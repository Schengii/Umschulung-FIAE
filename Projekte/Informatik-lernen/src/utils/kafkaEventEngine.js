// @ts-check
/**
 * @file kafkaEventEngine.js
 * Lernmodell für Apache Kafka: Topic mit Partitionen (append-only Log), Partitionierung
 * über den Schlüssel, Consumer Groups mit Partitionszuweisung und Offsets je Gruppe.
 *
 * Vereinfachungen gegenüber echtem Kafka (im Lab erklärt):
 * - Hash: FNV-1a statt des Hashs im Kafka-Producer – entscheidend ist nur „gleicher Schlüssel → gleiche Partition“.
 * - Ohne Schlüssel: Round-Robin statt Sticky/Adaptive Partitioning (KIP-480, KIP-794).
 * - Zuweisung: zusammenhängende Bereiche wie beim RangeAssignor.
 *
 * Quellen: https://kafka.apache.org/intro, https://kafka.apache.org/43/design/design/
 */

/**
 * @typedef {object} KafkaRecord
 * @property {number} offset
 * @property {string | null} key
 * @property {string} value
 */

/**
 * @typedef {object} TopicState
 * @property {KafkaRecord[][]} partitions - je Partition ein Log, Index = Offset
 * @property {number} roundRobin - nächste Partition für Events ohne Schlüssel
 * @property {Record<string, number[]>} committed - je Gruppe: nächster zu lesender Offset je Partition
 */

/**
 * 32-Bit-FNV-1a-Hash (vorzeichenlos).
 * @param {string} text
 * @returns {number}
 */
export function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Partition für einen Schlüssel: hash(key) mod Partitionsanzahl.
 * @param {string} key
 * @param {number} partitionCount
 * @returns {number}
 */
export function partitionForKey(key, partitionCount) {
  if (!Number.isInteger(partitionCount) || partitionCount < 1) throw new Error('partitionCount muss eine positive ganze Zahl sein');
  return fnv1a(key) % partitionCount;
}

/**
 * Leeres Topic.
 * @param {number} partitionCount
 * @returns {TopicState}
 */
export function createTopic(partitionCount) {
  if (!Number.isInteger(partitionCount) || partitionCount < 1) throw new Error('partitionCount muss eine positive ganze Zahl sein');
  return { partitions: Array.from({ length: partitionCount }, () => []), roundRobin: 0, committed: {} };
}

/**
 * Hängt ein Event an das Log der passenden Partition an (unveränderlich, gibt neuen Zustand zurück).
 * @param {TopicState} topic
 * @param {{ key: string | null, value: string }} event
 * @returns {{ topic: TopicState, partition: number, offset: number }}
 */
export function produce(topic, { key, value }) {
  const count = topic.partitions.length;
  const partition = key === null || key === '' ? topic.roundRobin % count : partitionForKey(key, count);
  const offset = topic.partitions[partition].length;
  const partitions = topic.partitions.map((log, i) => (i === partition ? [...log, { offset, key: key || null, value }] : log));
  const roundRobin = key === null || key === '' ? (topic.roundRobin + 1) % count : topic.roundRobin;
  return { topic: { ...topic, partitions, roundRobin }, partition, offset };
}

/**
 * Verteilt Partitionen auf die Consumer einer Gruppe (zusammenhängende Bereiche, RangeAssignor-Prinzip).
 * Jede Partition gehört genau einem Consumer der Gruppe; überzählige Consumer bleiben leer.
 * @param {number} partitionCount
 * @param {string[]} consumerIds
 * @returns {Record<string, number[]>}
 */
export function assignPartitions(partitionCount, consumerIds) {
  /** @type {Record<string, number[]>} */
  const result = {};
  for (const id of consumerIds) result[id] = [];
  const n = consumerIds.length;
  if (!n) return result;
  const base = Math.floor(partitionCount / n);
  const extra = partitionCount % n;
  let next = 0;
  consumerIds.forEach((id, i) => {
    const take = base + (i < extra ? 1 : 0);
    for (let k = 0; k < take; k++) result[id].push(next++);
  });
  return result;
}

/**
 * Offsets einer Gruppe (fehlende Gruppe beginnt bei 0 = auto.offset.reset=earliest).
 * @param {TopicState} topic
 * @param {string} groupId
 * @returns {number[]}
 */
export function groupOffsets(topic, groupId) {
  return topic.partitions.map((_, i) => topic.committed[groupId]?.[i] ?? 0);
}

/**
 * Ein Poll: Jeder Consumer der Gruppe liest bis zu `maxPerPartition` Events aus seinen Partitionen
 * und committet danach den neuen Offset. Andere Gruppen bleiben unberührt.
 * @param {TopicState} topic
 * @param {string} groupId
 * @param {string[]} consumerIds
 * @param {number} [maxPerPartition]
 * @returns {{ topic: TopicState, deliveries: Array<{ consumer: string, partition: number, record: KafkaRecord }> }}
 */
export function pollGroup(topic, groupId, consumerIds, maxPerPartition = 1) {
  const assignment = assignPartitions(topic.partitions.length, consumerIds);
  const offsets = groupOffsets(topic, groupId);
  /** @type {Array<{ consumer: string, partition: number, record: KafkaRecord }>} */
  const deliveries = [];
  for (const consumer of consumerIds) {
    for (const p of assignment[consumer]) {
      const log = topic.partitions[p];
      const end = Math.min(log.length, offsets[p] + maxPerPartition);
      for (let o = offsets[p]; o < end; o++) deliveries.push({ consumer, partition: p, record: log[o] });
      offsets[p] = end;
    }
  }
  return { topic: { ...topic, committed: { ...topic.committed, [groupId]: offsets } }, deliveries };
}

/**
 * Consumer Lag einer Gruppe: noch nicht gelesene Events je Partition und gesamt.
 * @param {TopicState} topic
 * @param {string} groupId
 * @returns {{ perPartition: number[], total: number }}
 */
export function consumerLag(topic, groupId) {
  const offsets = groupOffsets(topic, groupId);
  const perPartition = topic.partitions.map((log, i) => log.length - offsets[i]);
  return { perPartition, total: perPartition.reduce((a, b) => a + b, 0) };
}

/**
 * Prüft die Ordnungsgarantie: Alle Events eines Schlüssels liegen in genau einer Partition.
 * @param {TopicState} topic
 * @returns {Record<string, number[]>} Schlüssel → Partitionen, in denen er vorkommt
 */
export function partitionsByKey(topic) {
  /** @type {Record<string, Set<number>>} */
  const map = {};
  topic.partitions.forEach((log, p) => {
    for (const r of log) if (r.key) (map[r.key] ||= new Set()).add(p);
  });
  return Object.fromEntries(Object.entries(map).map(([k, s]) => [k, [...s].sort((a, b) => a - b)]));
}

/**
 * Ändert die Partitionsanzahl und spielt alle Events neu ein. Zeigt, warum mehr Partitionen
 * die Schlüssel-Zuordnung verschieben (in echtem Kafka bleiben alte Events, wo sie sind).
 * @param {TopicState} topic
 * @param {number} partitionCount
 * @returns {TopicState}
 */
export function repartition(topic, partitionCount) {
  const events = topic.partitions.flat().sort((a, b) => a.offset - b.offset);
  let next = createTopic(partitionCount);
  for (const e of events) next = produce(next, { key: e.key, value: e.value }).topic;
  return next;
}

export const KAFKA_DRILL_QUESTIONS = [
  {
    id: 'kafka_evt_1',
    frage: 'Ein Webshop sendet alle Events einer Bestellung mit dem Schlüssel orderId. Welche Garantie gibt Kafka dadurch?',
    optionen: [
      'Alle Events des Topics werden global in Sende-Reihenfolge gelesen',
      'Events mit derselben orderId landen in derselben Partition und werden dort in Schreibreihenfolge gelesen',
      'Jedes Event wird genau einmal an alle Consumer aller Gruppen geliefert und danach gelöscht',
      'Die orderId bestimmt, welche Consumer Group das Event bekommt'
    ],
    korrektIndex: 1,
    erklaerung: 'Gleicher Schlüssel → gleiche Partition. Kafka garantiert die Reihenfolge nur innerhalb einer Partition, nicht über das ganze Topic (kafka.apache.org/intro).'
  },
  {
    id: 'kafka_evt_2',
    frage: 'Ein Topic hat 4 Partitionen. Die Consumer Group „payment“ startet 6 Consumer. Was passiert?',
    optionen: [
      'Alle 6 Consumer lesen jede Partition parallel',
      '4 Consumer bekommen je eine Partition, 2 Consumer bleiben ohne Partition (idle)',
      'Kafka legt automatisch 2 weitere Partitionen an',
      'Die Gruppe verweigert den Start'
    ],
    korrektIndex: 1,
    erklaerung: 'Innerhalb einer Gruppe wird jede Partition genau einem Consumer zugewiesen. Mehr Consumer als Partitionen bringen keine weitere Parallelität – die Partitionsanzahl begrenzt die Skalierung.'
  },
  {
    id: 'kafka_evt_3',
    frage: 'Die Gruppen „payment“ und „analytics“ abonnieren dasselbe Topic. „payment“ hat alles gelesen. Was sieht „analytics“?',
    optionen: [
      'Nichts – gelesene Events sind gelöscht',
      'Nur Events, die nach dem Lesen durch „payment“ geschrieben wurden',
      'Alle noch nicht abgelaufenen Events; jede Gruppe hat eigene Offsets',
      'Nur jedes zweite Event (Lastverteilung zwischen den Gruppen)'
    ],
    korrektIndex: 2,
    erklaerung: 'Events werden beim Lesen nicht gelöscht, sondern nach der Retention-Zeit des Topics. Jede Consumer Group führt ihre eigene Position (Offset) je Partition – das ermöglicht Fan-out und Replay.'
  },
  {
    id: 'kafka_evt_4',
    frage: 'Was beschreibt der Consumer Lag?',
    optionen: [
      'Die Netzwerklatenz zwischen Producer und Broker in Millisekunden',
      'Die Differenz zwischen dem letzten geschriebenen Offset und dem committeten Offset einer Gruppe',
      'Die Anzahl der Broker im Cluster',
      'Die Zeit bis zum nächsten Rebalancing'
    ],
    korrektIndex: 1,
    erklaerung: 'Lag = Log-End-Offset − committeter Offset (je Partition, summiert je Gruppe). Wächst er dauerhaft, sind die Consumer zu langsam oder zu wenige.'
  },
  {
    id: 'kafka_evt_5',
    frage: 'Wodurch unterscheidet sich Kafka grundlegend von einer klassischen Message Queue wie RabbitMQ (Standard-Queue)?',
    optionen: [
      'Kafka speichert Events als dauerhaftes, wiederlesbares Log; eine Queue entfernt Nachrichten nach der Bestätigung',
      'Kafka unterstützt nur synchrone Kommunikation',
      'Kafka kann keine Nachrichten an mehrere Empfänger verteilen',
      'Eine Queue garantiert immer eine globale Reihenfolge über alle Konsumenten'
    ],
    korrektIndex: 0,
    erklaerung: 'Kafka ist ein verteiltes Commit-Log: Lesen verschiebt nur den Offset. In einer Queue wird eine bestätigte Nachricht entfernt; Fan-out braucht dort eigene Queues je Empfänger.'
  },
  {
    id: 'kafka_evt_6',
    frage: 'Ein Team erhöht die Partitionen eines Topics von 3 auf 4. Welches Risiko besteht für Events mit Schlüssel?',
    optionen: [
      'Keines – die Zuordnung Schlüssel → Partition bleibt immer gleich',
      'Neue Events eines Schlüssels können in einer anderen Partition landen als ältere, die Reihenfolge je Schlüssel ist beim Übergang nicht mehr gesichert',
      'Alle alten Events werden gelöscht',
      'Der Producer kann keine Schlüssel mehr senden'
    ],
    korrektIndex: 1,
    erklaerung: 'Die Partition ergibt sich aus hash(key) mod Partitionsanzahl. Ändert sich die Anzahl, ändert sich die Zuordnung für viele Schlüssel; alte Events bleiben in ihrer bisherigen Partition.'
  }
];

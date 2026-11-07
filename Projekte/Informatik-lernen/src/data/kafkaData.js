export const KAFKA_PATTERNS = [
  {
    id: 'producer_consumer',
    title: '1. Kafka Producer & Consumer Pattern',
    desc: 'Event Producer veröffentlichen Nachrichten in Kafka Topics. Unabhängige Consumer Groups verarbeiten Events asynchron.',
    producerCode: `// Kafka Producer (Node.js, KafkaJS)
const producer = kafka.producer();
await producer.send({
  topic: 'orders-topic',
  // key: gleiche Kunden-ID → gleiche Partition → feste Reihenfolge
  messages: [{ key: 'kunde-1', value: JSON.stringify({ orderId: 101, amount: 99.90 }) }],
});`,
    consumerCode: `// Kafka Consumer Group
const consumer = kafka.consumer({ groupId: 'payment-service-group' });
await consumer.subscribe({ topics: ['orders-topic'], fromBeginning: true });
await consumer.run({
  eachMessage: async ({ partition, message }) => {
    // Offset wird nach der Verarbeitung automatisch committet (autoCommit)
    console.log('P' + partition, '#' + message.offset, message.value.toString());
  },
});`
  }
];

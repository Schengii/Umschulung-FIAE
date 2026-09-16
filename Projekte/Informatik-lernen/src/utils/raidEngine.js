/**
 * IHK RAID Storage & Parity Calculation Engine
 * Prüfungsrelevante Berechnung für FISI, ITSE & AP1 nach AO 2020
 */

export const RAID_LEVELS = {
  0: {
    name: 'RAID 0 (Striping)',
    minDisks: 2,
    faultToleranceDescription: 'Keine Ausfallsicherheit. Ein Festplattenausfall führt zum Totalverlust aller Daten.',
    writePenalty: 1,
    readMultiplier: (n) => n,
    writeMultiplier: (n) => n
  },
  1: {
    name: 'RAID 1 (Mirroring / Spiegelung)',
    minDisks: 2,
    faultToleranceDescription: 'Ausfall von bis zu N - 1 Festplatten wird toleriert (mind. 1 Platte muss intakt bleiben).',
    writePenalty: 2,
    readMultiplier: (n) => n,
    writeMultiplier: () => 1
  },
  5: {
    name: 'RAID 5 (Block-Striping mit verteilter Parität)',
    minDisks: 3,
    faultToleranceDescription: 'Ausfall von genau 1 Festplatte wird toleriert. Datenrekonstruktion über XOR-Parität.',
    writePenalty: 4, // 2x Read + 2x Write (Read-Modify-Write)
    readMultiplier: (n) => n - 1,
    writeMultiplier: () => 1
  },
  6: {
    name: 'RAID 6 (Block-Striping mit zweifacher Parität P + Q)',
    minDisks: 4,
    faultToleranceDescription: 'Ausfall von bis zu 2 beliebigen Festplatten gleichzeitig wird toleriert (Dual-Parity / Reed-Solomon).',
    writePenalty: 6, // 3x Read + 3x Write
    readMultiplier: (n) => n - 2,
    writeMultiplier: () => 1
  },
  10: {
    name: 'RAID 10 (1+0 Striped Mirrors)',
    minDisks: 4,
    faultToleranceDescription: 'Toleriert Ausfall von mind. 1 Festplatte und bis zu N / 2 Platten (solange nie beide Platten desselben Mirror-Paars ausfallen).',
    writePenalty: 2,
    readMultiplier: (n) => n,
    writeMultiplier: (n) => n / 2
  },
  50: {
    name: 'RAID 50 (5+0 Striped RAID 5 Arrays)',
    minDisks: 6,
    faultToleranceDescription: 'Toleriert 1 Plattenausfall pro RAID-5-Subarray (mind. 1, max. 2 Ausfälle bei 2 Subarrays).',
    writePenalty: 4,
    readMultiplier: (n) => n - 2,
    writeMultiplier: () => 2
  }
};

/**
 * Berechnet Kapazitäten, Redundanz und Kennzahlen für eine RAID-Konfiguration
 */
export function calculateRaidStorage({
  raidLevel = 5,
  diskCount = 4,
  diskSizeTB = 4,
  rebuildSpeedMBs = 150,
  ureRate = 1e-14 // Consumer HDD 10^-14, Enterprise 10^-15
}) {
  const levelInfo = RAID_LEVELS[raidLevel] || RAID_LEVELS[5];
  const numDisks = Math.max(diskCount, levelInfo.minDisks);
  const sizeTB = Math.max(0.1, diskSizeTB);

  const rawCapacityTB = numDisks * sizeTB;
  let usableCapacityTB = 0;
  let parityCapacityTB = 0;
  let maxFailedDisks = 0;

  switch (Number(raidLevel)) {
    case 0:
      usableCapacityTB = rawCapacityTB;
      parityCapacityTB = 0;
      maxFailedDisks = 0;
      break;
    case 1:
      usableCapacityTB = sizeTB;
      parityCapacityTB = (numDisks - 1) * sizeTB;
      maxFailedDisks = numDisks - 1;
      break;
    case 5:
      usableCapacityTB = (numDisks - 1) * sizeTB;
      parityCapacityTB = sizeTB;
      maxFailedDisks = 1;
      break;
    case 6:
      usableCapacityTB = (numDisks - 2) * sizeTB;
      parityCapacityTB = 2 * sizeTB;
      maxFailedDisks = 2;
      break;
    case 10:
      // Disks must be even for RAID 10
      usableCapacityTB = (numDisks / 2) * sizeTB;
      parityCapacityTB = (numDisks / 2) * sizeTB;
      maxFailedDisks = 1; // Garantiert 1, optimal bis zu numDisks / 2
      break;
    case 50:
      // 2 Sub-Arrays angenommen
      usableCapacityTB = (numDisks - 2) * sizeTB;
      parityCapacityTB = 2 * sizeTB;
      maxFailedDisks = 1;
      break;
    default:
      usableCapacityTB = (numDisks - 1) * sizeTB;
      parityCapacityTB = sizeTB;
      maxFailedDisks = 1;
  }

  const efficiencyPercent = rawCapacityTB > 0 ? Math.round((usableCapacityTB / rawCapacityTB) * 100) : 0;
  const redundancyPercent = 100 - efficiencyPercent;

  // Rebuild-Dauer Berechnung: Zeit um 1 Festplatte komplett zu lesen/schreiben
  const diskSizeMB = sizeTB * 1000 * 1000;
  const rebuildSeconds = diskSizeMB / Math.max(10, rebuildSpeedMBs);
  const rebuildHours = Number((rebuildSeconds / 3600).toFixed(1));

  // URE-Wahrscheinlichkeit: P(URE) = 1 - (1 - rate)^(gelesene Bits)
  // Beim Rebuild von RAID 5 müssen alle verbleibenden intakten Platten komplett gelesen werden
  const disksToRead = raidLevel === 1 ? 1 : (numDisks - 1);
  const totalBitsToRead = disksToRead * sizeTB * 8 * 1e12;
  const ureProbability = Number((1 - Math.exp(-totalBitsToRead * ureRate)).toFixed(4));
  const urePercent = Number((ureProbability * 100).toFixed(2));

  // Visuelle Festplatten-Blockverteilung generieren (Beispielhafte 4 Blöcke pro Spindel)
  const diskMatrix = generateDiskBlockMatrix(raidLevel, numDisks);

  return {
    raidLevel,
    name: levelInfo.name,
    minDisks: levelInfo.minDisks,
    numDisks,
    diskSizeTB: sizeTB,
    rawCapacityTB: Number(rawCapacityTB.toFixed(2)),
    usableCapacityTB: Number(usableCapacityTB.toFixed(2)),
    parityCapacityTB: Number(parityCapacityTB.toFixed(2)),
    efficiencyPercent,
    redundancyPercent,
    maxFailedDisks,
    faultToleranceDescription: levelInfo.faultToleranceDescription,
    writePenalty: levelInfo.writePenalty,
    rebuildHours,
    urePercent,
    isUreRiskHigh: urePercent > 30,
    diskMatrix
  };
}

/**
 * Erzeugt die visuelle Blockverteilung (Striping & Parity Layout)
 */
function generateDiskBlockMatrix(level, numDisks) {
  const disks = Array.from({ length: numDisks }, (_, i) => ({
    diskId: i + 1,
    name: `Festplatte HDD ${i + 1}`,
    blocks: []
  }));

  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let d = 0; d < numDisks; d++) {
      let blockLabel = `D${r * numDisks + d + 1}`;
      let isParity = false;

      if (level === 0) {
        blockLabel = `Data ${r * numDisks + d + 1}`;
      } else if (level === 1) {
        blockLabel = `Mirror D${r + 1}`;
      } else if (level === 5) {
        // Rotierende Parität (Left-Symmetric)
        const parityDisk = (numDisks - 1 - (r % numDisks));
        if (d === parityDisk) {
          blockLabel = `P${r + 1} (XOR)`;
          isParity = true;
        } else {
          blockLabel = `D${r * (numDisks - 1) + (d < parityDisk ? d : d - 1) + 1}`;
        }
      } else if (level === 6) {
        // Dual Parity: P und Q
        const pDisk = (numDisks - 1 - (r % numDisks));
        const qDisk = (pDisk + 1) % numDisks;
        if (d === pDisk) {
          blockLabel = `P${r + 1} (XOR)`;
          isParity = true;
        } else if (d === qDisk) {
          blockLabel = `Q${r + 1} (Reed-Sol)`;
          isParity = true;
        } else {
          blockLabel = `Data ${r + 1}-${d + 1}`;
        }
      } else if (level === 10) {
        const pairId = Math.floor(d / 2) + 1;
        const isMirror = d % 2 === 1;
        blockLabel = `Mirror ${pairId} [${isMirror ? 'Kopie' : 'Original'}] D${r + 1}`;
      }

      disks[d].blocks.push({
        label: blockLabel,
        isParity
      });
    }
  }

  return disks;
}

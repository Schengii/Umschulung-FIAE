/**
 * Linux Virtual Memory, Page Faults & OOM-Killer Engine
 * Simulates Virtual-to-Physical Address Translation, TLB Cache Hits/Misses,
 * Minor vs. Major Page Faults (Disk Swap I/O), and Linux OOM-Score calculations.
 */

export class LinuxMemorySimulator {
  constructor(totalRamMb = 4096, totalSwapMb = 2048) {
    this.totalRamMb = totalRamMb;
    this.totalSwapMb = totalSwapMb;
    this.usedRamMb = 1024;
    this.usedSwapMb = 0;
    this.pageSizeKb = 4;
    this.tlb = [
      { vpn: 0x7ffd, pfn: 0x12a, valid: true },
      { vpn: 0x7ffe, pfn: 0x12b, valid: true }
    ];
    this.pageFaultStats = {
      minorFaults: 1420,
      majorFaults: 12,
      tlbHits: 8930,
      tlbMisses: 450
    };
  }

  accessMemory(virtualAddressHex = '0x7ffd040') {
    const vpn = parseInt(virtualAddressHex, 16) >> 12;
    const offset = parseInt(virtualAddressHex, 16) & 0xfff;

    const tlbEntry = this.tlb.find(e => e.vpn === vpn && e.valid);

    if (tlbEntry) {
      this.pageFaultStats.tlbHits++;
      return {
        virtualAddress: virtualAddressHex,
        physicalAddress: `0x${((tlbEntry.pfn << 12) | offset).toString(16)}`,
        status: 'TLB_HIT',
        latencyNs: 1.5,
        description: 'Sofortige TLB-Treffer-Übersetzung im L1 CPU-Cache'
      };
    }

    this.pageFaultStats.tlbMisses++;

    // Check if in RAM or Swap
    const isSwapped = this.usedRamMb >= this.totalRamMb * 0.95;

    if (isSwapped) {
      this.pageFaultStats.majorFaults++;
      this.usedSwapMb = Math.min(this.totalSwapMb, this.usedSwapMb + 4);
      return {
        virtualAddress: virtualAddressHex,
        physicalAddress: `0x${((0x199 << 12) | offset).toString(16)}`,
        status: 'MAJOR_PAGE_FAULT',
        latencyNs: 4500000, // ~4.5ms HDD/SSD Swap I/O
        description: 'Major Page Fault: Seite nicht im RAM! Gelesen aus Disk Swap Partition.'
      };
    } else {
      this.pageFaultStats.minorFaults++;
      this.tlb.push({ vpn, pfn: 0x150, valid: true });
      return {
        virtualAddress: virtualAddressHex,
        physicalAddress: `0x${((0x150 << 12) | offset).toString(16)}`,
        status: 'MINOR_PAGE_FAULT',
        latencyNs: 2500, // ~2.5µs OS Page Table Walk
        description: 'Minor Page Fault: Seite im OS Page Cache gefunden (ohne Disk I/O).'
      };
    }
  }

  calculateOomScore(processRssMb = 2048, oomScoreAdj = 0) {
    // Linux formula: oom_score = (RSS / TotalRAM) * 1000 + oom_score_adj
    const rawScore = (processRssMb / this.totalRamMb) * 1000;
    const finalScore = Math.max(0, Math.min(1000, Math.round(rawScore + oomScoreAdj)));

    let riskLevel = 'LOW';
    if (finalScore >= 800) riskLevel = 'CRITICAL (First to be killed)';
    else if (finalScore >= 500) riskLevel = 'HIGH';
    else if (finalScore >= 200) riskLevel = 'MEDIUM';

    return {
      processRssMb,
      totalRamMb: this.totalRamMb,
      oomScoreAdj,
      oomScore: finalScore,
      riskLevel
    };
  }
}

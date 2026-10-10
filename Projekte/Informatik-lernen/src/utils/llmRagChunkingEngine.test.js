import { describe, it, expect } from 'vitest';
import { chunkDocument, rankChunksWithCrossEncoder } from './llmRagChunkingEngine';

describe('llmRagChunkingEngine', () => {
  const sampleDoc = `BGP (Border Gateway Protocol) ist das Routing-Protokoll des Internets.
Es arbeitet pfadvektorbasiert und verhindert Routing-Schleifen durch das AS-Path-Attribut.

Linux Capabilities zerlegen die Root-Rechte in granulare Berechtigungen wie CAP_NET_BIND_SERVICE.
Seccomp BPF filtert Systemaufrufe (Syscalls) auf Kernel-Ebene.

Kostenrechnung: Der Maschinenstundensatz berechnet sich aus kalkulatorischer Abschreibung, Zinsen und Gemeinkosten.`;

  it('chunks documents with paragraph strategy', () => {
    const chunks = chunkDocument(sampleDoc, 'paragraph');
    expect(chunks.length).toBe(3);
    expect(chunks[0].text).toContain('BGP');
    expect(chunks[1].text).toContain('Linux Capabilities');
    expect(chunks[2].text).toContain('Maschinenstundensatz');
  });

  it('chunks documents with sliding window and overlap', () => {
    const chunks = chunkDocument(sampleDoc, 'sliding', 100, 20);
    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks[0].charStart).toBe(0);
    expect(chunks[1].charStart).toBe(80); // 100 - 20 = step 80
  });

  it('ranks relevant chunks at the top using cross-encoder scoring', () => {
    const chunks = chunkDocument(sampleDoc, 'paragraph');
    const query = 'Wie funktioniert Seccomp Syscall Filterung?';
    const ranked = rankChunksWithCrossEncoder(chunks, query);

    expect(ranked[0].text).toContain('Seccomp BPF');
    expect(ranked[0].crossEncoderScore).toBeGreaterThan(ranked[1].crossEncoderScore || 0);
  });
});

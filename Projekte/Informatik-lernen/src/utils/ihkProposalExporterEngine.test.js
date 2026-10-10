import { describe, it, expect } from 'vitest';
import {
  generateProposalMarkdown,
  exportProposalPdf
} from './ihkProposalExporterEngine';

describe('ihkProposalExporterEngine', () => {
  const mockData = {
    candidateName: 'Max Mustermann',
    companyName: 'Cloud Solutions GmbH',
    occupationName: 'Fachinformatiker Anwendungsentwicklung',
    projectTitle: 'Automatisierte CI/CD & Cloud Migration',
    projectGoal: 'Reduzierung manueller Deployments und Steigerung der Verfügbarkeit.',
    totalHours: 80,
    phases: [
      { id: '1', name: 'Analysephase', hours: 12, category: 'analyse' },
      { id: '2', name: 'Entwurfsphase', hours: 18, category: 'entwurf' },
      { id: '3', name: 'Implementierung', hours: 35, category: 'umsetzung' },
      { id: '4', name: 'Qualitätssicherung', hours: 15, category: 'qs' }
    ],
    securityMeasures: [
      { name: 'Zutrittskontrolle', detail: '2FA & Transponder' },
      { name: 'Verschlüsselung', detail: 'TLS 1.3 & AES-256' }
    ],
    economicFeasibility: 'Amortisation nach 8 Monaten dank Zeiteinsparung.'
  };

  it('generates well-formed Markdown project proposal document', () => {
    const md = generateProposalMarkdown(mockData);
    expect(md).toContain('# IHK PROJEKTANTRAG (AP2 TEIL A)');
    expect(md).toContain('Max Mustermann');
    expect(md).toContain('Cloud Solutions GmbH');
    expect(md).toContain('Automatisierte CI/CD & Cloud Migration');
    expect(md).toContain('80 Std.');
    expect(md).toContain('Zutrittskontrolle');
  });

  it('constructs a valid jsPDF instance without exceptions', () => {
    const doc = exportProposalPdf(mockData);
    expect(doc).toBeDefined();
    expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(200);
  });
});

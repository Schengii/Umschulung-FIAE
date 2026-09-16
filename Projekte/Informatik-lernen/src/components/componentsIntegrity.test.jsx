// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

import CommandPaletteModal from './Navigation/CommandPaletteModal';
import LabsDashboard from './Content/LabsDashboard';
import DashboardQuickAccessGrid from './Content/DashboardQuickAccessGrid';
import NwaScoringLab from './Content/NwaScoringLab';
import RaidCalculatorLab from './Content/RaidCalculatorLab';
import VlsmSubnetLab from './Content/VlsmSubnetLab';
import IhkProjectProposalLab from './Content/IhkProjectProposalLab';
import CpmNetworkLab from './Content/CpmNetworkLab';
import UmlDiagramLab from './Content/UmlDiagramLab';
import TerraformLab from './Content/TerraformLab';
import IhkOralDefenseStudioLab from './Content/IhkOralDefenseStudioLab';
import AnsiblePlaybookLab from './Content/AnsiblePlaybookLab';
import ComputationWorkerLab from './Content/ComputationWorkerLab';
import IhkPresentationTimerLab from './Content/IhkPresentationTimerLab';
import GithubActionsWorkflowLab from './Content/GithubActionsWorkflowLab';
import IhkProjectGanttLab from './Content/IhkProjectGanttLab';
import WasmSimdStudioLab from './Content/WasmSimdStudioLab';
import Http3QuicLab from './Content/Http3QuicLab';
import IhkWirtschaftlichkeitLab from './Content/IhkWirtschaftlichkeitLab';
import WebAuthnPasskeyLab from './Content/WebAuthnPasskeyLab';
import SystemdServiceLab from './Content/SystemdServiceLab';
import TlsReplayLab from './Content/TlsReplayLab';
import IhkRiskAnalysisLab from './Content/IhkRiskAnalysisLab';
import EbpfCiliumLab from './Content/EbpfCiliumLab';
import PostgresIndexTypesLab from './Content/PostgresIndexTypesLab';
import DnssecValidationLab from './Content/DnssecValidationLab';
import IhkAgileBurndownLab from './Content/IhkAgileBurndownLab';
import LinuxCowSnapshotLab from './Content/LinuxCowSnapshotLab';
import OpenApiContractLab from './Content/OpenApiContractLab';

describe('Component Integrity & Smoke Tests', () => {
  it('rendert CommandPaletteModal ohne ReferenceError (alle Lucide Icons importiert)', () => {
    const { container } = render(
      <CommandPaletteModal
        isOpen={true}
        onClose={() => {}}
        onNavigate={() => {}}
        onOpenModal={() => {}}
      />
    );
    expect(container).toBeDefined();
    expect(screen.getByPlaceholderText(/Suche Themen/i)).toBeDefined();
  });

  it('rendert LabsDashboard fehlerfrei mit allen Modulen', () => {
    const { container } = render(
      <LabsDashboard onSelectLab={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Nutzwertanalyse/i).length).toBeGreaterThan(0);
  });

  it('rendert DashboardQuickAccessGrid fehlerfrei', () => {
    const { container } = render(
      <DashboardQuickAccessGrid setActiveTab={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/IHK Nutzwertanalyse Studio/i)).toBeDefined();
    expect(screen.getByText(/RAID Storage & Paritäts-Rechner/i)).toBeDefined();
  });

  it('rendert NwaScoringLab fehlerfrei', () => {
    const { container } = render(
      <NwaScoringLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/IHK Nutzwertanalyse Studio/i)).toBeDefined();
  });

  it('rendert RaidCalculatorLab fehlerfrei', () => {
    const { container } = render(
      <RaidCalculatorLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/RAID Storage & Paritäts-Rechner/i)).toBeDefined();
  });

  it('rendert VlsmSubnetLab fehlerfrei', () => {
    const { container } = render(
      <VlsmSubnetLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/VLSM Subnet Splitter/i)).toBeDefined();
  });

  it('rendert IhkProjectProposalLab fehlerfrei', () => {
    const { container } = render(
      <IhkProjectProposalLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/IHK Projektantrag/i)).toBeDefined();
  });

  it('rendert CpmNetworkLab fehlerfrei', () => {
    const { container } = render(
      <CpmNetworkLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/IHK Netzplan Studio/i)).toBeDefined();
  });

  it('rendert UmlDiagramLab fehlerfrei', () => {
    const { container } = render(
      <UmlDiagramLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/UML Studio/i)).toBeDefined();
  });

  it('rendert TerraformLab fehlerfrei', () => {
    const { container } = render(
      <TerraformLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Terraform & OpenTofu/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkOralDefenseStudioLab fehlerfrei', () => {
    const { container } = render(
      <IhkOralDefenseStudioLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/IHK Fachgespräch/i).length).toBeGreaterThan(0);
  });

  it('rendert AnsiblePlaybookLab fehlerfrei', () => {
    const { container } = render(
      <AnsiblePlaybookLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Ansible Playbook/i).length).toBeGreaterThan(0);
  });

  it('rendert ComputationWorkerLab fehlerfrei', () => {
    const { container } = render(
      <ComputationWorkerLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Web Worker/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkPresentationTimerLab fehlerfrei', () => {
    const { container } = render(
      <IhkPresentationTimerLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Präsentations-Stoppuhr/i).length).toBeGreaterThan(0);
  });

  it('rendert GithubActionsWorkflowLab fehlerfrei', () => {
    const { container } = render(
      <GithubActionsWorkflowLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/GitHub Actions/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkProjectGanttLab fehlerfrei', () => {
    const { container } = render(
      <IhkProjectGanttLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/IHK Projekt-Gantt/i).length).toBeGreaterThan(0);
  });

  it('rendert WasmSimdStudioLab fehlerfrei', () => {
    const { container } = render(
      <WasmSimdStudioLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/WebAssembly SIMD/i).length).toBeGreaterThan(0);
  });

  it('rendert Http3QuicLab fehlerfrei', () => {
    const { container } = render(
      <Http3QuicLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/HTTP\/3 & QUIC/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkWirtschaftlichkeitLab fehlerfrei', () => {
    const { container } = render(
      <IhkWirtschaftlichkeitLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Wirtschaftlichkeit/i).length).toBeGreaterThan(0);
  });

  it('rendert WebAuthnPasskeyLab fehlerfrei', () => {
    const { container } = render(
      <WebAuthnPasskeyLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/WebAuthn/i).length).toBeGreaterThan(0);
  });

  it('rendert SystemdServiceLab fehlerfrei', () => {
    const { container } = render(
      <SystemdServiceLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/systemd/i).length).toBeGreaterThan(0);
  });

  it('rendert TlsReplayLab fehlerfrei', () => {
    const { container } = render(
      <TlsReplayLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/0-RTT/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkRiskAnalysisLab fehlerfrei', () => {
    const { container } = render(
      <IhkRiskAnalysisLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Risikoanalyse/i).length).toBeGreaterThan(0);
  });

  it('rendert EbpfCiliumLab fehlerfrei', () => {
    const { container } = render(
      <EbpfCiliumLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Cilium/i).length).toBeGreaterThan(0);
  });

  it('rendert PostgresIndexTypesLab fehlerfrei', () => {
    const { container } = render(
      <PostgresIndexTypesLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/PostgreSQL Index/i).length).toBeGreaterThan(0);
  });

  it('rendert DnssecValidationLab fehlerfrei', () => {
    const { container } = render(
      <DnssecValidationLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/DNSSEC/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkAgileBurndownLab fehlerfrei', () => {
    const { container } = render(
      <IhkAgileBurndownLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Burndown/i).length).toBeGreaterThan(0);
  });

  it('rendert LinuxCowSnapshotLab fehlerfrei', () => {
    const { container } = render(
      <LinuxCowSnapshotLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Copy-on-Write/i).length).toBeGreaterThan(0);
  });

  it('rendert OpenApiContractLab fehlerfrei', () => {
    const { container } = render(
      <OpenApiContractLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/OpenAPI/i).length).toBeGreaterThan(0);
  });
});


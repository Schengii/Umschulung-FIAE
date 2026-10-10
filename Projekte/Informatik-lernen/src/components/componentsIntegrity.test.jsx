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
import IhkTomCatalogLab from './Content/IhkTomCatalogLab';
import WisoLaborLawLab from './Content/WisoLaborLawLab';
import IhkDpiaLab from './Content/IhkDpiaLab';
import BsiGrundschutzLab from './Content/BsiGrundschutzLab';
import Ipv6NdpLab from './Content/Ipv6NdpLab';
import WisoPayrollLab from './Content/WisoPayrollLab';
import IhkStudyPlanLab from './Content/IhkStudyPlanLab';
import IhkCertificatePdfLab from './Content/IhkCertificatePdfLab';
import CleanArchLab from './Content/CleanArchLab';
import LinuxNetNsLab from './Content/LinuxNetNsLab';
import WisoMultiContributionLab from './Content/WisoMultiContributionLab';
import IhkWeaknessAuditLab from './Content/IhkWeaknessAuditLab';
import OauthRevocationIntrospectionLab from './Content/OauthRevocationIntrospectionLab';
import Raid6GaloisLab from './Content/Raid6GaloisLab';
import SqliteWorkerStudioLab from './Content/SqliteWorkerStudioLab';
import WisoZuschlagskalkulationLab from './Content/WisoZuschlagskalkulationLab';
import LinuxCapSeccompLab from './Content/LinuxCapSeccompLab';
import BgpPathSelectionLab from './Content/BgpPathSelectionLab';
import WisoMaschinenstundensatzLab from './Content/WisoMaschinenstundensatzLab';
import LlmRagChunkingLab from './Content/LlmRagChunkingLab';
import LinuxPsiCgroupLab from './Content/LinuxPsiCgroupLab';
import NwaSensitivityLab from './Content/NwaSensitivityLab';
import WebrtcIceGatheringLab from './Content/WebrtcIceGatheringLab';
import WisoRentabilitaetLeverageLab from './Content/WisoRentabilitaetLeverageLab';
import LinuxMacSelinuxLab from './Content/LinuxMacSelinuxLab';
import DnsPrivacyLab from './Content/DnsPrivacyLab';
import WisoLiquiditaetLab from './Content/WisoLiquiditaetLab';
import RagSemanticCacheLab from './Content/RagSemanticCacheLab';
import JwtConfusionLab from './Content/JwtConfusionLab';
import SqlWindowFunctionsLab from './Content/SqlWindowFunctionsLab';
import ArgoCdGitOpsLab from './Content/ArgoCdGitOpsLab';
import VectorMathEmbeddingLab from './Content/VectorMathEmbeddingLab';
import SqlIsolationLab from './Content/SqlIsolationLab';
import DguvV3ElektronikLab from './Content/DguvV3ElektronikLab';
import IhkMepSimulatorLab from './Content/IhkMepSimulatorLab';
import WisoFinancingLab from './Content/WisoFinancingLab';
import PkiCertificateLab from './Content/PkiCertificateLab';
import RoutingDijkstraLab from './Content/RoutingDijkstraLab';
import HttpCachingLab from './Content/HttpCachingLab';
import ExamReadinessLab from './Content/ExamReadinessLab';
import SrpZeroKnowledgeLab from './Content/SrpZeroKnowledgeLab';
import WisoContractBreachLab from './Content/WisoContractBreachLab';
import WisoCompanyFormsLab from './Content/WisoCompanyFormsLab';
import MtlsZtnaLab from './Content/MtlsZtnaLab';
import WisoPersonalPlanungLab from './Content/WisoPersonalPlanungLab';
import Oauth21DpopLab from './Content/Oauth21DpopLab';
import IhkProposalPdfLab from './Content/IhkProposalPdfLab';
import BgpAnycastDdosLab from './Content/BgpAnycastDdosLab';
import CloudIamPolicyLab from './Content/CloudIamPolicyLab';
import SreSloBurnLab from './Content/SreSloBurnLab';
import KafkaConsumerLagLab from './Content/KafkaConsumerLagLab';
import LinuxAuditdEbpfLab from './Content/LinuxAuditdEbpfLab';
import K8sGatewayApiLab from './Content/K8sGatewayApiLab';
import WisoBreakEvenLab from './Content/WisoBreakEvenLab';
import DnssecRolloverLab from './Content/DnssecRolloverLab';

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

  it('rendert IhkTomCatalogLab fehlerfrei', () => {
    const { container } = render(
      <IhkTomCatalogLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/DSGVO/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoLaborLawLab fehlerfrei', () => {
    const { container } = render(
      <WisoLaborLawLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Arbeitsrecht/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkDpiaLab fehlerfrei', () => {
    const { container } = render(
      <IhkDpiaLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/DSFA/i).length).toBeGreaterThan(0);
  });

  it('rendert BsiGrundschutzLab fehlerfrei', () => {
    const { container } = render(
      <BsiGrundschutzLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/BSI IT-Grundschutz/i).length).toBeGreaterThan(0);
  });

  it('rendert Ipv6NdpLab fehlerfrei', () => {
    const { container } = render(
      <Ipv6NdpLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/IPv6 SLAAC/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoPayrollLab fehlerfrei', () => {
    const { container } = render(
      <WisoPayrollLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Lohnabrechnungs/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkStudyPlanLab fehlerfrei', () => {
    const { container } = render(
      <IhkStudyPlanLab onNavigateTab={() => {}} onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Prüfungs-Countdown/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkCertificatePdfLab fehlerfrei', () => {
    const { container } = render(
      <IhkCertificatePdfLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/IHK Lernpass/i).length).toBeGreaterThan(0);
  });

  it('rendert CleanArchLab fehlerfrei', () => {
    const { container } = render(
      <CleanArchLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Clean Architecture/i).length).toBeGreaterThan(0);
  });

  it('rendert LinuxNetNsLab fehlerfrei', () => {
    const { container } = render(
      <LinuxNetNsLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Linux Network Namespaces/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoMultiContributionLab fehlerfrei', () => {
    const { container } = render(
      <WisoMultiContributionLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Mehrstufige Deckungsbeitragsrechnung/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkWeaknessAuditLab fehlerfrei', () => {
    const { container } = render(
      <IhkWeaknessAuditLab onNavigateTab={() => {}} onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/IHK Schwachstellen-Audit/i).length).toBeGreaterThan(0);
  });

  it('rendert OauthRevocationIntrospectionLab fehlerfrei', () => {
    const { container } = render(
      <OauthRevocationIntrospectionLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Token Revocation/i).length).toBeGreaterThan(0);
  });

  it('rendert Raid6GaloisLab fehlerfrei', () => {
    const { container } = render(
      <Raid6GaloisLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/RAID 6 Dual-Parity/i).length).toBeGreaterThan(0);
  });

  it('rendert SqliteWorkerStudioLab fehlerfrei', () => {
    const { container } = render(
      <SqliteWorkerStudioLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/SQLite Web Worker Sandbox/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoZuschlagskalkulationLab fehlerfrei', () => {
    const { container } = render(
      <WisoZuschlagskalkulationLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Zuschlagskalkulation/i).length).toBeGreaterThan(0);
  });

  it('rendert LinuxCapSeccompLab fehlerfrei', () => {
    const { container } = render(
      <LinuxCapSeccompLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Linux Capabilities/i).length).toBeGreaterThan(0);
  });

  it('rendert BgpPathSelectionLab fehlerfrei', () => {
    const { container } = render(
      <BgpPathSelectionLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/BGP Path Selection/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoMaschinenstundensatzLab fehlerfrei', () => {
    const { container } = render(
      <WisoMaschinenstundensatzLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Maschinenstundensatz/i).length).toBeGreaterThan(0);
  });

  it('rendert LlmRagChunkingLab fehlerfrei', () => {
    const { container } = render(
      <LlmRagChunkingLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/LLM RAG Chunking/i).length).toBeGreaterThan(0);
  });

  it('rendert LinuxPsiCgroupLab fehlerfrei', () => {
    const { container } = render(
      <LinuxPsiCgroupLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Linux Cgroups v2/i).length).toBeGreaterThan(0);
  });

  it('rendert NwaSensitivityLab fehlerfrei', () => {
    const { container } = render(
      <NwaSensitivityLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Nutzwertanalyse/i).length).toBeGreaterThan(0);
  });

  it('rendert WebrtcIceGatheringLab fehlerfrei', () => {
    const { container } = render(
      <WebrtcIceGatheringLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/ICE Candidate Gathering/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoRentabilitaetLeverageLab fehlerfrei', () => {
    const { container } = render(
      <WisoRentabilitaetLeverageLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Rentabilitätskennzahlen/i).length).toBeGreaterThan(0);
  });

  it('rendert LinuxMacSelinuxLab fehlerfrei', () => {
    const { container } = render(
      <LinuxMacSelinuxLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Mandatory Access Control/i).length).toBeGreaterThan(0);
  });

  it('rendert DnsPrivacyLab fehlerfrei', () => {
    const { container } = render(
      <DnsPrivacyLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/DNS-over-HTTPS/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoLiquiditaetLab fehlerfrei', () => {
    const { container } = render(
      <WisoLiquiditaetLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Liquiditätsgrade/i).length).toBeGreaterThan(0);
  });

  it('rendert RagSemanticCacheLab fehlerfrei', () => {
    const { container } = render(
      <RagSemanticCacheLab />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Semantic Cache/i).length).toBeGreaterThan(0);
  });

  it('rendert JwtConfusionLab fehlerfrei', () => {
    const { container } = render(
      <JwtConfusionLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/JWT Security/i).length).toBeGreaterThan(0);
  });

  it('rendert SqlWindowFunctionsLab fehlerfrei', () => {
    const { container } = render(
      <SqlWindowFunctionsLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/SQL Window Functions/i).length).toBeGreaterThan(0);
  });

  it('rendert ArgoCdGitOpsLab fehlerfrei', () => {
    const { container } = render(
      <ArgoCdGitOpsLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/ArgoCD GitOps/i).length).toBeGreaterThan(0);
  });

  it('rendert VectorMathEmbeddingLab fehlerfrei', () => {
    const { container } = render(
      <VectorMathEmbeddingLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Vektor-Mathematik/i).length).toBeGreaterThan(0);
  });

  it('rendert SqlIsolationLab fehlerfrei', () => {
    const { container } = render(
      <SqlIsolationLab onAwardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/SQL Transaction Isolation/i).length).toBeGreaterThan(0);
  });

  it('rendert DguvV3ElektronikLab fehlerfrei', () => {
    const { container } = render(
      <DguvV3ElektronikLab onAwardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/DGUV Vorschrift 3/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkMepSimulatorLab fehlerfrei', () => {
    const { container } = render(
      <IhkMepSimulatorLab onAwardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Mündliche Ergänzungsprüfung/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoFinancingLab fehlerfrei', () => {
    const { container } = render(
      <WisoFinancingLab onAwardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Finanzierungsvergleich/i).length).toBeGreaterThan(0);
  });

  it('rendert PkiCertificateLab fehlerfrei', () => {
    const { container } = render(
      <PkiCertificateLab onAwardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Certificate Chain/i).length).toBeGreaterThan(0);
  });

  it('rendert RoutingDijkstraLab fehlerfrei', () => {
    const { container } = render(
      <RoutingDijkstraLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Dijkstra/i).length).toBeGreaterThan(0);
  });

  it('rendert HttpCachingLab fehlerfrei', () => {
    const { container } = render(
      <HttpCachingLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/HTTP Caching/i).length).toBeGreaterThan(0);
  });

  it('rendert ExamReadinessLab fehlerfrei', () => {
    const { container } = render(
      <ExamReadinessLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Countdown-Planer/i).length).toBeGreaterThan(0);
  });

  it('rendert SrpZeroKnowledgeLab fehlerfrei', () => {
    const { container } = render(
      <SrpZeroKnowledgeLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Zero-Knowledge/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoContractBreachLab fehlerfrei', () => {
    const { container } = render(
      <WisoContractBreachLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Kaufvertragsstörungen/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoCompanyFormsLab fehlerfrei', () => {
    const { container } = render(
      <WisoCompanyFormsLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Rechtsformen/i).length).toBeGreaterThan(0);
  });

  it('rendert MtlsZtnaLab fehlerfrei', () => {
    const { container } = render(
      <MtlsZtnaLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Mutual TLS/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoPersonalPlanungLab fehlerfrei', () => {
    const { container } = render(
      <WisoPersonalPlanungLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Personalbedarf/i).length).toBeGreaterThan(0);
  });

  it('rendert Oauth21DpopLab fehlerfrei', () => {
    const { container } = render(
      <Oauth21DpopLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/OAuth 2.1/i).length).toBeGreaterThan(0);
  });

  it('rendert IhkProposalPdfLab fehlerfrei', () => {
    const { container } = render(
      <IhkProposalPdfLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/IHK Projektantrag/i).length).toBeGreaterThan(0);
  });

  it('rendert BgpAnycastDdosLab fehlerfrei', () => {
    const { container } = render(
      <BgpAnycastDdosLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/BGP Anycast/i).length).toBeGreaterThan(0);
  });

  it('rendert CloudIamPolicyLab fehlerfrei', () => {
    const { container } = render(
      <CloudIamPolicyLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Cloud IAM/i).length).toBeGreaterThan(0);
  });

  it('rendert SreSloBurnLab fehlerfrei', () => {
    const { container } = render(
      <SreSloBurnLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Prometheus/i).length).toBeGreaterThan(0);
  });

  it('rendert KafkaConsumerLagLab fehlerfrei', () => {
    const { container } = render(
      <KafkaConsumerLagLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Kafka Consumer Lag/i).length).toBeGreaterThan(0);
  });

  it('rendert LinuxAuditdEbpfLab fehlerfrei', () => {
    const { container } = render(
      <LinuxAuditdEbpfLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Linux Auditd/i).length).toBeGreaterThan(0);
  });

  it('rendert K8sGatewayApiLab fehlerfrei', () => {
    const { container } = render(
      <K8sGatewayApiLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Gateway API/i).length).toBeGreaterThan(0);
  });

  it('rendert WisoBreakEvenLab fehlerfrei', () => {
    const { container } = render(
      <WisoBreakEvenLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Deckungsbeitrag/i).length).toBeGreaterThan(0);
  });

  it('rendert DnssecRolloverLab fehlerfrei', () => {
    const { container } = render(
      <DnssecRolloverLab onRewardXP={() => {}} />
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText(/DNSSEC/i).length).toBeGreaterThan(0);
  });
});


import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import Navbar from './components/Navigation/Navbar';
import MobileNav from './components/Navigation/MobileNav';
import TopicReader from './components/Content/TopicReader';
import ClozeTester from './components/Content/ClozeTester';
import VideoHub from './components/Content/VideoHub';
import ProjectViewer from './components/Projects/ProjectViewer';
import DsgvoFooterModal from './components/Footer/DsgvoFooterModal';
import DifficultyFilterBar from './components/Navigation/DifficultyFilterBar';
import ExamSimulator from './components/Content/ExamSimulator';
const SkillMatrixWidget = lazy(() => import('./components/Gamification/SkillMatrixWidget'));
import DailyChallengeWidget from './components/Gamification/DailyChallengeWidget';
import SkillTreeWidget from './components/Gamification/SkillTreeWidget';
import ActivityHeatmapWidget from './components/Gamification/ActivityHeatmapWidget';
import PomodoroTimerWidget from './components/Navigation/PomodoroTimerWidget';
import ModalContainer from './components/Navigation/ModalContainer';

// Lazy Loaded Games & Labs for Maximum Initial Load Speed & Low Bundle Size
const SqlDungeon = lazy(() => import('./components/Games/SqlDungeon'));
const SecurityLab = lazy(() => import('./components/Games/SecurityLab'));
const CodePuzzle = lazy(() => import('./components/Games/CodePuzzle'));
const LogicGatesGame = lazy(() => import('./components/Games/LogicGatesGame'));
const WebSandbox = lazy(() => import('./components/Games/WebSandbox'));
const RegexLab = lazy(() => import('./components/Games/RegexLab'));
const CliTerminalLab = lazy(() => import('./components/Games/CliTerminalLab'));
const BossBattleGame = lazy(() => import('./components/Games/BossBattleGame'));
const CodeTypingSpeedrun = lazy(() => import('./components/Games/CodeTypingSpeedrun'));

const LanguageAcademy = lazy(() => import('./components/Content/LanguageAcademy'));
const AiPromptLab = lazy(() => import('./components/Content/AiPromptLab'));
const ToolingSetupGuide = lazy(() => import('./components/Content/ToolingSetupGuide'));
const AppWorkshop = lazy(() => import('./components/Content/AppWorkshop'));
const KnowledgeQuizArena = lazy(() => import('./components/Content/KnowledgeQuizArena'));
const CareerRoadmap = lazy(() => import('./components/Content/CareerRoadmap'));
const BigOVisualizer = lazy(() => import('./components/Content/BigOVisualizer'));
const ArchitectureVisualizer = lazy(() => import('./components/Content/ArchitectureVisualizer'));
const DesignPatternsLab = lazy(() => import('./components/Content/DesignPatternsLab'));
const TddUnitTestLab = lazy(() => import('./components/Content/TddUnitTestLab'));
const WebComponentsHub = lazy(() => import('./components/Content/WebComponentsHub'));
const FisiLernfelderHub = lazy(() => import('./components/Content/FisiLernfelderHub'));
const AiBusinessMasterclass = lazy(() => import('./components/Content/AiBusinessMasterclass'));
const ItPodcastHub = lazy(() => import('./components/Content/ItPodcastHub'));

const DockerLab = lazy(() => import('./components/Content/DockerLab'));
const CloudDevOpsLab = lazy(() => import('./components/Content/CloudDevOpsLab'));
const RedBlueTeamLab = lazy(() => import('./components/Content/RedBlueTeamLab'));
const ApiBenchStudio = lazy(() => import('./components/Content/ApiBenchStudio'));

const KubernetesLab = lazy(() => import('./components/Content/KubernetesLab'));
const RagAiSimulator = lazy(() => import('./components/Content/RagAiSimulator'));
const WasmRustLab = lazy(() => import('./components/Content/WasmRustLab'));
const KafkaEventLab = lazy(() => import('./components/Content/KafkaEventLab'));

const OauthOidcLab = lazy(() => import('./components/Content/OauthOidcLab'));
const WebSocketsLab = lazy(() => import('./components/Content/WebSocketsLab'));
const PerformanceProfilingLab = lazy(() => import('./components/Content/PerformanceProfilingLab'));
const AnfaengerGuideHub = lazy(() => import('./components/Content/AnfaengerGuideHub'));
const SubnettingLab = lazy(() => import('./components/Content/SubnettingLab'));
const GitLab = lazy(() => import('./components/Content/GitLab'));
const AlgoPlaygroundLab = lazy(() => import('./components/Content/AlgoPlaygroundLab'));
const PythonWasmLab = lazy(() => import('./components/Content/PythonWasmLab'));
const PacketTracerLab = lazy(() => import('./components/Content/PacketTracerLab'));
const LeitnerFlashcardLab = lazy(() => import('./components/Content/LeitnerFlashcardLab'));
const MonacoStudioLab = lazy(() => import('./components/Content/MonacoStudioLab'));
const CloudDesignerLab = lazy(() => import('./components/Content/CloudDesignerLab'));
const ApiMockStudioLab = lazy(() => import('./components/Content/ApiMockStudioLab'));
const CtfChallengeLab = lazy(() => import('./components/Content/CtfChallengeLab'));
const CiCdPipelineLab = lazy(() => import('./components/Content/CiCdPipelineLab'));
const DockerComposeLab = lazy(() => import('./components/Content/DockerComposeLab'));
const SystemDesignLab = lazy(() => import('./components/Content/SystemDesignLab'));
const RegexMasterLab = lazy(() => import('./components/Content/RegexMasterLab'));
const WebSocketProtocolLab = lazy(() => import('./components/Content/WebSocketProtocolLab'));
const VectorSearchLab = lazy(() => import('./components/Content/VectorSearchLab'));
const BigOBenchmarkLab = lazy(() => import('./components/Content/BigOBenchmarkLab'));
const WasmCompilerPlaygroundLab = lazy(() => import('./components/Content/WasmCompilerPlaygroundLab'));

// Neue Labs, Simulatoren & Kampagnen Hub
const DataStructuresLab = lazy(() => import('./components/Content/DataStructuresLab'));
const CiCdWorkflowLab = lazy(() => import('./components/Content/CiCdWorkflowLab'));
const LabsDashboard = lazy(() => import('./components/Content/LabsDashboard'));
const IhkOralExamSimulator = lazy(() => import('./components/Content/IhkOralExamSimulator'));
const SqlJoinVisualizerLab = lazy(() => import('./components/Content/SqlJoinVisualizerLab'));
const CampaignQuestHub = lazy(() => import('./components/Content/CampaignQuestHub'));
const GitBranchGraphLab = lazy(() => import('./components/Content/GitBranchGraphLab'));
const CpuArchitectureLab = lazy(() => import('./components/Content/CpuArchitectureLab'));
const SqlQueryOptimizerLab = lazy(() => import('./components/Content/SqlQueryOptimizerLab'));

// Next-Gen High-Value Labs & Generatoren
const CodeExecutionDebuggerLab = lazy(() => import('./components/Content/CodeExecutionDebuggerLab'));
const IhkProjectDocumentationGenerator = lazy(() => import('./components/Content/IhkProjectDocumentationGenerator'));
const CleanCodeReviewLab = lazy(() => import('./components/Content/CleanCodeReviewLab'));
const DnsHttpLifecycleLab = lazy(() => import('./components/Content/DnsHttpLifecycleLab'));
const SqlTransactionLab = lazy(() => import('./components/Content/SqlTransactionLab'));
const CiCdMatrixLinterLab = lazy(() => import('./components/Content/CiCdMatrixLinterLab'));
const PostgresExplainVisualizerLab = lazy(() => import('./components/Content/PostgresExplainVisualizerLab'));
const WebRtcSignalingLab = lazy(() => import('./components/Content/WebRtcSignalingLab'));
const GraphqlResolverLab = lazy(() => import('./components/Content/GraphqlResolverLab'));
const LinuxPermissionsLab = lazy(() => import('./components/Content/LinuxPermissionsLab'));
const CryptoKeygenLab = lazy(() => import('./components/Content/CryptoKeygenLab'));
const RedisCachingLab = lazy(() => import('./components/Content/RedisCachingLab'));
const CircuitBreakerLab = lazy(() => import('./components/Content/CircuitBreakerLab'));
const K8sCniOverlayLab = lazy(() => import('./components/Content/K8sCniOverlayLab'));
const JwksRotationLab = lazy(() => import('./components/Content/JwksRotationLab'));
const PostgresMvccLab = lazy(() => import('./components/Content/PostgresMvccLab'));
const Http3QuicLab = lazy(() => import('./components/Content/Http3QuicLab'));

// Brandneue Fach-Labs & PDF-Spickzettel Generator
const WisoKalkulationLab = lazy(() => import('./components/Content/WisoKalkulationLab'));
const Ieee754FloatingPointLab = lazy(() => import('./components/Content/Ieee754FloatingPointLab'));
const Ipv6RoutingLab = lazy(() => import('./components/Content/Ipv6RoutingLab'));
const OwaspExploitLab = lazy(() => import('./components/Content/OwaspExploitLab'));
const NeuralNetVisualizerLab = lazy(() => import('./components/Content/NeuralNetVisualizerLab'));
const IhkCheatSheetPdfGenerator = lazy(() => import('./components/Content/IhkCheatSheetPdfGenerator'));

// Next-Gen Multiplayer & Coding Studios
const P2pQuizDuellLab = lazy(() => import('./components/Content/P2pQuizDuellLab'));
const SqliteWasmStudioLab = lazy(() => import('./components/Content/SqliteWasmStudioLab'));
const LiveCodingChallengeStudio = lazy(() => import('./components/Content/LiveCodingChallengeStudio'));
const CustomChallengeCreatorLab = lazy(() => import('./components/Content/CustomChallengeCreatorLab'));
const GitMergeConflictLab = lazy(() => import('./components/Content/GitMergeConflictLab'));
const TcoRoiCalculatorLab = lazy(() => import('./components/Content/TcoRoiCalculatorLab'));
const RegexRailroadVisualizerLab = lazy(() => import('./components/Content/RegexRailroadVisualizerLab'));
const WebhookInspectorLab = lazy(() => import('./components/Content/WebhookInspectorLab'));
const VoiceQuizStudioLab = lazy(() => import('./components/Content/VoiceQuizStudioLab'));
const AgileScrumSimulatorLab = lazy(() => import('./components/Content/AgileScrumSimulatorLab'));
const GraphqlExplorerStudioLab = lazy(() => import('./components/Content/GraphqlExplorerStudioLab'));
const BleSensorSimulatorLab = lazy(() => import('./components/Content/BleSensorSimulatorLab'));

// v3.8.0 Flagship Simulatoren, Architecture & IHK Power Studios
const OsProcessSchedulerLab = lazy(() => import('./components/Content/OsProcessSchedulerLab'));
const PacketSnifferLab = lazy(() => import('./components/Content/PacketSnifferLab'));
const ErdDesignerLab = lazy(() => import('./components/Content/ErdDesignerLab'));
const TransformerAttentionLab = lazy(() => import('./components/Content/TransformerAttentionLab'));
const CloudArchitectureCanvasLab = lazy(() => import('./components/Content/CloudArchitectureCanvasLab'));
const IhkGradeCalculatorLab = lazy(() => import('./components/Content/IhkGradeCalculatorLab'));
const RackConfiguratorLab = lazy(() => import('./components/Content/RackConfiguratorLab'));
const ItsmSimulatorLab = lazy(() => import('./components/Content/ItsmSimulatorLab'));
const Sm2SpacedRepetitionLab = lazy(() => import('./components/Content/Sm2SpacedRepetitionLab'));
const PersonalNotebookLab = lazy(() => import('./components/Content/PersonalNotebookLab'));

// v3.9.0 Cryptography & WebAssembly
const ZkpCryptoVisualizerLab = lazy(() => import('./components/Content/ZkpCryptoVisualizerLab'));

// v3.10.0 Next-Gen OAuth PKCE, K8s Topology & WebRTC Mesh Studios
const OauthPkceStudioLab = lazy(() => import('./components/Content/OauthPkceStudioLab'));
const KubernetesClusterStudioLab = lazy(() => import('./components/Content/KubernetesClusterStudioLab'));
const WebRtcPeerStudioLab = lazy(() => import('./components/Content/WebRtcPeerStudioLab'));

// v3.11.0 Next-Gen Memory, Pool, Dunning & Service Mesh
const LinuxMemoryLab = lazy(() => import('./components/Content/LinuxMemoryLab'));
const PostgresPoolLab = lazy(() => import('./components/Content/PostgresPoolLab'));
const WisoDunningLab = lazy(() => import('./components/Content/WisoDunningLab'));
const ServiceMeshLab = lazy(() => import('./components/Content/ServiceMeshLab'));

// v3.12.0 Next-Gen Container, Contribution Margin & Token Exchange
const LinuxContainerLab = lazy(() => import('./components/Content/LinuxContainerLab'));
const WisoContributionMarginLab = lazy(() => import('./components/Content/WisoContributionMarginLab'));
const OauthTokenExchangeLab = lazy(() => import('./components/Content/OauthTokenExchangeLab'));

// v3.13.0 Next-Gen eBPF, Postgres Flamegraph, ABC/XYZ & WireGuard ZTNA
const EbpfXdpLab = lazy(() => import('./components/Content/EbpfXdpLab'));
const PostgresFlamegraphLab = lazy(() => import('./components/Content/PostgresFlamegraphLab'));
const WisoAbcXyzLab = lazy(() => import('./components/Content/WisoAbcXyzLab'));
const WireguardZtnaLab = lazy(() => import('./components/Content/WireguardZtnaLab'));

// v3.14.0 Next-Gen PromQL, Event-Sourcing, Loan & SFU
const PromqlAlertLab = lazy(() => import('./components/Content/PromqlAlertLab'));
const EventSourcingLab = lazy(() => import('./components/Content/EventSourcingLab'));
const WisoLoanCollateralLab = lazy(() => import('./components/Content/WisoLoanCollateralLab'));
const WebrtcSfuLab = lazy(() => import('./components/Content/WebrtcSfuLab'));

// v3.15.0 Next-Gen BPFtrace, Postgres WAL, Andler & OpenTelemetry
const BpftraceLab = lazy(() => import('./components/Content/BpftraceLab'));
const PostgresWalLab = lazy(() => import('./components/Content/PostgresWalLab'));
const WisoAndlerLab = lazy(() => import('./components/Content/WisoAndlerLab'));
const OpentelemetryTracingLab = lazy(() => import('./components/Content/OpentelemetryTracingLab'));

// v3.16.0 Next-Gen VXLAN, Partitioning, Interest & Kafka Rebalance
const LinuxBridgeVxlanLab = lazy(() => import('./components/Content/LinuxBridgeVxlanLab'));
const PostgresPartitioningLab = lazy(() => import('./components/Content/PostgresPartitioningLab'));
const WisoInterestCalculationsLab = lazy(() => import('./components/Content/WisoInterestCalculationsLab'));
const KafkaRebalanceLab = lazy(() => import('./components/Content/KafkaRebalanceLab'));

// v3.17.0 Next-Gen BGP Anycast, Postgres Fulltext, NPV & gRPC Protobuf
const BgpAnycastLab = lazy(() => import('./components/Content/BgpAnycastLab'));
const TlsHandshakeLab = lazy(() => import('./components/Content/TlsHandshakeLab'));
const JwtAttackLab = lazy(() => import('./components/Content/JwtAttackLab'));
const CorsPitfallsLab = lazy(() => import('./components/Content/CorsPitfallsLab'));
const PostgresFulltextLab = lazy(() => import('./components/Content/PostgresFulltextLab'));
const WisoCapitalValueLab = lazy(() => import('./components/Content/WisoCapitalValueLab'));
const GrpcProtobufLab = lazy(() => import('./components/Content/GrpcProtobufLab'));

// v3.18.0 IHK Power Labs: NWA, RAID, VLSM & Projektantrag
const NwaScoringLab = lazy(() => import('./components/Content/NwaScoringLab'));
const RaidCalculatorLab = lazy(() => import('./components/Content/RaidCalculatorLab'));
const VlsmSubnetLab = lazy(() => import('./components/Content/VlsmSubnetLab'));
const IhkProjectProposalLab = lazy(() => import('./components/Content/IhkProjectProposalLab'));
// v3.30.0 IHK CPM, UML & IaC Studios
const CpmNetworkLab = lazy(() => import('./components/Content/CpmNetworkLab'));
const UmlDiagramLab = lazy(() => import('./components/Content/UmlDiagramLab'));
const TerraformLab = lazy(() => import('./components/Content/TerraformLab'));
// v3.31.0 IHK Audio Fachgespräch, Ansible & Web Worker
const IhkOralDefenseStudioLab = lazy(() => import('./components/Content/IhkOralDefenseStudioLab'));
const AnsiblePlaybookLab = lazy(() => import('./components/Content/AnsiblePlaybookLab'));
const ComputationWorkerLab = lazy(() => import('./components/Content/ComputationWorkerLab'));
// v3.32.0 IHK Präsentations-Timer & GitHub Actions CI/CD
const IhkPresentationTimerLab = lazy(() => import('./components/Content/IhkPresentationTimerLab'));
const GithubActionsWorkflowLab = lazy(() => import('./components/Content/GithubActionsWorkflowLab'));
// v3.33.0 IHK Projekt-Gantt & WebAssembly SIMD Studio
const IhkProjectGanttLab = lazy(() => import('./components/Content/IhkProjectGanttLab'));
const WasmSimdStudioLab = lazy(() => import('./components/Content/WasmSimdStudioLab'));
// v3.34.0 IHK Wirtschaftlichkeit, WebAuthn Passkeys & Systemd Cgroups
const IhkWirtschaftlichkeitLab = lazy(() => import('./components/Content/IhkWirtschaftlichkeitLab'));
const WebAuthnPasskeyLab = lazy(() => import('./components/Content/WebAuthnPasskeyLab'));
const SystemdServiceLab = lazy(() => import('./components/Content/SystemdServiceLab'));
// v3.35.0 TLS 1.3 Replay, IHK Risikoanalyse, eBPF Cilium & Postgres Index Types
const TlsReplayLab = lazy(() => import('./components/Content/TlsReplayLab'));
const IhkRiskAnalysisLab = lazy(() => import('./components/Content/IhkRiskAnalysisLab'));
const EbpfCiliumLab = lazy(() => import('./components/Content/EbpfCiliumLab'));
const PostgresIndexTypesLab = lazy(() => import('./components/Content/PostgresIndexTypesLab'));
// v3.36.0 DNSSEC, IHK Burndown, Linux Btrfs CoW & OpenAPI Contract
const DnssecValidationLab = lazy(() => import('./components/Content/DnssecValidationLab'));
const IhkAgileBurndownLab = lazy(() => import('./components/Content/IhkAgileBurndownLab'));
const LinuxCowSnapshotLab = lazy(() => import('./components/Content/LinuxCowSnapshotLab'));
const OpenApiContractLab = lazy(() => import('./components/Content/OpenApiContractLab'));
import DashboardQuickAccessGrid from './components/Content/DashboardQuickAccessGrid';

import { USER_ROLES } from './data/userProfiles';
import { TOPICS } from './data/topicsData';

import { BookOpen, Sparkles, ArrowRight, CheckCircle, Sprout, Compass } from 'lucide-react';

const LabLoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: '600' }}>Modul wird geladen...</span>
  </div>
);

export default function App() {
  const { 
    userState, handleSelectRole, awardXP, handleCompleteTopic, refreshStateFromStorage,
    lang, setLang, theme, setTheme, fontSize, setFontSize,
    isDyslexic, setIsDyslexic, isColorblind, setIsColorblind,
    isHighContrast, setIsHighContrast,
    isReducedMotion, setIsReducedMotion,
    difficultyFilter, setDifficultyFilter
  } = useStore();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(!userState.role);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const setActiveTab = (tab) => navigate(`/${tab}`);

  // Global Ctrl + K / Cmd + K Keydown Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Topic Reader state
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Active Mini-Game Selector
  const [activeGameId, setActiveGameId] = useState('sql');

  // Apply Theme & Accessibility Classes to <body>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.fontSize = `${fontSize}%`;

    if (isDyslexic) {
      document.body.classList.add('dyslexia-mode');
    } else {
      document.body.classList.remove('dyslexia-mode');
    }

    if (isColorblind) {
      document.body.classList.add('colorblind-mode');
    } else {
      document.body.classList.remove('colorblind-mode');
    }

    if (isHighContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }

    if (isReducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }, [theme, fontSize, isDyslexic, isColorblind, isHighContrast, isReducedMotion]);

  const currentRole = USER_ROLES[userState.role] || USER_ROLES.anfaenger;

  // Filter Topics by Difficulty
  const filteredTopics = TOPICS.filter((t) => {
    if (difficultyFilter === 'all') return true;
    return t.difficultyLevel === difficultyFilter;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* Top Navbar */}
      <Navbar
        userState={userState}
        onOpenProfileModal={() => setIsRoleModalOpen(true)}
        onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
        onOpenGlossaryModal={() => setIsGlossaryModalOpen(true)}
        onOpenCertificateModal={() => setIsCertificateModalOpen(true)}
        onOpenFlashcardsModal={() => setIsFlashcardsModalOpen(true)}
        onOpenVocabularyModal={() => setIsVocabularyModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenDeploymentModal={() => setIsDeploymentModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        setFontSize={setFontSize}
        isDyslexic={isDyslexic}
        setIsDyslexic={setIsDyslexic}
        isColorblind={isColorblind}
        setIsColorblind={setIsColorblind}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        isReducedMotion={isReducedMotion}
        setIsReducedMotion={setIsReducedMotion}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px 40px 20px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Hero Welcome Banner */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '36px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--accent-primary)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <span className="badge badge-indigo" style={{ marginBottom: '12px' }}>
                        <Sparkles size={14} /> Aktuelles Level &amp; Zielgruppe: {currentRole.title}
                      </span>
                      <h1 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '8px 0', color: 'var(--text-main)' }}>
                        Willkommen zurück, <span className="text-gradient">Developer</span>!
                      </h1>
                      <p style={{ color: 'var(--text-muted)', maxWidth: '680px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        {currentRole.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => setActiveTab('campaign')}
                        style={{ minHeight: '48px', fontSize: '0.95rem', background: 'var(--gradient-cyber)', gap: '8px' }}
                      >
                        <Compass size={18} /> Story Kampagne
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => setIsRoleModalOpen(true)}
                        style={{ minHeight: '48px', fontSize: '0.95rem' }}
                      >
                        Profil / Level
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('anfaenger_guide')}
                        style={{ minHeight: '48px', fontSize: '0.95rem', borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}
                      >
                        <Sprout size={18} /> Einsteiger Kurs
                      </button>
                    </div>
                  </div>
                </div>

                {/* 365-Tage GitHub-Style Aktivitäts-Heatmap */}
                <ActivityHeatmapWidget />

                {/* Daily Challenge Widget */}
                <DailyChallengeWidget onCompleteChallenge={(xp) => awardXP(xp, 'daily_master')} />

                {/* RPG Skill Tree Widget */}
                <SkillTreeWidget userState={userState} onRewardXP={(xp) => awardXP(xp)} />

                {/* Skill Matrix Visualizer */}
                <Suspense fallback={null}>
                  <SkillMatrixWidget userState={userState} />
                </Suspense>

                {/* Feature Modules Quick Access Grid */}
                <DashboardQuickAccessGrid setActiveTab={setActiveTab} />
              </div>
            )}

            {/* NEUE FACH-LABS */}
            {activeTab === 'wiso_kalkulation' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoKalkulationLab />
              </Suspense>
            )}

            {activeTab === 'ieee754_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <Ieee754FloatingPointLab />
              </Suspense>
            )}

            {activeTab === 'ipv6_routing_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <Ipv6RoutingLab />
              </Suspense>
            )}

            {activeTab === 'owasp_exploit_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OwaspExploitLab />
              </Suspense>
            )}

            {activeTab === 'neural_net_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <NeuralNetVisualizerLab />
              </Suspense>
            )}

            {activeTab === 'cheat_sheets' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkCheatSheetPdfGenerator />
              </Suspense>
            )}

            {activeTab === 'p2p_duell' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <P2pQuizDuellLab />
              </Suspense>
            )}

            {activeTab === 'sqlite_studio' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SqliteWasmStudioLab />
              </Suspense>
            )}

            {activeTab === 'coding_challenges' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LiveCodingChallengeStudio />
              </Suspense>
            )}

            {activeTab === 'custom_challenges' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CustomChallengeCreatorLab />
              </Suspense>
            )}

            {activeTab === 'git_conflict_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GitMergeConflictLab />
              </Suspense>
            )}

            {activeTab === 'tco_roi_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <TcoRoiCalculatorLab />
              </Suspense>
            )}

            {activeTab === 'regex_railroad' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RegexRailroadVisualizerLab />
              </Suspense>
            )}

            {activeTab === 'webhook_inspector' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebhookInspectorLab />
              </Suspense>
            )}

            {activeTab === 'voice_quiz' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <VoiceQuizStudioLab />
              </Suspense>
            )}

            {activeTab === 'scrum_simulator' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AgileScrumSimulatorLab />
              </Suspense>
            )}

            {activeTab === 'graphql_explorer' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GraphqlExplorerStudioLab />
              </Suspense>
            )}

            {activeTab === 'ble_sensor' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <BleSensorSimulatorLab />
              </Suspense>
            )}

            {/* v3.8.0 FLAGSHIP LABS */}
            {activeTab === 'os_scheduler' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OsProcessSchedulerLab />
              </Suspense>
            )}

            {activeTab === 'packet_sniffer' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PacketSnifferLab />
              </Suspense>
            )}

            {activeTab === 'erd_designer' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ErdDesignerLab />
              </Suspense>
            )}

            {activeTab === 'transformer_attention' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <TransformerAttentionLab />
              </Suspense>
            )}

            {activeTab === 'cloud_canvas' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CloudArchitectureCanvasLab />
              </Suspense>
            )}

            {activeTab === 'ihk_grade_calculator' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkGradeCalculatorLab />
              </Suspense>
            )}

            {activeTab === 'rack_configurator' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RackConfiguratorLab />
              </Suspense>
            )}

            {activeTab === 'itsm_simulator' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ItsmSimulatorLab />
              </Suspense>
            )}

            {activeTab === 'sm2_spaced_repetition' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <Sm2SpacedRepetitionLab />
              </Suspense>
            )}

            {activeTab === 'personal_notebook' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PersonalNotebookLab />
              </Suspense>
            )}

            {/* LABS & SIMULATOREN DASHBOARD */}
            {activeTab === 'labs' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LabsDashboard
                  onSelectLab={(labId) => setActiveTab(labId)}
                  userState={userState}
                />
              </Suspense>
            )}

            {/* CAMPAIGN QUEST HUB */}
            {activeTab === 'campaign' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CampaignQuestHub
                  userState={userState}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onRewardXP={(xp) => awardXP(xp, 'campaign_step')}
                />
              </Suspense>
            )}

            {/* IHK ORAL EXAM */}
            {activeTab === 'oral_exam' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkOralExamSimulator onRewardXP={(xp) => awardXP(xp, 'oral_exam_master')} />
              </Suspense>
            )}

            {/* SQL JOINS VISUALIZER */}
            {activeTab === 'sql_joins' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SqlJoinVisualizerLab onRewardXP={(xp) => awardXP(xp, 'sql_join_master')} />
              </Suspense>
            )}

            {/* GIT BRANCH GRAPH LAB */}
            {activeTab === 'git_graph_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GitBranchGraphLab onRewardXP={(xp) => awardXP(xp, 'git_graph_master')} />
              </Suspense>
            )}

            {/* VON-NEUMANN CPU ARCHITECTURE LAB */}
            {activeTab === 'cpu_architecture_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CpuArchitectureLab onRewardXP={(xp) => awardXP(xp, 'cpu_master')} />
              </Suspense>
            )}

            {/* SQL QUERY OPTIMIZER LAB */}
            {activeTab === 'sql_optimizer_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SqlQueryOptimizerLab onRewardXP={(xp) => awardXP(xp, 'sql_optimizer_master')} />
              </Suspense>
            )}

            {/* DATA STRUCTURES */}
            {activeTab === 'datastructures' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <DataStructuresLab onRewardXP={(xp) => awardXP(xp, 'trees_graphs_master')} />
              </Suspense>
            )}

            {/* CI/CD WORKFLOW */}
            {activeTab === 'cicd_workflow' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CiCdWorkflowLab onRewardXP={(xp) => awardXP(xp, 'cicd_workflow_master')} />
              </Suspense>
            )}

            {/* ANFAENGER GUIDE */}
            {activeTab === 'anfaenger_guide' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AnfaengerGuideHub />
              </Suspense>
            )}

            {/* SUBNETTING LAB */}
            {activeTab === 'subnetting' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SubnettingLab onRewardXP={(xp) => awardXP(xp, 'subnetting_master')} />
              </Suspense>
            )}

            {/* GIT BRANCHING LAB */}
            {activeTab === 'git_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GitLab onRewardXP={(xp) => awardXP(xp, 'git_master')} />
              </Suspense>
            )}

            {/* ALGORITHMS PLAYGROUND */}
            {activeTab === 'algo_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AlgoPlaygroundLab onRewardXP={(xp) => awardXP(xp, 'algo_master')} />
              </Suspense>
            )}

            {/* PYTHON WASM LAB */}
            {activeTab === 'python_wasm' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PythonWasmLab onRewardXP={(xp) => awardXP(xp, 'python_wasm_master')} />
              </Suspense>
            )}

            {/* PACKET TRACER LAB */}
            {activeTab === 'packet_tracer' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PacketTracerLab onRewardXP={(xp) => awardXP(xp, 'packet_tracer_master')} />
              </Suspense>
            )}

            {/* LEITNER FLASHCARDS */}
            {activeTab === 'leitner' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LeitnerFlashcardLab onRewardXP={(xp) => awardXP(xp, 'leitner_master')} />
              </Suspense>
            )}

            {/* MONACO STUDIO */}
            {activeTab === 'monaco_studio' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <MonacoStudioLab onRewardXP={(xp) => awardXP(xp, 'monaco_master')} />
              </Suspense>
            )}

            {/* CLOUD DESIGNER */}
            {activeTab === 'cloud_designer' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CloudDesignerLab onRewardXP={(xp) => awardXP(xp, 'cloud_designer_master')} />
              </Suspense>
            )}

            {/* API MOCK STUDIO */}
            {activeTab === 'api_mock_studio' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ApiMockStudioLab onRewardXP={(xp) => awardXP(xp, 'api_mock_master')} />
              </Suspense>
            )}

            {/* CTF LAB */}
            {activeTab === 'ctf_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CtfChallengeLab onRewardXP={(xp) => awardXP(xp, 'ctf_master')} />
              </Suspense>
            )}

            {/* CI/CD PIPELINE */}
            {activeTab === 'cicd_pipeline' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CiCdPipelineLab onRewardXP={(xp) => awardXP(xp, 'cicd_master')} />
              </Suspense>
            )}

            {/* DOCKER COMPOSE */}
            {activeTab === 'docker_compose' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <DockerComposeLab onRewardXP={(xp) => awardXP(xp, 'docker_compose_master')} />
              </Suspense>
            )}

            {/* SYSTEM DESIGN */}
            {activeTab === 'system_design' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SystemDesignLab onRewardXP={(xp) => awardXP(xp, 'system_design_master')} />
              </Suspense>
            )}

            {/* REGEX MASTER */}
            {activeTab === 'regex_master' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RegexMasterLab onRewardXP={(xp) => awardXP(xp, 'regex_master')} />
              </Suspense>
            )}

            {/* WEBSOCKET PROTOCOL */}
            {activeTab === 'websocket_protocol' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebSocketProtocolLab onRewardXP={(xp) => awardXP(xp, 'websocket_protocol_master')} />
              </Suspense>
            )}

            {/* VECTOR SEARCH */}
            {activeTab === 'vector_search' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <VectorSearchLab onRewardXP={(xp) => awardXP(xp, 'vector_search_master')} />
              </Suspense>
            )}

            {/* BIG-O BENCHMARK */}
            {activeTab === 'bigo_benchmark' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <BigOBenchmarkLab onRewardXP={(xp) => awardXP(xp, 'bigo_benchmark_master')} />
              </Suspense>
            )}

            {/* WASM RUST */}
            {activeTab === 'wasm_rust_studio' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WasmRustLab onRewardXP={(xp) => awardXP(xp, 'wasm_rust_master')} />
              </Suspense>
            )}

            {/* ADVANCED SPECIAL LABS */}
            {activeTab === 'jwks_rotation_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <JwksRotationLab />
              </Suspense>
            )}

            {activeTab === 'postgres_mvcc_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresMvccLab />
              </Suspense>
            )}

            {activeTab === 'http3_quic_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <Http3QuicLab />
              </Suspense>
            )}

            {activeTab === 'redis_caching_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RedisCachingLab />
              </Suspense>
            )}

            {activeTab === 'circuit_breaker_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CircuitBreakerLab />
              </Suspense>
            )}

            {activeTab === 'k8s_cni_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <K8sCniOverlayLab />
              </Suspense>
            )}

            {activeTab === 'graphql_resolver_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GraphqlResolverLab />
              </Suspense>
            )}

            {activeTab === 'linux_permissions_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LinuxPermissionsLab />
              </Suspense>
            )}

            {activeTab === 'crypto_keygen_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CryptoKeygenLab />
              </Suspense>
            )}

            {activeTab === 'cicd_matrix_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CiCdMatrixLinterLab />
              </Suspense>
            )}

            {activeTab === 'postgres_explain_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresExplainVisualizerLab />
              </Suspense>
            )}

            {activeTab === 'webrtc_signaling_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebRtcSignalingLab />
              </Suspense>
            )}

            {activeTab === 'code_debugger_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CodeExecutionDebuggerLab />
              </Suspense>
            )}

            {activeTab === 'clean_code_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CleanCodeReviewLab />
              </Suspense>
            )}

            {activeTab === 'dns_http_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <DnsHttpLifecycleLab />
              </Suspense>
            )}

            {activeTab === 'sql_transaction_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SqlTransactionLab />
              </Suspense>
            )}

            {activeTab === 'ihk_doc_generator' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkProjectDocumentationGenerator />
              </Suspense>
            )}

            {/* OAUTH & OIDC */}
            {(activeTab === 'oauth' || activeTab === 'oauth_oidc') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OauthOidcLab />
              </Suspense>
            )}

            {/* WEBSOCKETS */}
            {activeTab === 'websockets' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebSocketsLab />
              </Suspense>
            )}

            {/* PERFORMANCE */}
            {activeTab === 'perf_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PerformanceProfilingLab />
              </Suspense>
            )}

            {/* KUBERNETES */}
            {activeTab === 'kubernetes' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <KubernetesLab />
              </Suspense>
            )}

            {/* RAG VECTOR AI */}
            {activeTab === 'rag_ai' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RagAiSimulator />
              </Suspense>
            )}

            {/* WASM COMPILER */}
            {activeTab === 'wasm_compiler' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WasmCompilerPlaygroundLab />
              </Suspense>
            )}

            {/* ZKP CRYPTO */}
            {activeTab === 'zkp_crypto' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ZkpCryptoVisualizerLab />
              </Suspense>
            )}

            {/* OAUTH PKCE & OIDC STUDIO */}
            {(activeTab === 'oauth_pkce_studio' || activeTab === 'oauth_pkce') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OauthPkceStudioLab />
              </Suspense>
            )}

            {/* KUBERNETES CLUSTER STUDIO */}
            {(activeTab === 'k8s_cluster_studio' || activeTab === 'k8s_cluster') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <KubernetesClusterStudioLab />
              </Suspense>
            )}

            {/* WEBRTC PEER STUDIO */}
            {(activeTab === 'webrtc_peer_studio' || activeTab === 'webrtc_peer') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebRtcPeerStudioLab />
              </Suspense>
            )}

            {/* LINUX MEMORY & PAGE FAULT */}
            {activeTab === 'linux_memory_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LinuxMemoryLab onRewardXP={(xp) => awardXP(xp, 'linux_memory_master')} />
              </Suspense>
            )}

            {/* POSTGRES CONNECTION POOL & ISOLATION */}
            {activeTab === 'postgres_pool_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresPoolLab onRewardXP={(xp) => awardXP(xp, 'postgres_pool_master')} />
              </Suspense>
            )}

            {/* IHK WISO DUNNING & SKONTO */}
            {activeTab === 'wiso_dunning_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoDunningLab onRewardXP={(xp) => awardXP(xp, 'wiso_dunning_master')} />
              </Suspense>
            )}

            {/* SERVICE MESH MTLS & ENVOY */}
            {activeTab === 'service_mesh_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ServiceMeshLab onRewardXP={(xp) => awardXP(xp, 'service_mesh_master')} />
              </Suspense>
            )}

            {/* LINUX CONTAINERS & CGROUPS */}
            {activeTab === 'linux_container_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LinuxContainerLab onRewardXP={(xp) => awardXP(xp, 'linux_container_master')} />
              </Suspense>
            )}

            {/* IHK WISO DECKUNGSBEITRAG & BEP */}
            {activeTab === 'wiso_contribution_margin' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoContributionMarginLab onRewardXP={(xp) => awardXP(xp, 'wiso_contribution_margin_master')} />
              </Suspense>
            )}

            {/* OAUTH TOKEN EXCHANGE RFC 8693 */}
            {activeTab === 'oauth_token_exchange_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OauthTokenExchangeLab onRewardXP={(xp) => awardXP(xp, 'oauth_token_exchange_master')} />
              </Suspense>
            )}

            {/* LINUX EBPF & XDP */}
            {activeTab === 'ebpf_xdp_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <EbpfXdpLab onRewardXP={(xp) => awardXP(xp, 'ebpf_xdp_master')} />
              </Suspense>
            )}

            {/* POSTGRES FLAMEGRAPH & BUFFER CACHE */}
            {activeTab === 'postgres_flamegraph_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresFlamegraphLab onRewardXP={(xp) => awardXP(xp, 'postgres_flamegraph_master')} />
              </Suspense>
            )}

            {/* IHK WISO ABC & XYZ ANALYSIS */}
            {activeTab === 'wiso_abc_xyz' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoAbcXyzLab onRewardXP={(xp) => awardXP(xp, 'wiso_abc_xyz_master')} />
              </Suspense>
            )}

            {/* WIREGUARD VPN & ZERO-TRUST */}
            {activeTab === 'wireguard_ztna_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WireguardZtnaLab onRewardXP={(xp) => awardXP(xp, 'wireguard_ztna_master')} />
              </Suspense>
            )}

            {/* PROMETHEUS PROMQL & ALERTING */}
            {activeTab === 'promql_alert_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PromqlAlertLab onRewardXP={(xp) => awardXP(xp, 'promql_alert_master')} />
              </Suspense>
            )}

            {/* EVENT SOURCING & CQRS */}
            {activeTab === 'event_sourcing_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <EventSourcingLab onRewardXP={(xp) => awardXP(xp, 'event_sourcing_master')} />
              </Suspense>
            )}

            {/* IHK WISO DARLEHENSARTEN & TILGUNG */}
            {activeTab === 'wiso_loan_collateral' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoLoanCollateralLab onRewardXP={(xp) => awardXP(xp, 'wiso_loan_collateral_master')} />
              </Suspense>
            )}

            {/* WEBRTC MEDIA ARCHITECTURE (SFU/MCU/MESH) */}
            {activeTab === 'webrtc_sfu_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebrtcSfuLab onRewardXP={(xp) => awardXP(xp, 'webrtc_sfu_master')} />
              </Suspense>
            )}

            {/* LINUX BPFTRACE DYNAMIC TRACING */}
            {activeTab === 'bpftrace_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <BpftraceLab onRewardXP={(xp) => awardXP(xp, 'bpftrace_master')} />
              </Suspense>
            )}

            {/* POSTGRES WAL & REPLICATION LAG */}
            {activeTab === 'postgres_wal_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresWalLab onRewardXP={(xp) => awardXP(xp, 'postgres_wal_master')} />
              </Suspense>
            )}

            {/* IHK WISO ANDLER OPTIMALE BESTELLMENGE */}
            {activeTab === 'wiso_andler' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoAndlerLab onRewardXP={(xp) => awardXP(xp, 'wiso_andler_master')} />
              </Suspense>
            )}

            {/* OPENTELEMETRY DISTRIBUTED TRACING */}
            {activeTab === 'opentelemetry_tracing_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OpentelemetryTracingLab onRewardXP={(xp) => awardXP(xp, 'opentelemetry_tracing_master')} />
              </Suspense>
            )}

            {/* LINUX BRIDGE & VXLAN */}
            {activeTab === 'linux_bridge_vxlan_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LinuxBridgeVxlanLab onRewardXP={(xp) => awardXP(xp, 'linux_bridge_vxlan_master')} />
              </Suspense>
            )}

            {/* POSTGRES PARTITIONING */}
            {activeTab === 'postgres_partitioning_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresPartitioningLab onRewardXP={(xp) => awardXP(xp, 'postgres_partitioning_master')} />
              </Suspense>
            )}

            {/* IHK WISO ZINS- & ZINSESZINS */}
            {activeTab === 'wiso_interest' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoInterestCalculationsLab onRewardXP={(xp) => awardXP(xp, 'wiso_interest_master')} />
              </Suspense>
            )}

            {/* KAFKA REBALANCE PROTOCOL */}
            {activeTab === 'kafka_rebalance_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <KafkaRebalanceLab onRewardXP={(xp) => awardXP(xp, 'kafka_rebalance_master')} />
              </Suspense>
            )}

            {/* LINUX BGP & ANYCAST */}
            {activeTab === 'bgp_anycast_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <BgpAnycastLab onRewardXP={(xp) => awardXP(xp, 'bgp_anycast_master')} />
              </Suspense>
            )}

            {/* TLS 1.3 HANDSHAKE */}
            {activeTab === 'tls_handshake_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <TlsHandshakeLab onRewardXP={(xp) => awardXP(xp, 'tls_handshake_master')} />
              </Suspense>
            )}

            {/* JWT ATTACK SANDBOX */}
            {activeTab === 'jwt_attack_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <JwtAttackLab onRewardXP={(xp) => awardXP(xp, 'jwt_attack_defender')} />
              </Suspense>
            )}

            {/* CORS PITFALLS */}
            {activeTab === 'cors_pitfalls_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CorsPitfallsLab onRewardXP={(xp) => awardXP(xp, 'cors_defender')} />
              </Suspense>
            )}

            {/* POSTGRES FULLTEXT SEARCH */}
            {activeTab === 'postgres_fulltext_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresFulltextLab onRewardXP={(xp) => awardXP(xp, 'postgres_fulltext_master')} />
              </Suspense>
            )}

            {/* IHK WISO KAPITALWERTMETHODE (NPV) */}
            {activeTab === 'wiso_capital_value' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WisoCapitalValueLab onRewardXP={(xp) => awardXP(xp, 'wiso_capital_value_master')} />
              </Suspense>
            )}

            {/* GRPC PROTOBUF WIRE FORMAT */}
            {activeTab === 'grpc_protobuf_lab' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GrpcProtobufLab onRewardXP={(xp) => awardXP(xp, 'grpc_protobuf_master')} />
              </Suspense>
            )}

            {/* IHK NUTZWERTANALYSE STUDIO (NWA) */}
            {(activeTab === 'nwa_scoring_lab' || activeTab === 'nwa_scoring') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <NwaScoringLab onRewardXP={(xp) => awardXP(xp, 'nwa_master')} />
              </Suspense>
            )}

            {/* RAID STORAGE & PARITÄTS-RECHNER */}
            {(activeTab === 'raid_calculator_lab' || activeTab === 'raid_calculator') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RaidCalculatorLab onRewardXP={(xp) => awardXP(xp, 'raid_master')} />
              </Suspense>
            )}

            {/* VLSM SUBNET SPLITTER & IP-RECHNER */}
            {(activeTab === 'vlsm_subnet_lab' || activeTab === 'vlsm_subnet') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <VlsmSubnetLab onRewardXP={(xp) => awardXP(xp, 'vlsm_master')} />
              </Suspense>
            )}

            {/* IHK PROJEKTANTRAGS-PRÜFER */}
            {(activeTab === 'ihk_project_proposal_lab' || activeTab === 'ihk_project_proposal') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkProjectProposalLab onRewardXP={(xp) => awardXP(xp, 'ihk_proposal_master')} />
              </Suspense>
            )}

            {/* IHK NETZPLAN STUDIO (CPM / DIN 69900) */}
            {(activeTab === 'cpm_network_lab' || activeTab === 'cpm_network') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CpmNetworkLab onRewardXP={(xp) => awardXP(xp, 'cpm_master')} />
              </Suspense>
            )}

            {/* UML SEQUENZ- & AKTIVITÄTSDIAGRAMM STUDIO */}
            {(activeTab === 'uml_diagram_lab' || activeTab === 'uml_diagram') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <UmlDiagramLab onRewardXP={(xp) => awardXP(xp, 'uml_master')} />
              </Suspense>
            )}

            {/* TERRAFORM & OPENTOFU IAC STUDIO */}
            {(activeTab === 'terraform_lab' || activeTab === 'terraform') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <TerraformLab onRewardXP={(xp) => awardXP(xp, 'terraform_master')} />
              </Suspense>
            )}

            {/* IHK FACHGESPRÄCH AUDIO-SIMULATOR */}
            {(activeTab === 'oral_defense_studio' || activeTab === 'oral_defense') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkOralDefenseStudioLab onRewardXP={(xp) => awardXP(xp, 'oral_defense_master')} />
              </Suspense>
            )}

            {/* ANSIBLE PLAYBOOK & IDEMPOTENZ STUDIO */}
            {(activeTab === 'ansible_playbook_lab' || activeTab === 'ansible_playbook') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AnsiblePlaybookLab onRewardXP={(xp) => awardXP(xp, 'ansible_master')} />
              </Suspense>
            )}

            {/* WEB WORKER & CONCURRENCY STUDIO */}
            {(activeTab === 'computation_worker_lab' || activeTab === 'computation_worker') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ComputationWorkerLab onRewardXP={(xp) => awardXP(xp, 'worker_master')} />
              </Suspense>
            )}

            {/* IHK PRÄSENTATIONS-STOPPUHR & FOLIEN-GLIEDERUNG (AP2 TEIL A) */}
            {(activeTab === 'presentation_timer_lab' || activeTab === 'presentation_timer' || activeTab === 'ihk_presentation_timer') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkPresentationTimerLab onRewardXP={(xp) => awardXP(xp, 'presentation_master')} />
              </Suspense>
            )}

            {/* GITHUB ACTIONS CI/CD WORKFLOW SIMULATOR */}
            {(activeTab === 'github_actions_lab' || activeTab === 'github_actions' || activeTab === 'github_actions_workflow_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <GithubActionsWorkflowLab onRewardXP={(xp) => awardXP(xp, 'github_actions_master')} />
              </Suspense>
            )}

            {/* IHK PROJEKT-GANTT & MEILENSTEIN-EDITOR (AP2) */}
            {(activeTab === 'ihk_project_gantt_lab' || activeTab === 'ihk_project_gantt' || activeTab === 'ihk_gantt') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkProjectGanttLab onRewardXP={(xp) => awardXP(xp, 'ihk_gantt_master')} />
              </Suspense>
            )}

            {/* WEBASSEMBLY SIMD & VECTOR PROCESSING STUDIO */}
            {(activeTab === 'wasm_simd_studio_lab' || activeTab === 'wasm_simd_studio' || activeTab === 'wasm_simd') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WasmSimdStudioLab onRewardXP={(xp) => awardXP(xp, 'wasm_simd_master')} />
              </Suspense>
            )}

            {/* IHK WIRTSCHAFTLICHKEIT, AMORTISATION & MAKE-OR-BUY */}
            {(activeTab === 'ihk_wirtschaftlichkeit_lab' || activeTab === 'ihk_wirtschaftlichkeit' || activeTab === 'amortisation_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkWirtschaftlichkeitLab onRewardXP={(xp) => awardXP(xp, 'ihk_wirtschaftlichkeit_master')} />
              </Suspense>
            )}

            {/* FIDO2 WEBAUTHN & PASSKEY STUDIO */}
            {(activeTab === 'webauthn_passkey_lab' || activeTab === 'webauthn_passkey' || activeTab === 'passkey_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebAuthnPasskeyLab onRewardXP={(xp) => awardXP(xp, 'passkey_master')} />
              </Suspense>
            )}

            {/* LINUX SYSTEMD & CGROUPS V2 SANDBOX */}
            {(activeTab === 'systemd_service_lab' || activeTab === 'systemd_service' || activeTab === 'systemd_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <SystemdServiceLab onRewardXP={(xp) => awardXP(xp, 'systemd_master')} />
              </Suspense>
            )}

            {/* TLS 1.3 0-RTT REPLAY & ANTI-REPLAY STUDIO */}
            {(activeTab === 'tls_replay_lab' || activeTab === 'tls_replay' || activeTab === '0rtt_replay_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <TlsReplayLab onRewardXP={(xp) => awardXP(xp, 'tls_replay_master')} />
              </Suspense>
            )}

            {/* IHK RISIKOANALYSE & RISIKOMATRIX STUDIO */}
            {(activeTab === 'ihk_risk_analysis_lab' || activeTab === 'ihk_risk_analysis' || activeTab === 'risikoanalyse_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkRiskAnalysisLab onRewardXP={(xp) => awardXP(xp, 'ihk_risk_master')} />
              </Suspense>
            )}

            {/* EBPF CILIUM SERVICE MESH & L7 TRACING SANDBOX */}
            {(activeTab === 'ebpf_cilium_lab' || activeTab === 'ebpf_cilium' || activeTab === 'cilium_mesh_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <EbpfCiliumLab onRewardXP={(xp) => awardXP(xp, 'cilium_master')} />
              </Suspense>
            )}

            {/* POSTGRESQL INDEX TYPES DEEP DIVE */}
            {(activeTab === 'postgres_index_types_lab' || activeTab === 'postgres_index_types' || activeTab === 'postgres_index_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <PostgresIndexTypesLab onRewardXP={(xp) => awardXP(xp, 'postgres_index_master')} />
              </Suspense>
            )}

            {/* DNSSEC CRYPTOGRAPHIC CHAIN OF TRUST & RRSIG */}
            {(activeTab === 'dnssec_validation_lab' || activeTab === 'dnssec_validation' || activeTab === 'dnssec_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <DnssecValidationLab onRewardXP={(xp) => awardXP(xp, 'dnssec_master')} />
              </Suspense>
            )}

            {/* IHK AGILE VS. WATERFALL & BURNDOWN STUDIO */}
            {(activeTab === 'ihk_burndown_lab' || activeTab === 'ihk_burndown' || activeTab === 'agile_burndown_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <IhkAgileBurndownLab onRewardXP={(xp) => awardXP(xp, 'ihk_burndown_master')} />
              </Suspense>
            )}

            {/* LINUX BTRFS / ZFS COW & SNAPSHOT SANDBOX */}
            {(activeTab === 'linux_cow_snapshot_lab' || activeTab === 'linux_cow_snapshot' || activeTab === 'btrfs_cow_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LinuxCowSnapshotLab onRewardXP={(xp) => awardXP(xp, 'linux_cow_master')} />
              </Suspense>
            )}

            {/* OPENAPI 3.1 & JSON-SCHEMA CONTRACT TESTING */}
            {(activeTab === 'openapi_contract_lab' || activeTab === 'openapi_contract' || activeTab === 'openapi_lab') && (
              <Suspense fallback={<LabLoadingFallback />}>
                <OpenApiContractLab onRewardXP={(xp) => awardXP(xp, 'openapi_contract_master')} />
              </Suspense>
            )}

            {/* KAFKA */}
            {activeTab === 'kafka' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <KafkaEventLab />
              </Suspense>
            )}

            {/* DOCKER */}
            {activeTab === 'docker' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <DockerLab />
              </Suspense>
            )}

            {/* CLOUD DEVOPS */}
            {activeTab === 'cloud_devops' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CloudDevOpsLab />
              </Suspense>
            )}

            {/* RED / BLUE TEAM */}
            {activeTab === 'security_lab_v2' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <RedBlueTeamLab />
              </Suspense>
            )}

            {/* API BENCH */}
            {activeTab === 'api_studio' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ApiBenchStudio />
              </Suspense>
            )}

            {/* AI BUSINESS */}
            {activeTab === 'ai_business' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AiBusinessMasterclass />
              </Suspense>
            )}

            {/* PODCAST */}
            {activeTab === 'podcast' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ItPodcastHub />
              </Suspense>
            )}

            {/* IHK LERNFELDER */}
            {activeTab === 'lernfelder' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <FisiLernfelderHub />
              </Suspense>
            )}

            {/* WEB COMPONENTS */}
            {activeTab === 'web_components' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <WebComponentsHub />
              </Suspense>
            )}

            {/* TDD */}
            {activeTab === 'tdd' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <TddUnitTestLab onRewardXP={(xp) => awardXP(xp, 'tdd_master')} />
              </Suspense>
            )}

            {/* ARCHITECTURE */}
            {activeTab === 'architecture' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ArchitectureVisualizer />
              </Suspense>
            )}

            {/* DESIGN PATTERNS */}
            {activeTab === 'design_patterns' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <DesignPatternsLab />
              </Suspense>
            )}

            {/* ROADMAPS */}
            {activeTab === 'roadmaps' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <CareerRoadmap userState={userState} />
              </Suspense>
            )}

            {/* BIG-O */}
            {activeTab === 'big_o' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <BigOVisualizer />
              </Suspense>
            )}

            {/* QUIZ ARENA */}
            {activeTab === 'quiz_arena' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <KnowledgeQuizArena onRewardXP={(xp) => awardXP(xp, 'quiz_master')} />
              </Suspense>
            )}

            {/* LANGUAGES */}
            {activeTab === 'languages' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <LanguageAcademy />
              </Suspense>
            )}

            {/* AI PROMPT */}
            {activeTab === 'ai' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AiPromptLab />
              </Suspense>
            )}

            {/* TOOLING */}
            {activeTab === 'tooling' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ToolingSetupGuide />
              </Suspense>
            )}

            {/* APP WORKSHOP */}
            {activeTab === 'app_workshop' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <AppWorkshop onCompleteWorkshop={(xp) => awardXP(xp, 'app_builder')} />
              </Suspense>
            )}

            {/* WISSEN & FACHKUNDE */}
            {activeTab === 'wissen' && (
              <div>
                {selectedTopicId ? (
                  <TopicReader
                    topicId={selectedTopicId}
                    onBack={() => setSelectedTopicId(null)}
                    onCompleteTopic={handleCompleteTopic}
                    isCompleted={userState.completedTopics.includes(selectedTopicId)}
                  />
                ) : (
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                      <BookOpen size={30} style={{ color: 'var(--accent-primary)' }} /> Fachkunde &amp; Wissensmodule
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1.05rem' }}>
                      Gefiltert nach Vorwissen, Alter und Erfahrung.
                    </p>

                    <DifficultyFilterBar
                      activeFilter={difficultyFilter}
                      onSelectFilter={(filterId) => setDifficultyFilter(filterId)}
                    />

                    <div className="grid-responsive">
                      {filteredTopics.map((topic) => {
                        const isDone = userState.completedTopics.includes(topic.id);
                        return (
                          <div
                            key={topic.id}
                            className="glass-panel glass-panel-hover"
                            onClick={() => setSelectedTopicId(topic.id)}
                            style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <span className="badge badge-indigo">{topic.difficultyLevel || topic.category}</span>
                              {isDone && <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />}
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                              {topic.icon} {topic.title}
                            </h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                              {topic.summary}
                            </p>
                            <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Artikel Lesen <ArrowRight size={16} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GAMES */}
            {activeTab === 'games' && (
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {[
                    { id: 'sql', label: '🗄️ SQL Dungeon' },
                    { id: 'security', label: '🛡️ Cyber Defense Lab' },
                    { id: 'boss', label: '⚔️ Code Duel Boss Battle' },
                    { id: 'typing_speedrun', label: '⌨️ Code Speedrun WPM' },
                    { id: 'cli', label: '💻 Terminal CLI Lab' },
                    { id: 'regex', label: '🔍 RegEx Lab' },
                    { id: 'puzzle', label: '🧩 Code Bug Hunter' },
                    { id: 'logic', label: '⚡ Logikgatter Simulator' },
                    { id: 'sandbox', label: '🌐 Live Web Sandbox' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setActiveGameId(g.id)}
                      style={{
                        minHeight: '44px',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '700',
                        fontSize: '0.92rem',
                        background: activeGameId === g.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                        color: activeGameId === g.id ? '#ffffff' : 'var(--text-main)',
                        border: activeGameId === g.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <Suspense fallback={<LabLoadingFallback />}>
                  {activeGameId === 'sql' && <SqlDungeon onCompleteGame={(_id, xp) => awardXP(xp, 'sql_master')} />}
                  {activeGameId === 'security' && <SecurityLab onCompleteGame={(_id, xp) => awardXP(xp, 'security_expert')} />}
                  {activeGameId === 'boss' && <BossBattleGame onCompleteGame={(_id, xp) => awardXP(xp, 'boss_slayer')} />}
                  {activeGameId === 'typing_speedrun' && <CodeTypingSpeedrun onCompleteGame={(_id, xp) => awardXP(xp, 'typing_god')} />}
                  {activeGameId === 'cli' && <CliTerminalLab onCompleteGame={(_id, xp) => awardXP(xp, 'cli_master')} />}
                  {activeGameId === 'regex' && <RegexLab onCompleteGame={(_id, xp) => awardXP(xp, 'regex_master')} />}
                  {activeGameId === 'puzzle' && <CodePuzzle onCompleteGame={(_id, xp) => awardXP(xp)} />}
                  {activeGameId === 'logic' && <LogicGatesGame onCompleteGame={(_id, xp) => awardXP(xp, 'logic_genius')} />}
                  {activeGameId === 'sandbox' && <WebSandbox onCompleteGame={(_id, xp) => awardXP(xp, 'web_builder')} />}
                </Suspense>
              </div>
            )}

            {/* IHK EXAM */}
            {activeTab === 'exam' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ExamSimulator onCompleteExam={(_score, xp) => awardXP(xp, 'exam_passed')} />
              </Suspense>
            )}

            {/* LÜCKENTEXT */}
            {activeTab === 'lueckentext' && (
              <ClozeTester userState={userState} onCompleteCloze={(_id, xp) => awardXP(xp, 'cloze_wizard')} />
            )}

            {/* VIDEOS */}
            {activeTab === 'videos' && (
              <VideoHub onCompleteVideo={(_id, xp) => awardXP(xp)} />
            )}

            {/* PROJEKTE */}
            {activeTab === 'projekte' && (
              <ProjectViewer onCompleteProject={(_id, xp) => awardXP(xp)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Pomodoro Focus Timer */}
      <PomodoroTimerWidget />

      {/* Footer with DSGVO Privacy & Impressum */}
      <DsgvoFooterModal />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Centralized Modals Container */}
      <ModalContainer
        isRoleModalOpen={isRoleModalOpen}
        setIsRoleModalOpen={setIsRoleModalOpen}
        isBadgesModalOpen={isBadgesModalOpen}
        setIsBadgesModalOpen={setIsBadgesModalOpen}
        isGlossaryModalOpen={isGlossaryModalOpen}
        setIsGlossaryModalOpen={setIsGlossaryModalOpen}
        isCertificateModalOpen={isCertificateModalOpen}
        setIsCertificateModalOpen={setIsCertificateModalOpen}
        isFlashcardsModalOpen={isFlashcardsModalOpen}
        setIsFlashcardsModalOpen={setIsFlashcardsModalOpen}
        isBackupModalOpen={isBackupModalOpen}
        setIsBackupModalOpen={setIsBackupModalOpen}
        isVocabularyModalOpen={isVocabularyModalOpen}
        setIsVocabularyModalOpen={setIsVocabularyModalOpen}
        isDeploymentModalOpen={isDeploymentModalOpen}
        setIsDeploymentModalOpen={setIsDeploymentModalOpen}
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        isAudioModalOpen={isAudioModalOpen}
        setIsAudioModalOpen={setIsAudioModalOpen}
        userState={userState}
        handleSelectRole={handleSelectRole}
        refreshStateFromStorage={refreshStateFromStorage}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

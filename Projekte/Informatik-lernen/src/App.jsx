import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import Navbar from './components/Navigation/Navbar';
import MobileNav from './components/Navigation/MobileNav';
import RoleSelectionModal from './components/Onboarding/RoleSelectionModal';
import TopicReader from './components/Content/TopicReader';
import ClozeTester from './components/Content/ClozeTester';
import VideoHub from './components/Content/VideoHub';
import ProjectViewer from './components/Projects/ProjectViewer';
import BadgesModal from './components/Gamification/BadgesModal';
import DsgvoFooterModal from './components/Footer/DsgvoFooterModal';
import DifficultyFilterBar from './components/Navigation/DifficultyFilterBar';
import GlossaryModal from './components/Content/GlossaryModal';
import ExamSimulator from './components/Content/ExamSimulator';
import SkillMatrixWidget from './components/Gamification/SkillMatrixWidget';
import CertificateModal from './components/Gamification/CertificateModal';
import DailyChallengeWidget from './components/Gamification/DailyChallengeWidget';
import FlashcardsModal from './components/Gamification/FlashcardsModal';
import BackupModal from './components/Gamification/BackupModal';
import SkillTreeWidget from './components/Gamification/SkillTreeWidget';

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
const VocabularyTrainerModal = lazy(() => import('./components/Content/VocabularyTrainerModal'));
const KnowledgeQuizArena = lazy(() => import('./components/Content/KnowledgeQuizArena'));
const CareerRoadmap = lazy(() => import('./components/Content/CareerRoadmap'));
const BigOVisualizer = lazy(() => import('./components/Content/BigOVisualizer'));
const ArchitectureVisualizer = lazy(() => import('./components/Content/ArchitectureVisualizer'));
const DesignPatternsLab = lazy(() => import('./components/Content/DesignPatternsLab'));
const TddUnitTestLab = lazy(() => import('./components/Content/TddUnitTestLab'));
const DeploymentGuideModal = lazy(() => import('./components/Content/DeploymentGuideModal'));
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
const OauthPkceStudio = lazy(() => import('./components/Content/OauthPkceStudio'));
const WasmRustStudio = lazy(() => import('./components/Content/WasmRustStudio'));

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

import CommandPaletteModal from './components/Navigation/CommandPaletteModal';

import { USER_ROLES } from './data/userProfiles';
import { TOPICS } from './data/topicsData';

import { BookOpen, Sparkles, ArrowRight, CheckCircle, Sprout } from 'lucide-react';

const LabLoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: '600' }}>Modul wird blitzschnell geladen...</span>
  </div>
);

export default function App() {
  const { 
    userState, handleSelectRole, awardXP, handleCompleteTopic, refreshStateFromStorage,
    lang, setLang, theme, setTheme, fontSize, setFontSize,
    isDyslexic, setIsDyslexic, isColorblind, setIsColorblind,
    isHighContrast, setIsHighContrast, isReducedMotion, setIsReducedMotion,
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
  }, [theme, fontSize, isDyslexic, isColorblind, isHighContrast]);

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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        fontSize={fontSize}
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
          <div>
            {/* Hero Welcome Banner */}
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: '2px solid var(--accent-primary)',
                marginBottom: '32px',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <span className="badge badge-indigo" style={{ marginBottom: '12px' }}>
                    <Sparkles size={14} /> Aktuelles Level & Zielgruppe: {currentRole.title}
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

            {/* Daily Challenge Widget */}
            <DailyChallengeWidget onCompleteChallenge={(xp) => awardXP(xp, 'daily_master')} />

            {/* RPG Skill Tree Widget */}
            <SkillTreeWidget userState={userState} onRewardXP={(xp) => awardXP(xp)} />

            {/* Skill Matrix Visualizer */}
            <SkillMatrixWidget userState={userState} />

            {/* Feature Modules Quick Access Grid */}
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)' }}>
              Empfohlene Lernbereiche für dich
            </h2>

            <div className="grid-responsive" style={{ marginBottom: '40px' }}>
              {/* Anfänger Guide Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('anfaenger_guide')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Einsteiger Kurs ohne Vorkenntnisse</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  EVA-Prinzip, CPU, Binärlogik & Netzwerke leicht erklärt.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Kurs Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Subnetting Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('subnetting')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌐</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>CIDR & Subnetting Lab</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  IP-Rechner, Host-Range Analyse & IHK-Prüfungsfragen.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Subnetting Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Git Branching Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('git_lab')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌿</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Visual Git Branching Lab</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Commits, Branching, Merging & Rebase interaktiv lernen.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Git Lab Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Algorithmen Playground Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('algo_lab')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Algorithmen & Sortier-Lab</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  QuickSort, MergeSort & Suchen Schritt-für-Schritt animieren.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Visualisierer Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Python WASM Sandbox Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('python_wasm')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Python 3 WASM Sandbox</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Schreibe & führe echten Python Code im Browser aus.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Python Sandbox <ArrowRight size={16} />
                </span>
              </div>

              {/* Network Packet Tracer Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('packet_tracer')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📡</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Packet Tracer & Routing</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  ICMP Pings, Gateway-Hops & Paketverläufe simulieren.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Tracer Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Leitner Spaced Repetition Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('leitner')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧠</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Leitner Spaced Repetition</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Effektives IHK Karteikasten-Lernen (Box 1 - 5).
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Karteikasten Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Monaco VS Code Studio Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('monaco_studio')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💻</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Monaco VS Code Studio</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Echter VS Code Editor im Browser mit IntelliSense.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Studio Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Cloud IaC Designer Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('cloud_designer')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>☁️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Cloud IaC & Terraform</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Designe AWS Architekturen & generiere Terraform Code.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Designer Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* REST API Testing Studio Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('api_mock_studio')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌐</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>API Tester Studio</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Postman Lite API-Testing mit JSON Headers & Body.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  API Studio Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Cybersecurity CTF Lab Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('ctf_lab')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚩</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Cybersecurity CTF Lab</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Ethical Hacking Quests (XSS, SQLi & Buffer Overflow).
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-rose)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  CTF Quests Starten <ArrowRight size={16} />
                </span>
              </div>

              {/* CI/CD Pipeline Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('cicd_pipeline')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚀</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>CI/CD GitHub Actions</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Pipelines konfigurieren, Runner simulieren & YAML generieren.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Pipeline Builder <ArrowRight size={16} />
                </span>
              </div>

              {/* Docker Compose Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('docker_compose')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐳</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Docker Compose Studio</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Multi-Container Stacks erstellen, Up/Down testen & docker-compose.yml.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Compose Studio <ArrowRight size={16} />
                </span>
              </div>

              {/* System Design Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('system_design')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>System Design & Load Balancer</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Traffic Spikes, Round Robin, Redis Caching & DB Replikation.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Simulator Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Regex Master Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('regex_master')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Regex Master Quests</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Live Pattern Matcher, E-Mail/IP Validierung & Quests.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Regex Quests <ArrowRight size={16} />
                </span>
              </div>

              {/* WebSockets Protocol Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('websocket_protocol')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📡</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>WebSocket Protocol Lab</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  HTTP 101 Upgrade, Ping/Pong Frames & Socket Streams.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Protocol Lab <ArrowRight size={16} />
                </span>
              </div>

              {/* RAG Vector Search Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('vector_search')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧠</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Local RAG Vector DB</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Embeddings, Kosinus-Ähnlichkeit & Top-K Retrieval.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Vector DB Öffnen <ArrowRight size={16} />
                </span>
              </div>

              {/* Big-O Benchmark Arena Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('bigo_benchmark')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Big-O Benchmark Arena</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Algorithmen-Laufzeiten O(1) bis O(N²) bei N Skalierung.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Benchmark Arena <ArrowRight size={16} />
                </span>
              </div>

              {/* OAuth2 PKCE Studio Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('oauth_pkce_studio')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔑</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>OAuth2 PKCE Flow Studio</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Code Verifier, Challenge, Token Exchange & JWT Claims.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  PKCE Studio <ArrowRight size={16} />
                </span>
              </div>

              {/* WASM Rust Studio Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('wasm_rust_studio')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>WASM & Rust Playground</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Rust Code &rarr; WASM Bytecode Kompilierung & Speed Tests.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  WASM Playground <ArrowRight size={16} />
                </span>
              </div>

              {/* OAuth2 Card */}
              {/* Data Structures & Graph Lab Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('datastructures')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌲</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Data Structures (Trees & Graphs)</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Binäre Suchbäume (BST Traversierung) & Dijkstra Graph Solver.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Tree & Graph Lab <ArrowRight size={16} />
                </span>
              </div>

              {/* CI/CD Pipeline Workflow Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('cicd_workflow')}
                style={{ padding: '24px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚙️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>CI/CD Pipeline Builder</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Visueller Workflow-Builder für GitHub Actions & Live Runner.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Pipeline Builder <ArrowRight size={16} />
                </span>
              </div>

              {/* All Labs Hub Card */}
              <div
                className="glass-panel glass-panel-hover"
                onClick={() => setActiveTab('labs')}
                style={{ padding: '24px', cursor: 'pointer', border: '2px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧪</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Interactive Labs Explorer</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Alle 25+ Simulatoren & Labs mit Such- und Tag-Filtern durchstöbern.
                </p>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Labs Explorer <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LABS DASHBOARD TAB */}
        {activeTab === 'labs' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <LabsDashboard onSelectLab={(labId) => setActiveTab(labId)} />
          </Suspense>
        )}

        {/* CAMPAIGN QUEST HUB TAB */}
        {activeTab === 'campaign' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CampaignQuestHub
              userState={userState}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRewardXP={(xp) => awardXP(xp, 'campaign_step')}
            />
          </Suspense>
        )}

        {/* IHK ORAL EXAM TAB */}
        {activeTab === 'oral_exam' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <IhkOralExamSimulator onRewardXP={(xp) => awardXP(xp, 'oral_exam_master')} />
          </Suspense>
        )}

        {/* SQL JOINS VISUALIZER TAB */}
        {activeTab === 'sql_joins' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <SqlJoinVisualizerLab onRewardXP={(xp) => awardXP(xp, 'sql_join_master')} />
          </Suspense>
        )}

        {/* GIT BRANCH GRAPH LAB TAB */}
        {activeTab === 'git_graph_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <GitBranchGraphLab onRewardXP={(xp) => awardXP(xp, 'git_graph_master')} />
          </Suspense>
        )}

        {/* VON-NEUMANN CPU ARCHITECTURE LAB TAB */}
        {activeTab === 'cpu_architecture_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CpuArchitectureLab onRewardXP={(xp) => awardXP(xp, 'cpu_master')} />
          </Suspense>
        )}

        {/* SQL QUERY OPTIMIZER LAB TAB */}
        {activeTab === 'sql_optimizer_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <SqlQueryOptimizerLab onRewardXP={(xp) => awardXP(xp, 'sql_optimizer_master')} />
          </Suspense>
        )}

        {/* DATA STRUCTURES TAB */}
        {activeTab === 'datastructures' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <DataStructuresLab onRewardXP={(xp) => awardXP(xp, 'trees_graphs_master')} />
          </Suspense>
        )}

        {/* CI/CD WORKFLOW TAB */}
        {activeTab === 'cicd_workflow' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CiCdWorkflowLab onRewardXP={(xp) => awardXP(xp, 'cicd_workflow_master')} />
          </Suspense>
        )}

        {/* ANFAENGER GUIDE TAB */}
        {activeTab === 'anfaenger_guide' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <AnfaengerGuideHub />
          </Suspense>
        )}

        {/* SUBNETTING LAB TAB */}
        {activeTab === 'subnetting' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <SubnettingLab onRewardXP={(xp) => awardXP(xp, 'subnetting_master')} />
          </Suspense>
        )}

        {/* GIT BRANCHING LAB TAB */}
        {activeTab === 'git_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <GitLab onRewardXP={(xp) => awardXP(xp, 'git_master')} />
          </Suspense>
        )}

        {/* ALGORITHMS PLAYGROUND LAB TAB */}
        {activeTab === 'algo_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <AlgoPlaygroundLab onRewardXP={(xp) => awardXP(xp, 'algo_master')} />
          </Suspense>
        )}

        {/* PYTHON WASM LAB TAB */}
        {activeTab === 'python_wasm' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <PythonWasmLab onRewardXP={(xp) => awardXP(xp, 'python_wasm_master')} />
          </Suspense>
        )}

        {/* PACKET TRACER LAB TAB */}
        {activeTab === 'packet_tracer' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <PacketTracerLab onRewardXP={(xp) => awardXP(xp, 'packet_tracer_master')} />
          </Suspense>
        )}

        {/* LEITNER FLASHCARDS TAB */}
        {activeTab === 'leitner' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <LeitnerFlashcardLab onRewardXP={(xp) => awardXP(xp, 'leitner_master')} />
          </Suspense>
        )}

        {/* MONACO STUDIO TAB */}
        {activeTab === 'monaco_studio' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <MonacoStudioLab onRewardXP={(xp) => awardXP(xp, 'monaco_master')} />
          </Suspense>
        )}

        {/* CLOUD DESIGNER TAB */}
        {activeTab === 'cloud_designer' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CloudDesignerLab onRewardXP={(xp) => awardXP(xp, 'cloud_designer_master')} />
          </Suspense>
        )}

        {/* API MOCK STUDIO TAB */}
        {activeTab === 'api_mock_studio' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <ApiMockStudioLab onRewardXP={(xp) => awardXP(xp, 'api_mock_master')} />
          </Suspense>
        )}

        {/* CYBERSECURITY CTF TAB */}
        {activeTab === 'ctf_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CtfChallengeLab onRewardXP={(xp) => awardXP(xp, 'ctf_master')} />
          </Suspense>
        )}

        {/* CI/CD PIPELINE TAB */}
        {activeTab === 'cicd_pipeline' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CiCdPipelineLab onRewardXP={(xp) => awardXP(xp, 'cicd_master')} />
          </Suspense>
        )}

        {/* DOCKER COMPOSE TAB */}
        {activeTab === 'docker_compose' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <DockerComposeLab onRewardXP={(xp) => awardXP(xp, 'docker_compose_master')} />
          </Suspense>
        )}

        {/* SYSTEM DESIGN LAB TAB */}
        {activeTab === 'system_design' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <SystemDesignLab onRewardXP={(xp) => awardXP(xp, 'system_design_master')} />
          </Suspense>
        )}

        {/* REGEX MASTER LAB TAB */}
        {activeTab === 'regex_master' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <RegexMasterLab onRewardXP={(xp) => awardXP(xp, 'regex_master')} />
          </Suspense>
        )}

        {/* WEBSOCKET PROTOCOL LAB TAB */}
        {activeTab === 'websocket_protocol' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <WebSocketProtocolLab onRewardXP={(xp) => awardXP(xp, 'websocket_protocol_master')} />
          </Suspense>
        )}

        {/* VECTOR SEARCH RAG LAB TAB */}
        {activeTab === 'vector_search' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <VectorSearchLab onRewardXP={(xp) => awardXP(xp, 'vector_search_master')} />
          </Suspense>
        )}

        {/* BIG-O BENCHMARK LAB TAB */}
        {activeTab === 'bigo_benchmark' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <BigOBenchmarkLab onRewardXP={(xp) => awardXP(xp, 'bigo_benchmark_master')} />
          </Suspense>
        )}

        {/* OAUTH2 PKCE STUDIO TAB */}
        {activeTab === 'oauth_pkce_studio' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <OauthPkceStudio onRewardXP={(xp) => awardXP(xp, 'oauth_pkce_master')} />
          </Suspense>
        )}

        {/* WASM RUST STUDIO TAB */}
        {activeTab === 'wasm_rust_studio' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <WasmRustStudio onRewardXP={(xp) => awardXP(xp, 'wasm_rust_master')} />
          </Suspense>
        )}

        {/* NEXT-GEN LABS & GENERATORS */}
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

        {/* OAUTH & OIDC LAB TAB */}
        {activeTab === 'oauth' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <OauthOidcLab />
          </Suspense>
        )}

        {/* OAUTH2 & OIDC LAB TAB */}
        {activeTab === 'oauth_oidc' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <OauthOidcLab />
          </Suspense>
        )}

        {/* WEBSOCKETS REALTIME LAB TAB */}
        {activeTab === 'websockets' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <WebSocketsLab />
          </Suspense>
        )}

        {/* PERFORMANCE PROFILING LAB TAB */}
        {activeTab === 'perf_lab' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <PerformanceProfilingLab />
          </Suspense>
        )}

        {/* KUBERNETES LAB TAB */}
        {activeTab === 'kubernetes' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <KubernetesLab />
          </Suspense>
        )}

        {/* RAG VECTOR AI SIMULATOR TAB */}
        {activeTab === 'rag_ai' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <RagAiSimulator />
          </Suspense>
        )}

        {/* WEBASSEMBLY RUST LAB TAB */}
        {activeTab === 'wasm_rust' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <WasmRustLab />
          </Suspense>
        )}

        {/* KAFKA EVENT-DRIVEN LAB TAB */}
        {activeTab === 'kafka' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <KafkaEventLab />
          </Suspense>
        )}

        {/* DOCKER LAB TAB */}
        {activeTab === 'docker' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <DockerLab />
          </Suspense>
        )}

        {/* CLOUD DEVOPS TAB */}
        {activeTab === 'cloud_devops' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CloudDevOpsLab />
          </Suspense>
        )}

        {/* RED / BLUE TEAM SECURITY TAB */}
        {activeTab === 'security_lab_v2' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <RedBlueTeamLab />
          </Suspense>
        )}

        {/* API BENCH STUDIO TAB */}
        {activeTab === 'api_studio' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <ApiBenchStudio />
          </Suspense>
        )}

        {/* AI BUSINESS MASTERCLASS TAB */}
        {activeTab === 'ai_business' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <AiBusinessMasterclass />
          </Suspense>
        )}

        {/* PODCAST HUB TAB */}
        {activeTab === 'podcast' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <ItPodcastHub />
          </Suspense>
        )}

        {/* IHK LERNFELDER TAB */}
        {activeTab === 'lernfelder' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <FisiLernfelderHub />
          </Suspense>
        )}

        {/* WEB COMPONENTS TAB */}
        {activeTab === 'web_components' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <WebComponentsHub />
          </Suspense>
        )}

        {/* TDD UNIT TESTING TAB */}
        {activeTab === 'tdd' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <TddUnitTestLab onRewardXP={(xp) => awardXP(xp, 'tdd_master')} />
          </Suspense>
        )}

        {/* SYSTEM ARCHITECTURE TAB */}
        {activeTab === 'architecture' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <ArchitectureVisualizer />
          </Suspense>
        )}

        {/* DESIGN PATTERNS TAB */}
        {activeTab === 'design_patterns' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <DesignPatternsLab />
          </Suspense>
        )}

        {/* CAREER ROADMAPS TAB */}
        {activeTab === 'roadmaps' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <CareerRoadmap userState={userState} />
          </Suspense>
        )}

        {/* BIG-O VISUALIZER TAB */}
        {activeTab === 'big_o' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <BigOVisualizer />
          </Suspense>
        )}

        {/* WISSENS QUIZ ARENA TAB */}
        {activeTab === 'quiz_arena' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <KnowledgeQuizArena onRewardXP={(xp) => awardXP(xp, 'quiz_master')} />
          </Suspense>
        )}

        {/* SPRACHEN ACADEMY TAB */}
        {activeTab === 'languages' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <LanguageAcademy />
          </Suspense>
        )}

        {/* KI-LAB TAB */}
        {activeTab === 'ai' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <AiPromptLab />
          </Suspense>
        )}

        {/* IDE & TOOLS SETUP TAB */}
        {activeTab === 'tooling' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <ToolingSetupGuide />
          </Suspense>
        )}

        {/* APP-WORKSHOP TAB */}
        {activeTab === 'app_workshop' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <AppWorkshop onCompleteWorkshop={(xp) => awardXP(xp, 'app_builder')} />
          </Suspense>
        )}

        {/* WISSEN & FACHKUNDE TAB */}
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
                  <BookOpen size={30} style={{ color: 'var(--accent-primary)' }} /> Fachkunde & Wissensmodule
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

        {/* GAMES TAB */}
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
              {activeGameId === 'sql' && <SqlDungeon onCompleteGame={(id, xp) => awardXP(xp, 'sql_master')} />}
              {activeGameId === 'security' && <SecurityLab onCompleteGame={(id, xp) => awardXP(xp, 'security_expert')} />}
              {activeGameId === 'boss' && <BossBattleGame onCompleteGame={(id, xp) => awardXP(xp, 'boss_slayer')} />}
              {activeGameId === 'typing_speedrun' && <CodeTypingSpeedrun onCompleteGame={(id, xp) => awardXP(xp, 'typing_god')} />}
              {activeGameId === 'cli' && <CliTerminalLab onCompleteGame={(id, xp) => awardXP(xp, 'cli_master')} />}
              {activeGameId === 'regex' && <RegexLab onCompleteGame={(id, xp) => awardXP(xp, 'regex_master')} />}
              {activeGameId === 'puzzle' && <CodePuzzle onCompleteGame={(id, xp) => awardXP(xp)} />}
              {activeGameId === 'logic' && <LogicGatesGame onCompleteGame={(id, xp) => awardXP(xp, 'logic_genius')} />}
              {activeGameId === 'sandbox' && <WebSandbox onCompleteGame={(id, xp) => awardXP(xp, 'web_builder')} />}
            </Suspense>
          </div>
        )}

        {/* IHK EXAM TAB */}
        {activeTab === 'exam' && (
          <Suspense fallback={<LabLoadingFallback />}>
            <ExamSimulator onCompleteExam={(_score, xp) => awardXP(xp, 'exam_passed')} />
          </Suspense>
        )}

        {/* LÜCKENTEXT TAB */}
        {activeTab === 'lueckentext' && (
          <ClozeTester userState={userState} onCompleteCloze={(_id, xp) => awardXP(xp, 'cloze_wizard')} />
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <VideoHub onCompleteVideo={(_id, xp) => awardXP(xp)} />
        )}

        {/* PROJEKTE TAB */}
        {activeTab === 'projekte' && (
          <ProjectViewer onCompleteProject={(_id, xp) => awardXP(xp)} />
        )}
                </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with DSGVO Privacy & Impressum Modal */}
      <DsgvoFooterModal />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={userState.role}
        onSelectRole={handleSelectRole}
      />

      {/* Badges & XP Stats Modal */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        userState={userState}
      />

      {/* IT Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        userState={userState}
      />

      {/* Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
        onRewardXP={(xp) => awardXP(xp)}
      />

      {/* Vocabulary Trainer Modal */}
      <VocabularyTrainerModal
        isOpen={isVocabularyModalOpen}
        onClose={() => setIsVocabularyModalOpen(false)}
        onRewardXP={(xp) => awardXP(xp)}
      />

      {/* Live Deployment Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeploymentModalOpen}
        onClose={() => setIsDeploymentModalOpen(false)}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onStateRestored={refreshStateFromStorage}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab, subData) => {
          if (tab === 'topic-detail' && subData) {
            setSelectedTopicId(subData.id);
            setActiveTab('dashboard');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenModal={(modalType) => {
          if (modalType === 'badges') setIsBadgesModalOpen(true);
          else if (modalType === 'glossary') setIsGlossaryModalOpen(true);
          else if (modalType === 'flashcards') setIsFlashcardsModalOpen(true);
          else if (modalType === 'role') setIsRoleModalOpen(true);
        }}
      />
    </div>
  );
}

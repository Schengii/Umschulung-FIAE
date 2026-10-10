import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import Navbar from './components/Navigation/Navbar';
import MobileNav from './components/Navigation/MobileNav';
import DsgvoFooterModal from './components/Footer/DsgvoFooterModal';
import DifficultyFilterBar from './components/Navigation/DifficultyFilterBar';
const SkillMatrixWidget = lazy(() => import('./components/Gamification/SkillMatrixWidget'));
// Nur beim Betreten des jeweiligen Tabs benötigt (Wissen, Lückentext, Videos,
// Projekte, Prüfungssimulator) - nicht Teil des Dashboard-Erstladepfads, den
// die meisten Nutzer sehen. Lazy Loading hält das Haupt-Bundle unter Budget.
const TopicReader = lazy(() => import('./components/Content/TopicReader'));
const ClozeTester = lazy(() => import('./components/Content/ClozeTester'));
const VideoHub = lazy(() => import('./components/Content/VideoHub'));
const ProjectViewer = lazy(() => import('./components/Projects/ProjectViewer'));
const ExamSimulator = lazy(() => import('./components/Content/ExamSimulator'));
import DailyChallengeWidget from './components/Gamification/DailyChallengeWidget';
import ExamCountdownWidget from './components/Gamification/ExamCountdownWidget';
import SkillTreeWidget from './components/Gamification/SkillTreeWidget';
import ActivityHeatmapWidget from './components/Gamification/ActivityHeatmapWidget';
import PomodoroTimerWidget from './components/Navigation/PomodoroTimerWidget';
import PwaUpdateToast from './components/Navigation/PwaUpdateToast';
import ModalContainer from './components/Navigation/ModalContainer';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundView from './components/NotFoundView';

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

const CareerRoadmap = lazy(() => import('./components/Content/CareerRoadmap'));




// Neue Labs, Simulatoren & Kampagnen Hub
// Lazy: zieht examData (Fragenkatalog) nicht in den Haupt-Chunk
const MistakeReviewWidget = lazy(() => import('./components/Gamification/MistakeReviewWidget'));
const LabsDashboard = lazy(() => import('./components/Content/LabsDashboard'));
const CampaignQuestHub = lazy(() => import('./components/Content/CampaignQuestHub'));

// Next-Gen High-Value Labs & Generatoren

// Brandneue Fach-Labs & PDF-Spickzettel Generator

// Next-Gen Multiplayer & Coding Studios

// v3.8.0 Flagship Simulatoren, Architecture & IHK Power Studios

// v3.9.0 Cryptography & WebAssembly

// v3.10.0 Next-Gen OAuth PKCE, K8s Topology & WebRTC Mesh Studios

// v3.11.0 Next-Gen Memory, Pool, Dunning & Service Mesh

// v3.12.0 Next-Gen Container, Contribution Margin & Token Exchange

// v3.13.0 Next-Gen eBPF, Postgres Flamegraph, ABC/XYZ & WireGuard ZTNA

// v3.14.0 Next-Gen PromQL, Event-Sourcing, Loan & SFU

// v3.15.0 Next-Gen BPFtrace, Postgres WAL, Andler & OpenTelemetry

// v3.16.0 Next-Gen VXLAN, Partitioning, Interest & Kafka Rebalance

// v3.17.0 Next-Gen BGP Anycast, Postgres Fulltext, NPV & gRPC Protobuf

// v3.18.0 IHK Power Labs: NWA, RAID, VLSM & Projektantrag
// v3.30.0 IHK CPM, UML & IaC Studios
// v3.31.0 IHK Audio Fachgespräch, Ansible & Web Worker
// v3.32.0 IHK Präsentations-Timer & GitHub Actions CI/CD
// v3.33.0 IHK Projekt-Gantt & WebAssembly SIMD Studio
// v3.34.0 IHK Wirtschaftlichkeit, WebAuthn Passkeys & Systemd Cgroups
// v3.35.0 TLS 1.3 Replay, IHK Risikoanalyse, eBPF Cilium & Postgres Index Types
// v3.36.0 DNSSEC, IHK Burndown, Linux Btrfs CoW & OpenAPI Contract
// v3.43.0 Flagship Labs: BSI IT-Grundschutz, IPv6 SLAAC NDP, WISO Payroll, Study Plan & Certificate
const IhkStudyPlanLab = lazy(() => import('./components/Content/IhkStudyPlanLab'));
// v3.44.0 Clean Architecture, Linux NetNS, Multi-Contribution Margin & IHK Weakness Audit
const IhkWeaknessAuditLab = lazy(() => import('./components/Content/IhkWeaknessAuditLab'));
// v3.45.0 OAuth Revocation, RAID 6 Galois, SQLite Worker & Zuschlagskalkulation
// v3.46.0 Linux Capabilities, BGP Path Selection, Maschinenstundensatz & LLM RAG Chunking
// v3.47.0 Linux PSI Cgroups, NWA Sensitivity, WebRTC ICE & WISO Leverage
// v3.48.0 Linux MAC/SELinux, DNS Privacy, WISO Liquiditaet & RAG Semantic Cache
// v3.49.0 JWT Algorithm Confusion & Security Studio
// v3.50.0 Window Functions, ArgoCD GitOps & Vector Math Studios
// v3.51.0 SQL Transaction Isolation & DGUV V3 Elektrotechnik Studios
// v3.52.0 MEP Simulator, WISO Financing & PKI Chain Validator Studios
// v3.53.0 Routing Dijkstra/STP, HTTP Caching & Exam Readiness Roadmap Studios
// v3.54.0 SRP Zero-Knowledge & WISO Contract Breach Studios
// v3.55.0 WISO Company Forms & mTLS Zero-Trust Mesh Studios
// v3.56.0 WISO Personalbedarfsplanung & OAuth 2.1 RFC 9449 DPoP Security Studios
// v3.57.0 IHK Proposal Exporter & BGP Anycast DDoS Scrubber Studios
// v3.58.0 Cloud IAM, SRE SLO Burn, Kafka Consumer Lag & Linux Auditd eBPF Studios
// v3.59.0 K8s Gateway API, WISO Break-Even Stufe 2 & DNSSEC Rollover Studios
// v3.60.0 IHK WISO Doppelte Buchführung & BAB Kostenstellenrechnung
// v3.61.0 IHK WISO Zahlungsverkehr (SEPA, Wechsel, Skonto/Rabatt/Bonus)
import { LAB_REGISTRY, buildRegistryIndex } from './data/labRegistry';
import { observeAutoLabels } from './utils/a11yAutoLabel';
import DashboardQuickAccessGrid from './components/Content/DashboardQuickAccessGrid';

import { USER_ROLES } from './data/userProfiles';
import { TOPICS } from './data/topicsData';

import { BookOpen, Sparkles, ArrowRight, CheckCircle, Sprout, Compass } from 'lucide-react';

// Tabs, die nicht über die `activeLabElement`-Tabelle laufen, sondern als
// eigene JSX-Blöcke weiter unten gerendert werden. Alles, was weder hier noch
// in der Tabelle vorkommt, ist eine unbekannte URL und zeigt die 404-Ansicht.
const STANDALONE_TABS = ['dashboard', 'wissen', 'games', 'lueckentext', 'videos', 'projekte'];

const LabLoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: '600' }}>Modul wird geladen...</span>
  </div>
);

// Registry-Labs einmalig lazy wrappen (Modul-Ebene, damit die Komponenten-Identität stabil bleibt)
const LAB_REGISTRY_INDEX = buildRegistryIndex(
  LAB_REGISTRY.map((entry) => ({ ...entry, Component: lazy(entry.load) }))
);

export default function App() {
  const { 
    userState, handleSelectRole, awardXP, handleCompleteTopic, refreshStateFromStorage, recordMistakeResults, recordLabVisit, recordLabCompletion,
    theme, setTheme, fontSize, setFontSize,
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
  // Führende/abschließende Slashes entfernen, damit auch `/labs/` das Lab öffnet.
  const activeTab = location.pathname.replace(/^\/+|\/+$/g, '') || 'dashboard';
  const setActiveTab = (tab) => navigate(`/${tab}`);

  // Lab-Fortschritt: jeder Aufruf eines Registry-Labs zählt als Besuch
  // (Schlüssel = erste Tab-ID des Registry-Eintrags, auch bei Alias-Routen).
  useEffect(() => {
    const entry = LAB_REGISTRY_INDEX.get(activeTab);
    if (entry) recordLabVisit(entry.tabs[0]);
  }, [activeTab, recordLabVisit]);

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

  // Daten-getriebene Lab-Routing-Tabelle: bildet activeTab (bzw. mehrere
  // Alias-IDs desselben Labs) auf genau EIN gerendertes Lab-Element ab.
  // Ersetzt ~150 vormals einzeln geschriebene
  //   {activeTab === 'x' && (<Suspense ...><Component .../></Suspense>)}
  // Blöcke durch eine einzige Stelle, an der neue Labs ergänzt werden -
  // damit sind Copy-Paste-Fehler wie vertauschte Props/Datenfelder
  // strukturell ausgeschlossen. Komplexere Tabs (Dashboard, Wissen, Games,
  // Lückentext, Videos, Projekte) bleiben bewusst als eigene JSX-Blöcke
  // weiter unten erhalten, da sie mehr als ein einzelnes Lab rendern.
  // A11y-Sicherheitsnetz: unbeschriftete Steuerelemente in Labs bekommen einen
  // aus dem Kontext abgeleiteten aria-label (siehe utils/a11yAutoLabel.js).
  const mainRef = useRef(null);
  useEffect(() => observeAutoLabels(mainRef.current), []);

  const activeLabElement = (() => {
    switch (true) {
      case activeTab === 'labs':
        return (
          <LabsDashboard
            onSelectLab={(labId) => {
              // 'sqldungeon' ist kein eigener Tab, sondern ein Spiel im Games-Tab
              if (labId === 'sqldungeon') {
                setActiveGameId('sql');
                setActiveTab('games');
                return;
              }
              setActiveTab(labId);
            }}
            userState={userState}
          />
        );
      case activeTab === 'campaign':
        return (
          <CampaignQuestHub
            userState={userState}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRewardXP={(xp) => awardXP(xp, 'campaign_step')}
          />
        );
      case activeTab === 'ihk_study_plan_lab' || activeTab === 'ihk_study_plan' || activeTab === 'pruefungsplaner':
        return <IhkStudyPlanLab onNavigateTab={(tab) => setActiveTab(tab)} onRewardXP={(xp) => awardXP(xp, 'study_plan_master')} />;
      case activeTab === 'ihk_weakness_audit_lab' || activeTab === 'ihk_weakness_audit' || activeTab === 'schwachstellen_audit':
        return <IhkWeaknessAuditLab onNavigateTab={(tab) => setActiveTab(tab)} onRewardXP={(xp) => awardXP(xp, 'weakness_audit_master')} />;
      case activeTab === 'roadmaps':
        return <CareerRoadmap userState={userState} />;
      case activeTab === 'exam':
        return <ExamSimulator onCompleteExam={(_score, xp) => awardXP(xp, 'exam_passed')} onRecordResults={recordMistakeResults} />;
      default: {
        // Labs aus der zentralen Registry (src/data/labRegistry.js)
        const entry = LAB_REGISTRY_INDEX.get(activeTab);
        if (!entry) return null;
        const RegistryLab = entry.Component;
        const xpProps = {};
        if (entry.xp) {
          const { prop, badge, withBadgeArg } = entry.xp;
          const labKey = entry.tabs[0];
          xpProps[prop] = withBadgeArg
            ? (xp, b) => { recordLabCompletion(labKey); return awardXP(xp, b || badge); }
            : (xp) => { recordLabCompletion(labKey); return awardXP(xp, badge); };
        }
        return <RegistryLab {...xpProps} />;
      }
    }
  })();

  const isUnknownTab = !activeLabElement && !STANDALONE_TABS.includes(activeTab);

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
      <main ref={mainRef} style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px 40px 20px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
          <ErrorBoundary resetKey={activeTab} onGoHome={() => setActiveTab('dashboard')}>
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

                {/* IHK Prüfungs-Countdown & T-Minus Sprint */}
                <ExamCountdownWidget setActiveTab={setActiveTab} />

                {/* Fehlerjournal: fällige Wiederholungen */}
                <Suspense fallback={null}>
                  <MistakeReviewWidget />
                </Suspense>

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

            {activeLabElement && (
              <Suspense fallback={<LabLoadingFallback />}>
                {activeLabElement}
              </Suspense>
            )}

            {isUnknownTab && (
              <NotFoundView
                path={location.pathname}
                onGoHome={() => setActiveTab('dashboard')}
                onOpenSearch={() => setIsCommandPaletteOpen(true)}
              />
            )}

            {/* WISSEN & FACHKUNDE */}
            {activeTab === 'wissen' && (
              <div>
                {selectedTopicId ? (
                  <Suspense fallback={<LabLoadingFallback />}>
                    <TopicReader
                      topicId={selectedTopicId}
                      onBack={() => setSelectedTopicId(null)}
                      onCompleteTopic={handleCompleteTopic}
                      isCompleted={userState.completedTopics.includes(selectedTopicId)}
                    />
                  </Suspense>
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

            {/* LÜCKENTEXT */}
            {activeTab === 'lueckentext' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ClozeTester userState={userState} onCompleteCloze={(_id, xp) => awardXP(xp, 'cloze_wizard')} />
              </Suspense>
            )}

            {/* VIDEOS */}
            {activeTab === 'videos' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <VideoHub onCompleteVideo={(_id, xp) => awardXP(xp)} />
              </Suspense>
            )}

            {/* PROJEKTE */}
            {activeTab === 'projekte' && (
              <Suspense fallback={<LabLoadingFallback />}>
                <ProjectViewer onCompleteProject={(_id, xp) => awardXP(xp)} />
              </Suspense>
            )}
          </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Pomodoro Focus Timer */}
      <PomodoroTimerWidget />

      {/* PWA Background Update Toast */}
      <PwaUpdateToast />

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

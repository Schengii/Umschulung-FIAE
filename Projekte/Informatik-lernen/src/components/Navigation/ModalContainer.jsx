import React, { Suspense, lazy } from 'react';
import ErrorBoundary from '../ErrorBoundary';

// Alle Modals sind nur nach expliziter Nutzerinteraktion sichtbar - lazy()
// hält sie aus dem eager geladenen App-Shell-Bundle heraus.
const RoleSelectionModal = lazy(() => import('../Onboarding/RoleSelectionModal'));
const BadgesModal = lazy(() => import('../Gamification/BadgesModal'));
const GlossaryModal = lazy(() => import('../Content/GlossaryModal'));
const FlashcardsModal = lazy(() => import('../Gamification/FlashcardsModal'));
// Lazy: pulls in jspdf + html2canvas, only needed once the user opens it
const CertificateModal = lazy(() => import('../Gamification/CertificateModal'));
const BackupModal = lazy(() => import('../Gamification/BackupModal'));
const VocabularyTrainerModal = lazy(() => import('../Content/VocabularyTrainerModal'));
const DeploymentGuideModal = lazy(() => import('../Content/DeploymentGuideModal'));
const CommandPaletteModal = lazy(() => import('./CommandPaletteModal'));
const AudioSettingsModal = lazy(() => import('./AudioSettingsModal'));

// Kompakter Fallback für Modal-Abstürze: eine kleine, schließbare Notiz statt
// der großen Ganzseiten-Fallback-UI, die für Haupt-Content-Module gedacht ist.
const ModalCrashFallback = ({ retry }) => (
  <div
    role="alert"
    style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      maxWidth: '320px',
      padding: '16px 18px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-card)',
      border: '2px solid var(--accent-danger, #ef4444)',
      boxShadow: 'var(--shadow-card)'
    }}
  >
    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
      Dieses Fenster ist abgestürzt und wurde geschlossen.
    </p>
    <button className="btn btn-secondary" onClick={retry} style={{ fontSize: '0.85rem' }}>
      Schließen
    </button>
  </div>
);

export default function ModalContainer({
  isRoleModalOpen,
  setIsRoleModalOpen,
  isBadgesModalOpen,
  setIsBadgesModalOpen,
  isGlossaryModalOpen,
  setIsGlossaryModalOpen,
  isCertificateModalOpen,
  setIsCertificateModalOpen,
  isFlashcardsModalOpen,
  setIsFlashcardsModalOpen,
  isBackupModalOpen,
  setIsBackupModalOpen,
  isVocabularyModalOpen,
  setIsVocabularyModalOpen,
  isDeploymentModalOpen,
  setIsDeploymentModalOpen,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  isAudioModalOpen,
  setIsAudioModalOpen,
  userState,
  handleSelectRole,
  refreshStateFromStorage,
  setActiveTab
}) {
  return (
    <>
      {/* Role / Profil Modal */}
      {isRoleModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsRoleModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <RoleSelectionModal
              isOpen={isRoleModalOpen}
              currentRole={userState.role}
              onSelectRole={(roleId) => {
                handleSelectRole(roleId);
                setIsRoleModalOpen(false);
              }}
              onClose={() => setIsRoleModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Badges Modal */}
      {isBadgesModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsBadgesModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <BadgesModal
              isOpen={isBadgesModalOpen}
              unlockedBadges={userState.unlockedBadges}
              onClose={() => setIsBadgesModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Glossary Modal */}
      {isGlossaryModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsGlossaryModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <GlossaryModal
              isOpen={isGlossaryModalOpen}
              onClose={() => setIsGlossaryModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Certificate Modal */}
      {isCertificateModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsCertificateModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <CertificateModal
              isOpen={isCertificateModalOpen}
              userState={userState}
              onClose={() => setIsCertificateModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Flashcards Modal */}
      {isFlashcardsModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsFlashcardsModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <FlashcardsModal
              isOpen={isFlashcardsModalOpen}
              onClose={() => setIsFlashcardsModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Backup & Restore Modal */}
      {isBackupModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsBackupModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <BackupModal
              isOpen={isBackupModalOpen}
              onClose={() => setIsBackupModalOpen(false)}
              onDataImported={refreshStateFromStorage}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Vocabulary Modal */}
      {isVocabularyModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsVocabularyModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <VocabularyTrainerModal
              isOpen={isVocabularyModalOpen}
              onClose={() => setIsVocabularyModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Deployment Guide Modal */}
      {isDeploymentModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsDeploymentModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <DeploymentGuideModal
              isOpen={isDeploymentModalOpen}
              onClose={() => setIsDeploymentModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Command Palette (Ctrl+K) */}
      {isCommandPaletteOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsCommandPaletteOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <CommandPaletteModal
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setIsCommandPaletteOpen(false);
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Audio Settings Modal */}
      {isAudioModalOpen && (
        <ErrorBoundary fallback={({ retry }) => <ModalCrashFallback retry={() => { setIsAudioModalOpen(false); retry(); }} />}>
          <Suspense fallback={null}>
            <AudioSettingsModal
              isOpen={isAudioModalOpen}
              onClose={() => setIsAudioModalOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}

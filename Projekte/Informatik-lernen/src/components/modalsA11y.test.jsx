// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BadgesModal from './Gamification/BadgesModal';
import FlashcardsModal from './Gamification/FlashcardsModal';
import BackupModal from './Gamification/BackupModal';
import CertificateModal from './Gamification/CertificateModal';
import GlossaryModal from './Content/GlossaryModal';
import VocabularyTrainerModal from './Content/VocabularyTrainerModal';
import DeploymentGuideModal from './Content/DeploymentGuideModal';
import AudioSettingsModal from './Navigation/AudioSettingsModal';
import CommandPaletteModal from './Navigation/CommandPaletteModal';
import RoleSelectionModal from './Onboarding/RoleSelectionModal';

// Gemeinsamer Vertrag aller Modals mit `isOpen`/`onClose` (PLAN.md M08/M09):
// modaler Dialog, Fokus im Dialog, Escape schließt, Tab bleibt im Dialog.
const MODALS = [
  ['BadgesModal', BadgesModal, { userState: {} }],
  ['FlashcardsModal', FlashcardsModal, {}],
  ['BackupModal', BackupModal, {}],
  ['CertificateModal', CertificateModal, { userState: { xp: 0, level: 1, completedTopics: [], badges: [] } }],
  ['GlossaryModal', GlossaryModal, {}],
  ['VocabularyTrainerModal', VocabularyTrainerModal, {}],
  ['DeploymentGuideModal', DeploymentGuideModal, {}],
  ['AudioSettingsModal', AudioSettingsModal, {}],
  ['CommandPaletteModal', CommandPaletteModal, { onNavigate: () => {}, onOpenModal: () => {} }],
  ['RoleSelectionModal', RoleSelectionModal, { currentRole: 'anfaenger', onSelectRole: () => {} }]
];

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe.each(MODALS)('%s', (_name, Modal, props) => {
  it('ist ein modaler Dialog mit Beschriftung und Fokus im Dialog', () => {
    render(<Modal isOpen onClose={() => {}} {...props} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const labelled = labelledBy ? document.getElementById(labelledBy)?.textContent : dialog.getAttribute('aria-label');
    expect(labelled?.trim().length).toBeGreaterThan(0);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('schließt per Escape', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} {...props} />);
    // Die Befehlspalette fängt Escape am Eingabefeld ab, alle anderen am Fenster.
    fireEvent.keyDown(document.activeElement ?? window, { key: 'Escape', bubbles: true });
    expect(onClose).toHaveBeenCalled();
  });

  it('rendert nichts, wenn geschlossen', () => {
    render(<Modal isOpen={false} onClose={() => {}} {...props} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

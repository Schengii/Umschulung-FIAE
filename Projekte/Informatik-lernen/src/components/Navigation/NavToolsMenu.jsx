import React from 'react';
import { Layers, BookOpen, BookMarked, Rocket, Volume2, ShieldCheck } from 'lucide-react';
import { onActivationKey } from '../Shared/keyActivation';

export default function NavToolsMenu({
  onOpenFlashcardsModal,
  onOpenGlossaryModal,
  onOpenVocabularyModal,
  onOpenDeploymentModal,
  onOpenAudioModal,
  onOpenBackupModal,
  onClose
}) {
  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: '125%',
        right: 0,
        width: 'min(300px, calc(100vw - 32px))',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4)',
        padding: '10px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenFlashcardsModal(); onClose(); })}
        onClick={() => { onOpenFlashcardsModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Layers size={17} color="var(--accent-purple)" /> IT-Karteikarten (SM-2)
      </div>

      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenGlossaryModal(); onClose(); })}
        onClick={() => { onOpenGlossaryModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <BookOpen size={17} color="var(--accent-primary)" /> IT-Lexikon (200+ Begriffe)
      </div>

      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenVocabularyModal(); onClose(); })}
        onClick={() => { onOpenVocabularyModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <BookMarked size={17} color="var(--accent-teal)" /> Fachwort-Vokabeltrainer
      </div>

      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenDeploymentModal(); onClose(); })}
        onClick={() => { onOpenDeploymentModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Rocket size={17} color="var(--accent-amber)" /> Live Deployment Guide
      </div>

      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenAudioModal(); onClose(); })}
        onClick={() => { onOpenAudioModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Volume2 size={17} color="var(--accent-teal)" /> Audio- &amp; SFX-Einstellungen
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

      <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => { onOpenBackupModal(); onClose(); })}
        onClick={() => { onOpenBackupModal(); onClose(); }}
        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <ShieldCheck size={17} /> Backup &amp; Wiederherstellen
      </div>
    </div>
  );
}


import React, { useState, useRef, useEffect } from 'react';
import { USER_ROLES } from '../../data/userProfiles';
import { Trophy, Flame, Code2, Search, ChevronDown, Wrench, Menu, X } from 'lucide-react';
import NavDesktopMenu from './NavDesktopMenu';
import NavToolsMenu from './NavToolsMenu';
import NavProfileMenu from './NavProfileMenu';
import NavMobileDrawer from './NavMobileDrawer';
import { onActivationKey } from '../Shared/keyActivation';

export default function Navbar({
  userState,
  onOpenProfileModal,
  onOpenBadgesModal,
  onOpenGlossaryModal,
  onOpenCertificateModal,
  onOpenFlashcardsModal,
  onOpenVocabularyModal,
  onOpenBackupModal,
  onOpenDeploymentModal,
  onOpenCommandPalette,
  onOpenAudioModal,
  activeTab,
  setActiveTab,
  setFontSize,
  isDyslexic,
  setIsDyslexic,
  isColorblind,
  setIsColorblind,
  isHighContrast,
  setIsHighContrast,
  isReducedMotion,
  setIsReducedMotion,
  theme,
  setTheme
}) {
  const currentRole = USER_ROLES[userState.role] || USER_ROLES.anfaenger;

  // Single Active Dropdown: 'labs' | 'exam' | 'learn' | 'tools' | 'profile_menu' | 'mobile_nav' | null
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    setActiveDropdown(null);
  };

  const isLabsActive = activeDropdown === 'labs' || activeTab === 'labs' || activeTab.includes('lab') || activeTab === 'wiso_kalkulation' || activeTab === 'ieee754_lab' || activeTab === 'ipv6_routing_lab' || activeTab === 'owasp_exploit_lab' || activeTab === 'neural_net_lab';
  const isExamActive = activeDropdown === 'exam' || activeTab === 'exam' || activeTab === 'oral_exam' || activeTab === 'lernfelder' || activeTab === 'podcast' || activeTab === 'cheat_sheets';
  const isLearnActive = activeDropdown === 'learn' || activeTab === 'anfaenger_guide' || activeTab === 'campaign' || activeTab === 'languages' || activeTab === 'ai_business';

  return (
    <header
      ref={navRef}
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        {/* 1. Left: Brand Logo */}
        <div onKeyDown={onActivationKey(() => navigateTo('dashboard'))}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigateTo('dashboard')}
          role="button"
          tabIndex={0}
          aria-label="Zum Dashboard"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-cta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
            }}
          >
            <Code2 size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main)' }}>
              IT<span className="text-gradient">-DEVGAME</span>
            </h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '-3px', fontWeight: 600 }}>
              Interactive Learning Platform
            </span>
          </div>
        </div>

        {/* 2. Middle: Desktop Navigation */}
        <NavDesktopMenu
          activeTab={activeTab}
          activeDropdown={activeDropdown}
          toggleDropdown={toggleDropdown}
          navigateTo={navigateTo}
          isLabsActive={isLabsActive}
          isExamActive={isExamActive}
          isLearnActive={isLearnActive}
        />

        {/* 3. Right: Unified TOOLS & PROFIL & SETTINGS Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Search Button (Command Palette) */}
          <button
            className="btn btn-secondary btn-sm header-btn"
            onClick={onOpenCommandPalette}
            style={{
              gap: '6px',
              fontWeight: 700,
              background: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
              minHeight: '40px',
              padding: '8px 14px'
            }}
            title="Schnellsuche (Ctrl + K)"
          >
            <Search size={16} />
            <span className="desktop-only" style={{ fontSize: '0.88rem' }}>Suche</span>
            <kbd className="desktop-only" style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Ctrl+K</kbd>
          </button>

          {/* DROPDOWN: Tools & Lernwerkzeuge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleDropdown('tools')}
              className="btn btn-secondary btn-sm header-btn"
              style={{
                minHeight: '40px',
                padding: '8px 14px',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                borderColor: activeDropdown === 'tools' ? 'var(--accent-primary)' : 'var(--border-color)',
                color: activeDropdown === 'tools' ? 'var(--accent-primary)' : 'var(--text-main)'
              }}
              title="Lernwerkzeuge & Modale"
            >
              <Wrench size={16} />
              <span className="desktop-only">Tools</span>
              <ChevronDown size={14} style={{ transform: activeDropdown === 'tools' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>
            {activeDropdown === 'tools' && (
              <NavToolsMenu
                onOpenFlashcardsModal={onOpenFlashcardsModal}
                onOpenGlossaryModal={onOpenGlossaryModal}
                onOpenVocabularyModal={onOpenVocabularyModal}
                onOpenDeploymentModal={onOpenDeploymentModal}
                onOpenAudioModal={onOpenAudioModal}
                onOpenBackupModal={onOpenBackupModal}
                onClose={() => setActiveDropdown(null)}
              />
            )}
          </div>

          {/* DROPDOWN: ALL-IN-ONE PROFIL & EINSTELLUNGEN Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleDropdown('profile_menu')}
              className="btn btn-secondary btn-sm header-btn"
              style={{
                minHeight: '40px',
                padding: '6px 12px',
                gap: '8px',
                fontWeight: 700,
                borderRadius: '9999px',
                borderColor: activeDropdown === 'profile_menu' ? 'var(--accent-primary)' : 'var(--border-color)',
                background: 'var(--bg-tertiary)'
              }}
              title="Profil, Level & Einstellungen"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: '800' }}>
                <Flame size={15} />
                <span>{userState.xp} XP</span>
              </div>
              <div style={{ height: '14px', width: '1px', background: 'var(--border-color)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: '800' }}>
                <Trophy size={15} />
                <span>Lvl {userState.level}</span>
              </div>
              <ChevronDown size={14} style={{ transform: activeDropdown === 'profile_menu' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
            </button>
            {activeDropdown === 'profile_menu' && (
              <NavProfileMenu
                userState={userState}
                currentRole={currentRole}
                onOpenProfileModal={onOpenProfileModal}
                onOpenBadgesModal={onOpenBadgesModal}
                onOpenCertificateModal={onOpenCertificateModal}
                onClose={() => setActiveDropdown(null)}
                theme={theme}
                setTheme={setTheme}
                setFontSize={setFontSize}
                isDyslexic={isDyslexic}
                setIsDyslexic={setIsDyslexic}
                isColorblind={isColorblind}
                setIsColorblind={setIsColorblind}
                isHighContrast={isHighContrast}
                setIsHighContrast={setIsHighContrast}
                isReducedMotion={isReducedMotion}
                setIsReducedMotion={setIsReducedMotion}
              />
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-only btn btn-secondary btn-sm"
            onClick={() => toggleDropdown('mobile_nav')}
            style={{ minHeight: '40px', width: '40px', flexShrink: 0, padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Navigation öffnen"
          >
            {activeDropdown === 'mobile_nav' ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Responsive Hamburger Drawer */}
      {activeDropdown === 'mobile_nav' && (
        <NavMobileDrawer onNavigate={navigateTo} />
      )}
    </header>
  );
}

import React from 'react';
import { Terminal, GraduationCap, BookOpen, ChevronDown } from 'lucide-react';
import { labsMenuItems, examMenuItems, learnMenuItems } from '../../data/navbarMenuItems';
import NavDropdownMenu from './NavDropdownMenu';

export default function NavDesktopMenu({
  activeTab,
  activeDropdown,
  toggleDropdown,
  navigateTo,
  isLabsActive,
  isExamActive,
  isLearnActive
}) {
  return (
    <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => navigateTo('dashboard')}
        style={{
          padding: '9px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.92rem',
          fontWeight: '700',
          background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
          color: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-main)',
          border: activeTab === 'dashboard' ? '1px solid var(--accent-primary)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        Dashboard
      </button>

      {/* DROPDOWN 1: Labs & Tools */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => toggleDropdown('labs')}
          style={{
            padding: '9px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.92rem',
            fontWeight: '700',
            background: isLabsActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
            color: isLabsActive ? 'var(--accent-primary)' : 'var(--text-main)',
            border: activeDropdown === 'labs' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Terminal size={17} color="var(--accent-primary)" />
          <span>Labs &amp; Tools</span>
          <ChevronDown size={14} style={{ transform: activeDropdown === 'labs' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>
        {activeDropdown === 'labs' && (
          <NavDropdownMenu items={labsMenuItems} activeTab={activeTab} onSelect={navigateTo} badgeBg="rgba(99, 102, 241, 0.15)" badgeColor="var(--accent-primary)" />
        )}
      </div>

      {/* DROPDOWN 2: IHK Prüfung */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => toggleDropdown('exam')}
          style={{
            padding: '9px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.92rem',
            fontWeight: '700',
            background: isExamActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
            color: isExamActive ? 'var(--accent-primary)' : 'var(--text-main)',
            border: activeDropdown === 'exam' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <GraduationCap size={17} color="var(--accent-teal)" />
          <span>IHK Prüfung</span>
          <ChevronDown size={14} style={{ transform: activeDropdown === 'exam' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>
        {activeDropdown === 'exam' && (
          <NavDropdownMenu items={examMenuItems} activeTab={activeTab} onSelect={navigateTo} badgeBg="rgba(13, 148, 136, 0.15)" badgeColor="var(--accent-teal)" />
        )}
      </div>

      {/* DROPDOWN 3: Kurse & Wissen */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => toggleDropdown('learn')}
          style={{
            padding: '9px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.92rem',
            fontWeight: '700',
            background: isLearnActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
            color: isLearnActive ? 'var(--accent-primary)' : 'var(--text-main)',
            border: activeDropdown === 'learn' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <BookOpen size={17} color="var(--accent-amber)" />
          <span>Kurse &amp; Wissen</span>
          <ChevronDown size={14} style={{ transform: activeDropdown === 'learn' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>
        {activeDropdown === 'learn' && (
          <NavDropdownMenu items={learnMenuItems} activeTab={activeTab} onSelect={navigateTo} badgeBg="rgba(217, 119, 6, 0.15)" badgeColor="var(--accent-amber)" />
        )}
      </div>

      {/* Mini-Games Button */}
      <button
        onClick={() => navigateTo('games')}
        style={{
          padding: '9px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.92rem',
          fontWeight: '700',
          background: activeTab === 'games' ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
          color: activeTab === 'games' ? 'var(--accent-primary)' : 'var(--text-main)',
          border: activeTab === 'games' ? '1px solid var(--accent-primary)' : '1px solid transparent',
          cursor: 'pointer'
        }}
      >
        🎮 Games
      </button>
    </nav>
  );
}

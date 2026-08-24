import React from 'react';
import { Home, BookOpen, Gamepad2, FileText, GraduationCap, Video, FolderGit2 } from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'wissen', label: 'Wissen', icon: BookOpen },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'lueckentext', label: 'Lücken', icon: FileText },
    { id: 'exam', label: 'IHK', icon: GraduationCap },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'projekte', label: 'Projekte', icon: FolderGit2 }
  ];

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-secondary)',
        borderTop: '2px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '6px 2px',
        zIndex: 1000,
        boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.1)'
      }}
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: isActive ? '800' : '600',
              cursor: 'pointer',
              gap: '2px',
              flex: 1,
              minHeight: '44px',
              padding: '4px 0'
            }}
            aria-label={tab.label}
          >
            <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

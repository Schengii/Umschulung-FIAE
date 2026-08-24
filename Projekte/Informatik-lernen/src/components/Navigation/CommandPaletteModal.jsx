import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Terminal, BookOpen, Sparkles, Trophy, Cpu, Code2, 
  Layers, Award, FileText, ArrowRight, X, Command, Database
} from 'lucide-react';
import { TOPICS } from '../../data/topicsData';
import { GLOSSARY_TERMS } from '../../data/glossaryData';

export default function CommandPaletteModal({ isOpen, onClose, onNavigate, onOpenModal }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Schnell-Befehle & Navigationselemente
  const staticActions = [
    { id: 'view-home', title: 'Übersicht / Startseite', category: 'Navigation', icon: BookOpen, action: () => onNavigate('home') },
    { id: 'view-topics', title: 'Alle Informatik-Themen', category: 'Themen & Content', icon: Layers, action: () => onNavigate('home', 'topics') },
    { id: 'view-labs', title: 'Interaktive Labs & Simulatoren', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('labs') },
    { id: 'view-jwks-rotation', title: 'OAuth2 JWKS Key Rotation Lab', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('jwks_rotation_lab') },
    { id: 'view-postgres-mvcc', title: 'PostgreSQL MVCC & VACUUM Lab', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_mvcc_lab') },
    { id: 'view-http3-quic', title: 'HTTP/3 & QUIC Protocol Inspector', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('http3_quic_lab') },
    { id: 'view-redis-caching', title: 'Redis Caching & Invalidation Lab', category: 'Labs & Tools', icon: Database, action: () => onNavigate('redis_caching_lab') },
    { id: 'view-circuit-breaker', title: 'Circuit Breaker & Resilience Lab', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('circuit_breaker_lab') },
    { id: 'view-k8s-cni', title: 'Kubernetes CNI & VXLAN Overlay Lab', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('k8s_cni_lab') },
    { id: 'view-graphql-resolver', title: 'GraphQL AST & DataLoader Lab', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('graphql_resolver_lab') },
    { id: 'view-linux-permissions', title: 'Linux Permissions & Inode Rechner', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('linux_permissions_lab') },
    { id: 'view-crypto-keygen', title: 'RSA & Diffie-Hellman Crypto Lab', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('crypto_keygen_lab') },
    { id: 'view-cicd-matrix', title: 'CI/CD Matrix Linter & Runner Lab', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('cicd_matrix_lab') },
    { id: 'view-postgres-explain', title: 'PostgreSQL Query Tree & Cost Visualizer', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_explain_lab') },
    { id: 'view-webrtc-signaling', title: 'WebRTC P2P & SDP Signaling Lab', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('webrtc_signaling_lab') },
    { id: 'view-code-debugger', title: 'Code Execution & Memory Debugger Lab', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('code_debugger_lab') },
    { id: 'view-clean-code', title: 'Clean Code & Security Review Arena', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('clean_code_lab') },
    { id: 'view-dns-http', title: 'DNS & HTTP/TLS Request Inspector', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('dns_http_lab') },
    { id: 'view-sql-transaction', title: 'SQL Transaktionen & ACID Simulator', category: 'Labs & Tools', icon: Database, action: () => onNavigate('sql_transaction_lab') },
    { id: 'view-ihk-doku', title: 'IHK Projektantrags- & Doku-Generator', category: 'Prüfung', icon: FileText, action: () => onNavigate('ihk_doc_generator') },
    { id: 'view-games', title: 'Coding Games & SQL Dungeon', category: 'Spiele', icon: Trophy, action: () => onNavigate('games') },
    { id: 'view-exam', title: 'IHK Prüfungssimulator (AP1 & AP2)', category: 'Prüfung', icon: FileText, action: () => onNavigate('exam') },
    { id: 'view-oral-exam', title: 'IHK Mündliches Fachgespräch Simulation', category: 'Prüfung', icon: Award, action: () => onNavigate('oral-exam') },
    { id: 'view-campaign', title: 'Story-Kampagne: Der IT-Aufstieg', category: 'Quests', icon: Sparkles, action: () => onNavigate('campaign') },
    { id: 'view-cpu-arch', title: 'Von-Neumann CPU & Register-Simulator', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('cpu_architecture_lab') },
    { id: 'view-sql-optimizer', title: 'SQL Query Optimizer & EXPLAIN Lab', category: 'Labs & Tools', icon: Database, action: () => onNavigate('sql_optimizer_lab') },
    { id: 'view-git-graph', title: 'Git Branch & Rebase Graph Visualizer', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('git_graph_lab') },
    { id: 'view-sql-join', title: 'SQL JOIN Visualizer Lab', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('sql_joins') },
    { id: 'modal-badges', title: 'Erfolge & Abzeichen ansehen', category: 'Profil & Gamification', icon: Trophy, action: () => onOpenModal('badges') },
    { id: 'modal-glossary', title: 'IT-Glossar & Fachbegriffe durchsuchen', category: 'Wissen', icon: BookOpen, action: () => onOpenModal('glossary') },
    { id: 'modal-flashcards', title: 'Karteikarten-Trainer öffnen', category: 'Lernen', icon: Layers, action: () => onOpenModal('flashcards') },
    { id: 'modal-role', title: 'Rolle / Fachrichtung wechseln (FIAE, FISI...)', category: 'Einstellungen', icon: Cpu, action: () => onOpenModal('role') }
  ];

  // Themen aus topicsData matchen
  const topicItems = TOPICS.map(t => ({
    id: `topic-${t.id}`,
    title: `${t.title} (${t.category})`,
    category: 'Lerneinheiten & Module',
    icon: BookOpen,
    description: t.description || '',
    action: () => onNavigate('topic-detail', t)
  }));

  // Glossarbegriffe matchen
  const glossaryMatches = GLOSSARY_TERMS.map(g => ({
    id: `glossary-${g.id}`,
    title: `${g.term}: ${(g.simpleExplanation || '').slice(0, 75)}...`,
    category: 'Glossar & Begriffe',
    icon: FileText,
    action: () => onOpenModal('glossary', g.term)
  }));

  const allItems = [...staticActions, ...topicItems, ...glossaryMatches];

  const filteredItems = search.trim() === '' 
    ? staticActions 
    : allItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 10);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '12vh',
          zIndex: 9999,
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '640px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', gap: '12px' }}>
            <Search size={20} color="var(--accent-primary)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Suche Themen, Labs, IHK-Prüfungen, Glossar... (↑↓ navigieren, Enter wählen)"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                color: 'var(--text-main)',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{ background: 'var(--bg-secondary)', padding: '3px 7px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>ESC</kbd>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '600' }}>Keine passenden Ergebnisse für "{search}"</p>
                <span style={{ fontSize: '0.85rem' }}>Versuche es mit Begriffen wie 'SQL', 'Git', 'IHK', 'Docker' oder 'Netzwerk'</span>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = item.icon || Terminal;
                return (
                  <div
                    key={item.id || index}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                      transition: 'all 0.1s ease',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '8px', 
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isSelected ? '#ffffff' : 'var(--accent-primary)',
                        flexShrink: 0
                      }}>
                        <IconComponent size={18} />
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: isSelected ? '700' : '600', color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                          {item.title}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <ArrowRight size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div style={{ 
            padding: '10px 16px', 
            borderTop: '1px solid var(--border-color)', 
            background: 'var(--bg-secondary)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>↑↓</kbd> Navigieren</span>
              <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>↵</kbd> Auswählen</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Command size={12} />
              <span>Informatik Power Search</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

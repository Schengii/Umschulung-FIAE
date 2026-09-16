import React, { useState } from 'react';
import { Cloud, UploadCloud, DownloadCloud, Key, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadToWebDav, downloadFromWebDav, DEFAULT_WEBDAV_CONFIG, type WebDavConfig } from '../services/cloudSyncService';
import type { Portfolio } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolios: Portfolio[];
  onImportSyncData: (data: Portfolio[]) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  portfolios,
  onImportSyncData
}) => {
  const [config, setConfig] = useState<WebDavConfig>(() => {
    const saved = localStorage.getItem('finanz_webdav_config');
    return saved ? JSON.parse(saved) : DEFAULT_WEBDAV_CONFIG;
  });

  const [pin, setPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const saveConfig = (newCfg: WebDavConfig) => {
    setConfig(newCfg);
    localStorage.setItem('finanz_webdav_config', JSON.stringify(newCfg));
  };

  const handleUpload = async () => {
    if (!pin) {
      setStatusMessage({ type: 'error', text: 'Bitte gib deine Master-PIN zur Verschlüsselung ein.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    const res = await uploadToWebDav(portfolios, pin, config);
    setIsLoading(false);

    if (res.success) {
      saveConfig(config);
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleDownload = async () => {
    if (!pin) {
      setStatusMessage({ type: 'error', text: 'Bitte gib deine Master-PIN zur Entschlüsselung ein.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    const res = await downloadFromWebDav(pin, config);
    setIsLoading(false);

    if (res.success && res.data) {
      saveConfig(config);
      onImportSyncData(res.data);
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Nextcloud & WebDAV Private Cloud Sync</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ende-zu-Ende verschlüsselte Synchronisation mit eigenem Server</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WebDAV Server URL</label>
            <input
              type="url"
              placeholder="https://cloud.meinedomain.de/remote.php/dav/files/benutzer/"
              value={config.serverUrl}
              onChange={e => setConfig({ ...config, serverUrl: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Benutzername</label>
              <input
                type="text"
                placeholder="Nextcloud User"
                value={config.username}
                onChange={e => setConfig({ ...config, username: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passwort / App-Token</label>
              <input
                type="password"
                placeholder="App-Passwort"
                value={config.password}
                onChange={e => setConfig({ ...config, password: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Key size={14} className="text-amber-400" /> Master-PIN (Für AES-GCM 256-Bit Verschlüsselung)
            </label>
            <input
              type="password"
              placeholder="Deine 4-stellige Master-PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
            />
          </div>

          {statusMessage && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <UploadCloud size={16} /> In Cloud sichern
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <DownloadCloud size={16} /> Aus Cloud laden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

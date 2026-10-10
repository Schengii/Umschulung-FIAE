import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

interface NetworkStatusIndicatorProps {
  onReconnect?: () => void;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ onReconnect }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnectedAlert, setShowReconnectedAlert] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedAlert(true);
      if (onReconnect) {
        onReconnect();
      }
      const timer = setTimeout(() => {
        setShowReconnectedAlert(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedAlert(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onReconnect]);

  if (showReconnectedAlert) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '20px',
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#10b981',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        animation: 'pulse 1.5s infinite'
      }} title="Internetverbindung wiederhergestellt. Kurse werden aktualisiert.">
        <CheckCircle2 size={13} />
        <span>Wieder online!</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '20px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#f87171',
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }} title="Offline: Lokaler Speicher & Cache aktiv. Änderungen werden lokal gesichert.">
        <WifiOff size={13} />
        <span>Offline-Modus</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-muted)',
      fontSize: '0.75rem'
    }} title="Online: Live-Kursdaten und Synchronisation aktiv">
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        boxShadow: '0 0 6px #10b981'
      }} />
      <span style={{ fontSize: '0.7rem' }}>Online</span>
    </div>
  );
};

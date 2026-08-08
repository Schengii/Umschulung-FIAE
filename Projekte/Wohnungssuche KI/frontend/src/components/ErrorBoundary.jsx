import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React ErrorBoundary hat einen Fehler abgefangen:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    if (confirm('Möchtest du wirklich den lokalen Cache zurücksetzen? Deine gespeicherten Offline-Daten (z. B. geladene Wohnungen bei Server-Offline) werden gelöscht. Das Suchprofil auf dem Server bleibt erhalten.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#060913',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 60%), radial-gradient(circle at 10% 20%, rgba(0, 242, 254, 0.03) 0%, transparent 40%)',
          fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif",
          color: '#f1f5f9',
          padding: '2rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: 'rgba(13, 19, 39, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(239, 68, 68, 0.05)',
            textAlign: 'center'
          }}>
            {/* Warning Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}>
              <AlertTriangle size={36} />
            </div>

            {/* Heading */}
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
              letterSpacing: '-0.5px',
              color: '#ef4444'
            }}>
              Hoppla, da ist etwas schiefgelaufen!
            </h1>

            <p style={{
              color: '#94a3b8',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Die Anwendung ist unerwartet abgestürzt. Dies kann durch veraltete oder fehlerhafte Cache-Daten im Browser verursacht worden sein.
            </p>

            {/* Error Message Display */}
            {this.state.error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginBottom: '2rem',
                textAlign: 'left',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#fca5a5',
                wordBreak: 'break-word',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <strong>Fehler:</strong> {this.state.error.toString()}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  color: '#030712',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 242, 254, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                <RefreshCw size={16} />
                Seite neu laden
              </button>

              <button
                onClick={this.handleResetCache}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.05)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Trash2 size={16} />
                Cache zurücksetzen
              </button>
            </div>

            {/* Expandable Technical details */}
            <div>
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {this.state.showDetails ? 'Technische Details ausblenden' : 'Technische Details anzeigen'}
              </button>

              {this.state.showDetails && this.state.errorInfo && (
                <pre style={{
                  marginTop: '1rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                  textAlign: 'left',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

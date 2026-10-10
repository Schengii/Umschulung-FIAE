import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { captureException } from '../utils/errorMonitoring.js';

/**
 * Globale Error Boundary für das Content-/Lab-Rendering.
 *
 * Bei 165+ eigenständigen, lazy geladenen Lab-Komponenten reicht ein einzelner
 * Laufzeitfehler in EINEM Modul (z. B. eine kaputte Berechnung, ein undefined
 * Property-Zugriff) aus, um React ohne Boundary komplett zum Absturz zu bringen
 * (weißer Bildschirm für die gesamte App). Diese Boundary fängt solche Fehler
 * lokal ab, zeigt eine Fallback-UI und erlaubt dem Nutzer, entweder das Modul
 * neu zu versuchen oder zum Dashboard zurückzukehren, ohne die App neu laden zu müssen.
 *
 * `resetKey` (z. B. der aktive Tab-Name) sorgt dafür, dass beim Wechsel des
 * Moduls automatisch wieder ein "sauberer" Render-Versuch unternommen wird –
 * ein einmal abgestürztes Modul blockiert also nicht dauerhaft alle anderen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props, state) {
    // Wechselt der Nutzer das Modul (resetKey ändert sich), wird der Fehlerzustand
    // zurückgesetzt, damit das nächste Modul unabhängig vom vorherigen startet.
    // Als abgeleiteter State (statt setState in componentDidUpdate) vermeidet
    // das einen zusätzlichen Render-Durchlauf.
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    // In der Konsole protokollieren, damit Fehler in einzelnen Labs während
    // der Entwicklung weiterhin sichtbar sind (kein "silent swallow").
    console.error('[ErrorBoundary] Unbehandelter Fehler in einem Modul:', error, errorInfo);
    // Meldet den Fehler zusätzlich an Sentry (No-Op ohne konfigurierte
    // VITE_SENTRY_DSN, siehe src/utils/errorMonitoring.js), damit Abstürze
    // einzelner Labs bei echten Nutzern auf der Live-Seite sichtbar werden.
    captureException(error, { componentStack: errorInfo?.componentStack, resetKey: this.props.resetKey });
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({ error: this.state.error, retry: this.handleRetry });
      }

      return (
        <div
          className="glass-panel"
          role="alert"
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--accent-danger, #ef4444)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '14px',
            maxWidth: '640px',
            margin: '32px auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-danger, #ef4444)' }}>
            <AlertTriangle size={24} />
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
              Dieses Modul ist abgestürzt
            </h2>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            In diesem Lab ist ein unerwarteter Fehler aufgetreten. Der Rest der App
            (Fortschritt, XP, andere Module) ist davon nicht betroffen. Du kannst
            es erneut versuchen oder ein anderes Modul über die Navigation öffnen.
          </p>
          {this.state.error?.message && (
            <pre
              style={{
                width: '100%',
                overflowX: 'auto',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary, rgba(0,0,0,0.15))',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={this.handleRetry} style={{ gap: '8px' }}>
              <RefreshCw size={16} /> Erneut versuchen
            </button>
            {typeof this.props.onGoHome === 'function' && (
              <button className="btn btn-secondary" onClick={this.props.onGoHome} style={{ gap: '8px' }}>
                <Home size={16} /> Zum Dashboard
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

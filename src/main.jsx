import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('APEX ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#06080d',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'monospace',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '550px',
            backgroundColor: '#0f172a',
            border: '1px solid #ef4444',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
          }}>
            <h2 style={{ color: '#ef4444', fontSize: '20px', margin: '0 0 12px 0' }}>
              ⚠️ RECUPERACIÓN DE ESTADO APEX
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
              Se detectó un conflicto con los datos en ejecución o almacenados en tu navegador.
            </p>
            <div style={{ color: '#f87171', fontSize: '11px', margin: '12px 0', wordBreak: 'break-all', textAlign: 'left', background: '#00000088', padding: '10px', borderRadius: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              <strong>Error:</strong> {this.state.error?.message || 'Error desconocido'}
              {this.state.error?.stack && (
                <pre style={{ marginTop: '6px', fontSize: '10px', color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Ignorar & Continuar
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 Restablecer Bóveda & Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// PWA: registra el service worker solo en producción (evita cachés molestas en dev)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service Worker no disponible:', err);
    });
  });
}

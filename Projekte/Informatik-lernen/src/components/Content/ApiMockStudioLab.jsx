import React, { useState } from 'react';
import { Send, Globe, Key, FileText, CheckCircle2, ShieldAlert, Sparkles, History, Plus, Trash2, Code, Copy, RefreshCw } from 'lucide-react';

const PRESET_ENDPOINTS = [
  {
    name: 'Get All Users',
    method: 'GET',
    url: 'https://api.devgame.it/v1/users',
    headers: JSON.stringify({ "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9...", "Accept": "application/json" }, null, 2),
    body: '',
    mockResponse: {
      status: 200,
      statusText: '200 OK',
      timeMs: 38,
      size: '1.4 KB',
      data: {
        success: true,
        count: 3,
        users: [
          { id: 101, username: 'alex_coder', role: 'Fullstack Dev', status: 'active' },
          { id: 102, username: 'sarah_sec', role: 'Cyber Security Expert', status: 'active' },
          { id: 103, username: 'devops_sam', role: 'Cloud Engineer', status: 'offline' }
        ]
      }
    }
  },
  {
    name: 'Create New User',
    method: 'POST',
    url: 'https://api.devgame.it/v1/users',
    headers: JSON.stringify({ "Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOi..." }, null, 2),
    body: JSON.stringify({ username: "new_developer", email: "dev@example.com", role: "Junior Dev" }, null, 2),
    mockResponse: {
      status: 201,
      statusText: '201 Created',
      timeMs: 85,
      size: '512 B',
      data: {
        success: true,
        message: 'User created successfully',
        createdUser: { id: 104, username: 'new_developer', email: 'dev@example.com', role: 'Junior Dev', createdAt: new Date().toISOString() }
      }
    }
  },
  {
    name: 'OAuth2 Token Request',
    method: 'POST',
    url: 'https://api.devgame.it/v1/auth/token',
    headers: JSON.stringify({ "Content-Type": "application/x-www-form-urlencoded" }, null, 2),
    body: JSON.stringify({ grant_type: "client_credentials", client_id: "dev_app_881", client_secret: "sec_9938127" }, null, 2),
    mockResponse: {
      status: 200,
      statusText: '200 OK',
      timeMs: 110,
      size: '720 B',
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'read write admin'
      }
    }
  },
  {
    name: 'GraphQL User Query',
    method: 'POST',
    url: 'https://api.devgame.it/v1/graphql',
    headers: JSON.stringify({ "Content-Type": "application/json" }, null, 2),
    body: JSON.stringify({ query: "query GetUser { user(id: 101) { id name email roles } }" }, null, 2),
    mockResponse: {
      status: 200,
      statusText: '200 OK',
      timeMs: 45,
      size: '640 B',
      data: {
        data: {
          user: { id: 101, name: "Alex Coder", email: "alex@devgame.it", roles: ["ADMIN", "DEVELOPER"] }
        }
      }
    }
  }
];

export default function ApiMockStudioLab({ onRewardXP }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.devgame.it/v1/users');
  const [headers, setHeaders] = useState(PRESET_ENDPOINTS[0].headers);
  const [requestBody, setRequestBody] = useState(PRESET_ENDPOINTS[0].body);
  const [activeTab, setActiveTab] = useState('body'); // 'headers' | 'body'
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (preset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setHeaders(preset.headers);
    setRequestBody(preset.body);
  };

  const handleSendRequest = () => {
    let matchedPreset = PRESET_ENDPOINTS.find(p => p.url === url && p.method === method);
    
    let result;
    if (matchedPreset) {
      result = matchedPreset.mockResponse;
    } else {
      result = {
        status: method === 'POST' || method === 'PUT' ? 201 : 200,
        statusText: method === 'POST' || method === 'PUT' ? '201 Created' : '200 OK',
        timeMs: Math.floor(Math.random() * 60) + 20,
        size: `${(Math.random() * 2 + 0.5).toFixed(1)} KB`,
        data: {
          timestamp: new Date().toISOString(),
          requestMethod: method,
          targetUrl: url,
          status: 'success',
          payloadReceived: requestBody ? tryParseJson(requestBody) : null
        }
      };
    }

    setResponse(result);
    setHistory(prev => [
      { id: Date.now(), method, url, status: result.status, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);

    if (onRewardXP) onRewardXP(25);
  };

  const tryParseJson = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} /> REST & GraphQL API Testing Studio
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌐 REST API Mock Studio (Postman Lite)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Interaktiver API-Client zum Testen von HTTP GET, POST, PUT, DELETE Anfragen, Headers & JSON-Paylaods.
          </p>
        </div>
      </div>

      {/* Presets Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Schnell-Presets:</span>
        {PRESET_ENDPOINTS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(preset)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <span style={{
              color: preset.method === 'GET' ? '#10b981' : preset.method === 'POST' ? '#6366f1' : '#f59e0b',
              fontWeight: '800',
              marginRight: '6px'
            }}>
              {preset.method}
            </span>
            {preset.name}
          </button>
        ))}
      </div>

      {/* URL Input Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-primary)',
            color: method === 'GET' ? '#10b981' : method === 'POST' ? '#6366f1' : method === 'PUT' ? '#f59e0b' : '#ef4444',
            fontWeight: '800',
            border: '1px solid var(--border-color)',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/resource"
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-primary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            minWidth: '280px'
          }}
        />

        <button className="btn btn-primary" onClick={handleSendRequest} style={{ gap: '8px', padding: '0 24px', fontSize: '0.95rem' }}>
          <Send size={18} /> Request Senden
        </button>
      </div>

      {/* Request Options Tabs */}
      <div style={{ marginBottom: '20px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('body')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'body' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'body' ? '700' : '500',
              borderBottom: activeTab === 'body' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              paddingBottom: '6px',
              cursor: 'pointer'
            }}
          >
            Body (JSON)
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'headers' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'headers' ? '700' : '500',
              borderBottom: activeTab === 'headers' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              paddingBottom: '6px',
              cursor: 'pointer'
            }}
          >
            Headers
          </button>
        </div>

        {activeTab === 'body' && (
          <div>
            <textarea
              rows={5}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder={'{\n  "key": "value"\n}'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: '#0f172a',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                resize: 'vertical'
              }}
            />
          </div>
        )}

        {activeTab === 'headers' && (
          <div>
            <textarea
              rows={4}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder={'{\n  "Authorization": "Bearer token..."\n}'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: '#0f172a',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                resize: 'vertical'
              }}
            />
          </div>
        )}
      </div>

      {/* Response Panel */}
      {response && (
        <div style={{ background: '#0f172a', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: response.status < 300 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                color: response.status < 300 ? '#10b981' : '#ef4444',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '800',
                fontSize: '0.9rem'
              }}>
                {response.statusText}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dauer: {response.timeMs}ms</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Größe: {response.size}</span>
            </div>

            <button
              onClick={handleCopyResponse}
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <CheckCircle2 size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              {copied ? 'Kopiert!' : 'Response kopieren'}
            </button>
          </div>

          <pre style={{
            margin: 0,
            padding: '16px',
            background: '#020617',
            borderRadius: 'var(--radius-md)',
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            maxHeight: '360px',
            overflowY: 'auto',
            border: '1px solid #0f172a'
          }}>
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Request History */}
      {history.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} /> Verlaufs-Historie
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontWeight: '800',
                    color: item.method === 'GET' ? '#10b981' : item.method === 'POST' ? '#6366f1' : '#f59e0b'
                  }}>
                    {item.method}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{item.url}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: item.status < 300 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '700' }}>
                    {item.status}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

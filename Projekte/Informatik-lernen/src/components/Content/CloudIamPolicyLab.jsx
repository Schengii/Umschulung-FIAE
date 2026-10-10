import React, { useState } from 'react';
import {
  Shield,
  Key,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Award,
  Sparkles,
  Lock,
  Filter
} from 'lucide-react';
import {
  evaluateIamPolicies,
  analyzeLeastPrivilege
} from '../../utils/cloudIamEngine';
import { useStore } from '../../store/useStore';

export default function CloudIamPolicyLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [completed, setCompleted] = useState(false);

  // Default preset policies
  const [policies] = useState([
    {
      id: 'scp-org',
      name: 'Organization Guardrail SCP',
      type: 'SCP',
      statements: [
        {
          sid: 'EnforceEUDataResidency',
          effect: 'Deny',
          actions: ['s3:CreateBucket', 'ec2:RunInstances'],
          resources: ['arn:aws:*:us-east-1:*']
        },
        {
          sid: 'PermitS3AndEc2General',
          effect: 'Allow',
          actions: ['s3:*', 'ec2:*'],
          resources: ['*']
        }
      ]
    },
    {
      id: 'identity-dev',
      name: 'DeveloperRole Identity Policy',
      type: 'IDENTITY',
      statements: [
        {
          sid: 'FullBucketRead',
          effect: 'Allow',
          actions: ['s3:GetObject', 's3:ListBucket'],
          resources: ['arn:aws:s3:::company-app-data/*']
        },
        {
          sid: 'WildcardDeleteAllowed',
          effect: 'Allow',
          actions: ['s3:DeleteBucket', 's3:DeleteObject'],
          resources: ['*'] // Violates Least Privilege
        }
      ]
    },
    {
      id: 'resource-bucket',
      name: 'CriticalBackup S3 Resource Policy',
      type: 'RESOURCE',
      statements: [
        {
          sid: 'DenyAllDestructiveOnBackups',
          effect: 'Deny',
          actions: ['s3:DeleteObject', 's3:DeleteBucket'],
          resources: ['arn:aws:s3:::critical-production-backups/*']
        }
      ]
    }
  ]);

  // Request Evaluation state
  const [selectedAction, setSelectedAction] = useState('s3:GetObject');
  const [selectedResource, setSelectedResource] = useState('arn:aws:s3:::company-app-data/index.html');
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleEvaluate = () => {
    const res = evaluateIamPolicies(
      {
        principal: 'arn:aws:iam::123456789012:role/DeveloperRole',
        action: selectedAction,
        resource: selectedResource
      },
      policies
    );
    setEvaluationResult(res);

    if (!completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'cloud_iam_governance_master');
    }
  };

  const findings = analyzeLeastPrivilege(policies);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={14} /> Cloud Security &amp; IAM
              </span>
              <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Key size={14} /> AWS / GCP Least-Privilege
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={28} style={{ color: 'var(--accent-indigo)' }} />
              Cloud IAM Policy Evaluator &amp; Least-Privilege Linter
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '820px' }}>
              Interaktive Auswertung von Organization Service Control Policies (SCPs), Identity-basierten Rollen und Resource Policies. 
              Visualisierung der IAM-Entscheidungslogik: <strong>Explicit Deny</strong> &gt; <strong>Explicit Allow</strong> &gt; <strong>Implicit Deny</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {completed && (
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} /> +65 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Request Tester + Policy Inspector */}
      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Left: Request Tester */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} style={{ color: 'var(--accent-teal)' }} /> Simulierte Zugriffsanfrage (Access Request)
          </h2>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Angefragte IAM Action:
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="input-select"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="s3:GetObject">s3:GetObject (Lesen von Daten)</option>
              <option value="s3:ListBucket">s3:ListBucket (Auflisten von Buckets)</option>
              <option value="s3:DeleteObject">s3:DeleteObject (Objekt löschen)</option>
              <option value="s3:DeleteBucket">s3:DeleteBucket (Ganzen Bucket löschen)</option>
              <option value="ec2:RunInstances">ec2:RunInstances (Server starten)</option>
              <option value="iam:CreateUser">iam:CreateUser (Benutzer anlegen - Unberechtigt)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Ziel-Ressourcen ARN (Resource ARN):
            </label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="input-select"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="arn:aws:s3:::company-app-data/index.html">arn:aws:s3:::company-app-data/index.html (App Daten)</option>
              <option value="arn:aws:s3:::critical-production-backups/database.bak">arn:aws:s3:::critical-production-backups/database.bak (Kritische Backups)</option>
              <option value="arn:aws:ec2:eu-central-1:123456789012:instance/*">arn:aws:ec2:eu-central-1:123456789012:instance/* (Frankfurt Region)</option>
              <option value="arn:aws:ec2:us-east-1:123456789012:instance/*">arn:aws:ec2:us-east-1:123456789012:instance/* (US Region - Durch SCP geblockt)</option>
            </select>
          </div>

          <button
            onClick={handleEvaluate}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '700' }}
          >
            <Sparkles size={18} /> IAM Evaluation Engine ausführen
          </button>

          {/* Result Card */}
          {evaluationResult && (
            <div style={{
              marginTop: '18px',
              padding: '16px',
              borderRadius: '10px',
              background: evaluationResult.decision === 'ALLOWED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${evaluationResult.decision === 'ALLOWED' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {evaluationResult.decision === 'ALLOWED' ? (
                  <CheckCircle size={22} style={{ color: 'var(--accent-emerald)' }} />
                ) : (
                  <AlertTriangle size={22} style={{ color: 'var(--accent-rose)' }} />
                )}
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: evaluationResult.decision === 'ALLOWED' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {evaluationResult.decision === 'ALLOWED' ? 'ZUGRIFF ERLAUBT (ALLOWED)' : 'ZUGRIFF VERWEIGERT (DENIED)'}
                </span>
                <span className="badge badge-neutral" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  {evaluationResult.decisionSource}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', lineHeight: '1.4' }}>
                {evaluationResult.reason}
              </p>
            </div>
          )}
        </div>

        {/* Right: Least Privilege Linter Findings */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} /> Least-Privilege &amp; Over-Permission Linter
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Automatische Erkennung gefährlicher Wildcards und unzureichend beschränkter Administrator-Rechte:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {findings.map((f, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-amber)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{f.title}</strong>
                  <span className={`badge ${f.severity === 'HIGH' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                    {f.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {f.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Policies Manifests */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode size={18} style={{ color: 'var(--accent-indigo)' }} /> Aktive IAM Richtlinien im System
        </h2>

        <div className="grid-responsive" style={{ gap: '16px' }}>
          {policies.map(p => (
            <div key={p.id} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{p.name}</span>
                <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{p.type}</span>
              </div>
              <div className="code-window" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                <pre className="code-body" style={{ fontSize: '0.75rem' }}>
                  <code>{JSON.stringify(p.statements, null, 2)}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

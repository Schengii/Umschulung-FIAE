import React, { useState, useMemo } from 'react';
import { 
  Server, Terminal, RefreshCw, AlertTriangle, Play, Layers 
} from 'lucide-react';
import { 
  calculateTerraformPlan, 
  getDeploymentOrder, 
  DEFAULT_TERRAFORM_RESOURCES 
} from '../../utils/terraformEngine';
import { useStore } from '../../store/useStore';

export default function TerraformLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [resources] = useState(DEFAULT_TERRAFORM_RESOURCES);
  const [currentStates, setCurrentStates] = useState([
    {
      id: 'aws_vpc.main',
      attributes: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: false } // Drift: false statt true
    },
    {
      id: 'aws_subnet.public_a',
      attributes: { cidr_block: '10.0.1.0/24', availability_zone: 'eu-central-1a' }
    }
  ]);
  const [applied, setApplied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const plan = useMemo(() => {
    return calculateTerraformPlan(resources, currentStates);
  }, [resources, currentStates]);

  const deploymentOrder = useMemo(() => {
    return getDeploymentOrder(resources);
  }, [resources]);

  const handleApply = () => {
    // Synchronisiere State mit den gewünschten Ressourcen
    setCurrentStates(resources.map(r => ({ id: r.id, attributes: { ...r.attributes } })));
    setApplied(true);
    if (!xpClaimed) {
      if (onRewardXP) onRewardXP(45);
      else awardXP(45, 'terraform_master');
      setXpClaimed(true);
    }
    setTimeout(() => setApplied(false), 3000);
  };

  const handleTriggerDrift = () => {
    // Simuliert eine manuelle Änderung in der Cloud-Konsole
    setCurrentStates(prev => [
      ...prev,
      { id: 'aws_unmanaged_bucket.shadow_data', attributes: { region: 'us-east-1', acl: 'public-read' } }
    ]);
  };

  const handleResetState = () => {
    setCurrentStates([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={14} /> Infrastructure as Code (IaC)
              </span>
              <span className="badge badge-teal">Terraform &amp; OpenTofu</span>
              <span className="badge badge-green">DAG Resource Graph</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              Terraform &amp; OpenTofu IaC Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Verstehe deklaratives State-Management, Execution Plans (`terraform plan`), Topologische Bereitstellungs-Reihenfolge via Directed Acyclic Graphs (DAG) und Cloud State Drift-Erkennung.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleResetState}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              title="Setzt den aktuellen State auf leer zurück"
            >
              <RefreshCw size={16} />
              State leeren
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleTriggerDrift}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <AlertTriangle size={16} />
              Drift simulieren
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Play size={16} />
              {applied ? 'Angewendet (State synchronisiert)!' : 'terraform apply (-auto-approve)'}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Zu erstellen (+)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-emerald)', margin: '4px 0' }}>
            +{plan.createCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Neu hinzukommende Ressourcen</div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Zu modifizieren (~)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-amber)', margin: '4px 0' }}>
            ~{plan.updateCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>In-Place Attributänderungen</div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Zu zerstören (-)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-rose)', margin: '4px 0' }}>
            -{plan.destroyCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Verwaiste State-Ressourcen (Drift)</div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>DAG Stufen</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)', margin: '4px 0' }}>
            {deploymentOrder.order.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Parallele/Sequenzielle Schritte</div>
        </div>
      </div>

      {/* Terminal View: terraform plan Output */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          background: '#090d16',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e2e8f0',
          fontFamily: 'monospace'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
          <Terminal size={18} color="#38bdf8" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#38bdf8' }}>
            terminal ~ terraform plan -out=tfplan
          </span>
        </div>

        <div style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
          <div style={{ color: '#94a3b8' }}>Terraform used the selected providers to generate the following execution plan:</div>
          <div style={{ margin: '8px 0', color: '#cbd5e1' }}>
            Terraform will perform the following actions:
          </div>

          <div style={{ margin: '14px 0' }}>
            {plan.planActions.map((act) => (
              <div key={act.id} style={{ marginBottom: '8px' }}>
                <span style={{ color: act.color, fontWeight: 800, marginRight: '8px' }}>
                  {act.symbol} {act.id}
                </span>
                {act.action === 'update' && act.diffs && (
                  <div style={{ marginLeft: '24px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {act.diffs.map((d, di) => (
                      <div key={di}>
                        ~ {d.key}: {JSON.stringify(d.oldVal)} ➔ <span style={{ color: 'var(--accent-amber)' }}>{JSON.stringify(d.newVal)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {act.action === 'destroy' && (
                  <div style={{ marginLeft: '24px', color: 'var(--accent-rose)', fontSize: '0.8rem' }}>
                    - (Ressource existiert nicht mehr in der .tf Konfiguration)
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '10px', marginTop: '14px', fontWeight: 800 }}>
            {plan.summaryText}
          </div>
        </div>
      </div>

      {/* DAG Deployment Order Graph */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-teal)" />
          Directed Acyclic Graph (DAG) Bereitstellungs-Reihenfolge
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {deploymentOrder.order.map((resId, idx) => {
            const res = resources.find(r => r.id === resId);
            return (
              <div 
                key={resId}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <span className="badge badge-indigo" style={{ fontWeight: 900 }}>
                  Stufe {idx + 1}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                  {resId}
                </span>
                {res && res.dependsOn && res.dependsOn.length > 0 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    depends_on: {res.dependsOn.join(', ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

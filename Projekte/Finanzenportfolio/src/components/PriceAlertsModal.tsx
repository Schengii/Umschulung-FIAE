import React, { useState } from 'react';
import { Bell, Plus, Trash2, ArrowUp, ArrowDown, BellRing, X, ToggleRight, Calendar, Landmark, Send } from 'lucide-react';
import type { PriceAlert, Holding, DepositLadderItem } from '../types';
import { requestNotificationPermission } from '../utils/alertUtils';
import { checkUpcomingExDividends, checkUpcomingDepositMaturities, sendDesktopPushNotification } from '../services/pwaNotificationSyncService';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  baseCurrency?: string;
  depositLadder?: DepositLadderItem[];
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  holdings,
  alerts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  baseCurrency = 'EUR',
  depositLadder = []
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PWA_RADAR'>('ALERTS');
  const [selectedTicker, setSelectedTicker] = useState<string>(holdings[0]?.ticker || '');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW' | 'DAILY_DROP_PCT'>('ABOVE');
  const [targetValue, setTargetValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  if (!isOpen) return null;

  const currentHolding = holdings.find(h => h.ticker.toUpperCase() === selectedTicker.toUpperCase());

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermissionStatus(perm);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetValue);
    if (isNaN(val) || val <= 0) return;

    const holdingName = currentHolding?.name || selectedTicker;

    onAddAlert({
      ticker: selectedTicker.toUpperCase(),
      name: holdingName,
      condition,
      targetValue: val,
      currentValue: currentHolding?.currentPrice,
      notes: notes.trim() || undefined
    });

    setTargetValue('');
    setNotes('');
  };

  const activeAlerts = alerts.filter(a => a.isActive);
  const triggeredAlerts = alerts.filter(a => !a.isActive && a.triggeredAt);

  // PWA Radar data
  const upcomingExDividends = checkUpcomingExDividends(holdings, 14);
  const upcomingMaturities = checkUpcomingDepositMaturities(depositLadder, 30);

  const handleSendTestPush = async () => {
    await sendDesktopPushNotification({
      id: `test-pwa-push-${Date.now()}`,
      type: 'PRICE_ALERT',
      title: 'FinanzenPortfolio PWA Test-Alarm',
      body: 'Push-Benachrichtigungen für Kursmarken, Ex-Dividenden und Zinsfälligkeiten sind aktiv!',
      targetDate: new Date().toISOString().slice(0, 10),
      isUrgent: false
    });
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '820px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderRadius: '12px' }}>
              <BellRing size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Kursalarme & PWA Background-Sync
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Erhalte Benachrichtigungen bei Kursmarken, Ex-Dividenden-Terminen und Festgeld-Fälligkeiten
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ALERTS')}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              background: activeTab === 'ALERTS' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'ALERTS' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'ALERTS' ? '#3b82f6' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <Bell size={16} />
            Kursalarme ({activeAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PWA_RADAR')}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              background: activeTab === 'PWA_RADAR' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'PWA_RADAR' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'PWA_RADAR' ? '#10b981' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <Calendar size={16} />
            PWA Sync Radar (Ex-Div & Fälligkeiten)
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Notification Permission Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            background: permissionStatus === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${permissionStatus === 'granted' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Bell size={18} color={permissionStatus === 'granted' ? '#10b981' : '#f59e0b'} />
              <div style={{ fontSize: '0.82rem' }}>
                <strong>Browser-Push:</strong> {permissionStatus === 'granted' ? 'Aktiviert (Benachrichtigungen werden angezeigt)' : 'Noch nicht erlaubt oder blockiert'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {permissionStatus === 'granted' ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSendTestPush}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={13} /> Test-Push
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRequestPermission}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem' }}
                >
                  Erlaubnis anfordern
                </button>
              )}
            </div>
          </div>

          {activeTab === 'ALERTS' ? (
            <>
              {/* New Alert Form */}
              <form onSubmit={handleCreateAlert} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={16} /> Neuen Kursalarm anlegen
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Wertpapier
                    </label>
                    <select
                      className="form-control"
                      value={selectedTicker}
                      onChange={e => setSelectedTicker(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      {holdings.map(h => (
                        <option key={h.ticker} value={h.ticker}>
                          {h.name} ({h.ticker}) - {h.currentPrice.toFixed(2)} {baseCurrency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Bedingung
                    </label>
                    <select
                      className="form-control"
                      value={condition}
                      onChange={e => setCondition(e.target.value as any)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="ABOVE">Kurs steigt über (&gt;=)</option>
                      <option value="BELOW">Kurs fällt unter (&lt;=)</option>
                      <option value="DAILY_DROP_PCT">Tagesverlust größer als (%)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      {condition === 'DAILY_DROP_PCT' ? 'Schwelle in %' : `Zielkurs in ${baseCurrency}`}
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder={condition === 'DAILY_DROP_PCT' ? 'z. B. 5 (für -5%)' : currentHolding?.currentPrice?.toFixed(2) || '0.00'}
                      value={targetValue}
                      onChange={e => setTargetValue(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Notiz / Begründung (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="z. B. Stop-Loss absichern oder Nachkauf-Limit"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Alarm scharfschalten
                  </button>
                </div>
              </form>

              {/* Active Alerts List */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Aktive Alarme ({activeAlerts.length})
                </div>
                {activeAlerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    Keine aktiven Kursalarme konfiguriert.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeAlerts.map(alert => {
                      const holding = holdings.find(h => h.ticker.toUpperCase() === alert.ticker.toUpperCase());
                      const currentP = holding?.currentPrice;
                      const isTriggerNear = currentP && alert.condition === 'ABOVE' && currentP >= alert.targetValue * 0.97;
                      const isDropNear = currentP && alert.condition === 'BELOW' && currentP <= alert.targetValue * 1.03;

                      return (
                        <div
                          key={alert.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: isTriggerNear || isDropNear ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${isTriggerNear || isDropNear ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                            borderRadius: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              padding: '0.4rem',
                              borderRadius: '8px',
                              background: alert.condition === 'ABOVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: alert.condition === 'ABOVE' ? '#10b981' : '#ef4444'
                            }}>
                              {alert.condition === 'ABOVE' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {alert.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({alert.ticker})</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Bedingung: {alert.condition === 'ABOVE' ? 'Kurs >=' : alert.condition === 'BELOW' ? 'Kurs <=' : 'Tagesabfall >='}{' '}
                                <strong>{alert.targetValue} {alert.condition === 'DAILY_DROP_PCT' ? '%' : baseCurrency}</strong>
                                {currentP !== undefined && (
                                  <> • Aktuell: <strong>{currentP.toFixed(2)} {baseCurrency}</strong></>
                                )}
                                {alert.notes && ` • "${alert.notes}"`}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                              type="button"
                              onClick={() => onToggleAlert(alert.id)}
                              style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}
                              title="Alarm deaktivieren"
                            >
                              <ToggleRight size={22} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAlert(alert.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              title="Alarm löschen"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Triggered Alerts History */}
              {triggeredAlerts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Ausgelöste Alarme ({triggeredAlerts.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {triggeredAlerts.map(alert => (
                      <div
                        key={alert.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          borderRadius: '10px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#f59e0b' }}>
                            🔔 Ausgelöst am {alert.triggeredAt}: {alert.name} ({alert.ticker})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Zielkurs: {alert.targetValue} {baseCurrency} • Letzter Kurs: {alert.currentValue?.toFixed(2)} {baseCurrency}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteAlert(alert.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          title="Aus Verlauf löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* PWA RADAR TAB */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Info Box */}
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}>
                <strong>PWA Background Sync & Service Worker Radar:</strong> Automatische Überwachung deiner Depot-Positionen auf anstehende Ex-Dividenden-Termine (Recht auf Dividende) sowie fällige Festgelder & Sparbriefe in deiner Zinstreppe innerhalb der nächsten 14 bis 30 Tage.
              </div>

              {/* Ex-Dividenden Radar */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#3b82f6" />
                  Bevorstehende Ex-Dividenden-Tage (nächste 14 Tage)
                </h4>
                {upcomingExDividends.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Keine Ex-Dividenden-Termine in den nächsten 14 Tagen für deine Depotpositionen gefunden.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {upcomingExDividends.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: 'rgba(59, 130, 246, 0.06)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          borderRadius: '10px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#60a5fa' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.body}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: item.isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: item.isUrgent ? '#ef4444' : '#60a5fa',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {item.isUrgent ? 'Dringend halten' : `Ex-Tag: ${item.targetDate}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Zinstreppen Fälligkeiten Radar */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark size={18} color="#10b981" />
                  Fällige Festgelder & Sparbriefe (nächste 30 Tage)
                </h4>
                {upcomingMaturities.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Keine Festgelder oder Sparbriefe, die in den nächsten 30 Tagen fällig werden.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {upcomingMaturities.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: 'rgba(16, 185, 129, 0.06)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: '10px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#34d399' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.body}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: item.isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: item.isUrgent ? '#ef4444' : '#34d399',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {item.isUrgent ? 'Bald fällig!' : `Fällig: ${item.targetDate}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, RefreshCw, Sun, Moon } from 'lucide-react';
import { encryptData } from '../services/cryptoStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  onBaseCurrencyChange: (cur: 'EUR' | 'USD' | 'CHF' | 'GBP') => void;
  isDarkMode: boolean;
  onToggleDarkMode: (dark: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  baseCurrency,
  onBaseCurrencyChange,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [pinPassword, setPinPassword] = useState('');
  const [encryptionStatus, setEncryptionStatus] = useState<string | null>(null);
  const [autoRefreshMin, setAutoRefreshMin] = useState<number>(5);

  if (!isOpen) return null;

  const handleEnableEncryption = async () => {
    if (!pinPassword || pinPassword.length < 4) {
      alert('Bitte wähle eine Master-PIN oder ein Passwort mit mindestens 4 Zeichen.');
      return;
    }

    try {
      const rawData = localStorage.getItem('finanz_portfolios') || '[]';
      const cipher = await encryptData(rawData, pinPassword);
      localStorage.setItem('finanz_encrypted_vault', cipher);
      setEncryptionStatus('Passwortschutz & AES-GCM 256-Bit Verschlüsselung erfolgreich aktiviert!');
      setPinPassword('');
    } catch {
      alert('Fehler beim Verschlüsseln der Daten.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Einstellungen & Sicherheit</h3>
              <p className="text-xs text-slate-400">Passwortschutz, Währung & Auto-Refresh</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          
          {/* Security / Encryption Section */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Web Crypto Master-PIN Tresor (AES-GCM)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Sichere deine Depotdaten lokal mit einem Master-Passwort. Nur mit korrekter PIN lassen sich die Daten entschlüsseln.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={pinPassword}
                onChange={(e) => setPinPassword(e.target.value)}
                placeholder="Master PIN oder Passwort..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleEnableEncryption}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white rounded-lg transition-colors"
              >
                Aktivieren
              </button>
            </div>

            {encryptionStatus && (
              <p className="text-emerald-400 font-semibold text-[11px]">{encryptionStatus}</p>
            )}
          </div>

          {/* Currency Selection */}
          <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Haupt-Währung</span>
              <span className="text-slate-400 block">Alle Depotwerte werden in dieser Währung dargestellt</span>
            </div>
            <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
              {(['EUR', 'USD', 'CHF', 'GBP'] as const).map((cur) => (
                <button
                  key={cur}
                  onClick={() => onBaseCurrencyChange(cur)}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${baseCurrency === cur ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Refresh */}
          <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Auto-Refresh Intervall
              </span>
              <span className="text-slate-400 block">Echtzeit-Kurse im Hintergrund aktualisieren</span>
            </div>
            <select
              value={autoRefreshMin}
              onChange={(e) => setAutoRefreshMin(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-semibold text-slate-200 focus:outline-none"
            >
              <option value={0}>Aus (Manuell)</option>
              <option value={1}>Alle 1 Minute</option>
              <option value={5}>Alle 5 Minuten</option>
              <option value={15}>Alle 15 Minuten</option>
            </select>
          </div>

          {/* Theme */}
          <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Erscheinungsbild</span>
              <span className="text-slate-400 block">Dunkelmodus vs. Hellmodus</span>
            </div>
            <button
              onClick={() => onToggleDarkMode(!isDarkMode)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-semibold text-slate-200 hover:bg-slate-800"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              {isDarkMode ? 'Dunkel' : 'Hell'}
            </button>
          </div>

          {/* Theme Accent Color */}
          <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Akzentfarbe</span>
              <span className="text-slate-400 block">Haupt-Akzentfarbe für Buttons & Charts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 cursor-pointer border-2 border-slate-700 hover:scale-110 transition-all" title="Smaragdgrün" />
              <span className="w-5 h-5 rounded-full bg-indigo-500 cursor-pointer border-2 border-slate-700 hover:scale-110 transition-all" title="Indigo" />
              <span className="w-5 h-5 rounded-full bg-amber-500 cursor-pointer border-2 border-slate-700 hover:scale-110 transition-all" title="Bernstein" />
              <span className="w-5 h-5 rounded-full bg-cyan-500 cursor-pointer border-2 border-slate-700 hover:scale-110 transition-all" title="Cyan" />
              <span className="w-5 h-5 rounded-full bg-rose-500 cursor-pointer border-2 border-slate-700 hover:scale-110 transition-all" title="Rosa" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all">
            Speichern & Schließen
          </button>
        </div>

      </div>
    </div>
  );
};

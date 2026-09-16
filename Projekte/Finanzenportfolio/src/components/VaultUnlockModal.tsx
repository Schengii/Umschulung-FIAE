import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';
import { decryptData } from '../services/cryptoStorage';
import type { Portfolio } from '../types';

interface VaultUnlockModalProps {
  isOpen: boolean;
  onUnlocked: (portfolios: Portfolio[]) => void;
  onResetVault: () => void;
}

export const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  isOpen,
  onUnlocked,
  onResetVault
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsDecrypting(true);
    setErrorMsg(null);

    try {
      const encryptedVault = localStorage.getItem('finanz_encrypted_vault');
      if (!encryptedVault) {
        setErrorMsg('Kein verschlüsselter Tresor gefunden.');
        setIsDecrypting(false);
        return;
      }

      const decryptedJson = await decryptData(encryptedVault, pin);
      const parsedPortfolios: Portfolio[] = JSON.parse(decryptedJson);

      if (Array.isArray(parsedPortfolios)) {
        onUnlocked(parsedPortfolios);
      } else {
        throw new Error('Ungültiges Datenformat');
      }
    } catch {
      setErrorMsg('Falsches Master-Passwort / PIN. Zugriff verweigert.');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-slate-100 space-y-6 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Tresor entsperren</h2>
          <p className="text-xs text-slate-400 max-w-xs">
            Deine Depotdaten sind mit AES-GCM 256-Bit verschlüsselt. Gib deine Master-PIN ein, um fortzufahren.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Master PIN / Passwort
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Passwort eingeben..."
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isDecrypting || !pin.trim()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-sm"
          >
            {isDecrypting ? 'Entschlüssele...' : 'Tresor Entsperren'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={() => {
              if (confirm('Möchtest du den verschlüsselten Tresor wirklich zurücksetzen? Ungesicherte lokale Tresordaten gehen verloren.')) {
                onResetVault();
              }
            }}
            className="text-slate-500 hover:text-rose-400 text-xs transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Tresor zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}

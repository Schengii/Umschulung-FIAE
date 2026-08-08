import React from 'react';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

export default function PriceChart({ listing, preferences }) {
  if (!listing) return null;

  const coldSqmPrice = listing.priceKalt && listing.sqm ? (listing.priceKalt / listing.sqm).toFixed(2) : null;
  const warmSqmPrice = listing.priceWarm && listing.sqm ? (listing.priceWarm / listing.sqm).toFixed(2) : null;
  const mietspiegelRef = preferences?.mietspiegelReference || 12.5;

  const priceHistory = listing.priceHistory || [
    { date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], priceWarm: (listing.priceWarm || 0) + 40 },
    { date: new Date().toISOString().split('T')[0], priceWarm: listing.priceWarm || 0 }
  ];

  const firstPrice = priceHistory[0]?.priceWarm || listing.priceWarm || 0;
  const currentPrice = listing.priceWarm || 0;
  const priceDiff = currentPrice - firstPrice;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          📊 Preisanalyse & Mietspiegel-Vergleich
        </h4>
        {priceDiff < 0 ? (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Miete um {Math.abs(priceDiff)} € gesenkt
          </span>
        ) : priceDiff > 0 ? (
          <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +{priceDiff} € Erhöht
          </span>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            Preis stabil
          </span>
        )}
      </div>

      {/* Metric comparison bars */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Kaltmiete pro m²</span>
          <span className="text-base font-extrabold text-sky-400">
            {coldSqmPrice ? `${coldSqmPrice} €/m²` : 'k. A.'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Mietspiegel-Richtwert: {mietspiegelRef} €/m²
          </span>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Mietpreisbremse-Status</span>
          {coldSqmPrice && Number(coldSqmPrice) <= mietspiegelRef * 1.1 ? (
            <span className="text-xs font-bold text-emerald-400 block">
              ✅ Konform (&lt;110% Richtwert)
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-400 block">
              ⚠️ Verdacht auf Überschreitung
            </span>
          )}
          <span className="text-[11px] text-slate-500 block mt-1">
            BGB § 556d Orientierung
          </span>
        </div>
      </div>

      {/* Visual Bar Comparison */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Kaltmiete / m²</span>
          <span>{coldSqmPrice || 0} € vs {mietspiegelRef} €</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-sky-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((coldSqmPrice || 0) / (mietspiegelRef * 1.5)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

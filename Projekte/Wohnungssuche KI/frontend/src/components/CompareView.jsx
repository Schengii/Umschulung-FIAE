import React, { useState } from 'react';
import { Columns, Check, X, Building, MapPin, Sparkles, Trash2 } from 'lucide-react';

export default function CompareView({ listings }) {
  const favorites = listings.filter(l => l.status === 'favorit' || (l.matchScore || 0) >= 70);
  const [selectedIds, setSelectedIds] = useState(() => favorites.slice(0, 3).map(l => l.id));

  const compareListings = listings.filter(l => selectedIds.includes(l.id));

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 4) return alert('Maximal 4 Wohnungen gleichzeitig vergleichen.');
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Columns className="w-6 h-6 text-sky-400" /> Wohnungsvergleichs-Matrix
        </h2>
        <p className="text-xs text-slate-400">Vergleiche deine ausgewählten Favoriten direkt nebeneinander.</p>
      </div>

      {/* Selector Pills */}
      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs font-semibold text-slate-400 block mb-2">Wohnungen für den Vergleich auswählen (max. 4):</span>
        <div className="flex flex-wrap gap-2">
          {listings.slice(0, 15).map(l => {
            const isSel = selectedIds.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => toggleSelect(l.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                  isSel ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {isSel && <Check className="w-3.5 h-3.5" />}
                <span className="truncate max-w-[150px]">{l.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {compareListings.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
          Wähle oben mindestens 2 Wohnungen aus, um die Vergleichsmatrix zu aktivieren.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300 border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="p-3 w-44 font-semibold text-slate-400">Kriterium</th>
                {compareListings.map(l => (
                  <th key={l.id} className="p-3 font-bold text-slate-200 border-l border-slate-800 min-w-[200px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate font-bold">{l.title}</span>
                      <button onClick={() => toggleSelect(l.id)} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{l.location}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-3 font-semibold text-slate-400 bg-slate-900/50">KI-Score & Fazit</td>
                {compareListings.map(l => (
                  <td key={l.id} className="p-3 border-l border-slate-800">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-sky-500/10 text-sky-400 mb-1">
                      <Sparkles className="w-3 h-3" /> {l.matchScore || 50}%
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-3 mt-1">{l.matchSummary}</p>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400 bg-slate-900/50">Warmmiete / m²</td>
                {compareListings.map(l => (
                  <td key={l.id} className="p-3 border-l border-slate-800 font-bold text-emerald-400 text-sm">
                    {l.priceWarm || l.priceKalt || 0} €
                    {l.sqm ? <span className="text-xs text-slate-400 block font-normal">({(l.priceWarm / l.sqm).toFixed(2)} €/m²)</span> : null}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400 bg-slate-900/50">Wohnfläche & Zimmer</td>
                {compareListings.map(l => (
                  <td key={l.id} className="p-3 border-l border-slate-800 font-medium">
                    {l.sqm || 0} m² | {l.rooms || 0} Zi.
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400 bg-slate-900/50">Vorteile (Pros)</td>
                {compareListings.map(l => (
                  <td key={l.id} className="p-3 border-l border-slate-800 text-emerald-400 space-y-1">
                    {l.pros && l.pros.map((p, i) => <div key={i}>✓ {p}</div>)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400 bg-slate-900/50">Nachteile (Cons)</td>
                {compareListings.map(l => (
                  <td key={l.id} className="p-3 border-l border-slate-800 text-rose-400 space-y-1">
                    {l.cons && l.cons.map((c, i) => <div key={i}>✗ {c}</div>)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

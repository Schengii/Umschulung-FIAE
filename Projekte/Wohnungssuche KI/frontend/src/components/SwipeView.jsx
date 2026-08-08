import React, { useState } from 'react';
import { Heart, X, Star, MapPin, Euro, Home as HomeIcon, Check, ThumbsDown, Sparkles, Building } from 'lucide-react';

export default function SwipeView({ listings, onUpdateStatus, onDeleteListing }) {
  const pendingListings = listings.filter(l => l.status === 'neu' || !l.status || l.status === 'gelesen');
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentListing = pendingListings[currentIndex];

  if (!currentListing || pendingListings.length === 0 || currentIndex >= pendingListings.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-800 my-8 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-100 mb-2">Alles durchgesehen! 🎉</h3>
        <p className="text-gray-400">Es stehen aktuell keine ungelesenen Wohnungen zur schnellen Durchsicht bereit.</p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow"
        >
          Von vorne beginnen
        </button>
      </div>
    );
  }

  const handleAction = (action) => {
    if (action === 'like') {
      onUpdateStatus(currentListing.id, 'favorit');
    } else if (action === 'dislike') {
      onDeleteListing(currentListing.id);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-600 text-white';
    if (score >= 60) return 'from-amber-500 to-orange-600 text-white';
    return 'from-rose-500 to-red-600 text-white';
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span>Triage Modus</span>
        <span>{currentIndex + 1} von {pendingListings.length} Inseraten</span>
      </div>

      {/* Main Card */}
      <div className="w-full bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl transition duration-300 relative flex flex-col min-h-[520px]">
        {/* Header Image or Fallback */}
        <div className="h-56 bg-gray-800 relative overflow-hidden flex items-center justify-center">
          {currentListing.images && currentListing.images.length > 0 ? (
            <img
              src={currentListing.images[0]}
              alt={currentListing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-600">
              <Building className="w-16 h-16 mb-2 stroke-[1.5]" />
              <span className="text-xs">Kein Foto verfügbar</span>
            </div>
          )}

          {/* Floating Score Badge */}
          <div className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full font-bold text-sm bg-gradient-to-r ${getScoreColor(currentListing.matchScore || 50)} shadow-lg flex items-center gap-1.5`}>
            <Sparkles className="w-4 h-4 fill-white/30" />
            <span>{currentListing.matchScore || 50}% Match</span>
          </div>

          {/* Portal Badge */}
          <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-black/60 backdrop-blur-md text-gray-200 border border-white/10 uppercase">
            {currentListing.portal || 'Inserat'}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-100 line-clamp-2 leading-snug mb-2">
              {currentListing.title}
            </h2>

            <div className="flex items-center text-xs text-gray-400 gap-1 mb-4">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{currentListing.location || 'Ort unbekannt'}</span>
            </div>

            {/* Key Metric Badges */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-800/80 mb-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-medium uppercase">Warmmiete</span>
                <span className="text-sm font-bold text-emerald-400">{currentListing.priceWarm || currentListing.priceKalt || 0} €</span>
              </div>
              <div className="flex flex-col items-center border-x border-gray-800">
                <span className="text-[10px] text-gray-500 font-medium uppercase">Fläche</span>
                <span className="text-sm font-bold text-gray-200">{currentListing.sqm || 0} m²</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-medium uppercase">Zimmer</span>
                <span className="text-sm font-bold text-gray-200">{currentListing.rooms || 0} Zi.</span>
              </div>
            </div>

            {/* Pros & Cons Preview */}
            <div className="space-y-1.5 text-xs">
              {currentListing.pros && currentListing.pros.slice(0, 2).map((pro, i) => (
                <div key={i} className="flex items-center text-emerald-400 gap-1.5">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{pro}</span>
                </div>
              ))}
              {currentListing.cons && currentListing.cons.slice(0, 2).map((con, i) => (
                <div key={i} className="flex items-center text-rose-400 gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{con}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-evenly pt-4 border-t border-gray-800">
            <button
              onClick={() => handleAction('dislike')}
              className="w-14 h-14 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-md"
              title="Ablehnen & Löschen"
            >
              <X className="w-7 h-7 stroke-[2.5]" />
            </button>

            <button
              onClick={() => handleAction('like')}
              className="w-14 h-14 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-md"
              title="Als Favorit speichern"
            >
              <Heart className="w-7 h-7 fill-emerald-500/20 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

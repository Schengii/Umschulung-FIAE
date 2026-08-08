import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import {
  Home, Settings, Plus, RefreshCw, Loader2,
  Search, Clock, Wifi, WifiOff, Building2, Map, List, FolderOpen,
  Sun, Moon, Sliders, Columns, Flame, Truck,
  LogIn, LogOut
} from 'lucide-react';

import ListingCard from './components/ListingCard.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ListingDetail from './components/ListingDetail.jsx';
import PreferenceForm from './components/PreferenceForm.jsx';
import LinkImporter from './components/LinkImporter.jsx';
import DocumentsView from './components/DocumentsView.jsx';
import DeleteConfirmationModal from './components/DeleteConfirmationModal.jsx';
import CalendarView from './components/CalendarView.jsx';
import PipelineView from './components/PipelineView.jsx';
import SwipeView from './components/SwipeView.jsx';
import CompareView from './components/CompareView.jsx';
import MovingManager from './components/MovingManager.jsx';
import { Geolocation } from '@capacitor/geolocation';

// Backend URL - im selben Netzwerk erreichbar
// Im Produktionsbetrieb kann die IP hier eingestellt werden
const DEFAULT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost'}:5000`;

const STATUS_FILTERS = [
  { key: 'alle', label: 'Alle' },
  { key: 'neu', label: 'Neu / Ungelesen' },
  { key: 'gelesen', label: 'Gelesen' },
  { key: 'favorit', label: '⭐ Favoriten' },
  { key: 'angeschrieben', label: 'Angeschrieben' },
  { key: 'abgesagt', label: 'Abgesagt' },
];

export default function App() {
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('BACKEND_URL') || DEFAULT_BACKEND_URL;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [view, setView] = useState('login'); // start with login view
  const [listings, setListings] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [statusFilter, setStatusFilter] = useState('alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [profiles, setProfiles] = useState([{ id: 1, name: 'Hauptprofil' }]);
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem('active_profile_id') || '1');

  const [preferences, setPreferences] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('list'); // 'list' | 'map'
  const [maxDistanceFilter, setMaxDistanceFilter] = useState(999); // 999 = beliebig
  const [portalFilter, setPortalFilter] = useState('alle');
  const [scanStatus, setScanStatus] = useState(null);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [showKoListings, setShowKoListings] = useState(false);

  useEffect(() => {
    async function initDeviceLocation() {
      try {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            console.warn('GPS-Berechtigung nicht erteilt');
            return;
          }
        }
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        if (position && position.coords) {
          setDeviceLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          console.log(`Live-Standort erfasst: ${position.coords.latitude}, ${position.coords.longitude}`);
        }
      } catch (err) {
        console.warn('Fehler beim Abrufen des Live-Standorts:', err.message);
      }
    }
    initDeviceLocation();
  }, []);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') === 'true' && 
           typeof window !== 'undefined' && 
           'Notification' in window && 
           Notification.permission === 'granted';
  });

  // Hilfsfunktion zum Konvertieren des VAPID Keys
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const unsubscribeUser = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          
          // An Backend senden, um aus DB zu entfernen
          await fetch(`${backendUrl}/api/push/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });
          console.log('PWA Push-Benachrichtigungen im Backend abgemeldet.');
        }
      } catch (err) {
        console.error('Fehler beim Abmelden des Push-Abonnements:', err);
      }
    }
    setNotificationsEnabled(false);
    localStorage.setItem('notifications_enabled', 'false');
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Dieser Browser unterstützt keine Desktop-Benachrichtigungen.');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
        
        // PWA Push Manager abonnieren falls vorhanden
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            console.log('Abonniere PWA Push-Benachrichtigungen...');
            const registration = await navigator.serviceWorker.ready;
            
            // VAPID Public-Key abrufen
            const keyRes = await fetch(`${backendUrl}/api/push/vapid-public-key`);
            if (keyRes.ok) {
              const { publicKey } = await keyRes.json();
              const convertedVapidKey = urlBase64ToUint8Array(publicKey);
              
              // Push abonnieren
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
              });
              
              // Im Backend speichern
              await fetch(`${backendUrl}/api/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
              });
              
              console.log('PWA Push-Abonnement erfolgreich registriert!');
            }
          } catch (pushErr) {
            console.warn('Push-Manager Abonnement fehlgeschlagen (Desktop-Push wird dennoch genutzt):', pushErr.message);
          }
        }

        new Notification('Wohnungssuche KI', {
          body: 'Benachrichtigungen wurden erfolgreich aktiviert!'
        });
      } else {
        await unsubscribeUser();
      }
    } catch (err) {
      console.error('Fehler bei Notification-Berechtigung:', err);
    }
  };

  function triggerDesktopNotification(listing) {
    if (localStorage.getItem('notifications_enabled') !== 'true' || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
    
    const notification = new Notification('🔥 Neues Top-Inserat gefunden!', {
      body: `${listing.matchScore}% Match: ${listing.title} in ${listing.location} für ${listing.priceWarm || listing.priceKalt} €`,
      tag: listing.id,
      requireInteraction: true
    });
    
    notification.onclick = () => {
      window.focus();
      setSelectedListing({
        ...listing,
        status: listing.status === 'neu' ? 'gelesen' : listing.status
      });
      handleStatusChange(listing.id, 'gelesen');
      notification.close();
    };
  }

  // Advanced individual filters
  const [minSqmFilter, setMinSqmFilter] = useState('');
  const [maxSqmFilter, setMaxSqmFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minDistanceFilter, setMinDistanceFilter] = useState('');
  const [maxDistanceInput, setMaxDistanceInput] = useState('');
  const [maxPoiSupermarket, setMaxPoiSupermarket] = useState('');
  const [maxPoiTransit, setMaxPoiTransit] = useState('');
  const [maxPoiPark, setMaxPoiPark] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const mapIframeRef = React.useRef(null);

  // Backend-Verbindung prüfen und Daten laden
  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const [listRes, prefRes, notesRes, statsRes, profRes] = await Promise.all([
        fetch(`${backendUrl}/api/listings`, { headers }),
        fetch(`${backendUrl}/api/preferences`, { headers }),
        fetch(`${backendUrl}/api/notes`, { headers }).catch(() => null),
        fetch(`${backendUrl}/api/stats`, { headers }).catch(() => null),
        fetch(`${backendUrl}/api/profiles`, { headers }).catch(() => null)
      ]);
      
      if (listRes && listRes.ok) {
        const data = await listRes.json();
        if (Array.isArray(data)) {
          setListings(prev => {
            if (prev && prev.length > 0) {
              const currentIds = new Set(prev.map(l => l.id));
              const newHighScoringListings = data.filter(l => !currentIds.has(l.id) && l.matchScore >= 80 && l.status === 'neu');
              
              newHighScoringListings.forEach(l => {
                triggerDesktopNotification(l);
              });
            }
            return data;
          });
          localStorage.setItem('cached_listings', JSON.stringify(data));
        }
        setBackendOnline(true);
      }
      if (prefRes && prefRes.ok) {
        const prefs = await prefRes.json();
        if (prefs && typeof prefs === 'object') {
          setPreferences(prefs);
          setLastScan(prefs.lastScanTime || null);
          localStorage.setItem('cached_preferences', JSON.stringify(prefs));
        }
      }
      if (notesRes && notesRes.ok) {
        const notesData = await notesRes.json();
        localStorage.setItem('cached_notes', JSON.stringify(notesData));
      }
      if (statsRes && statsRes.ok) {
        const sData = await statsRes.json();
        setStatsData(sData);
        localStorage.setItem('cached_stats', JSON.stringify(sData));
      }
      if (profRes && profRes.ok) {
        const profs = await profRes.json();
        if (Array.isArray(profs)) {
          setProfiles(profs);
        }
      }
      setLastUpdate(new Date());
    } catch (err) {
      console.log('Backend offline oder Fehler beim Laden. Lade aus lokalem Cache...', err);
      setBackendOnline(false);
      
      const cachedListings = localStorage.getItem('cached_listings');
      const cachedPrefs = localStorage.getItem('cached_preferences');
      const cachedStats = localStorage.getItem('cached_stats');
      if (cachedListings) {
        try {
          const parsed = JSON.parse(cachedListings);
          if (Array.isArray(parsed)) {
            setListings(parsed);
          }
        } catch (e) {
          console.error('Fehler beim Parsen der gecachten Inserate:', e);
        }
      }
      if (cachedPrefs) {
        try {
          const prefs = JSON.parse(cachedPrefs);
          if (prefs && typeof prefs === 'object') {
            setPreferences(prefs);
            setLastScan(prefs.lastScanTime || null);
          }
        } catch (e) {
          console.error('Fehler beim Parsen der gecachten Einstellungen:', e);
        }
      }
      if (cachedStats) {
        try {
          setStatsData(JSON.parse(cachedStats));
        } catch (e) {
          console.error('Fehler beim Parsen der gecachten Statistiken:', e);
        }
      }
    } finally {
      setLoadingListings(false);
    }
  }, [backendUrl, activeProfileId]);

  // Offline status synchronization
  const syncOfflineQueue = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem('offline_status_queue') || '[]');
    if (queue.length === 0) return;
    
    console.log(`Verbindung wiederhergestellt. Synchronisiere ${queue.length} Statusänderungen...`);
    const remainingQueue = [];
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    for (const item of queue) {
      try {
        const res = await fetch(`${backendUrl}/api/listings/${item.id}/status`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status: item.status })
        });
        if (!res.ok) {
          remainingQueue.push(item);
        }
      } catch (err) {
        remainingQueue.push(item);
      }
    }
    
    localStorage.setItem('offline_status_queue', JSON.stringify(remainingQueue));
    if (remainingQueue.length === 0) {
      console.log('Synchronisierung erfolgreich abgeschlossen.');
      loadListings();
    }
  }, [backendUrl, loadListings]);

  useEffect(() => {
    window.addEventListener('online', syncOfflineQueue);
    if (navigator.onLine) {
      syncOfflineQueue();
    }
    return () => window.removeEventListener('online', syncOfflineQueue);
  }, [syncOfflineQueue]);

  // Poll scan status when scanning is active
  useEffect(() => {
    if (!scanning) {
      setScanStatus(null);
      return;
    }

    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${backendUrl}/api/scan/status`, { headers });
        if (res.ok) {
          const status = await res.json();
          setScanStatus(status);
          if (status && !status.active) {
            setScanning(false);
            loadListings();
          }
        }
      } catch (err) {
        console.error('Fehler beim Abrufen des Scan-Status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [scanning, backendUrl, loadListings]);

  useEffect(() => {
    loadListings();
    // Jede Minute aktualisieren
    const interval = setInterval(loadListings, 60000);
    return () => clearInterval(interval);
  }, [loadListings]);

  const handleProfileChange = (profileId) => {
    setActiveProfileId(profileId);
    localStorage.setItem('active_profile_id', profileId);
  };

  const handleCreateProfile = async () => {
    const name = prompt('Name für das neue Suchprofil eingeben:');
    if (!name || name.trim().length === 0) return;
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${backendUrl}/api/profiles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: name.trim() })
      });
      if (res.ok) {
        const newProf = await res.json();
        setProfiles(prev => [...prev, newProf]);
        handleProfileChange(newProf.id);
      } else {
        const err = await res.json();
        alert(`Fehler beim Erstellen: ${err.error}`);
      }
    } catch (e) {
      alert(`Fehler: ${e.message}`);
    }
  };

  const handleDeleteProfile = async () => {
    if (profiles.length <= 1) {
      alert('Das letzte verbleibende Suchprofil kann nicht gelöscht werden.');
      return;
    }
    if (!confirm('Bist du sicher, dass du das aktuelle Suchprofil und ALLE dazugehörigen Wohnungen und Notizen unwiderruflich löschen möchtest?')) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${backendUrl}/api/profiles/${activeProfileId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        const remaining = profiles.filter(p => String(p.id) !== String(activeProfileId));
        setProfiles(remaining);
        handleProfileChange(remaining[0].id);
      } else {
        const err = await res.json();
        alert(`Fehler beim Löschen: ${err.error}`);
      }
    } catch (e) {
      alert(`Fehler: ${e.message}`);
    }
  };

  // Manuellen Scan starten
  async function handleScan() {
    setScanning(true);
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${backendUrl}/api/scan`, { method: 'POST', headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.lastScanTime) {
          setLastScan(data.lastScanTime);
        }
        await loadListings();
      }
    } catch {
      // Fehler ignorieren, loadListings zeigt offline-Status
    } finally {
      setScanning(false);
    }
  }

  // Alle Wohnungen neu bewerten (Bulk Re-Evaluation)
  async function handleBulkReevaluate() {
    setScanning(true);
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${backendUrl}/api/listings/evaluate-all`, { method: 'POST', headers });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Fehler beim Starten der Re-Evaluation.');
        setScanning(false);
      } else {
        // Wechsel zurück zum Dashboard, damit der Nutzer den Fortschrittsbalken sieht
        setView('dashboard');
      }
    } catch (err) {
      alert('Netzwerkfehler beim Starten der Re-Evaluation.');
      setScanning(false);
    }
  }

  // Status einer Wohnung aktualisieren
  async function handleStatusChange(id, newStatus) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      if (!navigator.onLine || !backendOnline) {
        // Offline: in Warteschlange einreihen
        const queue = JSON.parse(localStorage.getItem('offline_status_queue') || '[]');
        queue.push({ id, status: newStatus, timestamp: Date.now() });
        localStorage.setItem('offline_status_queue', JSON.stringify(queue));
        
        // Optimistisch im UI-State aktualisieren
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        setSelectedListing(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
        
        // Cache aktualisieren
        const cached = JSON.parse(localStorage.getItem('cached_listings') || '[]');
        const updatedCache = cached.map(l => l.id === id ? { ...l, status: newStatus } : l);
        localStorage.setItem('cached_listings', JSON.stringify(updatedCache));
        return;
      }

      await fetch(`${backendUrl}/api/listings/${id}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      
      // Update selected listing if it is currently open
      setSelectedListing(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);

      // Cache aktualisieren
      const cached = JSON.parse(localStorage.getItem('cached_listings') || '[]');
      const updatedCache = cached.map(l => l.id === id ? { ...l, status: newStatus } : l);
      localStorage.setItem('cached_listings', JSON.stringify(updatedCache));
    } catch {
      // Fehlgeschlagen: als Offline-Warteschlange behandeln
      const queue = JSON.parse(localStorage.getItem('offline_status_queue') || '[]');
      queue.push({ id, status: newStatus, timestamp: Date.now() });
      localStorage.setItem('offline_status_queue', JSON.stringify(queue));
      
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      setSelectedListing(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
    }
  }

  // Wohnung löschen mit optionaler Begründung
  async function handleDelete(id, reasons = [], customReason = '') {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`${backendUrl}/api/listings/${id}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ reasons, customReason })
      });
      setListings(prev => prev.filter(l => l.id !== id));
      if (selectedListing?.id === id) setSelectedListing(null);
    } catch {
      // Stille Fehlerbehandlung
    }
  }

  // Listing im State nach Aktualisierung (z.B. neues Inserat enriched oder neues Anschreiben) updaten
  function handleUpdateListing(updatedListing) {
    setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
    setSelectedListing(updatedListing);
  }

  // Importiertes Inserat hinzufügen
  function handleImportSuccess(newListing) {
    setListings(prev => {
      const exists = prev.find(l => l.id === newListing.id);
      if (exists) return prev.map(l => l.id === newListing.id ? newListing : l);
      return [newListing, ...prev];
    });
    setSelectedListing(newListing);
  }

  // Gefilterte und gesuchte Listings
  const filteredListings = listings
    .filter(l => {
      // Geografisch unpassende Wohnungen (Score 10) ausblenden (wenn showKoListings deaktiviert ist)
      if (l.matchScore === 10 && !showKoListings) return false;

      const matchesStatus = statusFilter === 'alle' || l.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        l.title?.toLowerCase().includes(query) ||
        l.location?.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query);
      
      // Distanz-Filter (sowohl Dropdown als auch erweiterte Eingabe)
      const actualMaxDistance = maxDistanceInput !== '' ? Number(maxDistanceInput) : maxDistanceFilter;
      const matchesMinDistance = !minDistanceFilter || (l.distanceKm !== undefined && l.distanceKm !== null && l.distanceKm >= Number(minDistanceFilter));
      const matchesMaxDistance = actualMaxDistance === 999 || (l.distanceKm !== undefined && l.distanceKm !== null && l.distanceKm <= actualMaxDistance);

      // Preis-Filter (Warm- oder Kaltmiete)
      const price = l.priceWarm || l.priceKalt;
      const matchesMinPrice = !minPriceFilter || (price !== undefined && price !== null && price >= Number(minPriceFilter));
      const matchesMaxPrice = !maxPriceFilter || (price !== undefined && price !== null && price <= Number(maxPriceFilter));

      // Quadratmeter-Filter
      const matchesMinSqm = !minSqmFilter || (l.sqm !== undefined && l.sqm !== null && l.sqm >= Number(minSqmFilter));
      const matchesMaxSqm = !maxSqmFilter || (l.sqm !== undefined && l.sqm !== null && l.sqm <= Number(maxSqmFilter));

      // Portal-Filter
      const matchesPortal = portalFilter === 'alle' || l.portal === portalFilter;

      // POI-Filter
      let matchesPoiSupermarket = true;
      if (maxPoiSupermarket) {
        const minDistance = l.pois?.supermarkets && l.pois.supermarkets.length > 0
          ? Math.min(...l.pois.supermarkets.map(s => s.distanceKm))
          : 999;
        matchesPoiSupermarket = minDistance <= Number(maxPoiSupermarket);
      }

      let matchesPoiTransit = true;
      if (maxPoiTransit) {
        const minDistance = l.pois?.publicTransit && l.pois.publicTransit.length > 0
          ? Math.min(...l.pois.publicTransit.map(t => t.distanceKm))
          : 999;
        matchesPoiTransit = minDistance <= Number(maxPoiTransit);
      }

      let matchesPoiPark = true;
      if (maxPoiPark) {
        const minDistance = l.pois?.parks && l.pois.parks.length > 0
          ? Math.min(...l.pois.parks.map(p => p.distanceKm))
          : 999;
        matchesPoiPark = minDistance <= Number(maxPoiPark);
      }

      return matchesStatus && matchesSearch && matchesMinDistance && matchesMaxDistance && matchesMinPrice && matchesMaxPrice && matchesMinSqm && matchesMaxSqm && matchesPortal && matchesPoiSupermarket && matchesPoiTransit && matchesPoiPark;
    })
    .sort((a, b) => {
      // 1. Neue (ungelesene) Wohnungen zuerst
      const aIsNew = a.status === 'neu' ? 1 : 0;
      const bIsNew = b.status === 'neu' ? 1 : 0;
      if (aIsNew !== bIsNew) {
        return bIsNew - aIsNew; // Neu zuerst (1 vor 0)
      }

      // 2. Danach nach Match-Score absteigend (höchste Übereinstimmung zuerst)
      const aScore = a.matchScore || 0;
      const bScore = b.matchScore || 0;
      if (aScore !== bScore) {
        return bScore - aScore;
      }

      // 3. Danach nach Scraped-Datum absteigend (neueste zuerst)
      const aDate = new Date(a.scrapedAt || 0).getTime();
      const bDate = new Date(b.scrapedAt || 0).getTime();
      return bDate - aDate;
    });

  // Message Handler für Klicks auf der Karte
  useEffect(() => {
    const handleMapMessage = (event) => {
      if (event.data && event.data.type === 'open-listing') {
        const listingId = event.data.id;
        // Finde das aktuelle Listing im State
        setListings(prevListings => {
          const listing = prevListings.find(l => l.id === listingId);
          if (listing) {
            // Modale Ansicht öffnen
            setSelectedListing({
              ...listing,
              status: listing.status === 'neu' ? 'gelesen' : listing.status
            });
            
            // Wenn neu, im Backend und Frontend als gelesen markieren
            if (listing.status === 'neu') {
              handleStatusChange(listing.id, 'gelesen');
            }
          }
          return prevListings;
        });
      }
    };

    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, []);

  // Karte mit gefilterten Daten synchronisieren
  useEffect(() => {
    if (dashboardTab === 'map' && mapIframeRef.current && preferences) {
      const timer = setTimeout(() => {
        mapIframeRef.current.contentWindow?.postMessage({
          type: 'set-data',
          preferences: preferences,
          listings: filteredListings
        }, '*');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [dashboardTab, filteredListings, preferences]);

  // Auth guard: redirect unauthenticated users to login
  const { token, logout } = useAuth();
  useEffect(() => {
    if (!token && view !== 'login' && view !== 'register') {
      setView('login');
    }
  }, [token, view]);

  // If authenticated, ensure we land on dashboard
  useEffect(() => {
    if (token && view === 'login') {
      setView('dashboard');
    }
  }, [token, view]);

  // Deep-linking Support für Benachrichtigungsklicks
  useEffect(() => {
    if (listings.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('openListingId');
      if (openId) {
        const found = listings.find(l => l.id === openId);
        if (found) {
          console.log(`Deep-Link: Öffne Wohnung "${found.title}"...`);
          setSelectedListing({
            ...found,
            status: found.status === 'neu' ? 'gelesen' : found.status
          });
          if (found.status === 'neu') {
            handleStatusChange(found.id, 'gelesen');
          }
          // Bereinige URL Parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [listings]);

  // Statistiken für die Dashboard-Überschrift
  const stats = {
    total: listings.length,
    visible: filteredListings.length,
    neu: filteredListings.filter(l => l.status === 'neu').length,
    favoriten: filteredListings.filter(l => l.status === 'favorit').length,
    topMatch: filteredListings.length > 0 ? Math.max(...filteredListings.map(l => l.matchScore || 0)) : 0,
  };

  function formatDate(dateObjOrStr) {
    if (!dateObjOrStr) return 'Noch nie';
    const d = new Date(dateObjOrStr);
    return d.toLocaleString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  return (
    <div className="app-container">

      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside className="sidebar">
        <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={28} className="logo-icon" />
            <span className="logo-text">Wohnungs KI</span>
          </div>
          <button 
            className="theme-toggle-btn" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Helles Design einschalten' : 'Dunkles Design einschalten'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Profil-Auswahl */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>SUCHPROFIL</label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <select 
              value={activeProfileId} 
              onChange={(e) => handleProfileChange(e.target.value)}
              style={{
                flex: 1,
                padding: '0.35rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={handleCreateProfile}
              style={{
                padding: '0.35rem 0.5rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.82rem'
              }}
              title="Neues Profil erstellen"
            >
              +
            </button>
            <button 
              onClick={handleDeleteProfile}
              style={{
                padding: '0.35rem 0.5rem',
                backgroundColor: 'var(--danger)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.82rem'
              }}
              title="Aktuelles Profil löschen"
            >
              x
            </button>
          </div>
        </div>

        <nav className="nav-links">
          <button
            id="nav-dashboard"
            className={`nav-button ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <Home size={20} className="nav-icon" />
            <span>Dashboard</span>
          </button>
          <button
            id="nav-swipe"
            className={`nav-button ${view === 'swipe' ? 'active' : ''}`}
            onClick={() => setView('swipe')}
          >
            <Flame size={20} className="nav-icon" />
            <span>Swipe Triage</span>
          </button>
          <button
            id="nav-compare"
            className={`nav-button ${view === 'compare' ? 'active' : ''}`}
            onClick={() => setView('compare')}
          >
            <Columns size={20} className="nav-icon" />
            <span>Vergleich</span>
          </button>
          <button
            id="nav-moving"
            className={`nav-button ${view === 'moving' ? 'active' : ''}`}
            onClick={() => setView('moving')}
          >
            <Truck size={20} className="nav-icon" />
            <span>Umzug & Kündigung</span>
          </button>
          <button
            id="nav-documents"
            className={`nav-button ${view === 'documents' ? 'active' : ''}`}
            onClick={() => setView('documents')}
          >
            <FolderOpen size={20} className="nav-icon" />
            <span>Dokumente</span>
          </button>
          <button
            id="nav-settings"
            className={`nav-button ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView('settings')}
          >
            <Settings size={20} className="nav-icon" />
            <span>Suchprofil</span>
          </button>
          <button
            id="nav-login"
            className={`nav-button ${view === 'login' ? 'active' : ''}`}
            onClick={() => setView('login')}
          >
            <LogIn size={20} className="nav-icon" />
            <span>Login</span>
          </button>
          <button
            id="nav-logout"
            className={`nav-button ${view === 'register' ? '' : ''}`}
            onClick={() => { logout(); setView('login'); }}
          >
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {backendOnline
              ? <><Wifi size={14} style={{ color: 'var(--success)' }} /> <span style={{ color: 'var(--success)', fontWeight: 600 }}>Server Online</span></>
              : <><WifiOff size={14} style={{ color: 'var(--danger)' }} /> <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Server Offline</span></>
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={14} />
            <span>Letzter Scan: {formatDate(lastScan)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Clock size={12} style={{ opacity: 0.7 }} />
            <span>Aktualisiert: {formatDate(lastUpdate)}</span>
          </div>
        </div>
      </aside>

      {/* ===== HAUPT-INHALT ===== */}
      <main className="main-content">

        {/* --- DASHBOARD VIEW --- */}
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <div className="page-title">
                <h1>Meine Wohnungssuche</h1>
                <p>
                  {stats.visible} Inserate angezeigt {stats.visible !== stats.total && `(von ${stats.total} gesamt)`} · {stats.neu} neu · {stats.favoriten} Favoriten
                  {stats.topMatch > 0 && <> · <span style={{ color: 'var(--primary)' }}>Bester Match: {stats.topMatch}%</span></>}
                </p>
              </div>
              <div className="header-actions">
                <button 
                  className="theme-toggle-btn mobile-theme-btn"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  title={theme === 'dark' ? 'Helles Design einschalten' : 'Dunkles Design einschalten'}
                  style={{ display: 'flex' }}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {typeof window !== 'undefined' && ('Notification' in window) && (
                  <button
                    className="btn"
                    onClick={() => {
                      if (notificationsEnabled) {
                        unsubscribeUser();
                      } else {
                        requestNotificationPermission();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      borderColor: notificationsEnabled ? '#10b981' : 'var(--border)',
                      background: notificationsEnabled ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      color: notificationsEnabled ? '#10b981' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                    title={notificationsEnabled ? "Desktop-Benachrichtigungen sind aktiv" : "Desktop-Benachrichtigungen aktivieren"}
                  >
                    <span>{notificationsEnabled ? '🔔 Push: An' : '🔕 Push: Aus'}</span>
                  </button>
                )}
                <button
                  id="btn-scan"
                  className="btn"
                  onClick={handleScan}
                  disabled={scanning || !backendOnline}
                >
                  {scanning ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
                  <span>{scanning ? 'Scannt...' : 'Jetzt Scannen'}</span>
                </button>
                <button
                  id="btn-import"
                  className="btn btn-primary"
                  onClick={() => setShowImporter(true)}
                  disabled={!backendOnline}
                >
                  <Plus size={16} />
                  <span>Inserat importieren</span>
                </button>
              </div>
            </div>

            {/* Scan Progress Bar */}
            {scanStatus && scanStatus.active && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Loader2 size={18} className="spinner" style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      Aktiver Suchlauf: {scanStatus.portal} {scanStatus.city ? `(${scanStatus.city})` : ''}
                    </span>
                  </div>
                  {scanStatus.total > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Fortschritt: {scanStatus.progress} / {scanStatus.total} ({Math.round((scanStatus.progress / scanStatus.total) * 100)}%)
                    </span>
                  )}
                </div>
                
                {/* Progress bar line */}
                {scanStatus.total > 0 && (
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(scanStatus.progress / scanStatus.total) * 100}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--primary) 0%, #00f2fe 100%)', 
                      transition: 'width 0.4s ease-in-out' 
                    }} />
                  </div>
                )}
                
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {scanStatus.message}
                </span>
              </div>
            )}

            {/* Offline-Banner */}
            {!backendOnline && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                color: '#f87171'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <WifiOff size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>Offline-Modus aktiv & Backend nicht erreichbar</strong>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      Du kannst bereits geladene Angebote und deine Favoriten weiterhin ansehen und bearbeiten. Statusänderungen werden automatisch lokal gespeichert und synchronisiert, sobald wieder eine Verbindung besteht.
                    </span>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: '#93c5fd',
                  marginBottom: '0.75rem',
                  lineHeight: '1.4'
                }}>
                  <strong>Datenschutz-Hinweis (DSGVO):</strong> Im Offline-Modus werden alle Inserate, Favoriten und Notizen ausschließlich verschlüsselt bzw. sicher in deinem Browser-Cache (lokal auf diesem Gerät) gespeichert. Es erfolgt kein Tracking oder unbefugte Weiterleitung von Daten an externe Server.
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '0.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.1)'
                }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    Gib die IP-Adresse deines Computers ein (z. B. auf dem Smartphone/Emulator):
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="http://192.168.137.252:5000"
                      value={backendUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBackendUrl(val);
                        localStorage.setItem('BACKEND_URL', val);
                      }}
                      style={{
                        flex: '1 1 200px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => loadListings()}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Verbindung testen
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                    Standard-URL auf diesem PC: <code style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => {
                      setBackendUrl('http://192.168.137.252:5000');
                      localStorage.setItem('BACKEND_URL', 'http://192.168.137.252:5000');
                    }}>http://192.168.137.252:5000</code> oder <code style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => {
                      setBackendUrl('http://localhost:5000');
                      localStorage.setItem('BACKEND_URL', 'http://localhost:5000');
                    }}>http://localhost:5000</code>
                  </p>
                </div>
              </div>
            )}

            {/* Statistics Card Section */}
            {statsData && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* 1. General Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} style={{ color: 'var(--primary)' }} />
                      <span>Scan-Übersicht</span>
                    </h4>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {statsData.totalListings || 0}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gesamtanzahl Inserate in der Datenbank</span>
                  </div>
                  {statsData.scanHistory && statsData.scanHistory.length > 0 && (
                    <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                      <strong>Letzter Suchlauf:</strong> {formatDate(statsData.scanHistory[statsData.scanHistory.length - 1].timestamp)}
                      <br />
                      <strong>Neue Inserate:</strong> +{statsData.scanHistory[statsData.scanHistory.length - 1].newCount || 0}
                    </div>
                  )}
                </div>

                {/* 2. Portal Breakdown */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Portal-Verteilung
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { id: 'kleinanzeigen', label: 'Kleinanzeigen', color: '#3c7a3c' },
                      { id: 'immowelt', label: 'Immowelt', color: '#ff6c00' },
                      { id: 'ohneMakler', label: 'Ohne Makler', color: '#005f73' },
                      { id: 'wgGesucht', label: 'WG-Gesucht', color: '#d83a3a' },
                      { id: 'immoscout24', label: 'ImmoScout24', color: '#ee7b00' },
                      { id: 'immonet', label: 'Immonet', color: '#003366' },
                      { id: 'sonstige', label: 'Sonstige', color: '#555555' }
                    ].map(portal => {
                      const count = statsData.portalTotals?.[portal.id] || 0;
                      const percentage = statsData.totalListings > 0 ? (count / statsData.totalListings) * 100 : 0;
                      if (count === 0) return null;
                      return (
                        <div key={portal.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 500 }}>
                            <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: portal.color }}></span>
                              {portal.label}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>{count} ({Math.round(percentage)}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: portal.color, borderRadius: '2px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Trend Chart (CSS column chart of last 7 scans) */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Scan-Trend (Letzte Scans)
                  </h4>
                  {statsData.scanHistory && statsData.scanHistory.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '80px', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border)' }}>
                        {(() => {
                          const historySlice = statsData.scanHistory.slice(-7);
                          const maxNewVal = Math.max(...historySlice.map(h => h.newCount || 0), 1);
                          return historySlice.map((h, i) => {
                            const heightPct = ((h.newCount || 0) / maxNewVal) * 100;
                            return (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }} title={`Scan am ${new Date(h.timestamp).toLocaleDateString('de-DE')}: ${h.newCount} neue`}>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.newCount}</span>
                                <div style={{
                                  width: '100%',
                                  height: `${Math.max(heightPct, 5)}%`,
                                  background: 'linear-gradient(180deg, var(--primary) 0%, rgba(255,255,255,0.2) 100%)',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: '2px',
                                  transition: 'height 0.3s ease'
                                }} />
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block', marginTop: '0.25rem' }}>
                        Neue Angebote pro Scan (letzte 7 Suchläufe)
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                      Keine Trenddaten vorhanden. Starte einen Scan, um Statistiken aufzuzeichnen.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* View und Filter Steuerung */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Liste / Karte / Kalender Tabs */}
              <div className="tabs" style={{ display: 'inline-flex' }}>
                <button
                  className={`tab-btn ${dashboardTab === 'list' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('list')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <List size={16} />
                  <span>Liste</span>
                </button>
                <button
                  className={`tab-btn ${dashboardTab === 'map' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('map')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Map size={16} />
                  <span>Karte</span>
                </button>
                <button
                  className={`tab-btn ${dashboardTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('calendar')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Clock size={16} />
                  <span>Kalender</span>
                </button>
                <button
                  className={`tab-btn ${dashboardTab === 'pipeline' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('pipeline')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Columns size={16} />
                  <span>Pipeline</span>
                </button>
              </div>

              {/* Distanz-Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Entfernung zum Arbeitsplatz:</span>
                <select
                  value={maxDistanceFilter}
                  onChange={e => setMaxDistanceFilter(Number(e.target.value))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    width: 'auto',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value={999}>Beliebig</option>
                  <option value={5}>&le; 5 km</option>
                  <option value={10}>&le; 10 km</option>
                  <option value={15}>&le; 15 km</option>
                  <option value={25}>&le; 25 km</option>
                  <option value={50}>&le; 50 km</option>
                </select>
              </div>

              {/* Portal-Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Portal:</span>
                <select
                  value={portalFilter}
                  onChange={e => setPortalFilter(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    width: 'auto',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="alle">Alle</option>
                  <option value="kleinanzeigen">Kleinanzeigen</option>
                  <option value="immowelt">Immowelt</option>
                  <option value="ohne-makler">Ohne Makler</option>
                  <option value="immoscout24">Immobilienscout24</option>
                  <option value="wg-gesucht">WG-Gesucht</option>
                  <option value="immonet">Immonet</option>
                  <option value="meinestadt">MeineStadt</option>
                  <option value="wohnungsboerse">Wohnungsbörse</option>
                  <option value="sonstige">Sonstige</option>
                </select>
              </div>
            </div>

            {/* Filter & Suche */}
            <div className="filters-bar">
              <div className="tabs">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    id={`filter-${f.key}`}
                    className={`tab-btn ${statusFilter === f.key ? 'active' : ''}`}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer', 
                  background: 'var(--bg-surface)', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  userSelect: 'none',
                  color: showKoListings ? '#ef4444' : 'var(--text-main)',
                  borderColor: showKoListings ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="checkbox"
                    checked={showKoListings}
                    onChange={(e) => setShowKoListings(e.target.checked)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                  <span>K.O. anzeigen ({listings.filter(l => l.matchScore === 10).length})</span>
                </label>
                <button
                  id="btn-advanced-filters"
                  className={`btn ${showAdvancedFilters ? 'btn-primary' : ''}`}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.5rem 1rem',
                    border: showAdvancedFilters ? '1px solid var(--primary)' : '1px solid var(--border)'
                  }}
                  title="Erweiterte Filtereinstellungen anzeigen"
                >
                  <Sliders size={16} />
                  <span>Filter</span>
                </button>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none'
                  }} />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Suche in Inseraten..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.25rem', width: '220px' }}
                  />
                </div>
              </div>
            </div>

            {/* Collapsible Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                boxShadow: 'var(--shadow-md)',
                animation: 'fadeIn 0.2s ease-out',
                backdropFilter: 'blur(10px)'
              }}>
                {/* Preis-Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Preis (€)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceFilter}
                      onChange={e => setMinPriceFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceFilter}
                      onChange={e => setMaxPriceFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                {/* Wohnfläche-Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Fläche (m²)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minSqmFilter}
                      onChange={e => setMinSqmFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxSqmFilter}
                      onChange={e => setMaxSqmFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                {/* Entfernung-Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Entfernung (km)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minDistanceFilter}
                      onChange={e => setMinDistanceFilter(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxDistanceInput}
                      onChange={e => setMaxDistanceInput(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                {/* POI Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Infrastruktur in der Nähe</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: '120px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🛒 Supermarkt</span>
                      <select
                        value={maxPoiSupermarket}
                        onChange={e => setMaxPoiSupermarket(e.target.value)}
                        style={{ padding: '0.4rem', fontSize: '0.85rem', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <option value="">Beliebig</option>
                        <option value="0.3">&le; 300 m</option>
                        <option value="0.5">&le; 500 m</option>
                        <option value="1.0">&le; 1 km</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: '120px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🚌 ÖPNV-Haltestelle</span>
                      <select
                        value={maxPoiTransit}
                        onChange={e => setMaxPoiTransit(e.target.value)}
                        style={{ padding: '0.4rem', fontSize: '0.85rem', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <option value="">Beliebig</option>
                        <option value="0.3">&le; 300 m</option>
                        <option value="0.5">&le; 500 m</option>
                        <option value="1.0">&le; 1 km</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: '120px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🌳 Park / Grünfläche</span>
                      <select
                        value={maxPoiPark}
                        onChange={e => setMaxPoiPark(e.target.value)}
                        style={{ padding: '0.4rem', fontSize: '0.85rem', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <option value="">Beliebig</option>
                        <option value="0.3">&le; 300 m</option>
                        <option value="0.5">&le; 500 m</option>
                        <option value="1.0">&le; 1 km</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Zurücksetzen Button */}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setMinPriceFilter('');
                      setMaxPriceFilter('');
                      setMinSqmFilter('');
                      setMaxSqmFilter('');
                      setMinDistanceFilter('');
                      setMaxDistanceInput('');
                      setMaxPoiSupermarket('');
                      setMaxPoiTransit('');
                      setMaxPoiPark('');
                    }}
                    style={{ width: '100%', padding: '0.45rem 1rem', fontSize: '0.85rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Zurücksetzen
                  </button>
                </div>
              </div>
            )}

            {/* Ergebnis-Grid / Karte */}
            {loadingListings && listings.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                <Loader2 size={40} className="spinner" style={{ color: 'var(--primary)' }} />
                <span>Lade Inserate...</span>
              </div>
            ) : dashboardTab === 'map' ? (
              <div 
                className="map-view-container" 
                style={{ 
                  height: '600px', 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border)', 
                  position: 'relative',
                  marginTop: '1.5rem'
                }}
              >
                <iframe
                  ref={mapIframeRef}
                  src={`${backendUrl}/api/map-html`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Wohnungs-Karte"
                />
              </div>
            ) : dashboardTab === 'calendar' ? (
              <CalendarView
                listings={filteredListings}
                onOpenListing={(listing) => {
                  setSelectedListing({
                    ...listing,
                    status: listing.status === 'neu' ? 'gelesen' : listing.status
                  });
                  if (listing.status === 'neu') {
                    handleStatusChange(listing.id, 'gelesen');
                  }
                }}
              />
            ) : dashboardTab === 'pipeline' ? (
              <PipelineView
                listings={filteredListings}
                onStatusChange={handleStatusChange}
                onOpenListing={(listing) => {
                  setSelectedListing({
                    ...listing,
                    status: listing.status === 'neu' ? 'gelesen' : listing.status
                  });
                  if (listing.status === 'neu') {
                    handleStatusChange(listing.id, 'gelesen');
                  }
                }}
              />
            ) : filteredListings.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '350px',
                gap: '1.5rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(0, 242, 254, 0.06)',
                  border: '2px solid rgba(0, 242, 254, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Building2 size={36} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {listings.length === 0 ? 'Noch keine Wohnungen gefunden' : 'Keine Ergebnisse für diesen Filter'}
                  </p>
                  <p style={{ fontSize: '0.9rem' }}>
                    {listings.length === 0
                      ? 'Richte zuerst dein Suchprofil ein und starte einen Scan – oder importiere ein Inserat direkt.'
                      : 'Versuche es mit einem anderen Suchbegriff oder Filter.'}
                  </p>
                </div>
                {listings.length === 0 && (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn" onClick={() => setView('settings')}>
                      <Settings size={16} />
                      <span>Suchprofil einrichten</span>
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowImporter(true)} disabled={!backendOnline}>
                      <Plus size={16} />
                      <span>Inserat importieren</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="dashboard-grid">
                {filteredListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    deviceLocation={deviceLocation}
                    preferences={preferences}
                    onClick={() => {
                      setSelectedListing({
                        ...listing,
                        status: listing.status === 'neu' ? 'gelesen' : listing.status
                      });
                      if (listing.status === 'neu') {
                        handleStatusChange(listing.id, 'gelesen');
                      }
                    }}
                    onStatusChange={handleStatusChange}
                    onDelete={(id) => setDeleteListingId(id)}
                  />
                ))}
              </div>
            )}

            {/* Dashboard Footer (Last Scan Time) */}
            <div style={{
              marginTop: '3rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  Letzter Suchlauf: <strong style={{ color: 'var(--text-main)' }}>{formatDate(lastScan)}</strong>
                </div>
                <div>
                  Letzte Aktualisierung: <strong style={{ color: 'var(--text-main)' }}>{formatDate(lastUpdate)}</strong>
                </div>
              </div>
              <div>
                {filteredListings.length} von {listings.length} Inseraten geladen
              </div>
            </div>
          </>
        )}

        {/* --- SETTINGS VIEW --- */}
        {view === 'settings' && (
          <PreferenceForm
            backendUrl={backendUrl}
            onBackendUrlChange={(newUrl) => {
              setBackendUrl(newUrl);
              localStorage.setItem('BACKEND_URL', newUrl);
            }}
            onBulkReevaluate={handleBulkReevaluate}
          />
        )}

        {/* --- DOCUMENTS VIEW --- */}
        {view === 'documents' && (
          <DocumentsView backendUrl={backendUrl} listings={listings} />
        )}
        {/* --- SWIPE TRIAGE VIEW --- */}
        {view === 'swipe' && (
          <SwipeView
            listings={listings}
            onUpdateStatus={handleStatusChange}
            onDeleteListing={handleDelete}
          />
        )}
        {/* --- COMPARE MATRIX VIEW --- */}
        {view === 'compare' && (
          <CompareView listings={listings} />
        )}
        {/* --- MOVING & TERMINATION MANAGER --- */}
        {view === 'moving' && (
          <MovingManager backendUrl={backendUrl} />
        )}
        {view === 'login' && (
          <Login onLoginSuccess={() => setView('dashboard')} />
        )}
        {view === 'register' && (
          <Register onRegisterSuccess={() => setView('dashboard')} />
        )}
      </main>

      {/* ===== BOTTOM NAVIGATION (Mobile) ===== */}
      <nav className="bottom-nav">
        <button
          id="mobile-nav-dashboard"
          className={`bottom-nav-item ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          <Home size={22} className="nav-icon" />
          <span>Dashboard</span>
        </button>
        <button
          id="mobile-btn-scan"
          className="bottom-nav-item"
          onClick={handleScan}
          disabled={scanning || !backendOnline}
          style={{ opacity: scanning || !backendOnline ? 0.4 : 1 }}
        >
          {scanning ? <Loader2 size={22} className="spinner" style={{ color: 'var(--primary)' }} /> : <RefreshCw size={22} className="nav-icon" />}
          <span>{scanning ? 'Scannt...' : 'Scan'}</span>
        </button>
        <button
          id="mobile-btn-import"
          className="bottom-nav-item"
          onClick={() => setShowImporter(true)}
          disabled={!backendOnline}
          style={{ opacity: !backendOnline ? 0.4 : 1 }}
        >
          <Plus size={22} className="nav-icon" />
          <span>Importieren</span>
        </button>
        <button
          id="mobile-nav-settings"
          className={`bottom-nav-item ${view === 'settings' ? 'active' : ''}`}
          onClick={() => setView('settings')}
        >
          <Settings size={22} className="nav-icon" />
          <span>Profil</span>
        </button>
      </nav>

      {/* ===== MODALS ===== */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          backendUrl={backendUrl}
          onClose={() => setSelectedListing(null)}
          onUpdateListing={handleUpdateListing}
          deviceLocation={deviceLocation}
        />
      )}

      {showImporter && (
        <LinkImporter
          backendUrl={backendUrl}
          onClose={() => setShowImporter(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {deleteListingId && (
        <DeleteConfirmationModal
          listing={listings.find(l => l.id === deleteListingId)}
          onClose={() => setDeleteListingId(null)}
          onConfirm={(reasons, customReason) => {
            handleDelete(deleteListingId, reasons, customReason);
            setDeleteListingId(null);
          }}
        />
      )}
    </div>
  );
}

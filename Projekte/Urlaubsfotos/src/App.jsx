import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import JSZip from 'jszip';

// Services
import { 
  getAllPhotos, 
  savePhoto, 
  deletePhoto, 
  clearAllPhotos,
  getAllAlbums,
  saveAlbum,
  deleteAlbum
} from './services/db';
import { getExifData, analyzeImageQuality, getReverseGeocoding, createThumbnail } from './services/analyzer';
import { classifyImage } from './services/ai';
import { applyImageEdits } from './services/editor';
import { detectFaces } from './services/faces';
import { generateSharingHtml } from './services/exportTemplate';
import { 
  createTokenClient, 
  fetchGooglePhotos, 
  downloadGooglePhoto, 
  listDriveBackups, 
  uploadBackupToDrive, 
  downloadBackupFromDrive 
} from './services/googleApi';

// Components
import Sidebar from './components/Sidebar';
import GalleryView from './components/GalleryView';
import MapView from './components/MapView';
import PeopleDashboard from './components/PeopleDashboard';
import StatsView from './components/StatsView';
import UploadZone from './components/UploadZone';
import QualityCheck from './components/QualityCheck';
import SlideshowView from './components/SlideshowView';
import CloudConnection from './components/CloudConnection';
import ImageEditor from './components/ImageEditor';
import PostcardView from './components/PostcardView';

// Standard Leaflet Icon fix for Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const base64ToBlob = async (base64Uri) => {
  const res = await fetch(base64Uri);
  return res.blob();
};

function calcGPSDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let heic2anyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadHeic2any() {
  if (heic2anyPromise) return heic2anyPromise;
  heic2anyPromise = (async () => {
    await loadScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');
    if (!window.heic2any) {
      throw new Error('heic2any failed to load globally.');
    }
    return window.heic2any;
  })();
  return heic2anyPromise;
}

async function hashPIN(pin) {
  if (!pin) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function App() {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeAlbumId, setActiveAlbumId] = useState('all');
  const [activeView, setActiveView] = useState('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  // Profiles & PIN Locks
  const [currentProfile, setCurrentProfile] = useState('default');
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [setupPinValue, setSetupPinValue] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');
  const [profileToSwitch, setProfileToSwitch] = useState(null);

  // New Album Form
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  
  // Filter settings
  const [filterType, setFilterType] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonName, setSelectedPersonName] = useState('');
  
  // Upload status tracking
  const [uploadQueue, setUploadQueue] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // Slideshow
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideshowSpeed, setSlideshowSpeed] = useState(5); 
  const [kenBurns, setKenBurns] = useState(true);
  const [musicActive, setMusicActive] = useState(false);
  const slideshowTimer = useRef(null);

  // Editor State
  const [editorRotation, setEditorRotation] = useState(0);
  const [editorBrightness, setEditorBrightness] = useState(100);
  const [editorContrast, setEditorContrast] = useState(100);
  const [editorGrayscale, setEditorGrayscale] = useState(false);
  const [editorSepia, setEditorSepia] = useState(false);
  const [editorMirrorHorizontal, setEditorMirrorHorizontal] = useState(false);
  const [editorMirrorVertical, setEditorMirrorVertical] = useState(false);
  const [editorPreset, setEditorPreset] = useState('none');
  const [editorSaving, setEditorSaving] = useState(false);

  // Geotagging State & Refs
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState('');
  const miniMapInstanceRef = useRef(null);
  const miniMarkerRef = useRef(null);

  // Batch Mode State
  const [batchMode, setBatchMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [batchTagName, setBatchTagName] = useState('');

  // Slideshow Audio States & Refs
  const [slideshowMood, setSlideshowMood] = useState('relaxed'); 
  const [oceanWavesActive, setOceanWavesActive] = useState(false);
  const [slideshowVolume, setSlideshowVolume] = useState(50);
  const [showExifDetails, setShowExifDetails] = useState(false);
  
  const slideshowMoodRef = useRef(slideshowMood);
  const oceanWavesActiveRef = useRef(oceanWavesActive);
  const slideshowVolumeRef = useRef(slideshowVolume);
  
  const audioCtxRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const masterGainRef = useRef(null);
  const wavesSourceRef = useRef(null);
  const wavesLfoRef = useRef(null);

  useEffect(() => { slideshowMoodRef.current = slideshowMood; }, [slideshowMood]);
  useEffect(() => { oceanWavesActiveRef.current = oceanWavesActive; }, [oceanWavesActive]);
  
  const stopOceanWaves = () => {
    if (wavesSourceRef.current) {
      try { wavesSourceRef.current.stop(); } catch (e) {}
      wavesSourceRef.current = null;
    }
    if (wavesLfoRef.current) {
      try { wavesLfoRef.current.stop(); } catch (e) {}
      wavesLfoRef.current = null;
    }
  };

  const startOceanWaves = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || wavesSourceRef.current || !masterGainRef.current) return;

    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(1.0, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);

    filter.frequency.setValueAtTime(380, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const wavesGain = ctx.createGain();
    wavesGain.gain.setValueAtTime(0.08, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(wavesGain);
    wavesGain.connect(masterGainRef.current);

    lfo.start();
    noiseSource.start();

    wavesSourceRef.current = noiseSource;
    wavesLfoRef.current = lfo;
  };

  const playAmbientMelody = () => {
    if (audioIntervalRef.current) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
      
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 64;
      audioCtxRef.current.analyserNode = analyser;
      
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(slideshowVolumeRef.current / 100, audioCtxRef.current.currentTime);
      
      masterGainRef.current.connect(analyser);
      analyser.connect(audioCtxRef.current.destination);
    } catch (e) {
      console.error('Failed to start AudioContext:', e);
      return;
    }

    const scales = {
      relaxed: [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
      melancholic: [196.00, 220.00, 233.08, 261.63, 293.66, 311.13, 392.00, 466.16],
      joyful: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 493.88]
    };

    audioIntervalRef.current = setInterval(() => {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') return;
      
      const currentMood = slideshowMoodRef.current;
      const pentatonicScale = scales[currentMood] || scales.relaxed;
      const note = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.0);
      
      osc.connect(gainNode);
      gainNode.connect(masterGainRef.current);
      
      osc.start();
      osc.stop(ctx.currentTime + 4.0);
    }, 2200);

    if (oceanWavesActiveRef.current) {
      startOceanWaves();
    }
  };

  const stopAmbientMelody = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    stopOceanWaves();
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    masterGainRef.current = null;
  };

  useEffect(() => {
    slideshowVolumeRef.current = slideshowVolume;
    if (masterGainRef.current && audioCtxRef.current) {
      const vol = slideshowVolume / 100;
      masterGainRef.current.gain.linearRampToValueAtTime(vol, audioCtxRef.current.currentTime + 0.1);
    }
  }, [slideshowVolume]);

  useEffect(() => {
    if (activeView === 'throwback' && musicActive && audioCtxRef.current) {
      if (oceanWavesActive) {
        startOceanWaves();
      } else {
        stopOceanWaves();
      }
    }
  }, [oceanWavesActive, activeView, musicActive]);

  // Google OAuth
  const [clientId, setClientId] = useState(localStorage.getItem('google_client_id') || '');
  const [accessToken, setAccessToken] = useState(sessionStorage.getItem('google_access_token') || '');
  const [googlePhotos, setGooglePhotos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [backups, setBackups] = useState([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [storageQuota, setStorageQuota] = useState({ used: '0.0', total: '0.0' });
  const tokenClientRef = useRef(null);

  useEffect(() => {
    loadPhotos();
    loadAlbums();
  }, [currentProfile]);

  useEffect(() => {
    setBatchMode(false);
    setSelectedPhotoIds([]);
  }, [activeView]);

  useEffect(() => {
    if (isEditingLocation && selectedPhoto) {
      const timer = setTimeout(() => {
        const mapEl = document.getElementById('mini-map-element');
        if (mapEl && !miniMapInstanceRef.current) {
          const lat = selectedPhoto.location?.latitude || 48.0;
          const lng = selectedPhoto.location?.longitude || 11.0;
          
          miniMapInstanceRef.current = L.map(mapEl).setView([lat, lng], 8);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OSM',
            maxZoom: 18,
          }).addTo(miniMapInstanceRef.current);
          
          miniMarkerRef.current = L.marker([lat, lng], { draggable: true }).addTo(miniMapInstanceRef.current);
        } else if (miniMapInstanceRef.current) {
          const lat = selectedPhoto.location?.latitude || 48.0;
          const lng = selectedPhoto.location?.longitude || 11.0;
          miniMapInstanceRef.current.setView([lat, lng], 8);
          if (miniMarkerRef.current) {
            miniMarkerRef.current.setLatLng([lat, lng]);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
        miniMarkerRef.current = null;
      }
    }
  }, [isEditingLocation, selectedPhoto]);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        setStorageQuota({
          used: (estimate.usage / 1024 / 1024).toFixed(1),
          total: (estimate.quota / 1024 / 1024 / 1024).toFixed(1)
        });
      });
    }
  }, [photos]);

  useEffect(() => {
    if (clientId) {
      const scopes = [
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'https://www.googleapis.com/auth/drive.file'
      ];
      
      const initTokenClient = () => {
        try {
          tokenClientRef.current = createTokenClient(clientId, scopes, (token) => {
            setAccessToken(token);
            sessionStorage.setItem('google_access_token', token);
            setSyncStatus('Erfolgreich angemeldet!');
          });
        } catch (err) {
          console.error('Failed to initialize Google token client:', err);
        }
      };

      if (window.google?.accounts?.oauth2) {
        initTokenClient();
      } else {
        const interval = setInterval(() => {
          if (window.google?.accounts?.oauth2) {
            clearInterval(interval);
            initTokenClient();
          }
        }, 500);
        return () => clearInterval(interval);
      }
    }
  }, [clientId]);

  useEffect(() => {
    if (accessToken) {
      loadGooglePhotos();
      loadBackups();
    }
  }, [accessToken]);

  const loadPhotos = async () => {
    try {
      const data = await getAllPhotos(currentProfile);
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPhotos(data);
    } catch (err) {
      console.error('Error loading photos:', err);
    }
  };

  const loadAlbums = async () => {
    try {
      const data = await getAllAlbums(currentProfile);
      setAlbums(data);
    } catch (err) {
      console.error('Error loading albums:', err);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    const album = {
      id: `album-${Math.random().toString(36).substring(2, 9)}`,
      title: newAlbumTitle.trim(),
      created: new Date().toISOString()
    };
    await saveAlbum(album, currentProfile);
    setNewAlbumTitle('');
    setShowNewAlbumModal(false);
    loadAlbums();
    setActiveAlbumId(album.id);
  };

  const handleDeleteAlbum = async (id, e) => {
    e.stopPropagation();
    if (confirm('Möchtest du dieses Album wirklich löschen? Die enthaltenen Fotos bleiben in der Gesamtgalerie erhalten.')) {
      await deleteAlbum(id);
      
      const albumPhotos = photos.filter(p => p.albumId === id);
      for (const p of albumPhotos) {
        await savePhoto({ ...p, albumId: null }, currentProfile);
      }
      
      if (activeAlbumId === id) {
        setActiveAlbumId('all');
      }
      loadAlbums();
      loadPhotos();
    }
  };

  useEffect(() => {
    if (selectedPhoto) {
      setEditorRotation(0);
      setEditorBrightness(100);
      setEditorContrast(100);
      setEditorGrayscale(false);
      setEditorSepia(false);
      setEditorMirrorHorizontal(false);
      setEditorMirrorVertical(false);
      setEditorPreset('none');
      setIsEditingLocation(false);
      setShowExifDetails(false);
    }
  }, [selectedPhoto]);

  useEffect(() => {
    if (activeView === 'throwback' && isPlaying && photos.length > 0) {
      slideshowTimer.current = setInterval(() => {
        setSlideshowIndex(prev => (prev + 1) % photos.length);
      }, slideshowSpeed * 1000);
    } else {
      clearInterval(slideshowTimer.current);
    }
    return () => clearInterval(slideshowTimer.current);
  }, [activeView, isPlaying, photos.length, slideshowSpeed]);

  useEffect(() => {
    if (activeView === 'throwback' && musicActive) {
      playAmbientMelody();
    } else {
      stopAmbientMelody();
    }
    return () => stopAmbientMelody();
  }, [activeView, musicActive]);

  const handleSaveEdits = async (drawingDataUrl = null, cropArea = null, customSaturate = 100) => {
    if (!selectedPhoto) return;
    setEditorSaving(true);
    try {
      const editedBlob = await applyImageEdits(selectedPhoto.blob, editorRotation, {
        brightness: editorBrightness,
        contrast: editorContrast,
        saturate: customSaturate,
        grayscale: editorGrayscale,
        sepia: editorSepia,
        mirrorHorizontal: editorMirrorHorizontal,
        mirrorVertical: editorMirrorVertical,
        preset: editorPreset
      }, drawingDataUrl, cropArea);

      const thumbnailBlob = await createThumbnail(editedBlob);

      const updatedPhoto = {
        ...selectedPhoto,
        blob: editedBlob,
        thumbnailBlob: thumbnailBlob,
        size: editedBlob.size
      };

      await savePhoto(updatedPhoto, currentProfile);
      loadPhotos();
      
      const newUrl = URL.createObjectURL(editedBlob);
      setSelectedPhoto({ ...updatedPhoto, url: newUrl });
      alert('Änderungen erfolgreich gespeichert.');
    } catch (err) {
      console.error(err);
      alert('Fehler beim Bearbeiten.');
    } finally {
      setEditorSaving(false);
    }
  };

  const exportLocalZip = async () => {
    if (photos.length === 0) return;
    setSyncStatus('Erstelle ZIP-Backup...');
    try {
      const zip = new JSZip();
      const catalog = [];

      for (const p of photos) {
        const arrayBuffer = await p.blob.arrayBuffer();
        const zipPath = `photos/${p.id}_${p.name}`;
        zip.file(zipPath, arrayBuffer);
        
        catalog.push({
          id: p.id,
          name: p.name,
          date: p.date,
          location: p.location,
          camera: p.camera,
          sharpness: p.sharpness,
          isBlurry: p.isBlurry,
          brightness: p.brightness,
          isFavorite: p.isFavorite,
          tags: p.tags || [],
          faces: p.faces || [],
          albumId: p.albumId || null,
          size: p.size,
          filename: zipPath
        });
      }

      zip.file('catalog.json', JSON.stringify(catalog));
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `urlaubsfotos_backup_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      
      setSyncStatus('Lokaler ZIP-Export erfolgreich heruntergeladen!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Erstellen des ZIP-Exports.');
    }
  };

  const handleZipImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Achtung: Dies fügt die Bilder aus dem ZIP deiner aktuellen Galerie hinzu. Fortfahren?')) return;
    
    setSyncStatus('Lese ZIP-Datei...');
    try {
      const zip = await JSZip.loadAsync(file);
      const catalogFile = zip.file('catalog.json');
      if (!catalogFile) {
        alert('Ungültiges Backup: catalog.json fehlt.');
        return;
      }

      const catalogText = await catalogFile.async('text');
      const catalog = JSON.parse(catalogText);
      
      setSyncStatus(`Importiere ${catalog.length} Bilder...`);
      for (const item of catalog) {
        const imageFile = zip.file(item.filename);
        if (imageFile) {
          const blob = await imageFile.async('blob');
          const thumbBlob = await createThumbnail(blob);
          await savePhoto({
            ...item,
            blob: blob,
            thumbnailBlob: thumbBlob
          }, currentProfile);
        }
      }

      setSyncStatus('ZIP-Import erfolgreich abgeschlossen!');
      loadPhotos();
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Importieren.');
    }
  };

  const handleShareGallery = async () => {
    const photosToShare = filteredPhotos.filter(p => !p.isBlurry && (activeAlbumId === 'all' || p.albumId === activeAlbumId));
    if (photosToShare.length === 0) {
      alert('Keine passenden Fotos zum Teilen gefunden.');
      return;
    }
    setSyncStatus('Erstelle Online-Galerie...');
    try {
      const activeAlbumTitle = activeAlbumId !== 'all' ? albums.find(a => a.id === activeAlbumId)?.title : 'Reise-Highlights';
      const htmlContent = await generateSharingHtml(activeAlbumTitle, photosToShare.slice(0, 40)); 
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeAlbumTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sharing.html`;
      link.click();
      setSyncStatus('Erfolgreich exportiert! Du kannst die HTML-Datei jetzt teilen.');
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Erstellen des Web-Exports.');
    }
  };

  const handleFiles = async (files) => {
    const newItems = Array.from(files).map(file => {
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        file: file,
        status: 'pending',
        progress: 0,
        thumbnail: isHeic ? '' : URL.createObjectURL(file),
        isHeic: isHeic
      };
    });

    setUploadQueue(prev => [...newItems, ...prev]);

    for (const item of newItems) {
      let currentFile = item.file;
      
      if (item.isHeic) {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'converting' } : q));
        try {
          const heic2any = await loadHeic2any();
          const convertedBlob = await heic2any({
            blob: item.file,
            toType: 'image/jpeg',
            quality: 0.9
          });
          const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          const newName = item.name.replace(/\.(heic|heif)$/i, '.jpg');
          currentFile = new File([resultBlob], newName, { type: 'image/jpeg' });
          
          const newThumbnail = URL.createObjectURL(currentFile);
          setUploadQueue(prev => prev.map(q => q.id === item.id ? { 
            ...q, 
            file: currentFile, 
            name: newName,
            thumbnail: newThumbnail 
          } : q));
        } catch (error) {
          console.error('HEIC conversion failed for', item.name, error);
          setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
          continue;
        }
      }

      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'analyzing' } : q));
      
      try {
        const metadata = await getExifData(currentFile);
        const analysis = await analyzeImageQuality(currentFile);
        
        if (metadata.location && metadata.location.latitude && metadata.location.longitude) {
          try {
            const cityName = await getReverseGeocoding(metadata.location.latitude, metadata.location.longitude);
            if (cityName) {
              metadata.location.name = cityName;
            }
          } catch (e) {
            console.error('Reverse geocoding failed:', e);
          }
        }
        
        const tags = await classifyImage(currentFile);
        const detected = await detectFaces(currentFile);
        const thumbBlob = await createThumbnail(currentFile);

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'saving' } : q));

        const photoRecord = {
          id: item.id,
          name: currentFile.name,
          blob: currentFile,
          thumbnailBlob: thumbBlob,
          date: metadata.date,
          location: metadata.location,
          camera: metadata.camera,
          sharpness: analysis.sharpness,
          isBlurry: analysis.isBlurry,
          brightness: analysis.brightness,
          isFavorite: analysis.sharpness > 80 && !analysis.isBlurry,
          tags: tags,
          faces: detected,
          albumId: activeAlbumId !== 'all' ? activeAlbumId : null,
          size: currentFile.size
        };

        await savePhoto(photoRecord, currentProfile);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done' } : q));
      } catch (error) {
        console.error('Error processing file:', item.name, error);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
      }
    }
    
    loadPhotos();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const toggleFavorite = async (photo, e) => {
    if (e) e.stopPropagation();
    const updated = { ...photo, isFavorite: !photo.isFavorite };
    await savePhoto(updated, currentProfile);
    setPhotos(prev => prev.map(p => p.id === photo.id ? updated : p));
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const handleRemoveTag = async (photo, tagToRemove) => {
    const updatedTags = (photo.tags || []).filter(t => t !== tagToRemove);
    const updatedPhoto = { ...photo, tags: updatedTags };
    await savePhoto(updatedPhoto, currentProfile);
    loadPhotos();
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto(prev => ({ ...prev, tags: updatedTags }));
    }
  };

  const handleAddTag = async (photo, newTag) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (photo.tags && photo.tags.includes(trimmed)) return;
    const updatedTags = [...(photo.tags || []), trimmed];
    const updatedPhoto = { ...photo, tags: updatedTags };
    await savePhoto(updatedPhoto, currentProfile);
    loadPhotos();
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto(prev => ({ ...prev, tags: updatedTags }));
    }
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!locationSearchQuery.trim()) return;
    setLocationSearchLoading(true);
    setLocationSearchError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationSearchQuery)}&format=json&limit=1`, {
        headers: {
          'Accept-Language': 'de,en'
        }
      });
      if (!res.ok) throw new Error('Fehler bei der Ortssuche.');
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const name = item.display_name.split(',')[0];
        
        if (miniMapInstanceRef.current) {
          miniMapInstanceRef.current.setView([lat, lon], 12);
          if (miniMarkerRef.current) {
            miniMarkerRef.current.setLatLng([lat, lon]);
          }
        }
        setLocationSearchQuery(name);
      } else {
        setLocationSearchError('Kein Ort gefunden.');
      }
    } catch (err) {
      console.error(err);
      setLocationSearchError('Netzwerkfehler.');
    } finally {
      setLocationSearchLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedPhoto) return;
    let lat = null;
    let lng = null;
    if (miniMarkerRef.current) {
      const pos = miniMarkerRef.current.getLatLng();
      lat = pos.lat;
      lng = pos.lng;
    }
    
    const updatedLocation = {
      latitude: lat,
      longitude: lng,
      name: locationSearchQuery.trim() || 'Manueller Standort'
    };

    const updatedPhoto = {
      ...selectedPhoto,
      location: updatedLocation
    };

    await savePhoto(updatedPhoto, currentProfile);
    loadPhotos();
    setSelectedPhoto(prev => ({ ...prev, location: updatedLocation }));
    setIsEditingLocation(false);
    setLocationSearchQuery('');
  };

  const handleRemoveLocation = async () => {
    if (!selectedPhoto) return;
    const updatedPhoto = {
      ...selectedPhoto,
      location: null
    };
    await savePhoto(updatedPhoto, currentProfile);
    loadPhotos();
    setSelectedPhoto(prev => ({ ...prev, location: null }));
    setIsEditingLocation(false);
    setLocationSearchQuery('');
  };

  const handleToggleSelectPhoto = (photoId) => {
    setSelectedPhotoIds(prev => 
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedPhotoIds.length === 0) return;
    if (confirm(`Möchtest du die ${selectedPhotoIds.length} ausgewählten Fotos wirklich löschen?`)) {
      for (const id of selectedPhotoIds) {
        await deletePhoto(id);
      }
      loadPhotos();
      setSelectedPhotoIds([]);
      setBatchMode(false);
    }
  };

  const handleBatchAssignAlbum = async (albumId) => {
    if (selectedPhotoIds.length === 0) return;
    const targetAlbumId = albumId || null;
    const albumTitle = targetAlbumId ? albums.find(a => a.id === targetAlbumId)?.title : 'Hauptgalerie';
    
    if (confirm(`Möchtest du die ${selectedPhotoIds.length} ausgewählten Fotos dem Album "${albumTitle}" zuweisen?`)) {
      for (const id of selectedPhotoIds) {
        const photo = photos.find(p => p.id === id);
        if (photo) {
          await savePhoto({ ...photo, albumId: targetAlbumId }, currentProfile);
        }
      }
      loadPhotos();
      setSelectedPhotoIds([]);
      setBatchMode(false);
    }
  };

  const handleBatchAddTag = async (e) => {
    e.preventDefault();
    const trimmed = batchTagName.trim();
    if (!trimmed) return;
    if (selectedPhotoIds.length === 0) return;

    if (confirm(`Möchtest du das Tag "${trimmed}" zu den ${selectedPhotoIds.length} ausgewählten Fotos hinzufügen?`)) {
      for (const id of selectedPhotoIds) {
        const photo = photos.find(p => p.id === id);
        if (photo) {
          const currentTags = photo.tags || [];
          if (!currentTags.includes(trimmed)) {
            await savePhoto({ ...photo, tags: [...currentTags, trimmed] }, currentProfile);
          }
        }
      }
      loadPhotos();
      setSelectedPhotoIds([]);
      setBatchTagName('');
      setBatchMode(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Möchtest du dieses Foto wirklich löschen?')) {
      await deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      if (selectedPhoto && selectedPhoto.id === id) {
        setSelectedPhoto(null);
      }
    }
  };

  const deleteBlurryPhotos = async () => {
    const blurry = photos.filter(p => p.isBlurry);
    if (blurry.length === 0) return;
    if (confirm(`Möchtest du alle ${blurry.length} unscharfen/verwackelten Bilder unwiderruflich löschen?`)) {
      for (const p of blurry) {
        await deletePhoto(p.id);
      }
      loadPhotos();
    }
  };

  function groupPhotosIntoTrips(photoList) {
    if (photoList.length === 0) return [];
    
    const sorted = [...photoList].sort((a, b) => new Date(a.date) - new Date(b.date));
    const trips = [];
    let currentTrip = {
      id: 'trip-0',
      title: 'Urlaub & Reisen',
      startDate: sorted[0].date,
      endDate: sorted[0].date,
      photos: [sorted[0]],
      locations: new Set()
    };

    if (sorted[0].location?.latitude) {
      currentTrip.locations.add(sorted[0].location.name || 'Unbekannter Ort');
    }

    const maxGapMs = 4 * 24 * 60 * 60 * 1000;

    for (let i = 1; i < sorted.length; i++) {
      const prevPhoto = sorted[i - 1];
      const currPhoto = sorted[i];
      const diff = new Date(currPhoto.date) - new Date(prevPhoto.date);

      if (diff <= maxGapMs) {
        currentTrip.photos.push(currPhoto);
        currentTrip.endDate = currPhoto.date;
        if (currPhoto.location?.latitude) {
          currentTrip.locations.add(currPhoto.location.name || 'Unbekannter Ort');
        }
      } else {
        trips.push(currentTrip);
        currentTrip = {
          id: `trip-${i}`,
          title: 'Urlaub & Reisen',
          startDate: currPhoto.date,
          endDate: currPhoto.date,
          photos: [currPhoto],
          locations: new Set()
        };
        if (currPhoto.location?.latitude) {
          currentTrip.locations.add(currPhoto.location.name || 'Unbekannter Ort');
        }
      }
    }
    trips.push(currentTrip);

    return trips.map(trip => {
      const locArray = Array.from(trip.locations);
      let title = 'Urlaubstrip';
      if (locArray.length > 0) {
        title = locArray.slice(0, 2).join(' & ');
      } else {
        const start = new Date(trip.startDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        title = `Reise im ${start}`;
      }
      return {
        ...trip,
        title
      };
    }).reverse();
  }

  // Google APIs
  const handleSaveClientId = (e) => {
    e.preventDefault();
    localStorage.setItem('google_client_id', clientId);
    setSyncStatus('Client-ID gespeichert. Melde dich jetzt an.');
  };

  const handleGoogleLogin = () => {
    if (!tokenClientRef.current) {
      alert('Bitte speichere zuerst eine gültige Google Client-ID.');
      return;
    }
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  };

  const handleGoogleLogout = () => {
    setAccessToken('');
    sessionStorage.removeItem('google_access_token');
    setGooglePhotos([]);
    setBackups([]);
    setSyncStatus('Abgemeldet.');
  };

  const loadGooglePhotos = async (pageToken = '') => {
    if (!accessToken) return;
    setCloudLoading(true);
    setSyncStatus('Lade Google Fotos...');
    try {
      const data = await fetchGooglePhotos(accessToken, pageToken);
      setGooglePhotos(prev => pageToken ? [...prev, ...(data.mediaItems || [])] : (data.mediaItems || []));
      setNextPageToken(data.nextPageToken || '');
      setSyncStatus('');
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Laden von Google Fotos.');
    } finally {
      setCloudLoading(false);
    }
  };

  const importGooglePhoto = async (gPhoto) => {
    setSyncStatus(`Importiere ${gPhoto.filename}...`);
    try {
      const blob = await downloadGooglePhoto(gPhoto.baseUrl);
      const file = new File([blob], gPhoto.filename, { type: blob.type });

      const metadata = await getExifData(file);
      const analysis = await analyzeImageQuality(file);
      const tags = await classifyImage(file);
      const detected = await detectFaces(file);
      const thumbBlob = await createThumbnail(file);

      const photoRecord = {
        id: `g-${gPhoto.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 5)}`,
        name: gPhoto.filename,
        blob: blob,
        thumbnailBlob: thumbBlob,
        date: gPhoto.mediaMetadata?.creationTime || metadata.date,
        location: metadata.location,
        camera: gPhoto.mediaMetadata?.cameraModel || metadata.camera,
        sharpness: analysis.sharpness,
        isBlurry: analysis.isBlurry,
        brightness: analysis.brightness,
        isFavorite: analysis.sharpness > 80 && !analysis.isBlurry,
        tags: tags,
        faces: detected,
        albumId: activeAlbumId !== 'all' ? activeAlbumId : null,
        size: blob.size
      };

      await savePhoto(photoRecord, currentProfile);
      loadPhotos();
      setSyncStatus(`Erfolgreich importiert: ${gPhoto.filename}`);
    } catch (err) {
      console.error(err);
      setSyncStatus(`Fehler beim Importieren von ${gPhoto.filename}`);
    }
  };

  const loadBackups = async () => {
    if (!accessToken) return;
    setCloudLoading(true);
    try {
      const list = await listDriveBackups(accessToken);
      setBackups(list);
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Suchen von Backups.');
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!accessToken) return;
    setCloudLoading(true);
    setSyncStatus('Bereite Backup vor (Fotos werden kodiert)...');
    try {
      const serializedPhotos = [];
      for (const p of photos) {
        const base64 = await blobToBase64(p.blob);
        serializedPhotos.push({
          ...p,
          blob: base64
        });
      }

      setSyncStatus('Lade Backup in Google Drive hoch...');
      const existingBackup = backups[0];
      await uploadBackupToDrive(accessToken, serializedPhotos, existingBackup?.id);
      setSyncStatus('Backup erfolgreich erstellt!');
      loadBackups();
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Hochladen.');
    } finally {
      setCloudLoading(false);
    }
  };

  const handleRestoreBackup = async (fileId) => {
    if (!accessToken) return;
    if (!confirm('Achtung: Dies überschreibt deine aktuelle lokale Galerie. Fortfahren?')) return;
    
    setCloudLoading(true);
    setSyncStatus('Lade Backup aus Google Drive herunter...');
    try {
      const data = await downloadBackupFromDrive(accessToken, fileId);
      
      setSyncStatus('Stelle Fotos in der lokalen Datenbank wieder her...');
      await clearAllPhotos();

      for (const item of data) {
        const blob = await base64ToBlob(item.blob);
        const thumbBlob = await createThumbnail(blob);
        await savePhoto({
          ...item,
          blob: blob,
          thumbnailBlob: thumbBlob
        }, currentProfile);
      }

      setSyncStatus('Wiederherstellung erfolgreich abgeschlossen!');
      loadPhotos();
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler.');
    } finally {
      setCloudLoading(false);
    }
  };

  const handleProfileChange = (profile) => {
    const pinHash = localStorage.getItem(`profile_pin_${profile}`);
    if (pinHash) {
      setProfileToSwitch(profile);
      setIsLocked(true);
      setPinInput('');
      setPinError('');
    } else {
      setCurrentProfile(profile);
      setProfileToSwitch(null);
    }
  };

  const handleLockProfile = () => {
    const pinHash = localStorage.getItem(`profile_pin_${currentProfile}`);
    if (pinHash) {
      setProfileToSwitch(currentProfile);
      setIsLocked(true);
      setPinInput('');
      setPinError('');
    } else {
      alert('Für dieses Profil ist keine PIN eingerichtet. Bitte klicke zuerst auf "🔑 PIN".');
    }
  };

  const handleSetupPIN = () => {
    setSetupPinValue('');
    setSetupPinConfirm('');
    setShowSetupPinModal(true);
  };

  const handleSetupPINSubmit = async (e) => {
    e.preventDefault();
    if (setupPinValue !== setupPinConfirm) {
      alert('Die PINs stimmen nicht überein.');
      return;
    }
    const hash = await hashPIN(setupPinValue);
    localStorage.setItem(`profile_pin_${currentProfile}`, hash);
    setShowSetupPinModal(false);
    alert('PIN erfolgreich eingerichtet!');
  };

  const handleRemovePIN = () => {
    localStorage.removeItem(`profile_pin_${currentProfile}`);
    setShowSetupPinModal(false);
    alert('PIN erfolgreich gelöscht!');
  };

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    const targetProfile = profileToSwitch || currentProfile;
    const pinHash = localStorage.getItem(`profile_pin_${targetProfile}`);
    const inputHash = await hashPIN(pinInput);
    
    if (inputHash === pinHash) {
      setCurrentProfile(targetProfile);
      setIsLocked(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Ungültige PIN. Bitte erneut versuchen.');
    }
  };

  const filteredPhotos = photos.filter(photo => {
    if (activeAlbumId !== 'all' && photo.albumId !== activeAlbumId) return false;
    if (filterType === 'highlights' && !photo.isFavorite) return false;
    
    if (selectedPersonName) {
      const hasPerson = photo.faces && photo.faces.some(f => f.name && f.name.toLowerCase() === selectedPersonName.toLowerCase());
      if (!hasPerson) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const parts = query.split(/\s+/);
      return parts.every(part => {
        if (part.startsWith('tag:')) {
          const val = part.substring(4);
          return photo.tags && photo.tags.some(tag => tag.toLowerCase().includes(val));
        }
        if (part.startsWith('ort:')) {
          const val = part.substring(4);
          return photo.location?.name && photo.location.name.toLowerCase().includes(val);
        }
        if (part.startsWith('kamera:')) {
          const val = part.substring(7);
          return photo.camera && photo.camera.toLowerCase().includes(val);
        }
        if (part.startsWith('jahr:')) {
          const val = part.substring(5);
          return new Date(photo.date).getFullYear().toString() === val;
        }

        const locMatch = photo.location?.name && photo.location.name.toLowerCase().includes(part);
        const camMatch = photo.camera && photo.camera.toLowerCase().includes(part);
        const nameMatch = photo.name && photo.name.toLowerCase().includes(part);
        const dateMatch = new Date(photo.date).toLocaleDateString('de-DE').includes(part);
        const tagsMatch = photo.tags && photo.tags.some(tag => tag.toLowerCase().includes(part));
        
        return locMatch || camMatch || nameMatch || dateMatch || tagsMatch;
      });
    }
    return true;
  });

  const trips = groupPhotosIntoTrips(filteredPhotos);

  const getEditorFilterCSS = () => {
    let styleStr = '';
    if (editorBrightness !== 100) styleStr += `brightness(${editorBrightness}%) `;
    if (editorContrast !== 100) styleStr += `contrast(${editorContrast}%) `;
    if (editorGrayscale) styleStr += 'grayscale(100%) ';
    if (editorSepia) styleStr += 'sepia(100%) ';
    
    if (editorPreset === 'vintage') styleStr += 'sepia(50%) contrast(110%) brightness(95%) ';
    if (editorPreset === 'cool') styleStr += 'hue-rotate(10deg) saturate(90%) brightness(105%) ';
    if (editorPreset === 'warm') styleStr += 'sepia(30%) saturate(120%) brightness(100%) ';
    if (editorPreset === 'dramatic') styleStr += 'contrast(140%) saturate(80%) brightness(90%) ';
    
    return styleStr.trim();
  };

  const handleNameFace = async (faceId, name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    for (const p of photos) {
      if (p.faces && p.faces.some(f => f.id === faceId)) {
        const updatedFaces = p.faces.map(f => f.id === faceId ? { ...f, name: trimmedName } : f);
        const updatedPhoto = { ...p, faces: updatedFaces };
        await savePhoto(updatedPhoto, currentProfile);
      }
    }
    loadPhotos();
  };

  const getStats = () => {
    let totalKm = 0;
    const sortedPhotos = [...photos]
      .filter(p => p.location?.latitude)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let i = 1; i < sortedPhotos.length; i++) {
      const p1 = sortedPhotos[i - 1].location;
      const p2 = sortedPhotos[i].location;
      totalKm += calcGPSDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }

    const cameras = {};
    const locations = {};
    let totalSize = 0;
    let sumSharpness = 0;

    photos.forEach(p => {
      if (p.camera) cameras[p.camera] = (cameras[p.camera] || 0) + 1;
      if (p.location?.name) locations[p.location.name] = (locations[p.location.name] || 0) + 1;
      totalSize += p.size || 0;
      sumSharpness += p.sharpness || 0;
    });

    const topLocations = Object.entries(locations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalDistance: Math.round(totalKm),
      cameras: Object.entries(cameras),
      topLocations,
      totalStorageMB: (totalSize / 1024 / 1024).toFixed(1),
      avgSharpness: photos.length ? Math.round(sumSharpness / photos.length) : 0
    };
  };

  const stats = getStats();

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeAlbumId={activeAlbumId}
        setActiveAlbumId={setActiveAlbumId}
        albums={albums}
        photos={photos}
        storageQuota={storageQuota}
        setShowNewAlbumModal={setShowNewAlbumModal}
        setSlideshowIndex={setSlideshowIndex}
        accessToken={accessToken}
        loadGooglePhotos={loadGooglePhotos}
        loadBackups={loadBackups}
        currentProfile={currentProfile}
        handleProfileChange={handleProfileChange}
        onLockProfile={handleLockProfile}
        onSetupPIN={handleSetupPIN}
      />

      <main className="main-content">
        {activeView === 'stats' && (
          <StatsView stats={stats} storageQuota={storageQuota} />
        )}

        {activeView === 'people' && (
          <PeopleDashboard
            photos={photos}
            selectedPersonName={selectedPersonName}
            setSelectedPersonName={setSelectedPersonName}
            setActiveView={setActiveView}
            handleNameFace={handleNameFace}
          />
        )}

        {activeView === 'map' && (
          <MapView
            photos={photos}
            activeAlbumId={activeAlbumId}
            groupPhotosIntoTrips={groupPhotosIntoTrips}
          />
        )}

        {(activeView === 'albums' || activeView === 'gallery') && (
          <GalleryView
            activeView={activeView}
            setActiveView={setActiveView}
            activeAlbumId={activeAlbumId}
            setActiveAlbumId={setActiveAlbumId}
            albums={albums}
            photos={filteredPhotos}
            selectedPersonName={selectedPersonName}
            setSelectedPersonName={setSelectedPersonName}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            selectedPhotoIds={selectedPhotoIds}
            setSelectedPhotoIds={setSelectedPhotoIds}
            batchTagName={batchTagName}
            setBatchTagName={setBatchTagName}
            filterType={filterType}
            setFilterType={setFilterType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            trips={trips}
            handleDeleteAlbum={handleDeleteAlbum}
            handleShareGallery={handleShareGallery}
            exportLocalZip={exportLocalZip}
            handleToggleSelectPhoto={handleToggleSelectPhoto}
            setSelectedPhoto={setSelectedPhoto}
            toggleFavorite={toggleFavorite}
            handleDelete={handleDelete}
            handleBatchDelete={handleBatchDelete}
            handleBatchAssignAlbum={handleBatchAssignAlbum}
            handleBatchAddTag={handleBatchAddTag}
            setShowNewAlbumModal={setShowNewAlbumModal}
          />
        )}

        {activeView === 'upload' && (
          <UploadZone
            activeAlbumId={activeAlbumId}
            albums={albums}
            zipInputRef={zipInputRef}
            fileInputRef={fileInputRef}
            dragActive={dragActive}
            syncStatus={syncStatus}
            uploadQueue={uploadQueue}
            handleZipImport={handleZipImport}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            handleFiles={handleFiles}
          />
        )}

        {activeView === 'review' && (
          <QualityCheck
            photos={photos}
            deleteBlurryPhotos={deleteBlurryPhotos}
            setActiveView={setActiveView}
            setSelectedPhoto={setSelectedPhoto}
            handleDelete={handleDelete}
          />
        )}

        {activeView === 'throwback' && (
          <SlideshowView
            photos={photos}
            slideshowIndex={slideshowIndex}
            setSlideshowIndex={setSlideshowIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            slideshowSpeed={slideshowSpeed}
            setSlideshowSpeed={setSlideshowSpeed}
            kenBurns={kenBurns}
            setKenBurns={setKenBurns}
            musicActive={musicActive}
            setMusicActive={setMusicActive}
            slideshowMood={slideshowMood}
            setSlideshowMood={setSlideshowMood}
            oceanWavesActive={oceanWavesActive}
            setOceanWavesActive={setOceanWavesActive}
            slideshowVolume={slideshowVolume}
            setSlideshowVolume={setSlideshowVolume}
            setActiveView={setActiveView}
            audioCtx={audioCtxRef.current}
          />
        )}

        {activeView === 'postcard' && (
          <PostcardView photos={photos} />
        )}

        {activeView === 'cloud' && (
          <CloudConnection
            accessToken={accessToken}
            clientId={clientId}
            setClientId={setClientId}
            googlePhotos={googlePhotos}
            backups={backups}
            cloudLoading={cloudLoading}
            syncStatus={syncStatus}
            nextPageToken={nextPageToken}
            photos={photos}
            handleSaveClientId={handleSaveClientId}
            handleGoogleLogin={handleGoogleLogin}
            handleGoogleLogout={handleGoogleLogout}
            handleCreateBackup={handleCreateBackup}
            loadBackups={loadBackups}
            handleRestoreBackup={handleRestoreBackup}
            loadGooglePhotos={loadGooglePhotos}
            importGooglePhoto={importGooglePhoto}
          />
        )}
      </main>

      {/* NEW ALBUM MODAL */}
      {showNewAlbumModal && (
        <div className="lightbox" onClick={() => setShowNewAlbumModal(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Neues Album erstellen</h3>
            <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Name des Albums (z.B. Rom 2025)" 
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none' }}
                required
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewAlbumModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Erstellen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX / FULLSCREEN MODAL + IMAGE EDITOR */}
      {selectedPhoto && (
        <ImageEditor
          selectedPhoto={selectedPhoto}
          setSelectedPhoto={setSelectedPhoto}
          editorRotation={editorRotation}
          setEditorRotation={setEditorRotation}
          editorMirrorHorizontal={editorMirrorHorizontal}
          setEditorMirrorHorizontal={setEditorMirrorHorizontal}
          editorMirrorVertical={editorMirrorVertical}
          setEditorMirrorVertical={setEditorMirrorVertical}
          editorBrightness={editorBrightness}
          setEditorBrightness={setEditorBrightness}
          editorContrast={editorContrast}
          setEditorContrast={setEditorContrast}
          editorGrayscale={editorGrayscale}
          setEditorGrayscale={setEditorGrayscale}
          editorSepia={editorSepia}
          setEditorSepia={setEditorSepia}
          editorPreset={editorPreset}
          setEditorPreset={setEditorPreset}
          editorSaving={editorSaving}
          isEditingLocation={isEditingLocation}
          setIsEditingLocation={setIsEditingLocation}
          locationSearchQuery={locationSearchQuery}
          setLocationSearchQuery={setLocationSearchQuery}
          locationSearchLoading={locationSearchLoading}
          locationSearchError={locationSearchError}
          showExifDetails={showExifDetails}
          setShowExifDetails={setShowExifDetails}
          albums={albums}
          savePhoto={savePhoto}
          loadPhotos={loadPhotos}
          handleSearchLocation={handleSearchLocation}
          handleRemoveLocation={handleRemoveLocation}
          handleSaveLocation={handleSaveLocation}
          handleRemoveTag={handleRemoveTag}
          handleAddTag={handleAddTag}
          toggleFavorite={toggleFavorite}
          handleDelete={handleDelete}
          handleSaveEdits={handleSaveEdits}
          getEditorFilterCSS={getEditorFilterCSS}
        />
      )}

      {/* PIN Lockscreen Overlay */}
      {isLocked && (
        <div className="lightbox" style={{ zIndex: 1000, background: 'rgba(6, 8, 14, 0.99)', backdropFilter: 'blur(30px)' }}>
          <div className="card" style={{ width: '360px', padding: '2.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🔒</span>
            <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>Profil gesperrt</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Bitte gib die PIN für das Profil "{profileToSwitch === 'private' ? 'Privat' : profileToSwitch === 'family' ? 'Familie' : 'Standard'}" ein.
            </p>
            <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="password" 
                maxLength="8"
                placeholder="PIN eingeben" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', outline: 'none', color: '#fff', fontSize: '1.25rem', textAlign: 'center', letterSpacing: '4px' }}
                required
                autoFocus
              />
              {pinError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{pinError}</div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setIsLocked(false); setProfileToSwitch(null); }}>Abbrechen</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Entsperren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showSetupPinModal && (
        <div className="lightbox" onClick={() => setShowSetupPinModal(false)} style={{ zIndex: 900 }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>PIN einrichten</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Richte eine PIN ein, um den Zugriff auf dein Profil "{currentProfile === 'private' ? 'Privat' : currentProfile === 'family' ? 'Familie' : 'Standard'}" zu schützen.
            </p>
            <form onSubmit={handleSetupPINSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="password" 
                maxLength="8"
                placeholder="Neue PIN" 
                value={setupPinValue}
                onChange={(e) => setSetupPinValue(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none', textAlign: 'center' }}
                required
              />
              <input 
                type="password" 
                maxLength="8"
                placeholder="PIN bestätigen" 
                value={setupPinConfirm}
                onChange={(e) => setSetupPinConfirm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none', textAlign: 'center' }}
                required
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                {localStorage.getItem(`profile_pin_${currentProfile}`) && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={handleRemovePIN}>PIN löschen</button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowSetupPinModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">PIN speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

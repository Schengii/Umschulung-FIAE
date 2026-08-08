import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  ExternalLink,
  Clipboard
} from 'lucide-react';
import { analyzeItemImages } from './gemini';

// Component imports
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EditorForm from './components/EditorForm';
import PriceTrendChart from './components/PriceTrendChart';
import ChatSimulator from './components/ChatSimulator';
import SettingsModal from './components/SettingsModal';
import SoldModal from './components/SoldModal';
import PlatformRecommender from './components/PlatformRecommender';
import ListingChecker from './components/ListingChecker';
import PostingTimeAdvisor from './components/PostingTimeAdvisor';
import BundleSuggester from './components/BundleSuggester';
import PdfExportButton from './components/PdfExportButton';
import VisualMockup from './components/VisualMockup';

// Demo items for immediate testing without API key or file upload
const DEMO_ITEMS = [
  {
    id: 'demo-iphone',
    name: 'iPhone 13 Pro - 128GB - Graphit',
    image: 'https://images.unsplash.com/photo-1632633038634-c1017da867d1?auto=format&fit=crop&q=80&w=600',
    description: 'Verkaufe mein treues iPhone 13 Pro mit 128GB Speicherplatz in der Farbe Graphit. Das Gerät befindet sich in einem sehr guten Zustand und wurde stets mit Schutzhülle und Panzerglas verwendet. Das Display weist keinerlei Kratzer auf, am Rahmen gibt es minimale Gebrauchsspuren. Akkukapazität liegt bei 87% (hält problemlos den ganzen Tag). Kommt in der Originalverpackung inklusive unbenutztem Ladekabel.',
    condition: 'Sehr gut',
    functionality: 'Voll funktionsfähig, FaceID, Kameras und Lautsprecher funktionieren einwandfrei.',
    utility: 'Premium Smartphone mit überragender Kamera, 120Hz ProMotion Display und langer Akkulaufzeit.',
    suggestedPrice: 420.00,
    shippingMethod: 'DHL Paket versichert bis 500€ (5,49 €)',
    paymentMethod: 'PayPal Freunde, Barzahlung bei Abholung, Kleinanzeigen Sicher Bezahlen',
    comparableOffers: [
      { platform: 'ebay', title: 'iPhone 13 Pro 128GB Graphit sehr gut OVP', price: '449,00 €', url: 'https://www.ebay.de/sch/i.html?_nkw=iphone+13+pro+128gb' },
      { platform: 'kleinanzeigen', title: 'iPhone 13 Pro graphit 128gb top Zustand', price: '399,00 €', url: 'https://www.kleinanzeigen.de/s-iphone-13-pro-128gb/k0' }
    ]
  },
  {
    id: 'demo-shoes',
    name: 'Nike Air Max 90 - White/Black - Gr. 44',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    description: 'Biete hier meine originalen Nike Air Max 90 in der Farbkombination Weiß/Schwarz an. Die Schuhe wurden nur 3-4 Mal getragen und befinden sich in einem super Zustand (siehe Fotos). Die Sohle hat noch volles Profil und ist absolut sauber. Keine unangenehmen Gerüche, tierfreier Nichtraucherhaushalt. Der Originalkarton ist leider nicht mehr vorhanden, wird aber gut verpackt verschickt.',
    condition: 'Sehr gut',
    functionality: 'Keine Risse oder Beschädigungen. Obermaterial und Sohle in tadellosem Zustand.',
    utility: 'Klassischer Sneaker mit hervorragender Air-Dämpfung und zeitlosem Design für Alltag und Sport.',
    suggestedPrice: 65.00,
    shippingMethod: 'DHL Paket versichert (5,49 €) oder Hermes Paket (4,95 €)',
    paymentMethod: 'PayPal, Überweisung, Barzahlung bei Abholung',
    comparableOffers: [
      { platform: 'ebay', title: 'Nike Air Max 90 Herrenschuhe Sneaker Gr. 44', price: '72,00 €', url: 'https://www.ebay.de/sch/i.html?_nkw=nike+air+max+90+44' },
      { platform: 'kleinanzeigen', title: 'Nike Air Max 90 Gr 44 weiß schwarz neuwertig', price: '60,00 €', url: 'https://www.kleinanzeigen.de/s-nike-air-max-90-44/k0' }
    ]
  },
  {
    id: 'demo-book',
    name: 'Die 7 Wege zur Effektivität - Stephen R. Covey',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    description: 'Verkaufe den Bestseller "Die 7 Wege zur Effektivität" von Stephen R. Covey als Taschenbuch. Das Buch wurde einmal vorsichtig gelesen. Der Einband hat minimale Lagerspuren an den Ecken, aber es gibt keine Eselsohren, Notizen oder Markierungen im Text. Die Seiten sind sauber und nicht vergilbt. Perfekt für alle, die sich mit persönlicher Weiterentwicklung beschäftigen wollen.',
    condition: 'Gut',
    functionality: 'Vollständig lesbar, Bindung intakt, keine fehlenden Seiten.',
    utility: 'Standardwerk der Persönlichkeitsentwicklung und des Selbstmanagements für mehr Erfolg im Leben.',
    suggestedPrice: 8.50,
    shippingMethod: 'Bücher- und Warensendung der Post (2,25 €)',
    paymentMethod: 'Überweisung, PayPal Freunde',
    comparableOffers: [
      { platform: 'ebay', title: 'Die 7 Wege zur Effektivität Covey Taschenbuch', price: '9,90 €', url: 'https://www.ebay.de/sch/i.html?_nkw=die+7+wege+zur+effektivitaet+covey' },
      { platform: 'kleinanzeigen', title: 'Buch Die 7 Wege zur Effektivität - Stephen Covey', price: '7,00 €', url: 'https://www.kleinanzeigen.de/s-die-7-wege-zur-effektivitaet/k0' }
    ]
  }
];

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('listing_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  // App Phase states: 'upload' | 'scanning' | 'editor' | 'dashboard'
  const [phase, setPhase] = useState('upload');
  
  const [uploadedImages, setUploadedImages] = useState([]); // array of { id, url, file, isCover }
  const [activeImageId, setActiveImageId] = useState(null); // active main image in editor
  const [scanningProgress, setScanningProgress] = useState('Gegenstand wird erkannt...');
  
  // Form input states
  const [currentItem, setCurrentItem] = useState({
    name: '',
    description: '',
    condition: 'Gut',
    functionality: '',
    utility: '',
    suggestedPrice: '',
    minimumPrice: '',
    disclaimer: 'standard',
    tags: '',
    shippingMethod: '',
    paymentMethod: '',
    comparableOffers: [],
    images: []
  });
  
  // Export tab state: 'ebay' | 'kleinanzeigen' | 'shoop' | 'chat'
  const [activeExportTab, setActiveExportTab] = useState('kleinanzeigen');
  const [activeSidebarTab, setActiveSidebarTab] = useState('listings'); // 'listings' | 'dashboard'
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [targetSoldPrice, setTargetSoldPrice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('listing_history', JSON.stringify(history));
  }, [history]);

  const [copiedFields, setCopiedFields] = useState({});

  const handleCopyField = (field, text) => {
    navigator.clipboard.writeText(text);
    setCopiedFields(prev => ({ ...prev, [field]: true }));
    showToast(`${field} kopiert!`);
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const renderCopyConsole = () => {
    const fields = [
      { name: 'Titel', value: currentItem.name },
      { name: 'Preis', value: currentItem.suggestedPrice ? `${currentItem.suggestedPrice} €` : '' },
      { name: 'Beschreibung', value: currentItem.description },
      { name: 'Versandart', value: currentItem.shippingMethod },
      { name: 'Tags', value: currentItem.tags }
    ].filter(f => f.value);

    return (
      <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📋 Schritt-für-Schritt Kopier-Assistent
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ideal für Formulare</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fields.map((field) => (
            <div key={field.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, minWidth: '90px' }}>{field.name}:</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)', margin: '0 12px', textAlign: 'left' }}>
                {field.value}
              </span>
              <button
                type="button"
                className="btn"
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.75rem', 
                  borderRadius: '4px',
                  background: copiedFields[field.name] ? 'var(--accent-emerald-bg)' : 'rgba(255,255,255,0.05)',
                  color: copiedFields[field.name] ? 'var(--accent-emerald)' : '#fff',
                  border: copiedFields[field.name] ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => handleCopyField(field.name, field.value)}
              >
                {copiedFields[field.name] ? 'Kopiert! ✓' : 'Kopieren'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveApiKey = (key) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setShowSettings(false);
    showToast('API-Schlüssel erfolgreich gespeichert!');
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map((file, index) => ({
        id: 'img-' + Date.now() + '-' + index,
        url: URL.createObjectURL(file),
        file: file,
        isCover: uploadedImages.length === 0 && index === 0
      }));
      const updated = [...uploadedImages, ...newImages].slice(0, 5); // Max 5 images
      setUploadedImages(updated);
      if (updated.length > 0) {
        const cover = updated.find(img => img.isCover) || updated[0];
        setActiveImageId(cover.id);
      }
      
      if (phase === 'upload') {
        startScanningWorkflow(updated);
      } else {
        showToast('Bild hinzugefügt! Klicke auf "Neu analysieren" um Details zu aktualisieren.');
      }
    }
  };

  const startScanningWorkflow = (imagesList) => {
    setPhase('scanning');
    
    // Animate search updates
    setTimeout(() => setScanningProgress('Marktpreise werden aus dem Internet ermittelt...'), 1200);
    setTimeout(() => setScanningProgress('Vorlagen-Details werden optimiert...'), 2400);

    setTimeout(async () => {
      try {
        const coverImg = imagesList.find(img => img.isCover) || imagesList[0];
        const filesOnly = imagesList.map(img => img.file).filter(Boolean);
        
        if (!apiKey) {
          setShowSettings(true);
          const randomDemo = DEMO_ITEMS[Math.floor(Math.random() * DEMO_ITEMS.length)];
          setCurrentItem({
            ...randomDemo,
            image: coverImg?.url || randomDemo.image,
            images: imagesList.map(img => ({ url: img.url, isCover: img.isCover }))
          });
          showToast('Mock-Modus: Bitte hinterlege deinen API-Schlüssel für echte KI-Analysen.');
        } else {
          // Multimodal search grounding call
          const result = await analyzeItemImages(filesOnly, apiKey);
          setCurrentItem({
            ...result,
            image: coverImg?.url,
            images: imagesList.map(img => ({ url: img.url, isCover: img.isCover }))
          });
        }
        setPhase('editor');
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Analyse fehlgeschlagen. Lade Mock-Daten...');
        const randomDemo = DEMO_ITEMS[0];
        setCurrentItem({
          ...randomDemo,
          image: imagesList[0]?.url || randomDemo.image,
          images: imagesList.map(img => ({ url: img.url, isCover: img.isCover }))
        });
        setPhase('editor');
      }
    }, 3600);
  };

  const handleSelectDemoItem = (demoItem) => {
    const demoImages = [
      { id: 'demo-img-0', url: demoItem.image, file: null, isCover: true }
    ];
    setUploadedImages(demoImages);
    setActiveImageId('demo-img-0');
    setPhase('scanning');

    setTimeout(() => setScanningProgress('Marktpreise werden aus dem Internet ermittelt...'), 1000);
    setTimeout(() => setScanningProgress('Vorlagen-Details werden optimiert...'), 2200);

    setTimeout(() => {
      setCurrentItem({ 
        ...demoItem,
        images: demoImages.map(img => ({ url: img.url, isCover: img.isCover }))
      });
      setPhase('editor');
      showToast(`${demoItem.name} geladen!`);
    }, 3000);
  };

  const setAsCover = (id) => {
    const updated = uploadedImages.map(img => ({
      ...img,
      isCover: img.id === id
    }));
    setUploadedImages(updated);
    const cover = updated.find(img => img.id === id);
    if (cover) {
      setCurrentItem(prev => ({
        ...prev,
        image: cover.url,
        images: updated.map(i => ({ url: i.url, isCover: i.isCover }))
      }));
      showToast('Hauptbild geändert!');
    }
  };

  const deleteImage = (id) => {
    if (uploadedImages.length <= 1) {
      showToast('Mindestens ein Bild muss erhalten bleiben.');
      return;
    }
    const target = uploadedImages.find(img => img.id === id);
    const updated = uploadedImages.filter(img => img.id !== id);
    
    if (target?.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    
    setUploadedImages(updated);
    const cover = updated.find(img => img.isCover) || updated[0];
    setActiveImageId(cover.id);
    
    setCurrentItem(prev => ({
      ...prev,
      image: cover.url,
      images: updated.map(i => ({ url: i.url, isCover: i.isCover }))
    }));
    showToast('Bild entfernt.');
  };

  const handleUpdateImage = (id, newUrl, newFile) => {
    const updated = uploadedImages.map(img => {
      if (img.id === id) {
        return {
          ...img,
          url: newUrl,
          file: newFile
        };
      }
      return img;
    });
    setUploadedImages(updated);
    
    const updatedCover = updated.find(img => img.isCover) || updated[0];
    setCurrentItem(prev => ({
      ...prev,
      image: updatedCover?.url,
      images: updated.map(i => ({ url: i.url, isCover: i.isCover }))
    }));
  };

  const handleSaveListing = () => {
    const existingIndex = history.findIndex(item => item.name === currentItem.name);
    
    let updatedHistory;
    if (existingIndex > -1) {
      updatedHistory = [...history];
      // Keep original createdAt on update
      updatedHistory[existingIndex] = {
        ...currentItem,
        date: new Date().toLocaleDateString(),
        createdAt: history[existingIndex].createdAt || new Date().toISOString(),
      };
    } else {
      updatedHistory = [
        {
          ...currentItem,
          id: 'item-' + Date.now(),
          date: new Date().toLocaleDateString(),
          createdAt: new Date().toISOString(),
        },
        ...history
      ];
    }
    
    setHistory(updatedHistory);
    showToast('Vorlage in der Historie gespeichert!');
  };

  const handleSnoozeItem = (id) => {
    setHistory(history.map(item =>
      item.id === id ? { ...item, createdAt: new Date().toISOString() } : item
    ));
    showToast('Erinnerung auf 7 Tage verschoben.');
  };

  const handleReducePrice = (id, pct) => {
    setHistory(history.map(item => {
      if (item.id === id) {
        const oldPrice = parseFloat(item.suggestedPrice) || 0;
        const newPrice = Math.max(1, Math.round(oldPrice * (1 - pct / 100) * 100) / 100);
        const updated = { ...item, suggestedPrice: newPrice };
        // If this is the current item being edited, update it too
        if (currentItem.name === item.name) {
          setCurrentItem(prev => ({ ...prev, suggestedPrice: newPrice }));
        }
        return updated;
      }
      return item;
    }));
    showToast(`Preis um ${pct}% gesenkt!`);
  };

  const handleSaveSale = (saleData) => {
    const saleDetails = {
      isSold: true,
      soldPrice: saleData.price,
      soldPlatform: saleData.platform,
      shippingCost: saleData.shipping,
      platformFees: saleData.fees,
      soldDate: new Date().toLocaleDateString()
    };

    const updatedItem = {
      ...currentItem,
      saleDetails
    };

    setCurrentItem(updatedItem);
    
    const updatedHistory = history.map(item => {
      if (item.name === currentItem.name || item.id === currentItem.id) {
        return {
          ...item,
          saleDetails
        };
      }
      return item;
    });

    setHistory(updatedHistory);
    setShowSoldModal(false);
    setTargetSoldPrice(null);
    showToast('Artikel als verkauft markiert!');
  };

  const handleFieldChange = (field, value) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast('In Zwischenablage kopiert!');
  };

  const getDisclaimerText = () => {
    switch (currentItem.disclaimer) {
      case 'standard':
        return '\n\nDer Verkauf erfolgt unter Ausschluss jeglicher Sachmängelhaftung.';
      case 'erweitert':
        return '\n\nDa es sich um einen Privatverkauf handelt, schließe ich jegliche Garantie, Gewährleistung und Rücknahme aus.';
      case 'elektronik':
        return '\n\nHinweis zum EU-Recht: Dies ist ein Privatverkauf. Der Artikel wird verkauft wie beschrieben und abgebildet. Eine Rücknahme, Gewährleistung oder Garantie wird ausgeschlossen.';
      default:
        return '';
    }
  };

  const getEbayTemplate = () => {
    return `📌 TITLE:
${currentItem.name}

🏷️ ZUSTAND:
${currentItem.condition}

📝 BESCHREIBUNG:
${currentItem.description}

⚙️ FUNKTIONALITÄT:
${currentItem.functionality}

💡 NUTZEN & DETAILS:
${currentItem.utility}

🚚 VERSAND:
${currentItem.shippingMethod}

💳 BEZAHLUNG:
${currentItem.paymentMethod}${getDisclaimerText()}

---
Erstellt mit ListerAI`;
  };

  const getKleinanzeigenTemplate = () => {
    return `Titel:
${currentItem.name}

Preis (VB):
${currentItem.suggestedPrice} €

Beschreibung:
Hallo zusammen,

ich verkaufe hier folgenden Gegenstand:
"${currentItem.name}"

Zustand: ${currentItem.condition}
Funktionalität: ${currentItem.functionality}

Hier einige Details zum Gegenstand und dessen Nutzen:
${currentItem.description}

Vorteile & Nutzen:
- ${currentItem.utility}

Versand & Bezahlung:
- Versandart: ${currentItem.shippingMethod}
- Bezahlmethode: ${currentItem.paymentMethod}

Bei Fragen stehe ich gerne zur Verfügung.${getDisclaimerText()}

Viele Grüße!`;
  };

  const getShoopTemplate = () => {
    return `Plattform Tipp (Shoop Cashback & Vinted):
Wenn du diesen Gegenstand verkaufst, nutze Vinted oder eBay.
Achte darauf, deinen Shoop Account zu aktivieren, um beim Einstellen oder Kaufen von Zubehör zusätzliche Cashback-Punkte zu sammeln.

Empfohlener Startpreis: ${currentItem.suggestedPrice} €
Optimale Versandmethode: ${currentItem.shippingMethod}`;
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Sidebar with History */}
      <Sidebar
        history={history}
        currentItem={currentItem}
        phase={phase}
        activeSidebarTab={activeSidebarTab}
        onSelectTab={(tab) => {
          setActiveSidebarTab(tab);
          if (tab === 'listings') {
            if (phase === 'dashboard') setPhase('upload');
          } else {
            setPhase('dashboard');
          }
        }}
        onSelectHistoryItem={(item) => {
          setCurrentItem(item);
          const itemImages = item.images || [{ url: item.image, isCover: true }];
          const mappedImages = itemImages.map((img, idx) => ({
            id: 'hist-img-' + idx,
            url: img.url,
            file: null,
            isCover: img.isCover
          }));
          setUploadedImages(mappedImages);
          const cover = mappedImages.find(img => img.isCover) || mappedImages[0];
          setActiveImageId(cover?.id);
          setPhase('editor');
        }}
        onDeleteHistoryItem={(id, e) => {
          e.stopPropagation();
          setHistory(history.filter(item => item.id !== id));
          showToast('Vorlage gelöscht.');
        }}
        onOpenSettings={() => setShowSettings(true)}
        onSnoozeItem={handleSnoozeItem}
        onReducePrice={handleReducePrice}
      />

      {/* Main workspace area */}
      <main className="main-content">
        
        {/* API Warning Banner if key is missing */}
        {!apiKey && (
          <div className="glass-panel" style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', marginBottom: '24px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} className="text-amber-400" style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.9rem', color: '#fef3c7' }}>
                <strong>Kein API-Schlüssel hinterlegt.</strong> Die Anwendung läuft im Test-Modus mit simulierter KI.
              </span>
            </div>
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setShowSettings(true)}>
              Schlüssel einrichten
            </button>
          </div>
        )}

        {/* Phase 1: Upload Workspace */}
        {phase === 'upload' && (
          <div className="upload-container">
            <div className="welcome-header">
              <h1>Was möchtest du verkaufen?</h1>
              <p>Mache ein Foto oder lade ein Bild hoch. ListerAI erledigt den Rest mithilfe von KI.</p>
            </div>

            <div className="dropzone" onClick={() => fileInputRef.current.click()}>
              <div className="dropzone-icon-container">
                <Camera size={36} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>Bild auswählen oder aufnehmen</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Unterstützt PNG, JPG oder WebP</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                multiple
                style={{ display: 'none' }} 
              />
            </div>

            {/* Quick Demo items */}
            <div style={{ marginTop: '40px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Direkt mit Demo-Objekt testen
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {DEMO_ITEMS.map((demo) => (
                  <div 
                    key={demo.id} 
                    className="glass-panel" 
                    style={{ padding: '12px', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-smooth)' }}
                    onClick={() => handleSelectDemoItem(demo)}
                  >
                    <img src={demo.image} alt={demo.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{demo.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '2px', fontWeight: 700 }}>Ca. {demo.suggestedPrice} €</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Scanning / Loading screen */}
        {phase === 'scanning' && (
          <div className="upload-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="scanner-container">
              <img src={uploadedImages.find(img => img.isCover)?.url || uploadedImages[0]?.url} alt="Scannen..." className="scanner-image" />
              <div className="scanner-line"></div>
              <div className="scanner-overlay"></div>
            </div>
            <div className="loading-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '1.2rem', marginTop: '16px' }}>
              <Sparkles size={20} />
              <span>{scanningProgress}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
              Unsere KI analysiert Bildinhalte und vergleicht Online-Plattformen.
            </p>
          </div>
        )}

        {/* Phase 3: Editor & Template Output Workspace */}
        {phase === 'editor' && (
          <>
            <div className="editor-header">
              <div>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }} 
                  onClick={() => setPhase('upload')}
                >
                  <RotateCcw size={16} />
                  Anderes Bild hochladen
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!currentItem.saleDetails?.isSold ? (
                  <button type="button" className="btn btn-secondary" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }} onClick={() => setShowSoldModal(true)}>
                    Verkauf eintragen
                  </button>
                ) : (
                  <span className="badge" style={{ position: 'static', padding: '6px 14px', fontSize: '0.85rem', backgroundColor: 'var(--accent-emerald-bg)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    ✓ Verkauft am {currentItem.saleDetails.soldDate} für {currentItem.saleDetails.soldPrice} €
                  </span>
                )}
                <PdfExportButton currentItem={currentItem} />
                <button type="button" className="btn btn-secondary" onClick={handleSaveListing}>
                  Entwurf sichern
                </button>
                <a 
                  href={`https://www.ebay-kleinanzeigen.de/p-anzeige-aufgeben.html`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary"
                >
                  Inserat aufgeben
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="editor-layout">
              {/* Form Card */}
              <EditorForm
                currentItem={currentItem}
                uploadedImages={uploadedImages}
                activeImageId={activeImageId}
                apiKey={apiKey}
                onChange={handleFieldChange}
                onSetActiveImageId={setActiveImageId}
                onSetAsCover={setAsCover}
                onDeleteImage={deleteImage}
                onUpdateImage={handleUpdateImage}
                onAddImagesClick={() => fileInputRef.current.click()}
                onReAnalyze={() => startScanningWorkflow(uploadedImages)}
                showToast={showToast}
              />

              {/* Comparisons & Template Output Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Real-time comparison grounding details */}
                <div className="glass-panel price-card" style={{ padding: '24px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Marktpreis-Vergleich</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Automatisch abgeglichene Angebote im Internet:</p>
                  
                  <div className="price-container">
                    <span className="price-val">{currentItem.suggestedPrice} €</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Empfohlener Preis</span>
                  </div>

                  <div className="comparison-list">
                    {currentItem.comparableOffers && currentItem.comparableOffers.length > 0 ? (
                      currentItem.comparableOffers.map((offer, idx) => {
                        const isLink = !!offer.url && offer.url.startsWith('http');
                        const ItemComponent = isLink ? 'a' : 'div';
                        const linkProps = isLink ? { href: offer.url, target: '_blank', rel: 'noreferrer', style: { textDecoration: 'none', color: 'inherit', cursor: 'pointer' } } : {};
                        
                        return (
                          <ItemComponent key={idx} className="comparison-item" {...linkProps}>
                            <span className={`comparison-platform comp-${offer.platform}`}>
                              {offer.platform}
                            </span>
                            <span className="comparison-title" title={offer.title}>
                              {offer.title}
                            </span>
                            <span className="comparison-price" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {offer.price}
                              {isLink && <ExternalLink size={12} style={{ opacity: 0.6 }} />}
                            </span>
                          </ItemComponent>
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '10px' }}>
                        Keine direkten Vergleichsangebote gefunden.
                      </p>
                    )}
                  </div>
                </div>

                <PriceTrendChart currentItem={currentItem} />

                {/* Platform Recommender */}
                <PlatformRecommender
                  currentItem={currentItem}
                  apiKey={apiKey}
                  showToast={showToast}
                />

                {/* Bundle Suggester */}
                <BundleSuggester
                  currentItem={currentItem}
                  history={history}
                  apiKey={apiKey}
                  showToast={showToast}
                  onApplyBundle={({ description, suggestedPrice }) => {
                    handleFieldChange('description', description);
                    handleFieldChange('suggestedPrice', suggestedPrice);
                  }}
                />

                {/* Listing Completeness Checker */}
                <ListingChecker currentItem={currentItem} />

                {/* Visual Live Preview Mockup */}
                <VisualMockup currentItem={currentItem} />

                {/* Posting Time Advisor */}
                <PostingTimeAdvisor
                  currentItem={currentItem}
                  apiKey={apiKey}
                  showToast={showToast}
                />

                {/* Templates and Clipboard export options */}
                <div className="glass-panel export-card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>Vorlagen & Käufer-Chat</h3>
                  
                  <div className="platform-tabs">
                    <button 
                      className={`platform-tab ${activeExportTab === 'kleinanzeigen' ? 'active' : ''}`}
                      onClick={() => setActiveExportTab('kleinanzeigen')}
                    >
                      Kleinanzeigen
                    </button>
                    <button 
                      className={`platform-tab ${activeExportTab === 'ebay' ? 'active' : ''}`}
                      onClick={() => setActiveExportTab('ebay')}
                    >
                      eBay
                    </button>
                    <button 
                      className={`platform-tab ${activeExportTab === 'shoop' ? 'active' : ''}`}
                      onClick={() => setActiveExportTab('shoop')}
                    >
                      Shoop & Vinted
                    </button>
                    <button 
                      className={`platform-tab ${activeExportTab === 'chat' ? 'active' : ''}`}
                      onClick={() => setActiveExportTab('chat')}
                    >
                      💬 Käufer-Chat
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    {activeExportTab === 'kleinanzeigen' && (
                      <>
                        <div className="template-preview-box">
                          {getKleinanzeigenTemplate()}
                        </div>
                        <button 
                          className="btn btn-secondary copy-button"
                          onClick={() => handleCopyText(getKleinanzeigenTemplate())}
                        >
                          <Clipboard size={16} />
                          Kopieren
                        </button>
                      </>
                    )}

                    {activeExportTab === 'ebay' && (
                      <>
                        <div className="template-preview-box">
                          {getEbayTemplate()}
                        </div>
                        <button 
                          className="btn btn-secondary copy-button"
                          onClick={() => handleCopyText(getEbayTemplate())}
                        >
                          <Clipboard size={16} />
                          Kopieren
                        </button>
                      </>
                    )}

                    {activeExportTab === 'shoop' && (
                      <>
                        <div className="template-preview-box">
                          {getShoopTemplate()}
                        </div>
                        <button 
                          className="btn btn-secondary copy-button"
                          onClick={() => handleCopyText(getShoopTemplate())}
                        >
                          <Clipboard size={16} />
                          Kopieren
                        </button>
                      </>
                    )}

                    {activeExportTab === 'chat' && (
                      <ChatSimulator
                        currentItem={currentItem}
                        apiKey={apiKey}
                        showToast={showToast}
                        onOpenSoldModal={(price) => {
                          setTargetSoldPrice(price);
                          setShowSoldModal(true);
                        }}
                      />
                    )}
                  </div>
                  {activeExportTab !== 'chat' && renderCopyConsole()}
                </div>

              </div>
            </div>
          </>
        )}

        {/* Phase 4: Dashboard / Statistics View */}
        {phase === 'dashboard' && (
          <Dashboard history={history} />
        )}

      </main>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        multiple
        style={{ display: 'none' }} 
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          history={history}
          onSaveApiKey={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
          onImportHistory={(imported) => {
            setHistory(imported);
            localStorage.setItem('listing_history', JSON.stringify(imported));
          }}
          showToast={showToast}
        />
      )}

      {/* Mark as Sold Modal */}
      {showSoldModal && (
        <SoldModal
          initialPrice={targetSoldPrice || currentItem.suggestedPrice || ''}
          onSave={handleSaveSale}
          onClose={() => {
            setShowSoldModal(false);
            setTargetSoldPrice(null);
          }}
        />
      )}
    </div>
  );
}

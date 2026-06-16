class MapService {
  constructor(containerId, initialLocation, onPositionChanged) {
    this.containerId = containerId;
    this.lat = initialLocation.lat;
    this.lng = initialLocation.lng;
    this.radius = initialLocation.radius;
    this.onPositionChanged = onPositionChanged;
    
    this.map = null;
    this.marker = null;
    this.circle = null;
    
    this.initMap();
  }

  initMap() {
    // Check if L (Leaflet) is loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded.');
      return;
    }

    // Fix Leaflet marker icon paths when imported via CDN
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    // Initialize Map with dark-themed OpenStreetMap tiles
    this.map = L.map(this.containerId).setView([this.lat, this.lng], 15);

    // Standard OpenStreetMap tiles (which we invert in CSS to make dark)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Create marker with custom styling if possible or standard pin
    this.marker = L.marker([this.lat, this.lng], {
      draggable: true
    }).addTo(this.map);

    // Draw Geofence circle
    this.circle = L.circle([this.lat, this.lng], {
      color: '#8b5cf6', // Violet color matching CSS --primary
      fillColor: '#8b5cf6',
      fillOpacity: 0.15,
      radius: this.radius
    }).addTo(this.map);

    // Marker drag event
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.updatePosition(position.lat, position.lng);
    });

    // Map click event (moves marker to click location)
    this.map.on('click', (e) => {
      this.updatePosition(e.latlng.lat, e.latlng.lng);
    });

    // Trigger initial load callback
    this.onPositionChanged(this.lat, this.lng, this.radius);
  }

  updatePosition(lat, lng) {
    this.lat = lat;
    this.lng = lng;
    
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    }
    
    if (this.circle) {
      this.circle.setLatLng([lat, lng]);
    }
    
    if (this.map) {
      this.map.panTo([lat, lng]);
    }

    this.onPositionChanged(lat, lng, this.radius);
  }

  updateRadius(radius) {
    this.radius = parseInt(radius, 10);
    if (this.circle) {
      this.circle.setRadius(this.radius);
    }
    this.onPositionChanged(this.lat, this.lng, this.radius);
  }

  // Force map layout refresh when switching tabs
  invalidateSize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        this.map.setView([this.lat, this.lng], this.map.getZoom());
      }, 100);
    }
  }

  // Search Address using OpenStreetMap Nominatim (Free Geocoding)
  async searchAddress(query) {
    if (!query || query.trim().length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=de`
      );
      
      if (!response.ok) throw new Error('Search request failed.');
      
      const data = await response.json();
      return data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error during address search:', error);
      return [];
    }
  }
}

window.MapService = MapService;

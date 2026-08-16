import { OfficeLocation } from "./types";

export class MapService {
  containerId: string;
  lat: number;
  lng: number;
  radius: number;
  onPositionChanged: (lat: number, lng: number, radius: number) => void;
  map: any = null;
  marker: any = null;
  circle: any = null;

  constructor(
    containerId: string,
    initialLocation: OfficeLocation,
    onPositionChanged: (lat: number, lng: number, radius: number) => void
  ) {
    this.containerId = containerId;
    this.lat = initialLocation.lat;
    this.lng = initialLocation.lng;
    this.radius = initialLocation.radius;
    this.onPositionChanged = onPositionChanged;

    this.initMap();
  }

  initMap(): void {
    const win = window as any;
    if (typeof win.L === "undefined") {
      console.error("Leaflet library not loaded.");
      return;
    }

    const L = win.L;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    this.map = L.map(this.containerId).setView([this.lat, this.lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([this.lat, this.lng], {
      draggable: true,
    }).addTo(this.map);

    this.circle = L.circle([this.lat, this.lng], {
      color: "#8b5cf6",
      fillColor: "#8b5cf6",
      fillOpacity: 0.15,
      radius: this.radius,
    }).addTo(this.map);

    this.marker.on("dragend", () => {
      const position = this.marker.getLatLng();
      this.updatePosition(position.lat, position.lng);
    });

    this.map.on("click", (e: any) => {
      this.updatePosition(e.latlng.lat, e.latlng.lng);
    });

    this.onPositionChanged(this.lat, this.lng, this.radius);
  }

  updatePosition(lat: number, lng: number): void {
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

  updateRadius(radius: number | string): void {
    this.radius = typeof radius === "number" ? radius : parseInt(radius, 10);
    if (this.circle) {
      this.circle.setRadius(this.radius);
    }
    this.onPositionChanged(this.lat, this.lng, this.radius);
  }

  invalidateSize(): void {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        this.map.setView([this.lat, this.lng], this.map.getZoom());
      }, 100);
    }
  }

  async searchAddress(
    query: string
  ): Promise<Array<{ display_name: string; lat: number; lng: number }>> {
    if (!query || query.trim().length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=de`
      );

      if (!response.ok) throw new Error("Search request failed.");

      const data = await response.json();
      return data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    } catch (error) {
      console.error("Error during address search:", error);
      return [];
    }
  }
}

if (typeof window !== "undefined") {
  (window as any).MapService = MapService;
}

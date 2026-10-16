/** Minimale Typen für das per CDN geladene Leaflet (nur die hier genutzten Teile). */
export interface LeafletLayerGroup {
  addTo(map: LeafletMap): LeafletLayerGroup;
  clearLayers(): void;
}

export interface LeafletMarker {
  addTo(layer: LeafletLayerGroup): LeafletMarker;
  bindPopup(content: HTMLElement): LeafletMarker;
}

export interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  remove(): void;
}

export interface LeafletApi {
  map(container: HTMLElement): LeafletMap;
  tileLayer(url: string, options: { maxZoom: number; attribution: string }): { addTo(map: LeafletMap): void };
  layerGroup(): LeafletLayerGroup;
  divIcon(options: { className: string; html: string; iconSize: [number, number]; iconAnchor: [number, number] }): unknown;
  marker(position: [number, number], options: { icon: unknown }): LeafletMarker;
}

export function getLeaflet(): LeafletApi | undefined {
  return (window as Window & { L?: LeafletApi }).L;
}

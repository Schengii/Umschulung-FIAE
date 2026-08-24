import { IndoorBuilding, IndoorFeature, LocationPoint } from '../types/navigation';

export class IndoorMapService {
  private static buildings: IndoorBuilding[] = [
    {
      id: 'building-munich-hbf',
      name: 'München Hauptbahnhof',
      type: 'station',
      bounds: {
        minLat: 48.139,
        maxLat: 48.143,
        minLon: 11.556,
        maxLon: 11.564,
      },
      levels: [
        { level: -2, name: 'Tiefgeschoss U1/U2/U7/U8', shortName: 'U2' },
        { level: -1, name: 'S-Bahn & Einkaufs-Passage', shortName: 'U1' },
        { level: 0, name: 'Erdgeschoss – Haupthalle & Fernbahn', shortName: 'EG' },
        { level: 1, name: '1. Obergeschoss – DB Lounge & Gastro', shortName: '1' },
      ],
      features: [
        {
          id: 'feat-1',
          name: 'Gleis 11-26 (Fernverkehr)',
          type: 'platform',
          level: 0,
          coordinate: { latitude: 48.1408, longitude: 11.5585 },
        },
        {
          id: 'feat-2',
          name: 'DB Reisezentrum & Information',
          type: 'info',
          level: 0,
          coordinate: { latitude: 48.1402, longitude: 11.5601 },
        },
        {
          id: 'feat-3',
          name: 'Aufzug zu S-Bahn & U-Bahn',
          type: 'elevator',
          level: 0,
          coordinate: { latitude: 48.1404, longitude: 11.5595 },
        },
        {
          id: 'feat-4',
          name: 'S-Bahn Gleis 1 (Richtung Ostbahnhof)',
          type: 'platform',
          level: -1,
          coordinate: { latitude: 48.1405, longitude: 11.5602 },
        },
        {
          id: 'feat-5',
          name: 'U-Bahn U1/U2 Gleise',
          type: 'platform',
          level: -2,
          coordinate: { latitude: 48.1401, longitude: 11.5598 },
        },
        {
          id: 'feat-6',
          name: 'Barrierefreie Toiletten (WC)',
          type: 'restroom',
          level: -1,
          coordinate: { latitude: 48.1399, longitude: 11.5605 },
        },
        {
          id: 'feat-7',
          name: 'DB Lounge (1. Klasse)',
          type: 'shop',
          level: 1,
          coordinate: { latitude: 48.1409, longitude: 11.5603 },
        },
      ],
    },
    {
      id: 'building-olympia-mall',
      name: 'Olympia-Einkaufszentrum (OEZ)',
      type: 'mall',
      bounds: {
        minLat: 48.181,
        maxLat: 48.186,
        minLon: 11.528,
        maxLon: 11.536,
      },
      levels: [
        { level: -1, name: 'Basement – Parkhaus & U3/U1', shortName: 'UG' },
        { level: 0, name: 'Erdgeschoss – Fashion & Food Court', shortName: 'EG' },
        { level: 1, name: '1. OG – Elektronik & Dining', shortName: '1' },
      ],
      features: [
        {
          id: 'oez-1',
          name: 'Food Court & Sitzbereich',
          type: 'shop',
          level: 0,
          coordinate: { latitude: 48.1832, longitude: 11.5315 },
        },
        {
          id: 'oez-2',
          name: 'Kundeninformation & Schließfächer',
          type: 'info',
          level: 0,
          coordinate: { latitude: 48.1830, longitude: 11.5320 },
        },
        {
          id: 'oez-3',
          name: 'U-Bahn Verbindung OEZ',
          type: 'platform',
          level: -1,
          coordinate: { latitude: 48.1825, longitude: 11.5310 },
        },
      ],
    },
  ];

  /**
   * Prüft ob der Nutzer sich in einem bekannten mehrstöckigen Indoor-Gebäude befindet
   */
  public static findBuildingAtLocation(location: LocationPoint): IndoorBuilding | null {
    return this.buildings.find(b =>
      location.latitude >= b.bounds.minLat &&
      location.latitude <= b.bounds.maxLat &&
      location.longitude >= b.bounds.minLon &&
      location.longitude <= b.bounds.maxLon
    ) || null;
  }

  /**
   * Liefert alle Features (Pois, Aufzüge, Gleise) für eine bestimmte Etage
   */
  public static getFeaturesForLevel(building: IndoorBuilding, level: number): IndoorFeature[] {
    return building.features.filter(f => f.level === level);
  }
}

export const VIDEO_TUTORIALS = [
  {
    id: 'vid_py_basics',
    title: 'Python für Anfänger: Der komplette 30-Minuten Kurs',
    category: 'Programmierung',
    duration: '30 Min',
    difficulty: 'Einsteiger',
    description: 'Lerne Variablen, Datentypen (int, float, str, list), if-Schleifen, while/for Loops & Funktionen in Python von Grund auf.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kqtD5dpn9C8',
    keyTakeaways: [
      'Variablen deklarieren ohne Typisierung',
      'Kontrollstrukturen (if, elif, else)',
      'Schleifen (for i in range(), while True)',
      'Eigene Funktionen definieren mit def'
    ]
  },
  {
    id: 'vid_docker_crash',
    title: 'Docker & Container in 20 Minuten verstehen',
    category: 'DevOps & Cloud',
    duration: '20 Min',
    difficulty: 'Azubi / IHK',
    description: 'Was ist der Unterschied zwischen einer VM und einem Docker Container? Lerne Dockerfiles, Images, Container & Docker Compose.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fqMOX6JJhGo',
    keyTakeaways: [
      'Images vs. Container',
      'Dockerfile Instruktionen (FROM, RUN, COPY, CMD)',
      'Port-Mapping (-p 8080:80)',
      'Docker Compose für Multi-Container Apps'
    ]
  },
  {
    id: 'vid_k8s_intro',
    title: 'Kubernetes (K8s) Kompakt-Erklärung für Entwickler',
    category: 'Cloud Native',
    duration: '25 Min',
    difficulty: 'Senior / Expert',
    description: 'Verstehe Pods, Services, Deployments, ReplicaSets & Ingress Controller in Kubernetes.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/X48VuDVv0do',
    keyTakeaways: [
      'Kubernetes Architektur (Control Plane & Worker Nodes)',
      'Pods als kleinste bereitstellbare Einheit',
      'Declarative YAML Manifeste (kubectl apply -f)'
    ]
  },
  {
    id: 'vid_sql_master',
    title: 'SQL Datenbanken & Relationen einfach erklärt',
    category: 'Datenbanken',
    duration: '25 Min',
    difficulty: 'Einsteiger / Azubi',
    description: 'Lerne SELECT, WHERE, GROUP BY, INNER JOIN, LEFT JOIN & Fremdschlüssel in relationalen Datenbanken.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/HXV3zeQKqGY',
    keyTakeaways: [
      'Tabellenstruktur & Primärschlüssel (Primary Key)',
      'Abfragen filtern mit WHERE & ORDER BY',
      'Verknüpfung von Tabellen mit JOINs'
    ]
  }
];

export const TUTORIAL_VIDEOS = VIDEO_TUTORIALS;

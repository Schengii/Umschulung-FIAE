export const MICRO_PROJECTS = [
  {
    id: 'proj_react_todo',
    title: '1. Interaktive ToDo-App mit React & LocalStorage',
    category: 'Frontend Webdev',
    difficulty: 'Einsteiger',
    xpReward: 150,
    description: 'Baue deine erste interaktive Webanwendung in React mit Zustandsverwaltung (useState) und dauerhafter Speicherung (localStorage).',
    tasks: [
      'Erstelle ein Input-Feld und einen Button zum Hinzufügen von Aufgaben',
      'Verwende useState zum Speichern des Aufgaben-Arrays',
      'Implementiere das Löschen und Abhaken von erledigten Aufgaben',
      'Speichere die Daten in localStorage, damit sie beim Neuladen erhalten bleiben'
    ],
    codeSnippet: `import React, { useState, useEffect } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState(() => {
    return JSON.parse(localStorage.getItem('my_todos')) || [];
  });
  const [text, setText] = useState('');

  useEffect(() => {
    localStorage.setItem('my_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!text.trim()) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setText('');
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={addTodo}>Hinzufügen</button>
    </div>
  );
}`
  },
  {
    id: 'proj_py_scraper',
    title: '2. Python Web Scraper für IT-News',
    category: 'Backend & Automation',
    difficulty: 'Azubi / Junior',
    xpReward: 200,
    description: 'Automatisiere das Auslesen von Überschriften aus IT-Nachrichtenportalen mit Python, Requests & BeautifulSoup.',
    tasks: [
      'Installiere requests und beautifulsoup4',
      'Sende eine HTTP GET Anfrage an das Nachrichtenportal',
      'Parsee das HTML nach <h2> oder <h3> Tags',
      'Gib die Top-10 IT-Schlagzeilen in der Konsole aus'
    ],
    codeSnippet: `import requests
from bs4 import BeautifulSoup

url = "https://news.ycombinator.com/"
response = requests.get(url)

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    titles = soup.find_all('span', class_='titleline')
    for idx, t in enumerate(titles[:10], 1):
        print(f"{idx}. {t.text}")`
  },
  {
    id: 'proj_docker_api',
    title: '3. Dockerisierte Node.js Express REST API',
    category: 'DevOps & Backend',
    difficulty: 'Senior / Expert',
    xpReward: 250,
    description: 'Erstelle eine RESTful API in Express.js und verpacke sie in ein optimiertes Docker Multi-Stage Image.',
    tasks: [
      'Erstelle eine app.js mit /api/v1/health Endpoint',
      'Schreibe ein Multi-Stage Dockerfile',
      'Baue das Docker Image (docker build -t my-api .)',
      'Starte den Container auf Port 3000 (docker run -p 3000:3000 my-api)'
    ],
    codeSnippet: `# Multi-Stage Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["node", "app.js"]`
  }
];

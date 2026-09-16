/**
 * Scrum & Kanban Sprint Engine
 * Manages user stories, story point estimation, sprint burndown calculations and velocity.
 */

export const INITIAL_USER_STORIES = [
  {
    id: 'US-101',
    title: 'OAuth2 Login mit PKCE',
    description: 'Als Benutzer möchte ich mich sicher per OAuth2 PKCE anmelden können.',
    category: 'Security',
    storyPoints: 5,
    status: 'todo', // 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
    priority: 'High'
  },
  {
    id: 'US-102',
    title: 'Datenbank-Indexierung für Aufträge',
    description: 'Als Admin möchte ich schnelle Abfragen durch B-Tree Indizes auf orders(customer_id).',
    category: 'Database',
    storyPoints: 3,
    status: 'in_progress',
    priority: 'Medium'
  },
  {
    id: 'US-103',
    title: 'CI/CD Pipeline mit GitHub Actions',
    description: 'Als Entwickler möchte ich automatisierte Tests bei jedem Git-Push.',
    category: 'DevOps',
    storyPoints: 8,
    status: 'review',
    priority: 'High'
  },
  {
    id: 'US-104',
    title: 'DSGVO Footer & Datenschutzerklärung',
    description: 'Als Nutzer möchte ich transparente Datenschutz-Informationen einsehen.',
    category: 'Compliance',
    storyPoints: 2,
    status: 'done',
    priority: 'Low'
  },
  {
    id: 'US-105',
    title: 'REST API Caching mit Redis',
    description: 'Als Nutzer erwarte ich Antwortzeiten unter 50ms durch Cache-Aside.',
    category: 'Performance',
    storyPoints: 5,
    status: 'backlog',
    priority: 'Medium'
  }
];

export function calculateSprintMetrics(stories, sprintDays = 10) {
  const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const completedPoints = stories
    .filter(s => s.status === 'done')
    .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const inProgressPoints = stories
    .filter(s => s.status === 'in_progress' || s.status === 'review')
    .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  const completionRate = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Generate Burndown Chart Data (Ideal vs Actual)
  const burndownData = [];
  const idealBurnPerDay = totalPoints / sprintDays;

  for (let day = 0; day <= sprintDays; day++) {
    const ideal = Number(Math.max(0, totalPoints - day * idealBurnPerDay).toFixed(1));
    
    // Simulate actual burndown curve
    let actual = null;
    if (day === 0) {
      actual = totalPoints;
    } else if (day <= 5) {
      // Halfway through sprint
      const burnedSoFar = (completedPoints * (day / 5)) * 0.8;
      actual = Number(Math.max(0, totalPoints - burnedSoFar).toFixed(1));
    } else if (day === 10) {
      actual = remainingPoints;
    }

    burndownData.push({
      day: `Tag ${day}`,
      dayNumber: day,
      idealRemaining: ideal,
      actualRemaining: actual
    });
  }

  return {
    totalPoints,
    completedPoints,
    inProgressPoints,
    remainingPoints,
    completionRate,
    burndownData
  };
}

export function moveStoryStatus(stories, storyId, newStatus) {
  return stories.map(s => s.id === storyId ? { ...s, status: newStatus } : s);
}

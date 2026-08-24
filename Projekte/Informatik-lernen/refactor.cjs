const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { Routes, Route, useNavigate, useLocation } from 'react-router-dom';\nimport { useStore } from './store/useStore';"
);

// 2. Replace state definitions
const stateRegex = /const \[userState, setUserState\] = useState\(loadUserState\(\)\);[\s\S]*?const \[activeGameId, setActiveGameId\] = useState\('sql'\);/m;
const newStateCode = `
  const { 
    userState, setUserState, handleSelectRole, awardXP, handleCompleteTopic, refreshStateFromStorage,
    lang, setLang, theme, setTheme, fontSize, setFontSize,
    isDyslexic, setIsDyslexic, isColorblind, setIsColorblind,
    isHighContrast, setIsHighContrast, isReducedMotion, setIsReducedMotion,
    difficultyFilter, setDifficultyFilter
  } = useStore();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(!userState.role);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const setActiveTab = (tab) => navigate(\`/\${tab}\`);

  // Topic Reader state
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Active Mini-Game Selector
  const [activeGameId, setActiveGameId] = useState('sql');
`;
code = code.replace(stateRegex, newStateCode.trim());

// 3. Remove saveUserState effect and duplicate handlers since useStore handles them
const effectToRemove1 = /  \/\/ Save user state on change[\s\S]*?\}, \[userState\]\);\n\n/m;
code = code.replace(effectToRemove1, '');

const effectToRemove2 = /  const refreshStateFromStorage = \(\) => \{[\s\S]*?setUserState\(loadUserState\(\)\);\n  \};\n\n/m;
code = code.replace(effectToRemove2, '');

const effectToRemove3 = /  \/\/ Handle Role Select[\s\S]*?\}\);\n  \};\n\n/m;
code = code.replace(effectToRemove3, '');

const effectToRemove4 = /  \/\/ Award XP and trigger Confetti[\s\S]*?unlockedBadges: unlocked\n      \};\n    \}\);\n  \};\n\n/m;
code = code.replace(effectToRemove4, '');

const effectToRemove5 = /  const handleCompleteTopic = \(topicId, xp\) => \{[\s\S]*?awardXP\(xp, 'first_steps'\);\n    \}\n  \};\n\n/m;
code = code.replace(effectToRemove5, '');

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx refactored successfully');

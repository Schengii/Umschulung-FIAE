// i18n Translation Dictionary (Deutsch & English)

export const TRANSLATIONS = {
  de: {
    dashboard: 'Dashboard',
    wissen: 'Wissen',
    roadmaps: 'Roadmaps',
    architecture: 'Architektur',
    patterns: 'Patterns',
    languages: 'Sprachen',
    quiz_arena: 'Quiz Arena',
    big_o: 'Big-O',
    games: 'Spiele',
    exam: 'IHK Prüfung',
    ai: 'KI-Lab',
    tooling: 'Tools',
    app_workshop: 'App-Shop',
    tdd: 'Unit-Tests TDD',
    welcome: 'Willkommen zurück, Developer!',
    lexicon: 'Lexikon',
    vocabulary: 'Vokabeln',
    certificate: 'Zertifikat',
    backup: 'Backup'
  },
  en: {
    dashboard: 'Dashboard',
    wissen: 'Knowledge',
    roadmaps: 'Roadmaps',
    architecture: 'Architecture',
    patterns: 'Patterns',
    languages: 'Languages',
    quiz_arena: 'Quiz Arena',
    big_o: 'Big-O',
    games: 'Games',
    exam: 'Certification Exam',
    ai: 'AI-Lab',
    tooling: 'Tools',
    app_workshop: 'App Workshop',
    tdd: 'Unit Testing TDD',
    welcome: 'Welcome back, Developer!',
    lexicon: 'Glossary',
    vocabulary: 'Vocabulary',
    certificate: 'Certificate',
    backup: 'Backup'
  }
};

export const getTranslation = (lang, key) => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.de[key] || key;
};

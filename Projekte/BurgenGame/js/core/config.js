// --- CONSTANTS & CONFIGURATIONS ---
const MAP_SIZE = 14;

const AGES = {
  DARK: 0,
  FEUDAL: 1,
  CASTLE: 2,
  IMPERIAL: 3
};

const AGES_CONFIG = {
  [AGES.DARK]: { name: 'Dunkles Zeitalter', icon: '🪵' },
  [AGES.FEUDAL]: { name: 'Feudalzeit', icon: '🛡️' },
  [AGES.CASTLE]: { name: 'Ritterzeit', icon: '🏰' },
  [AGES.IMPERIAL]: { name: 'Imperialzeit', icon: '👑' }
};

const BUILDING_TYPES = {
  KEEP: 'keep',
  WOODCUTTER: 'woodcutter',
  QUARRY: 'quarry',
  FARM: 'farm',
  BARRACKS: 'barracks',
  WALL: 'wall',
  FOUNTAIN: 'fountain',
  TAX_HOUSE: 'tax_house',
  TAVERN: 'tavern',
  IRON_MINE: 'iron_mine',
  BLACKSMITH: 'blacksmith',
  STABLES: 'stables',
  LIBRARY: 'library',
  MARKETPLACE: 'marketplace',
  HERO_ALTAR: 'hero_altar',
  MILL: 'mill',
  BAKERY: 'bakery',
  SMELTER: 'smelter',
  HOUSE: 'house',
  TOWNHALL: 'townhall',
  FORTRESS: 'fortress',
  SIEGE_WORKSHOP: 'siege_workshop',
  STATUE: 'statue',
  GARDEN: 'garden',
  BANNER: 'banner',
  BREWERY: 'brewery',
  CHAPEL: 'chapel',
  WELL: 'well',
  CATTLE_FARM: 'cattle_farm',
  TANNERY: 'tannery',
  ARROW_TOWER: 'arrow_tower',
  BALLISTA_TOWER: 'ballista_tower',
  MOAT: 'moat',
  DRAWBRIDGE: 'drawbridge',
  FIRE_STATION: 'fire_station',
  GRANARY_SEAL: 'granary_seal',
  CHURCH: 'church',
  HOP_FARM: 'hop_farm'
};

const BUILDING_AGE_REQUIREMENTS = {
  [BUILDING_TYPES.KEEP]: AGES.DARK,
  [BUILDING_TYPES.WOODCUTTER]: AGES.DARK,
  [BUILDING_TYPES.QUARRY]: AGES.DARK,
  [BUILDING_TYPES.FARM]: AGES.DARK,
  [BUILDING_TYPES.HOUSE]: AGES.DARK,
  [BUILDING_TYPES.WALL]: AGES.DARK,
  [BUILDING_TYPES.FOUNTAIN]: AGES.DARK,
  [BUILDING_TYPES.CATTLE_FARM]: AGES.DARK,
  [BUILDING_TYPES.WELL]: AGES.DARK,
  
  [BUILDING_TYPES.TAX_HOUSE]: AGES.FEUDAL,
  [BUILDING_TYPES.TAVERN]: AGES.FEUDAL,
  [BUILDING_TYPES.MARKETPLACE]: AGES.FEUDAL,
  [BUILDING_TYPES.MILL]: AGES.FEUDAL,
  [BUILDING_TYPES.BAKERY]: AGES.FEUDAL,
  [BUILDING_TYPES.BARRACKS]: AGES.FEUDAL,
  [BUILDING_TYPES.TANNERY]: AGES.FEUDAL,
  [BUILDING_TYPES.CHURCH]: AGES.FEUDAL,
  [BUILDING_TYPES.HOP_FARM]: AGES.FEUDAL,
  
  [BUILDING_TYPES.IRON_MINE]: AGES.CASTLE,
  [BUILDING_TYPES.SMELTER]: AGES.CASTLE,
  [BUILDING_TYPES.BLACKSMITH]: AGES.CASTLE,
  [BUILDING_TYPES.STABLES]: AGES.CASTLE,
  [BUILDING_TYPES.LIBRARY]: AGES.CASTLE,
  [BUILDING_TYPES.HERO_ALTAR]: AGES.CASTLE,
  
  [BUILDING_TYPES.TOWNHALL]: AGES.IMPERIAL,
  [BUILDING_TYPES.FORTRESS]: AGES.IMPERIAL,
  [BUILDING_TYPES.SIEGE_WORKSHOP]: AGES.IMPERIAL,
  [BUILDING_TYPES.BREWERY]: AGES.IMPERIAL,
  [BUILDING_TYPES.STATUE]: AGES.IMPERIAL,
  [BUILDING_TYPES.GARDEN]: AGES.IMPERIAL,
  [BUILDING_TYPES.BANNER]: AGES.IMPERIAL
};

const START_RESOURCES = {
  wood: 300,
  stone: 200,
  food: 200,
  gold: 150,
  rubies: 50,
  iron: 0,
  weapons: 0,
  iron_ore: 0,
  flour: 0,
  bread: 0,
  beer: 0,
  hide: 0,
  leather: 0
};

const BUILDINGS_CONFIG = {
  [BUILDING_TYPES.KEEP]: {
    name: 'Burgfried (Keep)',
    description: 'Das Herz deiner Burg. Ermöglicht den Bau anderer Gebäude und erhöht die maximale Baustufe.',
    baseWidth: 2,
    baseHeight: 2,
    levels: {
      1: { cost: { wood: 0, stone: 0, gold: 0 }, time: 0 },
      2: { cost: { wood: 200, stone: 150, gold: 100 }, time: 30 },
      3: { cost: { wood: 500, stone: 400, gold: 300 }, time: 90 },
      4: { cost: { wood: 1200, stone: 1000, gold: 800 }, time: 240 }
    }
  },
  [BUILDING_TYPES.WOODCUTTER]: {
    name: 'Holzfäller',
    description: 'Fällt Bäume in der Umgebung, um die Holzvorräte stetig zu füllen.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 50, stone: 20, gold: 0 }, time: 10, production: { wood: 10 } },
      2: { cost: { wood: 120, stone: 60, gold: 50 }, time: 30, production: { wood: 25 } },
      3: { cost: { wood: 300, stone: 180, gold: 150 }, time: 80, production: { wood: 60 } },
      4: { cost: { wood: 800, stone: 500, gold: 400 }, time: 180, production: { wood: 150 } }
    }
  },
  [BUILDING_TYPES.QUARRY]: {
    name: 'Steinbruch',
    description: 'Baut Steinvorkommen ab, um Baumaterial für dickere Mauern bereitzustellen.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 80, stone: 30, gold: 0 }, time: 15, production: { stone: 8 } },
      2: { cost: { wood: 180, stone: 80, gold: 60 }, time: 45, production: { stone: 20 } },
      3: { cost: { wood: 450, stone: 250, gold: 200 }, time: 120, production: { stone: 50 } },
      4: { cost: { wood: 1000, stone: 700, gold: 500 }, time: 300, production: { stone: 120 } }
    }
  },
  [BUILDING_TYPES.FARM]: {
    name: 'Bauernhof',
    description: 'Produziert Nahrung für die arbeitende Bevölkerung und deine Soldaten.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 60, stone: 40, gold: 0 }, time: 12, production: { food: 12 } },
      2: { cost: { wood: 150, stone: 100, gold: 40 }, time: 35, production: { food: 30 } },
      3: { cost: { wood: 400, stone: 300, gold: 180 }, time: 100, production: { food: 75 } },
      4: { cost: { wood: 900, stone: 800, gold: 450 }, time: 240, production: { food: 180 } }
    }
  },
  [BUILDING_TYPES.BARRACKS]: {
    name: 'Kaserne',
    description: 'Ermöglicht das Anwerben und Ausbilden verschiedener Militäreinheiten.',
    baseWidth: 2,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 100, gold: 50 }, time: 25, unlocks: ['spearman'] },
      2: { cost: { wood: 350, stone: 280, gold: 150 }, time: 60, unlocks: ['spearman', 'swordsman', 'ram'] },
      3: { cost: { wood: 800, stone: 650, gold: 400 }, time: 150, unlocks: ['spearman', 'swordsman', 'bowman', 'catapult'] }
    }
  },
  [BUILDING_TYPES.WALL]: {
    name: 'Burgmauer',
    description: 'Erhöht die Verteidigung deiner Burg im Falle eines Angriffs.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 20, stone: 50, gold: 10 }, time: 5, defenseBonus: 0.1 },
      2: { cost: { wood: 60, stone: 120, gold: 40 }, time: 15, defenseBonus: 0.25 },
      3: { cost: { wood: 150, stone: 300, gold: 100 }, time: 45, defenseBonus: 0.5 }
    }
  },
  [BUILDING_TYPES.TAX_HOUSE]: {
    name: 'Steuerhaus',
    description: 'Hier wohnt der Steuereintreiber. Ermöglicht das Anfordern von Goldzahlungen.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 100, stone: 50, gold: 30 }, time: 20 },
      2: { cost: { wood: 250, stone: 150, gold: 100 }, time: 50 },
      3: { cost: { wood: 600, stone: 400, gold: 250 }, time: 120 }
    }
  },
  [BUILDING_TYPES.FOUNTAIN]: {
    name: 'Springbrunnen',
    description: 'Eine prachtvolle Dekoration, die die Stimmung hebt und +10% Ressourcenproduktion gibt.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 0, stone: 0, gold: 0, rubies: 20 }, time: 5 }
    }
  },
  [BUILDING_TYPES.TAVERN]: {
    name: 'Taverne',
    description: 'Hier trinken Bürger Neuigkeiten und Spione heuern an. Ermöglicht das Rekrutieren von Spionen.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 100, stone: 80, gold: 50 }, time: 20, maxSpies: 3 },
      2: { cost: { wood: 250, stone: 180, gold: 120 }, time: 50, maxSpies: 7 },
      3: { cost: { wood: 600, stone: 450, gold: 300 }, time: 120, maxSpies: 15 }
    }
  },
  [BUILDING_TYPES.IRON_MINE]: {
    name: 'Eisenmine',
    description: 'Baut Eisenerz ab, um Rohstoffe für die Waffenherstellung bereitzustellen.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 100, gold: 50 }, time: 20, production: { iron_ore: 12 } },
      2: { cost: { wood: 350, stone: 250, gold: 150 }, time: 50, production: { iron_ore: 28 } },
      3: { cost: { wood: 800, stone: 600, gold: 400 }, time: 120, production: { iron_ore: 60 } }
    }
  },
  [BUILDING_TYPES.BLACKSMITH]: {
    name: 'Schmiede',
    description: 'Verarbeitet Eisen und Holz zu Waffen für deine Truppen.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 200, stone: 150, gold: 80 }, time: 25, production: { weapons: 3 }, consumption: { iron: 2, wood: 1 } },
      2: { cost: { wood: 450, stone: 350, gold: 200 }, time: 60, production: { weapons: 8 }, consumption: { iron: 5, wood: 2 } },
      3: { cost: { wood: 1000, stone: 800, gold: 500 }, time: 150, production: { weapons: 20 }, consumption: { iron: 12, wood: 5 } }
    }
  },
  [BUILDING_TYPES.STABLES]: {
    name: 'Stallungen',
    description: 'Züchtet kräftige Pferde. Ermöglicht das Rekrutieren von Rittern.',
    baseWidth: 2,
    baseHeight: 2,
    levels: {
      1: { cost: { wood: 300, stone: 200, gold: 150 }, time: 40, unlocks: ['knight'] },
      2: { cost: { wood: 700, stone: 500, gold: 350 }, time: 100, unlocks: ['knight'] }
    }
  },
  [BUILDING_TYPES.LIBRARY]: {
    name: 'Bibliothek',
    description: 'Sitz der Weisen. Ermöglicht das Erforschen von mächtigen permanenten Upgrades.',
    baseWidth: 2,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 250, stone: 200, gold: 100 }, time: 30 },
      2: { cost: { wood: 600, stone: 500, gold: 300 }, time: 80 }
    }
  },
  [BUILDING_TYPES.MARKETPLACE]: {
    name: 'Marktplatz',
    description: 'Ermöglicht den Tausch von Rohstoffen (Holz, Stein, Nahrung, Eisen) gegen Gold und umgekehrt.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 120, gold: 50 }, time: 20 }
    }
  },
  [BUILDING_TYPES.HERO_ALTAR]: {
    name: 'Heldenaltar',
    description: 'Der Versammlungsort deiner stärksten Generäle. Ermöglicht das Beschwören und Aufstufen eines mächtigen Helden.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 250, stone: 200, gold: 100 }, time: 30 }
    }
  },
  [BUILDING_TYPES.MILL]: {
    name: 'Mühle',
    description: 'Verarbeitet Getreide (Nahrung) zu feinem Mehl für die Bäckerei.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 100, stone: 80, gold: 50 }, time: 15, production: { flour: 10 }, consumption: { food: 15 } },
      2: { cost: { wood: 220, stone: 180, gold: 120 }, time: 40, production: { flour: 25 }, consumption: { food: 35 } }
    }
  },
  [BUILDING_TYPES.BAKERY]: {
    name: 'Bäckerei',
    description: 'Backt aus Mehl nahrhaftes Brot, das deine Bürger nährt und die Netto-Nahrungsproduktion massiv erhöht.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 100, gold: 80 }, time: 20, production: { bread: 30 }, consumption: { flour: 10 } },
      2: { cost: { wood: 300, stone: 200, gold: 180 }, time: 50, production: { bread: 75 }, consumption: { flour: 22 } }
    }
  },
  [BUILDING_TYPES.SMELTER]: {
    name: 'Erzschmelze',
    description: 'Schmilzt rohes Eisenerz zu reinem Eisen für die Waffenschmiede.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 120, stone: 150, gold: 60 }, time: 18, production: { iron: 8 }, consumption: { iron_ore: 10 } },
      2: { cost: { wood: 280, stone: 320, gold: 150 }, time: 45, production: { iron: 20 }, consumption: { iron_ore: 25 } }
    }
  },
  [BUILDING_TYPES.HOUSE]: {
    name: 'Wohnhaus',
    description: 'Beherbergt Bürger, die passiv Gold zahlen (+5 Bevölkerung, +2 Gold/Min pro Stufe). Erhöht auch die Zufriedenheit.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 80, stone: 40, gold: 20 }, time: 15, population: 5, goldPerMin: 2 },
      2: { cost: { wood: 180, stone: 100, gold: 60 }, time: 40, population: 12, goldPerMin: 5 },
      3: { cost: { wood: 400, stone: 250, gold: 150 }, time: 90, population: 25, goldPerMin: 12 },
      4: { cost: { wood: 900, stone: 600, gold: 350 }, time: 200, population: 50, goldPerMin: 28 }
    }
  },
  [BUILDING_TYPES.TOWNHALL]: {
    name: 'Rathaus',
    description: 'Das Herz der Bürgerschaft. Erhöht die Bevölkerungsobergrenze massiv und gibt einen Produktionsbonus basierend auf Zufriedenheit.',
    baseWidth: 2,
    baseHeight: 2,
    levels: {
      1: { cost: { wood: 300, stone: 250, gold: 200 }, time: 60, populationCap: 100, happinessBonus: 5 },
      2: { cost: { wood: 700, stone: 600, gold: 500 }, time: 150, populationCap: 250, happinessBonus: 10 },
      3: { cost: { wood: 1500, stone: 1200, gold: 1000 }, time: 360, populationCap: 600, happinessBonus: 20 }
    }
  },
  [BUILDING_TYPES.FORTRESS]: {
    name: 'Festung',
    description: 'Mächtige Verteidigungsanlage. Gibt permanenten +40% Verteidigungs-Buff und schreckt Raubritter ab (längere Angriffsintervalle).',
    baseWidth: 2,
    baseHeight: 2,
    levels: {
      1: { cost: { wood: 500, stone: 800, gold: 400, iron: 100 }, time: 300, defenseBonus: 0.40 },
      2: { cost: { wood: 1000, stone: 1800, gold: 900, iron: 250 }, time: 600, defenseBonus: 0.70 }
    }
  },
  [BUILDING_TYPES.SIEGE_WORKSHOP]: {
    name: 'Belagerungs-Werkstatt',
    description: 'Ermöglicht die Ausbildung des mächtigen Paladins und der Grenzwächter. Verbessert alle Belagerungswaffen.',
    baseWidth: 2,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 400, stone: 300, gold: 250, iron: 80 }, time: 120, unlocks: ['paladin', 'border_guard'] },
      2: { cost: { wood: 900, stone: 700, gold: 600, iron: 200 }, time: 300, unlocks: ['paladin', 'border_guard'] }
    }
  },
  [BUILDING_TYPES.STATUE]: {
    name: 'Goldstatue',
    description: 'Ein luxuriöses Monument zur Feier des Reiches. Erhöht die Zufriedenheit um +10.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { stone: 100, gold: 100 }, time: 10, happinessBonus: 10 }
    }
  },
  [BUILDING_TYPES.GARDEN]: {
    name: 'Schlossgarten',
    description: 'Ein wunderschöner Ziergarten zur Entspannung der Bürger. Erhöht die Zufriedenheit um +8.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 100, gold: 50 }, time: 8, happinessBonus: 8 }
    }
  },
  [BUILDING_TYPES.BANNER]: {
    name: 'Königliches Banner',
    description: 'Eine stolze Flagge des Königreichs. Erhöht die Zufriedenheit um +5.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 50, gold: 30 }, time: 5, happinessBonus: 5 }
    }
  },
  [BUILDING_TYPES.BREWERY]: {
    name: 'Brauerei',
    description: 'Braut köstliches Bier aus Getreide (Nahrung) und Holz. Erhöht die Zufriedenheit.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 100, gold: 50 }, time: 20, production: { beer: 5 }, consumption: { food: 4, wood: 2 } },
      2: { cost: { wood: 300, stone: 200, gold: 120 }, time: 45, production: { beer: 12 }, consumption: { food: 8, wood: 4 } },
      3: { cost: { wood: 700, stone: 500, gold: 300 }, time: 100, production: { beer: 25 }, consumption: { food: 16, wood: 8 } }
    }
  },
  [BUILDING_TYPES.CATTLE_FARM]: {
    name: 'Viehweide (Cattle Farm)',
    description: 'Züchtet Rinder. Produziert Fleisch (Nahrung) und Tierhäute (Hides).',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 100, stone: 60, gold: 20 }, time: 15, production: { hide: 4, food: 6 } },
      2: { cost: { wood: 250, stone: 150, gold: 100 }, time: 40, production: { hide: 10, food: 15 } },
      3: { cost: { wood: 600, stone: 400, gold: 300 }, time: 100, production: { hide: 24, food: 40 } }
    }
  },
  [BUILDING_TYPES.TANNERY]: {
    name: 'Gerberei (Tannery)',
    description: 'Gerbt Tierhäute zu Leder, welches für die Truppenausrüstung unerlässlich ist.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 120, gold: 50 }, time: 20, production: { leather: 3 }, consumption: { hide: 5, wood: 1 } },
      2: { cost: { wood: 350, stone: 280, gold: 150 }, time: 50, production: { leather: 8 }, consumption: { hide: 12, wood: 2 } },
      3: { cost: { wood: 800, stone: 650, gold: 400 }, time: 120, production: { leather: 20 }, consumption: { hide: 30, wood: 5 } }
    }
  },
  [BUILDING_TYPES.ARROW_TOWER]: {
    name: 'Pfeilturm',
    description: 'Befestigter Turm mit Bogenschützen. Feuert im Abwehrkampf jede Runde automatisch Pfeile auf Angreifer.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { stone: 200, wood: 100, gold: 150 }, time: 30, rangedPower: 30 },
      2: { cost: { stone: 450, wood: 250, gold: 350 }, time: 70, rangedPower: 70 }
    }
  },
  [BUILDING_TYPES.BALLISTA_TOWER]: {
    name: 'Ballistaturm',
    description: 'Schwere Wehranlage mit Speerschleuder. Erzeugt massiven Flächenschaden im Abwehrkampf.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { stone: 500, iron: 200, gold: 400 }, time: 90, rangedPower: 90 }
    }
  },
  [BUILDING_TYPES.MOAT]: {
    name: 'Burggraben',
    description: 'Tiefe Wassergräben um die Festung. Verlangsamt angreifende Feinde und verleiht Verteidiger-Boni.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { stone: 300, gold: 200 }, time: 40, slowEffect: 0.3 }
    }
  },
  [BUILDING_TYPES.DRAWBRIDGE]: {
    name: 'Zugbrücke',
    description: 'Befestigtes Burgtor über dem Wassergraben. Kann im Verteidigungsfall hochgezogen werden.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 400, iron: 150, gold: 300 }, time: 50, defenseBonus: 0.4 }
    }
  },
  [BUILDING_TYPES.FIRE_STATION]: {
    name: 'Feuerwache',
    description: 'Bereitschaftstruppe für Brände. Löscht spontane Feuergefahr und Blitzeinschläge automatisch ab.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 200, stone: 150, gold: 100 }, time: 25 }
    }
  },
  [BUILDING_TYPES.GRANARY_SEAL]: {
    name: 'Kornspeicher-Versiegelung',
    description: 'Schützt die Getreidebestände zuverlässig vor Heuschrecken und Schädlingsbefall.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 150, stone: 200, gold: 120 }, time: 30 }
    }
  },
  [BUILDING_TYPES.CHURCH]: {
    name: 'Kapelle',
    description: 'Bietet der Bevölkerung geistlichen Beistand und erfüllt das Bedürfnis nach Glaube.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 120, stone: 180, gold: 100 }, time: 25 },
      2: { cost: { wood: 250, stone: 350, gold: 250 }, time: 60 }
    }
  },
  [BUILDING_TYPES.WELL]: {
    name: 'Dorfbrunnen',
    description: 'Spendet frisches Quellwasser und erfüllt das Hygienebedürfnis deiner Bürger.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 50, stone: 80, gold: 20 }, time: 10 }
    }
  },
  [BUILDING_TYPES.HOP_FARM]: {
    name: 'Hopfenfeld',
    description: 'Baut Hopfen an, der in der Brauerei zu erfrischendem Bier verarbeitet wird.',
    baseWidth: 1,
    baseHeight: 1,
    levels: {
      1: { cost: { wood: 80, stone: 30, gold: 20 }, time: 15, production: { hops: 5 } }
    }
  }
};

const TROOPS_CONFIG = {
  spearman: {
    name: 'Speerkämpfer',
    description: 'Günstig und hervorragend in der Verteidigung gegen Nahkämpfer. Konter: Ritter +40%.',
    cost: { gold: 15, food: 5 },
    time: 4,
    counters: { knight: 1.4 }, // Spear beats cavalry
    stats: {
      attackMelee: 8,
      attackRanged: 0,
      defenseMelee: 22,
      defenseRanged: 10,
      lootCapacity: 12,
      foodConsumption: 0.6
    }
  },
  swordsman: {
    name: 'Schwertkämpfer',
    description: 'Starke Nahkampf-Offensivkraft. Konter: Speerkämpfer +30%.',
    cost: { gold: 30, food: 10 },
    time: 8,
    counters: { spearman: 1.3 }, // Sword beats spear
    stats: {
      attackMelee: 28,
      attackRanged: 0,
      defenseMelee: 12,
      defenseRanged: 12,
      lootCapacity: 18,
      foodConsumption: 1.2
    }
  },
  bowman: {
    name: 'Bogenschütze',
    description: 'Fernkämpfer mit hohem Schaden. Konter: Schwertkämpfer +35%.',
    cost: { gold: 45, food: 15, leather: 1 },
    time: 12,
    counters: { swordsman: 1.35 }, // Bow beats melee swordsman
    stats: {
      attackMelee: 2,
      attackRanged: 32,
      defenseMelee: 8,
      defenseRanged: 25,
      lootCapacity: 8,
      foodConsumption: 1.8
    }
  },
  spy: {
    name: 'Spion',
    description: 'Schleicht sich in fremde Burgen, um Truppenstärken auszuspähen. Kann nicht kämpfen.',
    cost: { gold: 30, food: 0 },
    time: 8,
    counters: {},
    stats: {
      attackMelee: 0,
      attackRanged: 0,
      defenseMelee: 0,
      defenseRanged: 0,
      lootCapacity: 0,
      foodConsumption: 0
    }
  },
  knight: {
    name: 'Ritter',
    description: 'Schwere Kavallerieeinheit. Konter: Bogenschützen +30%.',
    cost: { gold: 65, food: 25, weapons: 2, leather: 1 },
    time: 15,
    counters: { bowman: 1.3 }, // Knight beats bowman
    stats: {
      attackMelee: 55,
      attackRanged: 0,
      defenseMelee: 45,
      defenseRanged: 35,
      lootCapacity: 35,
      foodConsumption: 3.0
    }
  },
  ram: {
    name: 'Rammbock',
    description: 'Langsame Belagerungseinheit. Reduziert den feindlichen Mauerverteidigungsbonus im Kampf um 15% (absolut).',
    cost: { gold: 60, wood: 100 },
    time: 16,
    counters: {},
    stats: {
      attackMelee: 15,
      attackRanged: 0,
      defenseMelee: 25,
      defenseRanged: 30,
      lootCapacity: 0,
      foodConsumption: 2.0,
      wallKonter: 0.15
    }
  },
  catapult: {
    name: 'Katapult',
    description: 'Schwere Belagerungswaffe. Reduziert den feindlichen Mauerverteidigungsbonus im Kampf um 25% (absolut).',
    cost: { gold: 120, stone: 150 },
    time: 25,
    counters: {},
    stats: {
      attackMelee: 5,
      attackRanged: 45,
      defenseMelee: 10,
      defenseRanged: 20,
      lootCapacity: 0,
      foodConsumption: 3.5,
      wallKonter: 0.25
    }
  },
  paladin: {
    name: 'Paladin',
    description: 'Elitekämpfer mit heiliger Kraft. Extrem stark in Angriff und Verteidigung. Benötigt Belagerungs-Werkstatt.',
    cost: { gold: 120, food: 40, weapons: 5 },
    time: 30,
    counters: { knight: 1.2, swordsman: 1.15 },
    stats: {
      attackMelee: 85,
      attackRanged: 15,
      defenseMelee: 70,
      defenseRanged: 55,
      lootCapacity: 50,
      foodConsumption: 5.0
    }
  },
  border_guard: {
    name: 'Grenzwächter',
    description: 'Spezialist für Burgverteidigung. Sehr starke Defensivwerte, aber schwach im Angriff. Benötigt Belagerungs-Werkstatt.',
    cost: { gold: 45, stone: 20 },
    time: 10,
    counters: { ram: 1.5, catapult: 1.3 }, // Guard counters siege engines
    stats: {
      attackMelee: 5,
      attackRanged: 5,
      defenseMelee: 60,
      defenseRanged: 60,
      lootCapacity: 5,
      foodConsumption: 1.5
    }
  }
};


const RESEARCH_CONFIG = {
  forestry: { name: 'Forstwirtschaft', desc: '+15% Holzproduktion', cost: { gold: 120, wood: 100 }, effect: { type: 'prod_multiplier', resource: 'wood', value: 0.15 } },
  masonry: { name: 'Mauerwerkskunst', desc: '+15% Steinproduktion', cost: { gold: 120, stone: 100 }, effect: { type: 'prod_multiplier', resource: 'stone', value: 0.15 } },
  crop_rotation: { name: 'Fruchtfolge', desc: '+15% Nahrungsprod.', cost: { gold: 150, wood: 100, food: 100 }, requires: 'forestry', effect: { type: 'prod_multiplier', resource: 'food', value: 0.15 } },
  iron_smelting: { name: 'Eisenverhüttung', desc: '+15% Eisenproduktion', cost: { gold: 200, stone: 150, iron: 50 }, requires: 'masonry', effect: { type: 'prod_multiplier', resource: 'iron', value: 0.15 } },
  reinforced_armor: { name: 'Verstärkte Rüstungen', desc: '+10% Truppen-Verteidigung', cost: { gold: 300, iron: 100, weapons: 10 }, requires: 'iron_smelting', effect: { type: 'defense_bonus', value: 0.10 } },
  sharp_blades: { name: 'Scharfe Klingen', desc: '+10% Truppen-Angriff', cost: { gold: 300, iron: 100, weapons: 10 }, requires: 'iron_smelting', effect: { type: 'attack_bonus', value: 0.10 } },
  logistics: { name: 'Militärische Logistik', desc: '-20% Marschzeit', cost: { gold: 250, food: 200, wood: 200 }, requires: 'crop_rotation', effect: { type: 'travel_reduction', value: 0.20 } }
};

const RANDOM_EVENTS_CONFIG = [
  {
    id: 'merchant',
    title: 'Reisender Händler',
    icon: '🛒',
    desc: 'Ein wohlhabender Händler aus dem Süden bietet dir einen lukrativen Tausch an. Er möchte 150 Holz und bietet dir dafür 80 Gold.',
    choices: [
      {
        text: '✅ Tausch eingehen (Kosten: 🪵 150 → +🪙 80)',
        condition: (state) => state.resources.wood >= 150,
        action: (state) => { state.resources.wood -= 150; state.resources.gold += 80; return '🛒 Holz gegen Gold eingetauscht! Der Händler ist zufrieden.'; }
      },
      { text: '❌ Tausch ablehnen', action: () => 'Der Händler zieht brummelnd weiter.' }
    ]
  },
  {
    id: 'drought',
    title: 'Große Dürre',
    icon: '☀️',
    desc: 'Eine sengende Hitzewelle trocknet die Felder aus! Die Ernte steht auf dem Spiel. Handle schnell!',
    choices: [
      {
        text: '💧 Bewässerung graben (Kosten: 🪙 100)',
        condition: (state) => state.resources.gold >= 100,
        action: (state) => { state.resources.gold -= 100; return '💧 Die Felder wurden bewässert und gerettet!'; }
      },
      {
        text: '😓 Dürre erdulden (Verliere 🌾 100)',
        condition: (state) => state.resources.food >= 100,
        action: (state) => { state.resources.food -= 100; return '☀️ Die Ernte verdorrt. Du verlierst 100 Nahrung!'; }
      },
      {
        text: '🤷 Nichts tun (Verliere 30% Nahrung)',
        action: (state) => { const lost = Math.floor(state.resources.food * 0.3); state.resources.food -= lost; return `☀️ Du verlierst ${lost} Nahrung mangels Ernte!`; }
      }
    ]
  },
  {
    id: 'blessing',
    title: 'Segen der Kirche',
    icon: '✝️',
    desc: 'Ein hoher Bischof besucht deine Burg und bittet um eine Spende für die Bedürftigen. Der Herr schaut hin!',
    choices: [
      {
        text: '💎 Rubine spenden (Kosten: 💎 10 → +🌾 200, +🪙 150)',
        condition: (state) => state.resources.rubies >= 10,
        action: (state) => { state.resources.rubies -= 10; state.resources.food += 200; state.resources.gold += 150; return '✝️ Gottes Segen liegt über deinem Reich! +200 Nahrung, +150 Gold!'; }
      },
      { text: '🚪 Abweisen', action: () => 'Der Bischof murmelt finstere Worte beim Gehen.' }
    ]
  },
  {
    id: 'bandit_raid',
    title: 'Banditenüberfall',
    icon: '🗡️',
    desc: 'Eine verwegene Räuberbande plündert deine Außenbezirke und bedroht die Bürger! Wie reagierst du?',
    choices: [
      {
        text: '🪙 Tribut zahlen (Kosten: 🪙 200)',
        condition: (state) => state.resources.gold >= 200,
        action: (state) => { state.resources.gold -= 200; state.happiness = Math.max(0, (state.happiness || 50) - 10); return '🗡️ Die Banditen ziehen ab. Aber deine Bürger sind verunsichert (-10 Zufriedenheit).'; }
      },
      {
        text: '⚔️ Militär entsenden (Benötigt ≥3 Soldaten)',
        condition: (state) => { const total = Object.values(state.troops).reduce((a, b) => a + b, 0) - (state.troops.spy || 0); return total >= 3; },
        action: (state) => {
          if (Math.random() < 0.7) { state.resources.gold += 100; state.resources.rubies += 3; state.happiness = Math.min(100, (state.happiness || 50) + 5); return '⚔️ Sieg! Banditen vernichtet! (+🪙 100, +💎 3, +5 Zufriedenheit)'; }
          else { const types = ['spearman', 'swordsman', 'bowman'].filter(t => (state.troops[t] || 0) > 0); if (types.length > 0) state.troops[types[0]]--; return '⚔️ Schwerer Kampf! Die Banditen flohen, aber wir verloren einen Soldaten!'; }
        }
      }
    ]
  },
  {
    id: 'plague',
    title: 'Beulenpest',
    icon: '💀',
    desc: 'Die Beulenpest hat die umliegenden Dörfer erfasst und droht in deine Burg einzudringen! Maßnahmen sind dringend nötig.',
    choices: [
      {
        text: '🏥 Quarantäne + Ärzte (Kosten: 🪙 300, 🌾 150)',
        condition: (state) => state.resources.gold >= 300 && state.resources.food >= 150,
        action: (state) => { state.resources.gold -= 300; state.resources.food -= 150; return '🏥 Die Quarantäne war erfolgreich! Das Reich ist gerettet.'; }
      },
      {
        text: '😨 Grenzen sperren (Bevölkerung -20%)',
        action: (state) => { state.population = Math.floor((state.population || 50) * 0.8); state.happiness = Math.max(0, (state.happiness || 50) - 15); return '💀 Trotz der Maßnahmen sterben viele Bürger. Bevölkerung sinkt.'; }
      }
    ]
  },
  {
    id: 'fire',
    title: 'Großes Feuer',
    icon: '🔥',
    desc: 'Ein verheerendes Feuer wütet in deiner Burg! Ein Gebäude wird beschädigt und muss aufwendig repariert werden.',
    choices: [
      {
        text: '💧 Sofort löschen (Kosten: 🪙 150, 🪵 200)',
        condition: (state) => state.resources.gold >= 150 && state.resources.wood >= 200,
        action: (state) => { state.resources.gold -= 150; state.resources.wood -= 200; return '🔥 Das Feuer wurde gelöscht! Minimaler Schaden.'; }
      },
      {
        text: '😰 Ausbrennen lassen (Verliere 🪵 400)',
        action: (state) => { state.resources.wood = Math.max(0, state.resources.wood - 400); state.happiness = Math.max(0, (state.happiness || 50) - 8); return '🔥 Das Feuer breitet sich aus! Du verlierst 400 Holz.'; }
      }
    ]
  },
  {
    id: 'rich_harvest',
    title: 'Reiche Ernte',
    icon: '🌾',
    desc: 'Die Götter sind gnädig! Eine außerordentlich reiche Ernte beschert deinem Reich Überfluss. Deine Bauern strahlen vor Freude.',
    choices: [
      {
        text: '🎉 Fest feiern (+500 Nahrung, +Zufriedenheit)',
        action: (state) => { state.resources.food += 500; state.happiness = Math.min(100, (state.happiness || 50) + 15); return '🌾 Ein großes Erntefest! +500 Nahrung, +15 Zufriedenheit!'; }
      },
      {
        text: '💰 Überschuss verkaufen (+200 Gold)',
        action: (state) => { state.resources.gold += 200; return '🌾 Die Ernte wurde auf dem Markt für +200 Gold verkauft!'; }
      }
    ]
  },
  {
    id: 'wandering_hero',
    title: 'Wandernder Recke',
    icon: '🦸',
    desc: 'Ein legendärer Recke bietet seine Dienste an. Er verlangt eine einmalige Bezahlung, bringt aber wertvolle Beute mit.',
    choices: [
      {
        text: '🪙 Anheuern (Kosten: 🪙 250) → +💎 15, +🪙 100',
        condition: (state) => state.resources.gold >= 250,
        action: (state) => { state.resources.gold -= 250; state.resources.gold += 100; state.resources.rubies += 15; return '🦸 Der Recke schließt sich an und übergibt seine Beute! +🪙 100, +💎 15'; }
      },
      { text: '❌ Ablehnen', action: () => 'Der Recke sucht sein Glück anderswo.' }
    ]
  },
  {
    id: 'gold_vein',
    title: 'Goldader entdeckt',
    icon: '⛏️',
    desc: 'Arbeiter haben beim Ausheben von Fundamenten eine reiche Goldader entdeckt! Mit Investition kann man sie abbauen.',
    choices: [
      {
        text: '⛏️ Abbauen (Kosten: 🪵 100, 🪨 100) → +🪙 500',
        condition: (state) => state.resources.wood >= 100 && state.resources.stone >= 100,
        action: (state) => { state.resources.wood -= 100; state.resources.stone -= 100; state.resources.gold += 500; return '⛏️ Die Goldader wurde erschlossen! +500 Gold!'; }
      },
      { text: '🚫 Ignorieren', action: () => 'Die Gelegenheit verstreicht ungenutzt.' }
    ]
  },
  {
    id: 'folk_uprising',
    title: 'Volksaufstand',
    icon: '👊',
    desc: 'Unzufriedene Bürger versammeln sich vor dem Burgtor! Sie verlangen mehr Brot und Gerechtigkeit.',
    choices: [
      {
        text: '🍞 Brot verteilen (Kosten: 🍞 30) → +20 Zufriedenheit',
        condition: (state) => (state.resources.bread || 0) >= 30,
        action: (state) => { state.resources.bread -= 30; state.happiness = Math.min(100, (state.happiness || 50) + 20); return '🍞 Das Volk ist besänftigt. +20 Zufriedenheit!'; }
      },
      {
        text: '🪙 Gold als Entschädigung (Kosten: 🪙 200) → +10 Zufriedenheit',
        condition: (state) => state.resources.gold >= 200,
        action: (state) => { state.resources.gold -= 200; state.happiness = Math.min(100, (state.happiness || 50) + 10); return '🪙 Die Bürger werden bestochen. +10 Zufriedenheit.'; }
      },
      {
        text: '⚔️ Aufstand niederschlagen (Verliere Zufriedenheit)',
        action: (state) => { state.happiness = Math.max(0, (state.happiness || 50) - 25); return '⚔️ Der Aufstand wurde brutal niedergeschlagen. -25 Zufriedenheit!'; }
      }
    ]
  },
  {
    id: 'diplomat_visit',
    title: 'Diplomatischer Besuch',
    icon: '🤝',
    desc: 'Ein Gesandter aus einem fernen Reich überbringt Geschenke und sucht eine mögliche Handelsallianz.',
    choices: [
      {
        text: '🤝 Allianz annehmen → +150 Gold, +100 Nahrung, +5 Zufriedenheit',
        action: (state) => { state.resources.gold += 150; state.resources.food += 100; state.happiness = Math.min(100, (state.happiness || 50) + 5); return '🤝 Die Allianz ist besiegelt! Geschenke treffen ein!'; }
      },
      { text: '🚪 Gesandten abweisen', action: () => 'Die Delegation kehrt unverrichteter Dinge zurück.' }
    ]
  },
  {
    id: 'tournament',
    title: 'Großes Turnier',
    icon: '🏆',
    desc: 'Ein Ritterturnier kann ausgerichtet werden! Es kostet Ressourcen, steigert aber die Bekanntheit und Zufriedenheit erheblich.',
    choices: [
      {
        text: '🏆 Turnier ausrichten (Kosten: 🪙 300, 🌾 200) → +Rubine, +Zufriedenheit',
        condition: (state) => state.resources.gold >= 300 && state.resources.food >= 200,
        action: (state) => { state.resources.gold -= 300; state.resources.food -= 200; state.resources.rubies += 8; state.happiness = Math.min(100, (state.happiness || 50) + 20); return '🏆 Das Turnier war ein großer Erfolg! +8 Rubine, +20 Zufriedenheit!'; }
      },
      { text: '❌ Kein Turnier dieses Jahr', action: () => 'Das Turnier wird auf nächstes Jahr verschoben.' }
    ]
  },
  {
    id: 'plague_rats',
    title: 'Rattenpest in Lagerhäusern',
    icon: '🐀',
    desc: 'Ratten haben die Lager befallen und fressen eure Vorräte! Sofortiges Handeln ist nötig.',
    choices: [
      {
        text: '🪤 Kammerjäger bezahlen (Kosten: 🪙 80)',
        condition: (state) => state.resources.gold >= 80,
        action: (state) => { state.resources.gold -= 80; return '🐀 Die Ratten wurden vertrieben. Minimale Verluste.'; }
      },
      {
        text: '😤 Selbst bekämpfen (Verliere 🌾 200, 🪵 100)',
        action: (state) => { state.resources.food = Math.max(0, state.resources.food - 200); state.resources.wood = Math.max(0, state.resources.wood - 100); return '🐀 Die Ratten haben gewütet. Große Verluste in den Lagern!'; }
      }
    ]
  },
  {
    id: 'frost',
    title: 'Früher Frost',
    icon: '❄️',
    desc: 'Ein unerwarteter Frost trifft eure Siedlung früh im Jahr. Die Ernte friert ein und Holz wird dringend gebraucht.',
    choices: [
      {
        text: '🪵 Brennholz beschaffen (Kosten: 🪵 200 → +🌾 150 gerettet)',
        condition: (state) => state.resources.wood >= 200,
        action: (state) => { state.resources.wood -= 200; state.resources.food += 150; return '❄️ Die Feuer halten den Frost ab. Teile der Ernte konnten gerettet werden!'; }
      },
      {
        text: '🌨️ Den Frost aussitzen (Verliere 🌾 300)',
        action: (state) => { state.resources.food = Math.max(0, state.resources.food - 300); state.happiness = Math.max(0, (state.happiness || 50) - 10); return '❄️ Der Frost friert einen Großteil der Ernte ein. -300 Nahrung, -10 Zufriedenheit.'; }
      }
    ]
  },
  {
    id: 'mineral_springs',
    title: 'Heilige Quellen entdeckt',
    icon: '💧',
    desc: 'Arbeiter entdecken sprudelnde Heilquellen in der Nähe. Pilger aus aller Welt könnten Gold bringen!',
    choices: [
      {
        text: '🏛️ Wallfahrtsort errichten (Kosten: 🪨 150, 🪙 100) → +300 Gold',
        condition: (state) => state.resources.stone >= 150 && state.resources.gold >= 100,
        action: (state) => { state.resources.stone -= 150; state.resources.gold -= 100; state.resources.gold += 300; state.happiness = Math.min(100, (state.happiness || 50) + 10); return '💧 Pilger strömen herbei! +300 Gold, +10 Zufriedenheit!'; }
      },
      {
        text: '💧 Quelle einfach nutzen → +50 Gold',
        action: (state) => { state.resources.gold += 50; return '💧 Die Quelle dient als Trinkwasser. +50 Gold vom Verkauf.'; }
      }
    ]
  },
  {
    id: 'alliance_defense',
    title: 'Bündnispartner unter Angriff! 🛡️',
    icon: '🤝',
    desc: 'Ein Bündnispartner bittet um Hilfe! Ihr Außenposten wird von Banditen belagert. Entsende Truppen zur Verteidigung!',
    condition: (state) => {
      const hasAlliance = Object.values(state.diplomacy || {}).some(d => d.status === 'allied');
      return hasAlliance;
    },
    choices: [
      {
        text: '⚔️ 10 Speerkämpfer entsenden (Benötigt: 10 Speerkämpfer)',
        condition: (state) => (state.troops.spearman || 0) >= 10,
        action: (state) => {
          state.troops.spearman -= 10;
          if (Math.random() < 0.85) {
            state.resources.gold += 300;
            state.resources.rubies += 8;
            Object.keys(state.diplomacy).forEach(nId => {
              if (state.diplomacy[nId].status === 'allied') {
                state.diplomacy[nId].relation = Math.min(100, state.diplomacy[nId].relation + 15);
              }
            });
            return '🛡️ Erfolgreiche Verteidigung! Dein Bündnispartner bedankt sich mit 300 Gold, 8 Rubinen und verbesserter Diplomatie! (+15 Beziehung)';
          } else {
            state.troops.spearman += 2;
            return '😢 Unerwarteter Rückschlag! Der Außenposten fiel und nur 2 Speerkämpfer kehrten zurück.';
          }
        }
      },
      {
        text: '⚔️ 5 Ritter entsenden (Benötigt: 5 Ritter)',
        condition: (state) => (state.troops.knight || 0) >= 5,
        action: (state) => {
          state.troops.knight -= 5;
          if (Math.random() < 0.95) {
            state.resources.gold += 400;
            state.resources.rubies += 12;
            Object.keys(state.diplomacy).forEach(nId => {
              if (state.diplomacy[nId].status === 'allied') {
                state.diplomacy[nId].relation = Math.min(100, state.diplomacy[nId].relation + 20);
              }
            });
            return '🛡️ Glorreicher Sieg! Deine Ritter haben die Angreifer vernichtend geschlagen! Partner belohnt dich mit 400 Gold, 12 Rubinen und +20 Beziehung!';
          } else {
            state.troops.knight += 1;
            return '😢 Bittere Niederlage! Deine Ritter wurden aufgerieben, nur 1 kehrte zurück.';
          }
        }
      },
      {
        text: '🚪 Bitte um Hilfe ablehnen (Diplomatie -15)',
        action: (state) => {
          Object.keys(state.diplomacy).forEach(nId => {
            if (state.diplomacy[nId].status === 'allied') {
              state.diplomacy[nId].relation = Math.max(-100, state.diplomacy[nId].relation - 15);
            }
          });
          return '🤝 Die Bitte wurde abgelehnt. Die diplomatischen Beziehungen zu deinen Bündnispartnern haben Schaden genommen (-15 Beziehung).';
        }
      }
    ]
  },
  {
    id: 'diplomatic_request_res',
    title: 'Diplomatische Rohstoffhilfe 🪵',
    icon: '🤝',
    desc: 'Dein Bündnispartner benötigt dringend Baumaterial (500 Holz und 500 Stein), um seine Grenzbefestigung auszubauen.',
    condition: (state) => {
      const hasAlliance = Object.values(state.diplomacy || {}).some(d => d.status === 'allied');
      return hasAlliance;
    },
    choices: [
      {
        text: '✅ Ressourcen senden (Kosten: 🪵 500, 🪨 500 → +💎 10, +25 Beziehung)',
        condition: (state) => state.resources.wood >= 500 && state.resources.stone >= 500,
        action: (state) => {
          state.resources.wood -= 500;
          state.resources.stone -= 500;
          state.resources.rubies += 10;
          Object.keys(state.diplomacy).forEach(nId => {
            if (state.diplomacy[nId].status === 'allied') {
              state.diplomacy[nId].relation = Math.min(100, state.diplomacy[nId].relation + 25);
            }
          });
          return '🤝 Rohstoffe gesendet! Dein Bündnispartner schätzt deine Zuverlässigkeit zutiefst und schenkt dir 10 Rubine (+25 Beziehung).';
        }
      },
      {
        text: '❌ Hilferuf ignorieren',
        action: () => 'Du hast den Hilferuf ignoriert. Keine Konsequenzen, aber eine verpasste Chance.'
      }
    ]
  }
];

const TAX_OPTIONS = [
  { id: 'short', name: 'Zehnt (Schnell)', duration: 30, yield: 15, rubyCost: 1, desc: '30 Sek. für 15 Gold' },
  { id: 'medium', name: 'Zoll (Mittel)', duration: 300, yield: 80, rubyCost: 4, desc: '5 Min. für 80 Gold' },
  { id: 'long', name: 'Steuern (Lang)', duration: 3600, yield: 450, rubyCost: 15, desc: '1 Std. für 450 Gold' },
  { id: 'sleep', name: 'Kaiserlicher Tribut', duration: 21600, yield: 1200, rubyCost: 35, desc: '6 Std. für 1200 Gold' }
];

const WORLD_MAP_CONFIG = {
  width: 800,
  height: 600,
  playerCastle: { x: 400, y: 300, name: 'Deine Burg' },
  npcCastles: [
    { id: 1, name: 'Raubritter Stufe 1', level: 1, x: 220, y: 180, defenders: { spearman: 3, swordsman: 0, bowman: 0 }, loot: { gold: 80, wood: 150, stone: 80, rubies: 1 }, travelTime: 20 },
    { id: 2, name: 'Raubritter Stufe 2', level: 2, x: 550, y: 150, defenders: { spearman: 5, swordsman: 2, bowman: 0 }, loot: { gold: 180, wood: 300, stone: 200, rubies: 2 }, travelTime: 40 },
    { id: 3, name: 'Raubritter Stufe 3', level: 3, x: 180, y: 450, defenders: { spearman: 6, swordsman: 4, bowman: 2 }, loot: { gold: 350, wood: 500, stone: 400, rubies: 4 }, travelTime: 75 },
    { id: 4, name: 'Raubritter Stufe 4', level: 4, x: 620, y: 420, defenders: { spearman: 10, swordsman: 8, bowman: 5 }, loot: { gold: 700, wood: 1000, stone: 850, rubies: 8 }, travelTime: 120 },
    { id: 5, name: 'Raubritter-Festung L5', level: 5, x: 410, y: 90, defenders: { spearman: 25, swordsman: 15, bowman: 15 }, loot: { gold: 1800, wood: 2500, stone: 2000, rubies: 25 }, travelTime: 240 },
    { id: 6, name: 'Uralter Drache L6 (Raidboss)', level: 6, x: 680, y: 180, defenders: { spearman: 50, swordsman: 40, bowman: 30, knight: 15 }, loot: { gold: 5000, wood: 5000, stone: 5000, rubies: 100 }, travelTime: 360 }
  ],
  outposts: [
    { id: 'op1', name: 'Holzfällerlager', type: 'woodcutter', level: 1, x: 300, y: 150, defenders: { spearman: 4, swordsman: 0, bowman: 0, knight: 0 }, yield: { wood: 60 }, travelTime: 15, icon: '🪓' },
    { id: 'op2', name: 'Steinbruch-Außenposten', type: 'quarry', level: 2, x: 250, y: 380, defenders: { spearman: 4, swordsman: 2, bowman: 0, knight: 0 }, yield: { stone: 40 }, travelTime: 25, icon: '⛏️' },
    { id: 'op3', name: 'Eisenminen-Außenposten', type: 'iron_mine', level: 3, x: 500, y: 420, defenders: { spearman: 5, swordsman: 4, bowman: 2, knight: 0 }, yield: { iron: 25 }, travelTime: 35, icon: '⛓️' },
    { id: 'cp1', name: 'Königlicher Wachturm', type: 'control_point', level: 4, x: 100, y: 250, defenders: { spearman: 8, swordsman: 6, bowman: 4, knight: 2 }, yield: { gold: 10 }, travelTime: 50, icon: '🏰', isControlPoint: true, bonus: 'movement_speed', bonusDesc: '+15% Marschgeschwindigkeit für Truppen' },
    { id: 'cp2', name: 'Versunkener Tempel', type: 'control_point', level: 4, x: 450, y: 550, defenders: { spearman: 8, swordsman: 6, bowman: 4, knight: 2 }, yield: { gold: 10 }, travelTime: 60, icon: '⛩️', isControlPoint: true, bonus: 'build_speed', bonusDesc: '+15% Baugeschwindigkeit' },
    { id: 'cp3', name: 'Grenzfestung', type: 'control_point', level: 4, x: 700, y: 100, defenders: { spearman: 8, swordsman: 6, bowman: 4, knight: 2 }, yield: { gold: 10 }, travelTime: 40, icon: '🛡️', isControlPoint: true, bonus: 'tax_gold', bonusDesc: '+15% Steuereinnahmen' }
  ]
};

const QUESTS_CONFIG = [
  {
    id: 'quest_woodcutter',
    title: 'Holz ranschaffen',
    description: 'Baue einen Holzfäller in deiner Burg, um Holz zu verbinden.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.WOODCUTTER),
    reward: { gold: 50, wood: 50, stone: 20, rubies: 5 }
  },
  {
    id: 'quest_quarry',
    title: 'Erste Steine',
    description: 'Baue einen Steinbruch, um Stein abzubauen.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.QUARRY),
    reward: { gold: 80, wood: 50, stone: 50, rubies: 5 }
  },
  {
    id: 'quest_farm',
    title: 'Die Arbeiter füttern',
    description: 'Errichte einen Bauernhof, um Nahrung für deine Truppen bereitzustellen.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.FARM),
    reward: { gold: 100, wood: 100, stone: 100, rubies: 5 }
  },
  {
    id: 'quest_upgrade_keep',
    title: 'Herrschersitz ausbauen',
    description: 'Bringe deinen Burgfried auf Stufe 2, um deine Vormacht zu demonstrieren.',
    condition: (state) => {
      const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
      return keep && keep.level >= 2 && !keep.underConstruction;
    },
    reward: { gold: 200, wood: 150, stone: 150, rubies: 10 }
  },
  {
    id: 'quest_tax',
    title: 'Finanzierung sichern',
    description: 'Baue ein Steuerhaus, um Geld eintreiben zu können.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.TAX_HOUSE),
    reward: { gold: 150, wood: 100, stone: 50, rubies: 5 }
  },
  {
    id: 'quest_barracks',
    title: 'Eigene Miliz gründen',
    description: 'Baue eine Kaserne, um wehrfähig zu werden.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.BARRACKS),
    reward: { gold: 150, wood: 150, stone: 100, rubies: 10 }
  },
  {
    id: 'quest_recruit',
    title: 'Soldaten anheuern',
    description: 'Bilde mindestens 5 Speerkämpfer in deiner Kaserne aus.',
    condition: (state) => (state.troops.spearman || 0) >= 5,
    reward: { gold: 200, food: 200, rubies: 10 }
  },
  {
    id: 'quest_defeat_rb1',
    title: 'Erster Feldzug',
    description: 'Greife einen Raubritter der Stufe 1 an und besiege ihn.',
    condition: (state) => state.statistics.npcDefeated >= 1,
    reward: { gold: 300, wood: 400, stone: 400, rubies: 15 }
  },
  {
    id: 'quest_spring',
    title: 'Burgverschönerung',
    description: 'Baue einen dekorativen Springbrunnen im Baumenü für Rubine.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.FOUNTAIN),
    reward: { gold: 300, wood: 300, stone: 300, rubies: 20 }
  },
  {
    id: 'quest_defeat_rb2',
    title: 'Expansion des Reiches',
    description: 'Besiege einen Raubritter der Stufe 2 auf der Weltkarte.',
    condition: (state) => state.statistics.maxNpcLevelDefeated >= 2,
    reward: { gold: 500, wood: 800, stone: 800, rubies: 25 }
  },
  {
    id: 'quest_tavern',
    title: 'Heimliche Winkel',
    description: 'Baue eine Taverne in deiner Burg, um Spione anzuwerben.',
    condition: (state) => state.buildings.some(b => b.type === BUILDING_TYPES.TAVERN && !b.underConstruction),
    reward: { gold: 150, wood: 100, stone: 100, rubies: 10 }
  },
  {
    id: 'quest_spy',
    title: 'Schatten im Nebel',
    description: 'Führe eine erfolgreiche Spionagemission gegen eine Raubritterburg durch.',
    condition: (state) => (state.statistics.npcSpied || 0) >= 1,
    reward: { gold: 200, wood: 150, stone: 150, rubies: 15 }
  },
  {
    id: 'quest_first_dungeon',
    title: 'In die Dunkelheit',
    description: 'Schicke deinen Helden in seinen ersten Dungeon und schließe ihn ab.',
    condition: (state) => (state.statistics.dungeonsCleared || 0) >= 1,
    reward: { gold: 500, rubies: 25, wood: 300, stone: 300 }
  },
  {
    id: 'quest_first_outpost',
    title: 'Expansion beginnt',
    description: 'Erobere einen Außenposten auf der Weltkarte und besetze ihn mit Truppen.',
    condition: (state) => state.outposts && Object.values(state.outposts).some(op => op.owner === 'player'),
    reward: { gold: 600, rubies: 30, wood: 500, stone: 400 }
  },
  {
    id: 'quest_first_alliance',
    title: 'Freunde in hohen Plätzen',
    description: 'Schließe ein Bündnis mit einer der KI-Nationen auf der Weltkarte ab.',
    condition: (state) => state.diplomacy && Object.values(state.diplomacy).some(d => d.status === 'ally'),
    reward: { gold: 800, rubies: 35 }
  },
  {
    id: 'quest_hero_level5',
    title: 'Legendärer Held',
    description: 'Bringe deinen Helden auf Level 5.',
    condition: (state) => state.hero && state.hero.level >= 5,
    reward: { gold: 500, rubies: 40 }
  },
  {
    id: 'quest_maritime',
    title: 'Herr der Meere',
    description: 'Baue ein Handelsschiff und stelle eine maritime Handelsroute her.',
    condition: (state) => state.maritimeShips && state.maritimeShips.length >= 1,
    reward: { gold: 700, rubies: 30, iron: 200 }
  },
  {
    id: 'quest_academy',
    title: 'Wissen ist Macht',
    description: 'Forsche 3 verschiedene Technologien in der Akademie oder Bibliothek.',
    condition: (state) => {
      const libCount = Object.values(state.research || {}).filter(v => v === true).length;
      const acadCount = Object.keys(state.researchProgress || {}).filter(k => state.researchProgress[k]?.completed).length;
      return (libCount + acadCount) >= 3;
    },
    reward: { gold: 600, rubies: 40 }
  },
  {
    id: 'quest_keep_3',
    title: 'Mächtiger Burgfried',
    description: 'Bringe deinen Burgfried auf Stufe 3 – Symbol deiner Stärke.',
    condition: (state) => {
      const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
      return keep && keep.level >= 3 && !keep.underConstruction;
    },
    reward: { gold: 1000, rubies: 50, wood: 800, stone: 800 }
  },
  {
    id: 'quest_age_feudal',
    title: 'Das Feudalzeitalter',
    description: 'Bringe dein Königreich in die Feudalzeit, indem du den Burgfried auf Stufe 2 ausbaust.',
    condition: (state) => (state.ageIndex || 0) >= AGES.FEUDAL,
    reward: { gold: 300, wood: 200, stone: 200, rubies: 15 }
  },
  {
    id: 'quest_coop_attack',
    title: 'Vereinte Kräfte',
    description: 'Fordere Alliierten-Militärhilfe bei einem Angriff auf ein NPC-Ziel an.',
    condition: (state) => (state.statistics.coopAttacksLaunched || 0) >= 1,
    reward: { gold: 400, rubies: 20 }
  }
];


// --- OUTPOST BUILDINGS CONFIGURATION ---
const OUTPOST_BUILDING_TYPES = {
  TOWER: 'tower',
  DEPOT: 'depot',
  BARRACKS: 'barracks',
  BOOSTER: 'booster'
};

const OUTPOST_BUILDINGS_CONFIG = {
  [OUTPOST_BUILDING_TYPES.TOWER]: {
    name: 'Wehrturm',
    description: 'Verteidigt den Außenposten bei Raubritterangriffen durch Pfeilbeschuss (schießt auf Angreifer).',
    levels: {
      1: { cost: { gold: 100, stone: 80 }, time: 15, damage: 15 },
      2: { cost: { gold: 200, stone: 180 }, time: 30, damage: 30 },
      3: { cost: { gold: 400, stone: 350 }, time: 60, damage: 55 }
    }
  },
  [OUTPOST_BUILDING_TYPES.DEPOT]: {
    name: 'Lagerhaus',
    description: 'Erhöht die maximale Kapazität für Rohstoffe, die im Außenposten gesammelt werden können.',
    levels: {
      1: { cost: { gold: 80, wood: 100 }, time: 10, capacity: 1500 },
      2: { cost: { gold: 150, wood: 200 }, time: 20, capacity: 4000 },
      3: { cost: { gold: 300, wood: 450 }, time: 45, capacity: 10000 }
    }
  },
  [OUTPOST_BUILDING_TYPES.BARRACKS]: {
    name: 'Unterkunft',
    description: 'Erhöht das Truppenlimit (Garnison) für diesen Außenposten.',
    levels: {
      1: { cost: { gold: 120, wood: 80, stone: 60 }, time: 20, garrisonMax: 10 },
      2: { cost: { gold: 250, wood: 150, stone: 120 }, time: 40, garrisonMax: 20 },
      3: { cost: { gold: 500, wood: 300, stone: 250 }, time: 80, garrisonMax: 40 }
    }
  },
  [OUTPOST_BUILDING_TYPES.BOOSTER]: {
    name: 'Produktions-Booster',
    description: 'Steigert die Effizienz des Außenpostens und erhöht dessen Ertragsgeschwindigkeit um +50% pro Stufe.',
    levels: {
      1: { cost: { gold: 150, wood: 120, stone: 100 }, time: 25, yieldMultiplier: 0.5 },
      2: { cost: { gold: 300, wood: 250, stone: 200 }, time: 50, yieldMultiplier: 1.0 },
      3: { cost: { gold: 600, wood: 500, stone: 400 }, time: 100, yieldMultiplier: 1.5 }
    }
  }
};

// --- SEASONS CONFIGURATION ---
const SEASONS_CONFIG = [
  { id: 'spring', name: 'Frühling', color: 'rgba(255, 182, 193, 0.12)', prodMult: { food: 1.15 }, speedMult: 1.0, particle: 'blossom' },
  { id: 'summer', name: 'Sommer', color: 'rgba(255, 223, 0, 0.05)', prodMult: { food: 1.30, wood: 0.9 }, speedMult: 1.1, particle: 'sun' },
  { id: 'autumn', name: 'Herbst', color: 'rgba(210, 105, 30, 0.12)', prodMult: { wood: 1.25, food: 0.8 }, speedMult: 0.9, particle: 'leaf' },
  { id: 'winter', name: 'Winter', color: 'rgba(240, 248, 255, 0.20)', prodMult: { food: 0.5, wood: 0.85, stone: 0.8 }, speedMult: 0.75, particle: 'snow' }
];
const SEASON_DURATION_SEC = 600; // 10 minutes per season (increased for better strategy time)

// --- RESOURCE STORAGE CAPS ---
// Maximum storable resources. Can be expanded via Storehouse upgrades.
const RESOURCE_STORAGE_CAPS = {
  wood:    5000,
  stone:   5000,
  food:    3000,
  gold:    Infinity, // Gold is always unlimited
  rubies:  Infinity, // Rubies never cap
  iron:    2000,
  iron_ore: 1000,
  weapons: 1000,
  flour:   500,
  bread:   300
};


// --- HERO DUNGEONS CONFIGURATION ---
const DUNGEONS_CONFIG = [
  { id: 'dungeon_forest', name: 'Finsterer Wald', levelReq: 1, duration: 15, desc: 'Ein verfallener Forst voller wilder Bestien und Diebe.', rewardChance: 0.75, items: ['rusty_sword', 'leather_armor'] },
  { id: 'dungeon_mines', name: 'Verlassene Minen', levelReq: 3, duration: 30, desc: 'Tief in den eingestürzten Stollen schlummern uralte Wächter.', rewardChance: 0.80, items: ['steel_sword', 'chain_mail', 'gold_ring'] },
  { id: 'dungeon_dragon', name: 'Drachenhort', levelReq: 5, duration: 60, desc: 'Die ultimative Herausforderung für jeden Helden im feurigen Vulkan.', rewardChance: 0.90, items: ['dragon_slayer', 'plate_armor', 'ruby_amulet'] },
  { id: 'dungeon_drachenhort', name: 'Zorn des Vulkans (Drachenhort)', levelReq: 10, duration: 90, desc: 'Die ultimative Herausforderung für jeden Helden im feurigen Vulkan.', rewardChance: 0.95, items: ['dragon_slayer', 'dragon_scale_armor', 'dragon_amulet'] }
];

// --- HERO ITEMS CONFIGURATION ---
const ITEMS_CONFIG = {
  rusty_sword: { name: 'Rostiges Schwert', slot: 'weapon', rarity: 'common', bonus: { attack: 0.1 }, desc: 'Ein altes, rostiges Schwert (+10% Helden-Angriff)' },
  steel_sword: { name: 'Stahlschwert', slot: 'weapon', rarity: 'rare', bonus: { attack: 0.25 }, desc: 'Ein scharfes Breitschwert (+25% Helden-Angriff)' },
  dragon_slayer: { name: 'Drachentöter', slot: 'weapon', rarity: 'legendary', bonus: { attack: 0.5 }, desc: 'Eine legendäre Klinge (+50% Helden-Angriff)' },
  leather_armor: { name: 'Lederrüstung', slot: 'armor', rarity: 'common', bonus: { defense: 0.1 }, desc: 'Leichter Schutz (+10% Helden-Rüstung)' },
  chain_mail: { name: 'Kettenhemd', slot: 'armor', rarity: 'rare', bonus: { defense: 0.25 }, desc: 'Solide Ringe (+25% Helden-Rüstung)' },
  plate_armor: { name: 'Ritterrüstung', slot: 'armor', rarity: 'epic', bonus: { defense: 0.5 }, desc: 'Schwere Plattenrüstung (+50% Helden-Rüstung)' },
  gold_ring: { name: 'Goldener Ring', slot: 'accessory', rarity: 'rare', bonus: { production: 0.08 }, desc: 'Zieht Wohlstand an (+8% Ressourcenproduktion)' },
  ruby_amulet: { name: 'Rubin-Amulett', slot: 'accessory', rarity: 'epic', bonus: { production: 0.2 }, desc: 'Mächtiges Rubin-Amulett (+20% Ressourcenproduktion)' },
  iron_shield: { name: 'Eisenschild', slot: 'accessory', rarity: 'common', bonus: { defense: 0.12 }, desc: 'Einfacher Rundschild (+12% Helden-Rüstung)' },
  mythril_blade: { name: 'Mythril-Klinge', slot: 'weapon', rarity: 'epic', bonus: { attack: 0.4 }, desc: 'Magische Klinge (+40% Helden-Angriff)' },
  dragon_scale_armor: { name: 'Drachenschuppen-Rüstung', slot: 'armor', rarity: 'legendary', bonus: { defense: 0.6 }, desc: 'Rüstung aus Drachenschuppen (+60% Helden-Rüstung)' },
  dragon_amulet: { name: 'Drachen-Amulett', slot: 'accessory', rarity: 'legendary', bonus: { production: 0.3 }, desc: 'Amulett der Hitze (+30% Ressourcenproduktion)' }
};

// --- DAILY QUESTS CONFIGURATION ---
const DAILY_QUESTS_POOL = [
  { id: 'dq_wood', title: 'Holz für den Wiederaufbau', desc: 'Die Werkstätten benötigen dringend Holz. Liefere 150 Holz.', type: 'deliver', req: { wood: 150 }, reward: { gold: 100, rubies: 2 } },
  { id: 'dq_stone', title: 'Sicherung der Mauern', desc: 'Liefere 150 Stein, um die Zinnen auszubessern.', type: 'deliver', req: { stone: 150 }, reward: { gold: 120, rubies: 2 } },
  { id: 'dq_food', title: 'Verpflegung der Wachen', desc: 'Die Kaserne braucht Vorräte. Liefere 100 Nahrung.', type: 'deliver', req: { food: 100 }, reward: { gold: 80, rubies: 1 } },
  { id: 'dq_bread', title: 'Kaiserliche Brotzeit', desc: 'Bürger verlangen frisches Brot. Liefere 15 Brot.', type: 'deliver', req: { bread: 15 }, reward: { gold: 180, rubies: 4 } },
  { id: 'dq_troops', title: 'Garnisons-Inspektion', desc: 'Bilde mindestens 5 Soldaten (Speerkämpfer, Schwertkämpfer oder Bogenschützen) aus.', type: 'troops', reqCount: 5, reward: { gold: 150, rubies: 3 } },
  { id: 'dq_spies', title: 'Schatten im Nebel', desc: 'Führe 2 Spionagemissionen aus.', type: 'spy', reqCount: 2, reward: { gold: 200, rubies: 5 } }
];

// --- HERO SKILLS CONFIGURATION ---
const HERO_SKILLS_CONFIG = {
  // Wirtschaft (Economy / Schatzmeister)
  eco_prod: { name: 'Einflussreicher Rat', desc: '+5% Ressourcenproduktion pro Stufe', maxLevel: 5, bonusType: 'production', valuePerLevel: 0.05, branch: 'Wirtschaft' },
  eco_build: { name: 'Oberbaumeister', desc: '-10% Bauzeit pro Stufe', maxLevel: 3, bonusType: 'build_time', valuePerLevel: -0.10, branch: 'Wirtschaft' },
  eco_tax: { name: 'Steuergespür', desc: '+10% Steuereinnahmen pro Stufe', maxLevel: 5, bonusType: 'tax_multiplier', valuePerLevel: 0.10, branch: 'Wirtschaft' },
  eco_trade: { name: 'Handelsrabatt', desc: '-5% Marktplatz-Gebühren pro Stufe', maxLevel: 5, bonusType: 'market_discount', valuePerLevel: -0.05, branch: 'Wirtschaft' },
  
  // Angriff (Offense / Kriegsherr)
  off_attack: { name: 'Schlachtruf', desc: '+8% Truppen-Angriffskraft pro Stufe', maxLevel: 5, bonusType: 'attack', valuePerLevel: 0.08, branch: 'Angriff' },
  off_speed: { name: 'Eilmarsch', desc: '-10% Truppenmarschzeit pro Stufe', maxLevel: 3, bonusType: 'march_time', valuePerLevel: -0.10, branch: 'Angriff' },
  off_crit: { name: 'Kritischer Treffer', desc: '+4% Krit-Chance im Taktik-Kampf pro Stufe', maxLevel: 5, bonusType: 'crit_chance', valuePerLevel: 0.04, branch: 'Angriff' },
  off_siege: { name: 'Belagerungsexperte', desc: '+10% Belagerungsschaden pro Stufe', maxLevel: 5, bonusType: 'siege_power', valuePerLevel: 0.10, branch: 'Angriff' },
  combat_whirlwind: { name: 'Klingensturm', desc: 'Aktiv im Kampf: Heilt nicht, sondern teilt 20 AoE-Schaden an alle angrenzenden Gegner aus.', maxLevel: 3, bonusType: 'combat_whirlwind', valuePerLevel: 1, branch: 'Angriff' },
  
  // Verteidigung (Defense / Paladin)
  def_wall: { name: 'Steinerner Wall', desc: '+10% Burgmauer-Schutzbonus pro Stufe', maxLevel: 5, bonusType: 'wall_defense', valuePerLevel: 0.10, branch: 'Verteidigung' },
  def_garrison: { name: 'Eiserner Griff', desc: '+8% Garnisons-Verteidigung pro Stufe', maxLevel: 5, bonusType: 'garrison_defense', valuePerLevel: 0.08, branch: 'Verteidigung' },
  def_shield: { name: 'Schildwache', desc: '+5% Abwehr für alle Truppen pro Stufe', maxLevel: 5, bonusType: 'troop_defense', valuePerLevel: 0.05, branch: 'Verteidigung' },
  def_life: { name: 'Lebenslicht', desc: '+10 max HP für den Helden im Kampf pro Stufe', maxLevel: 5, bonusType: 'hero_max_hp', valuePerLevel: 10, branch: 'Verteidigung' },
  combat_heal: { name: 'Heiliges Licht', desc: 'Aktiv im Kampf: Heilt Verbündete und dich selbst auf angrenzenden Kacheln um 40 HP.', maxLevel: 3, bonusType: 'combat_heal', valuePerLevel: 1, branch: 'Verteidigung' },
  combat_taunt: { name: 'Göttlicher Schild', desc: 'Aktiv im Kampf: Gewährt dem Helden +30 Rüstung für 1 Runde.', maxLevel: 3, bonusType: 'combat_taunt', valuePerLevel: 1, branch: 'Verteidigung' }
};

// --- AI NATIONS CONFIGURATION (für Diplomatie-System) ---
const AI_NATIONS_CONFIG = [
  {
    id: 'kingdom_north',
    name: 'Königreich Nordmark',
    icon: '❄️',
    personality: 'aggressive', // aggressive, peaceful, mercantile
    strength: 'military',
    desc: 'Ein kriegerisches Königreich aus dem kalten Norden. Respektiert Stärke, hasst Schwäche.',
    color: '#3498db',
    startRelation: -20, // -100 bis +100
    tributes: { gold: 300, wood: 200, stone: 150 },
    gifts: { gold: 150, wood: 100 }
  },
  {
    id: 'republic_south',
    name: 'Republik Südgold',
    icon: '⚖️',
    personality: 'mercantile',
    strength: 'economy',
    desc: 'Eine reiche Händlerrepublik aus dem Süden. Handelspartnerschaft wird hoch bewertet.',
    color: '#f1c40f',
    startRelation: 10,
    tributes: { gold: 200, iron: 50 },
    gifts: { gold: 200, iron: 30 }
  },
  {
    id: 'empire_east',
    name: 'Ostkaiserreich',
    icon: '🦅',
    personality: 'peaceful',
    strength: 'culture',
    desc: 'Ein altes, kultiviertes Kaiserreich mit langer Geschichte. Schätzt Frieden und Bildung.',
    color: '#9b59b6',
    startRelation: 30,
    tributes: { gold: 150, food: 200 },
    gifts: { gold: 100, food: 150, rubies: 5 }
  }
];

// --- PRESTIGE-SYSTEM CONFIGURATION ---
const PRESTIGE_RANKS = [
  { rank: 0, name: 'Bürgerlicher Herrscher', icon: '🏠', minPoints: 0, bonus: {} },
  { rank: 1, name: 'Ritter des Reiches', icon: '⚔️', minPoints: 1000, bonus: { startGold: 200, productionMult: 0.05 } },
  { rank: 2, name: 'Baron von Ehrenstein', icon: '🛡️', minPoints: 3000, bonus: { startGold: 500, productionMult: 0.12, startTroops: 5 } },
  { rank: 3, name: 'Graf des Imperiums', icon: '👑', minPoints: 8000, bonus: { startGold: 1000, productionMult: 0.20, startTroops: 15, startRubies: 20 } },
  { rank: 4, name: 'Herzog von Aldoria', icon: '🏰', minPoints: 20000, bonus: { startGold: 2000, productionMult: 0.30, startTroops: 30, startRubies: 50, breweryBonus: 0.5 } },
  { rank: 5, name: 'Kaiser des Abendlandes', icon: '🌟', minPoints: 50000, bonus: { startGold: 5000, productionMult: 0.50, startTroops: 60, startRubies: 100, gemBonus: 0.5 } }
];

// --- DIPLOMACY ACTIONS CONFIGURATION ---
const DIPLOMACY_ACTIONS = {
  send_gift: { name: 'Geschenk senden', costMultiplier: 1.0, relationGain: 15, cooldown: 300 },
  propose_alliance: { name: 'Bündnis vorschlagen', relationReq: 30, effect: 'alliance', cooldown: 600 },
  demand_tribute: { name: 'Tribut fordern', relationLoss: 25, rewardMult: 1.0, cooldown: 180, successChance: 0.5 },
  peace_treaty: { name: 'Friedensvertrag', relationReq: -50, relationGain: 40, cost: { gold: 300 }, cooldown: 900 },
  request_military_aid: { name: 'Militärhilfe anfragen', relationReq: 50, troopsGranted: 10, cooldown: 1800 },
  demand_vassalage: { name: 'Vasallentum fordern', relationReq: -60, successChance: 0.4, cooldown: 1200 }
};

// --- GEAR SETS CONFIGURATION ---
const GEAR_SETS = {
  guard_set: {
    name: "Wachposten-Set",
    items: ['rusty_sword', 'leather_armor', 'iron_shield'],
    bonuses: {
      2: { type: 'build_speed', value: 0.15, desc: "+15% Baugeschwindigkeit" },
      3: { type: 'spearman_power', value: 0.25, desc: "+25% Kampfkraft der Speerkämpfer" }
    }
  },
  king_set: {
    name: "Ritterkönig-Set",
    items: ['dragon_slayer', 'plate_armor', 'ruby_amulet'],
    bonuses: {
      2: { type: 'production', value: 0.20, desc: "+20% Ressourcenproduktion" },
      3: { type: 'troop_attack', value: 0.30, desc: "+30% Truppenangriffskraft" }
    }
  },
  dragon_set: {
    name: "Drachenzähmer-Set",
    items: ['dragon_slayer', 'dragon_scale_armor', 'dragon_amulet'],
    bonuses: {
      2: { type: 'production', value: 0.35, desc: "+35% Ressourcenproduktion" },
      3: { type: 'troop_attack', value: 0.45, desc: "+45% Truppenangriffskraft" }
    }
  }
};


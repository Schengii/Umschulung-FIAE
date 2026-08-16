/**
 * TypeScript Type Definitions for BurgenGame (Empire Classic)
 */

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  iron?: number;
  rubies: number;
}

export interface Building {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
  underConstruction: boolean;
  constructionTimeRemaining: number;
  constructionTimeTotal: number;
}

export interface TroopStats {
  attackMelee: number;
  attackRanged: number;
  defenseMelee: number;
  defenseRanged: number;
  lootCapacity: number;
}

export interface TroopConfig {
  id: string;
  name: string;
  time: number;
  cost: Partial<Resources>;
  stats: TroopStats;
}

export interface Mission {
  id: string;
  targetId: string;
  targetType: 'npc' | 'outpost';
  status: 'traveling' | 'returning';
  departureTime: number;
  duration: number;
  troopsSent: Record<string, number>;
  loot: Resources;
  battleReport?: any;
}

export interface GameState {
  ageIndex: number;
  resources: Resources;
  buildings: Building[];
  troops: Record<string, number>;
  missions: Mission[];
  rulerTitle?: string;
  happiness?: number;
  worldMapScouted?: Record<string, boolean>;
  dynastyFamily?: any;
  stockPortfolio?: Record<string, number>;
}

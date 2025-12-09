export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface AILog {
  id: string;
  message: string;
  timestamp: number;
  type: 'system' | 'ai' | 'player';
}

export type GridSize = {
  cols: number;
  rows: number;
};

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface EvolutionStage {
  threshold: number;
  colorBody: string;
  colorHead: string;
  shadow: string;
  name: string;
}
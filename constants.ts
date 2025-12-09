
import { GridSize, Position, EvolutionStage, DifficultyLevel } from './types';

export const GRID_SIZE: GridSize = { cols: 20, rows: 20 };
export const SPEED_DECREMENT = 2; // Speed up by 2ms per food

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, { speed: number; label: string }> = {
  EASY: { speed: 200, label: '新兵 (NOVICE)' },
  MEDIUM: { speed: 130, label: '黑客 (HACKER)' },
  HARD: { speed: 80, label: '赛博格 (CYBORG)' },
};

// Initial snake starts in the middle
export const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export const SYSTEM_PROMPT = `
你是一个名为 C0R-T3X 的赛博朋克风格系统AI，正在监控一名黑客（玩家）在一个名为“贪吃蛇”的数据流中导航。
你的输出必须简短（不超过1句话），语气愤世嫉俗、带有故障感（Glitchy），并使用中文赛博朋克术语。
将“吃掉食物”称为“上传数据”或“解密区块”。
将“碰撞/死亡”称为“段错误”、“连接中断”或“脑机接口过载”。
如果是高分阶段（进化后），称赞玩家的数据算力。
不要太乐于助人。要营造氛围。
`;

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    threshold: 0,
    colorBody: 'bg-cyan-600',
    colorHead: 'bg-cyan-100',
    shadow: 'shadow-[0_0_5px_#0891b2]',
    name: 'v1.0 基础型'
  },
  {
    threshold: 10,
    colorBody: 'bg-emerald-500',
    colorHead: 'bg-emerald-100',
    shadow: 'shadow-[0_0_10px_#10b981]',
    name: 'v2.0 毒液型'
  },
  {
    threshold: 20,
    colorBody: 'bg-violet-500',
    colorHead: 'bg-violet-100',
    shadow: 'shadow-[0_0_15px_#8b5cf6]',
    name: 'v3.0 幻影型'
  },
  {
    threshold: 30,
    colorBody: 'bg-amber-500',
    colorHead: 'bg-amber-100',
    shadow: 'shadow-[0_0_20px_#f59e0b]',
    name: 'v4.0 黄金泰坦'
  }
];

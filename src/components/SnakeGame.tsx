import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { CyberButton } from './CyberButton';
import { generateGameCommentary } from '../services/geminiService';
import { GRID_SIZE, INITIAL_SNAKE, SPEED_DECREMENT, EVOLUTION_STAGES, DIFFICULTY_CONFIG } from '../constants';
import { Direction, GameStatus, Position, AILog, DifficultyLevel, EvolutionStage } from '../types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Cpu, Trophy, Share2 } from 'lucide-react';

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [evolution, setEvolution] = useState<EvolutionStage>(EVOLUTION_STAGES[0]);
  const [difficultyLabel, setDifficultyLabel] = useState('');
  
  const directionRef = useRef<Direction>(Direction.UP);
  const nextDirectionRef = useRef<Direction>(Direction.UP);
  const gameLoopRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('neon-serpent-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const addLog = (message: string, type: AILog['type'] = 'system') => {
    setLogs(prev => [...prev.slice(-4), { id: Math.random().toString(), message, timestamp: Date.now(), type }]);
  };

  const triggerAI = async (context: string) => {
    addLog("正在解析神经模式...", "system");
    const commentary = await generateGameCommentary(context);
    addLog(commentary, "ai");
  };

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position, isColliding;
    do {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE.cols), y: Math.floor(Math.random() * GRID_SIZE.rows) };
      // eslint-disable-next-line
      isColliding = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
    } while (isColliding);
    return newFood;
  }, []);

  const startGame = (difficulty: DifficultyLevel) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setSnake(INITIAL_SNAKE);
    directionRef.current = Direction.UP;
    nextDirectionRef.current = Direction.UP;
    setScore(0);
    setSpeed(config.speed);
    setFood(generateFood(INITIAL_SNAKE));
    setEvolution(EVOLUTION_STAGES[0]);
    setStatus(GameStatus.PLAYING);
    setLogs([]);
    setDifficultyLabel(config.label);
    triggerAI(`玩家已接入。难度: ${config.label}`);
  };

  const gameOver = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('neon-serpent-highscore', score.toString());
    }
    triggerAI(`信号丢失。最终数据: ${score}`);
  };

  const handleShare = async () => {
    const text = `🐍 [NEON SERPENT] 赛博贪吃蛇\n📊 得分: ${score}\n🧬 型号: ${evolution.name}\n☠️ 难度: ${difficultyLabel}`;
    try {
      await navigator.clipboard.writeText(text);
      addLog("战绩已复制到剪贴板", "system");
      alert("已复制战绩！");
    } catch (err) { console.error(err); }
  };

  const moveSnake = useCallback(() => {
    setSnake(prev => {
      const head = { ...prev[0] };
      directionRef.current = nextDirectionRef.current;

      if (directionRef.current === Direction.UP) head.y -= 1;
      if (directionRef.current === Direction.DOWN) head.y += 1;
      if (directionRef.current === Direction.LEFT) head.x -= 1;
      if (directionRef.current === Direction.RIGHT) head.x += 1;

      if (head.x < 0 || head.x >= GRID_SIZE.cols || head.y < 0 || head.y >= GRID_SIZE.rows || prev.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return prev;
      }

      const newSnake = [head, ...prev];
      if (food && head.x === food.x && head.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        setSpeed(s => Math.max(50, s - SPEED_DECREMENT));
        setFood(generateFood(newSnake));
        
        const nextStage = EVOLUTION_STAGES.slice().reverse().find(s => newScore >= s.threshold);
        if (nextStage && nextStage.name !== evolution.name) {
            setEvolution(nextStage);
            triggerAI(`机体升级 -> ${nextStage.name}`);
        }
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
    // eslint-disable-next-line
  }, [food, score, evolution]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [status, moveSnake, speed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const k = e.key.toLowerCase();
      const cur = directionRef.current;
      if (k === 'w' && cur !== Direction.DOWN) nextDirectionRef.current = Direction.UP;
      if (k === 's' && cur !== Direction.UP) nextDirectionRef.current = Direction.DOWN;
      if (k === 'a' && cur !== Direction.RIGHT) nextDirectionRef.current = Direction.LEFT;
      if (k === 'd' && cur !== Direction.LEFT) nextDirectionRef.current = Direction.RIGHT;
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status]);

  const handleManualControl = (dir: Direction) => {
    const cur = directionRef.current;
    if (dir === Direction.UP && cur !== Direction.DOWN) nextDirectionRef.current = Direction.UP;
    if (dir === Direction.DOWN && cur !== Direction.UP) nextDirectionRef.current = Direction.DOWN;
    if (dir === Direction.LEFT && cur !== Direction.RIGHT) nextDirectionRef.current = Direction.LEFT;
    if (dir === Direction.RIGHT && cur !== Direction.LEFT) nextDirectionRef.current = Direction.RIGHT;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start justify-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-[500px] flex justify-between items-end mb-2 font-display text-cyan-400">
           <div><div className="text-xs">型号 (VERSION)</div><div className={`text-sm font-bold ${evolution.colorHead.replace('bg-', 'text-')}`}>{evolution.name}</div></div>
           <div className="text-3xl font-bold">{score}</div>
           <div className="text-right"><div className="text-xs text-yellow-700">最高纪录</div><div className="text-xl text-yellow-500">{highScore}</div></div>
        </div>

        <div className="relative group w-full max-w-[500px]">
           <GameBoard gridSize={GRID_SIZE} snake={snake} food={food} isGameOver={status === GameStatus.GAME_OVER} evolutionStage={evolution} />
           
           {status === GameStatus.IDLE && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4">
               <h2 className="text-3xl font-display font-bold text-white mb-6">选择难度</h2>
               <div className="flex flex-col gap-3 w-full max-w-xs">
                 {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                    <CyberButton key={key} onClick={() => startGame(key as DifficultyLevel)} variant={key === 'HARD' ? 'danger' : 'primary'}>{cfg.label}</CyberButton>
                 ))}
               </div>
             </div>
           )}

           {status === GameStatus.GAME_OVER && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6">
               <h2 className="text-5xl font-display font-bold text-red-500 mb-2">致命错误</h2>
               <div className="mb-8 text-center"><div className="text-4xl font-bold text-white">{score}</div></div>
               <div className="flex flex-col gap-3 w-full max-w-[240px]">
                 <CyberButton onClick={handleShare}><Share2 size={16} className="inline mr-2"/> 分享战绩</CyberButton>
                 <CyberButton variant="danger" onClick={() => setStatus(GameStatus.IDLE)}>系统重启</CyberButton>
               </div>
             </div>
           )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden w-[200px]">
           <div />
           <button className="bg-cyan-900/40 p-4 border border-cyan-600 active:bg-cyan-500" onClick={() => handleManualControl(Direction.UP)}><ArrowUp/></button>
           <div />
           <button className="bg-cyan-900/40 p-4 border border-cyan-600 active:bg-cyan-500" onClick={() => handleManualControl(Direction.LEFT)}><ArrowLeft/></button>
           <button className="bg-cyan-900/40 p-4 border border-cyan-600 active:bg-cyan-500" onClick={() => handleManualControl(Direction.DOWN)}><ArrowDown/></button>
           <button className="bg-cyan-900/40 p-4 border border-cyan-600 active:bg-cyan-500" onClick={() => handleManualControl(Direction.RIGHT)}><ArrowRight/></button>
        </div>
      </div>

      <div className="w-full lg:w-80 h-64 lg:h-auto flex flex-col border border-cyan-800 bg-black/50 backdrop-blur relative overflow-hidden rounded-sm">
        <div className="bg-cyan-900/20 p-3 border-b border-cyan-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400"><Cpu size={18} /><span className="font-bold text-sm">C0R-T3X</span></div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3">
           {logs.map((log) => (
             <div key={log.id} className="flex flex-col">
                <span className="text-[10px] opacity-40 text-cyan-600">[{new Date(log.timestamp).toISOString().slice(14, 19)}]</span>
                <div className={`p-2 rounded border-l-2 ${log.type === 'ai' ? 'border-fuchsia-500 text-fuchsia-100' : 'border-cyan-500 text-cyan-100'}`}>
                  {log.type === 'ai' && <span className="text-fuchsia-500 font-bold mr-2">C0R-T3X:</span>}
                  {log.message}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
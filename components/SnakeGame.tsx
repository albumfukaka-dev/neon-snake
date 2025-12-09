
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { CyberButton } from './CyberButton';
import { generateGameCommentary } from '../services/geminiService';
import { GRID_SIZE, INITIAL_SNAKE, SPEED_DECREMENT, EVOLUTION_STAGES, DIFFICULTY_CONFIG } from '../constants';
import { Direction, GameStatus, Position, AILog, DifficultyLevel, EvolutionStage } from '../types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Cpu, Trophy, Share2 } from 'lucide-react';

export const SnakeGame: React.FC = () => {
  // Game State
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position | null>(null);
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [minSpeed, setMinSpeed] = useState(50);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [evolution, setEvolution] = useState<EvolutionStage>(EVOLUTION_STAGES[0]);
  const [difficultyLabel, setDifficultyLabel] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Refs for mutable state in event listeners/intervals
  const directionRef = useRef<Direction>(Direction.UP);
  const nextDirectionRef = useRef<Direction>(Direction.UP);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load High Score on Mount
  useEffect(() => {
    const saved = localStorage.getItem('neon-serpent-highscore');
    if (saved) {
        setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Update High Score helper
  const updateHighScore = (currentScore: number) => {
    if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('neon-serpent-highscore', currentScore.toString());
    }
  };

  // --- Sound & AI Effects ---
  const addLog = (message: string, type: AILog['type'] = 'system') => {
    setLogs(prev => [...prev.slice(-4), { // Keep last 5 logs
      id: Math.random().toString(36),
      message,
      timestamp: Date.now(),
      type
    }]);
  };

  const triggerAI = async (context: string) => {
    addLog("正在解析神经模式...", "system");
    const commentary = await generateGameCommentary(context);
    addLog(commentary, "ai");
  };

  // --- Game Logic Helpers ---

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    let isColliding;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE.cols),
        y: Math.floor(Math.random() * GRID_SIZE.rows),
      };
      // eslint-disable-next-line no-loop-func
      isColliding = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
    } while (isColliding);
    return newFood;
  }, []);

  const startGame = (difficulty: DifficultyLevel) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setSnake(INITIAL_SNAKE);
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    nextDirectionRef.current = Direction.UP;
    setScore(0);
    setSpeed(config.speed);
    setMinSpeed(Math.max(20, config.speed - 100)); // Lower bound for speed
    setFood(generateFood(INITIAL_SNAKE));
    setEvolution(EVOLUTION_STAGES[0]);
    setStatus(GameStatus.PLAYING);
    setLogs([]);
    setDifficultyLabel(config.label);
    setIsCopied(false);
    triggerAI(`玩家已接入系统。难度等级: ${config.label}`);
  };

  const resetToMenu = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setStatus(GameStatus.IDLE);
    setSnake(INITIAL_SNAKE);
    setIsCopied(false);
  };

  const gameOver = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setStatus(GameStatus.GAME_OVER);
    updateHighScore(score);
    triggerAI(`玩家信号丢失。最终数据量: ${score}。原因: 碰撞。`);
  };

  const handleShare = async () => {
    const text = `🐍 [NEON SERPENT] 赛博贪吃蛇\n📊 最终数据量: ${score}\n🧬 机体型号: ${evolution.name}\n☠️ 难度: ${difficultyLabel}\n快来挑战我的最高纪录!`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      addLog("战绩数据已复制到剪贴板", "system");
    } catch (err) {
      console.error('Failed to copy', err);
      addLog("剪贴板访问被拒绝", "system");
    }
  };

  // --- Movement & Collision ---

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      directionRef.current = nextDirectionRef.current;

      switch (directionRef.current) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // 1. Wall Collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE.cols || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE.rows
      ) {
        gameOver();
        return prevSnake;
      }

      // 2. Self Collision
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // 3. Eat Food
      if (food && newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        
        // Speed up
        setSpeed(prev => Math.max(minSpeed, prev - SPEED_DECREMENT));
        setFood(generateFood(newSnake));
        
        // Evolution Check
        const nextStage = EVOLUTION_STAGES.slice().reverse().find(s => newScore >= s.threshold);
        if (nextStage && nextStage.name !== evolution.name) {
            setEvolution(nextStage);
            triggerAI(`系统进化! 当前版本: ${nextStage.name}`);
        } else if (newScore % 5 === 0) {
            triggerAI(`数据上传成功。当前缓存: ${newScore}`);
        }

      } else {
        newSnake.pop(); 
      }

      return newSnake;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [food, generateFood, score, evolution, minSpeed]); 

  // --- Effects ---

  useEffect(() => {
    // Prevent food spawn inside snake on start
    if (status === GameStatus.PLAYING && !food) {
        setFood(generateFood(INITIAL_SNAKE));
    }
  }, [status, food, generateFood]);

  // Game Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [status, moveSnake, speed]);

  // WASD Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;

      const currentDir = directionRef.current;
      const key = e.key.toLowerCase();
      
      switch (key) {
        case 'w':
          if (currentDir !== Direction.DOWN) nextDirectionRef.current = Direction.UP;
          break;
        case 's':
          if (currentDir !== Direction.UP) nextDirectionRef.current = Direction.DOWN;
          break;
        case 'a':
          if (currentDir !== Direction.RIGHT) nextDirectionRef.current = Direction.LEFT;
          break;
        case 'd':
          if (currentDir !== Direction.LEFT) nextDirectionRef.current = Direction.RIGHT;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Mobile Controls Helper
  const handleManualControl = (dir: Direction) => {
    const currentDir = directionRef.current;
    if (dir === Direction.UP && currentDir !== Direction.DOWN) nextDirectionRef.current = Direction.UP;
    if (dir === Direction.DOWN && currentDir !== Direction.UP) nextDirectionRef.current = Direction.DOWN;
    if (dir === Direction.LEFT && currentDir !== Direction.RIGHT) nextDirectionRef.current = Direction.LEFT;
    if (dir === Direction.RIGHT && currentDir !== Direction.LEFT) nextDirectionRef.current = Direction.RIGHT;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start justify-center">
      
      {/* LEFT COLUMN: Game Area */}
      <div className="flex-1 w-full flex flex-col items-center">
        
        {/* Score Bar */}
        <div className="w-full max-w-[500px] flex justify-between items-end mb-2 font-display text-cyan-400">
          <div>
            <div className="text-xs text-cyan-700">机体型号 (VERSION)</div>
            <div className={`text-sm font-bold tracking-widest ${evolution.colorHead.replace('bg-', 'text-')}`}>{evolution.name}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-cyan-700">数据量 (DATA)</div>
            <div className="text-3xl font-bold tracking-widest">{score.toString().padStart(3, '0')}</div>
          </div>
           <div className="text-right flex flex-col items-end">
            <div className="text-xs text-yellow-700 flex items-center gap-1">
              <Trophy size={10} />
              <span>最高纪录</span>
            </div>
            <div className="text-xl text-yellow-500 font-bold">{highScore.toString().padStart(3, '0')}</div>
          </div>
        </div>

        {/* Board Container */}
        <div className="relative group w-full max-w-[500px]">
          <GameBoard 
            gridSize={GRID_SIZE} 
            snake={snake} 
            food={food} 
            isGameOver={status === GameStatus.GAME_OVER} 
            evolutionStage={evolution}
          />
          
          {/* Overlays */}
          {status === GameStatus.IDLE && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm border-2 border-cyan-500/50 p-4">
               <h2 className="text-3xl font-display font-bold text-white mb-6 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">选择接入难度</h2>
               <div className="flex flex-col gap-3 w-full max-w-xs">
                 <CyberButton onClick={() => startGame('EASY')} className="w-full">
                    {DIFFICULTY_CONFIG.EASY.label}
                 </CyberButton>
                 <CyberButton onClick={() => startGame('MEDIUM')} className="w-full">
                    {DIFFICULTY_CONFIG.MEDIUM.label}
                 </CyberButton>
                 <CyberButton onClick={() => startGame('HARD')} variant="danger" className="w-full">
                    {DIFFICULTY_CONFIG.HARD.label}
                 </CyberButton>
               </div>
               {highScore > 0 && (
                 <div className="mt-6 text-yellow-500/80 font-mono text-sm border-t border-yellow-900/50 pt-2 w-full text-center">
                   历史最高纪录: {highScore}
                 </div>
               )}
             </div>
          )}

          {status === GameStatus.GAME_OVER && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md border-2 border-red-500/50 p-6">
               <h2 className="text-5xl font-display font-bold text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">致命错误</h2>
               <p className="text-red-300 font-mono mb-6 tracking-widest">系统崩溃 // 连接中断</p>
               
               <div className="mb-8 text-center w-full">
                 <div className="text-cyan-600 text-xs uppercase tracking-widest mb-1">本次得分</div>
                 <div className="text-4xl font-bold text-white mb-2">{score}</div>
                 {score >= highScore && score > 0 && (
                   <div className="text-yellow-400 text-sm animate-pulse flex items-center gap-1 justify-center">
                     <Trophy size={14} /> 新纪录!
                   </div>
                 )}
               </div>

               <div className="flex flex-col gap-3 w-full max-w-[240px]">
                 <CyberButton variant="primary" onClick={handleShare}>
                    <div className="flex items-center justify-center gap-2">
                       <Share2 size={16} />
                       {isCopied ? "已复制数据" : "分享战绩"}
                    </div>
                 </CyberButton>
                 <CyberButton variant="danger" onClick={resetToMenu}>系统重启</CyberButton>
               </div>
             </div>
          )}
        </div>

        {/* Mobile Controls (Visual/Functional fallback) */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden w-full max-w-[200px]">
          <div />
          <button 
             className="bg-cyan-900/40 p-4 rounded border border-cyan-600 active:bg-cyan-500 active:text-black transition-colors"
             onClick={() => handleManualControl(Direction.UP)}
          >
            <ArrowUp />
          </button>
          <div />
          <button 
             className="bg-cyan-900/40 p-4 rounded border border-cyan-600 active:bg-cyan-500 active:text-black transition-colors"
             onClick={() => handleManualControl(Direction.LEFT)}
          >
            <ArrowLeft />
          </button>
          <button 
             className="bg-cyan-900/40 p-4 rounded border border-cyan-600 active:bg-cyan-500 active:text-black transition-colors"
             onClick={() => handleManualControl(Direction.DOWN)}
          >
            <ArrowDown />
          </button>
          <button 
             className="bg-cyan-900/40 p-4 rounded border border-cyan-600 active:bg-cyan-500 active:text-black transition-colors"
             onClick={() => handleManualControl(Direction.RIGHT)}
          >
            <ArrowRight />
          </button>
        </div>

        <div className="mt-4 text-xs text-cyan-800 hidden sm:block">
          使用 [W, A, S, D] 键导航数据流
        </div>
      </div>

      {/* RIGHT COLUMN: C0R-T3X AI Log */}
      <div className="w-full lg:w-80 h-64 lg:h-auto flex flex-col border border-cyan-800 bg-black/50 backdrop-blur relative overflow-hidden rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="bg-cyan-900/20 p-3 border-b border-cyan-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
             <Cpu size={18} />
             <span className="font-display font-bold text-sm tracking-wider">C0R-T3X 神经连接</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-75"></div>
          </div>
        </div>
        
        {/* Log Body */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 relative">
           <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
           
           {logs.length === 0 && (
             <div className="text-cyan-900 italic opacity-50 text-center mt-10">等待神经信号输入...</div>
           )}

           {logs.map((log) => (
             <div key={log.id} className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <span className="text-[10px] opacity-40 mb-0.5 text-cyan-600">
                  [{new Date(log.timestamp).toISOString().slice(11, 23)}]
                </span>
                <div className={`
                  p-2 rounded border-l-2 
                  ${log.type === 'ai' ? 'border-fuchsia-500 bg-fuchsia-900/10 text-fuchsia-100' : 'border-cyan-500 bg-cyan-900/10 text-cyan-100'}
                `}>
                  {log.type === 'ai' && <span className="text-fuchsia-500 font-bold mr-2">C0R-T3X:</span>}
                  {log.type === 'system' && <span className="text-cyan-500 font-bold mr-2">SYS:</span>}
                  {log.message}
                </div>
             </div>
           ))}
        </div>

        {/* Input Simulation (Visual only) */}
        <div className="p-2 bg-black border-t border-cyan-900 text-cyan-700 text-xs flex items-center gap-2">
           <span>{'>'}</span>
           <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};

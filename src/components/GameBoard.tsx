import React, { useMemo } from 'react';
import { Position, GridSize, EvolutionStage } from '../types';

interface GameBoardProps {
  gridSize: GridSize;
  snake: Position[];
  food: Position | null;
  isGameOver: boolean;
  evolutionStage: EvolutionStage;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gridSize, snake, food, isGameOver, evolutionStage }) => {
  
  const cells = useMemo(() => {
    return Array.from({ length: gridSize.rows * gridSize.cols });
  }, [gridSize]);

  const getHeadStyle = () => {
    if (snake.length < 2) return { transform: 'rotate(0deg)' };
    const head = snake[0];
    const neck = snake[1];
    let r = 0;
    if (head.x > neck.x) r = 90;
    else if (head.x < neck.x) r = -90;
    else if (head.y > neck.y) r = 180;
    else if (head.y < neck.y) r = 0;
    return { transform: `rotate(${r}deg)` };
  };

  return (
    <div 
      className="relative grid bg-[#080808] border-2 border-cyan-900/50 shadow-[0_0_30px_rgba(0,255,255,0.1)] rounded-sm overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`,
        aspectRatio: `${gridSize.cols}/${gridSize.rows}`,
        width: '100%',
        maxWidth: '500px',
      }}
    >
      {/* 网格背景线 */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${100/gridSize.cols}% ${100/gridSize.rows}%`
        }}
      />

      {cells.map((_, i) => {
        const x = i % gridSize.cols;
        const y = Math.floor(i / gridSize.cols);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = snake.some((s, idx) => idx > 0 && s.x === x && s.y === y);
        const isFood = food?.x === x && food?.y === y;

        return (
          <div key={i} className="relative z-10 w-full h-full flex items-center justify-center">
            {isBody && (
              <div className={`w-[90%] h-[90%] rounded-sm opacity-80 transition-colors duration-500 ${evolutionStage.colorBody} ${evolutionStage.shadow}`} />
            )}
            
            {isHead && (
              <div 
                className={`w-full h-full z-20 relative transition-colors duration-500 rounded-t-md ${isGameOver ? 'animate-pulse bg-red-500 shadow-red-500' : `${evolutionStage.colorHead} ${evolutionStage.shadow}`}`}
                style={getHeadStyle()}
              >
                 <div className={`absolute inset-0 opacity-50 animate-ping ${evolutionStage.colorBody}`}></div>
                 <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-black rounded-full border border-white/50" />
                 <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-black rounded-full border border-white/50" />
              </div>
            )}

            {isFood && (
              <div className="relative w-[70%] h-[70%]">
                <div className="absolute inset-0 bg-fuchsia-500 rotate-45 transform animate-pulse shadow-[0_0_10px_#d946ef]"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
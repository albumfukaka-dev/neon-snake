
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
  
  // Memoize grid cells to avoid recalculating creating array every render
  const cells = useMemo(() => {
    return Array.from({ length: gridSize.rows * gridSize.cols });
  }, [gridSize]);

  // Check if a cell is part of the snake
  const getSnakeSegmentIndex = (x: number, y: number) => {
    return snake.findIndex(segment => segment.x === x && segment.y === y);
  };

  // Helper to determine head rotation
  const getHeadStyle = () => {
    if (snake.length < 2) return { transform: 'rotate(0deg)' };
    
    const head = snake[0];
    const neck = snake[1];
    
    let rotation = 0;
    if (head.x > neck.x) rotation = 90;      // Moving Right
    else if (head.x < neck.x) rotation = -90; // Moving Left
    else if (head.y > neck.y) rotation = 180; // Moving Down
    else if (head.y < neck.y) rotation = 0;   // Moving Up

    return { transform: `rotate(${rotation}deg)` };
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
      {/* Grid Lines Overlay */}
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
        const snakeIndex = getSnakeSegmentIndex(x, y);
        const isFood = food?.x === x && food?.y === y;
        const isHead = snakeIndex === 0;
        const isBody = snakeIndex > 0;

        return (
          <div key={`${x}-${y}`} className="relative z-10 w-full h-full flex items-center justify-center">
            {/* Snake Segment */}
            {isBody && (
              <div className={`w-[90%] h-[90%] rounded-sm opacity-80 transition-colors duration-500 ${evolutionStage.colorBody} ${evolutionStage.shadow}`} />
            )}
            
            {/* Snake Head (Enhanced) */}
            {isHead && (
              <div 
                className={`w-full h-full z-20 relative transition-colors duration-500 rounded-t-md ${isGameOver ? 'animate-pulse bg-red-500 shadow-red-500' : `${evolutionStage.colorHead} ${evolutionStage.shadow}`}`}
                style={getHeadStyle()}
              >
                 {/* Internal Glow */}
                 <div className={`absolute inset-0 opacity-50 animate-ping ${evolutionStage.colorBody}`}></div>
                 
                 {/* Eyes */}
                 <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-black rounded-full border border-white/50 shadow-[0_0_2px_white]" />
                 <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-black rounded-full border border-white/50 shadow-[0_0_2px_white]" />
              </div>
            )}

            {/* Food */}
            {isFood && (
              <div className="relative w-[70%] h-[70%]">
                <div className="absolute inset-0 bg-fuchsia-500 rotate-45 transform animate-pulse shadow-[0_0_10px_#d946ef]"></div>
                <div className="absolute inset-0 border border-fuchsia-300 rotate-12 transform scale-125 opacity-50"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

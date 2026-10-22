import React from 'react';
import { BlockDefinition, Coord } from '../engine/types';

interface BlockPieceProps {
  block: BlockDefinition;
  cells: Coord[];
  isPlaced: boolean;
  isAllowed: boolean;
  onRotate: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}

export const BlockPiece: React.FC<BlockPieceProps> = ({
  block,
  cells,
  isPlaced,
  isAllowed,
  onRotate,
  onPointerDown,
}) => {
  const maxX = Math.max(...cells.map(([x]) => x));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const cols = maxX + 1;
  const rows = maxY + 1;

  const colorStyles: Record<string, string> = {
    red: 'bg-red-500 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    yellow: 'bg-yellow-400 border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.5)]',
    blue: 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    green: 'bg-green-500 border-green-300 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
  };

  const occupiedSet = new Set(cells.map(([x, y]) => `${x},${y}`));

  return (
    <div
      onPointerDown={(e) => {
        if (!isAllowed || isPlaced) return;
        onPointerDown(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isAllowed || isPlaced) return;
        onRotate();
      }}
      className={`relative p-2 rounded-xl transition-all select-none touch-none cursor-grab active:cursor-grabbing ${
        !isAllowed ? 'opacity-25 grayscale pointer-events-none' : isPlaced ? 'opacity-30' : 'hover:scale-105 active:scale-95'
      }`}
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, 20px)`,
          gridTemplateRows: `repeat(${rows}, 20px)`,
        }}
      >
        {Array.from({ length: rows }).map((_, y) =>
          Array.from({ length: cols }).map((_, x) => {
            const hasCell = occupiedSet.has(`${x},${y}`);
            return (
              <div
                key={`${x},${y}`}
                className={`w-5 h-5 rounded-md ${
                  hasCell ? `${colorStyles[block.color]} border` : 'bg-transparent'
                }`}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

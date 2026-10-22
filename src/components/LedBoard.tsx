import React from 'react';
import { Coord, PlacedBlock } from '../engine/types';

interface LedBoardProps {
  targetMask: bigint;
  placedBlocks: PlacedBlock[];
  errorCoords: Coord[];
  isVictorious: boolean;
  hintCells?: Coord[];
  onGridClick?: (x: number, y: number) => void;
}

export const LedBoard: React.FC<LedBoardProps> = ({
  targetMask,
  placedBlocks,
  errorCoords,
  isVictorious,
  hintCells = [],
  onGridClick,
}) => {
  const gridCells = [];

  const occupiedMap = new Map<string, string>();
  for (const block of placedBlocks) {
    for (const [x, y] of block.cells) {
      occupiedMap.set(`${x},${y}`, block.color);
    }
  }

  const errorSet = new Set(errorCoords.map(([x, y]) => `${x},${y}`));
  const hintSet = new Set(hintCells.map(([x, y]) => `${x},${y}`));

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const bitIndex = BigInt(y * 8 + x);
      const isTarget = (targetMask & (1n << bitIndex)) !== 0n;
      const key = `${x},${y}`;
      const placedColor = occupiedMap.get(key);
      const isError = errorSet.has(key);
      const isHint = hintSet.has(key);

      let cellStyle = "bg-[#181d24] border border-[#232a35]"; // 灭灯状态
      let glowClass = "";

      if (isError) {
        cellStyle = "bg-red-500 border-red-300 animate-pulse";
        glowClass = "shadow-[0_0_12px_rgba(239,68,68,0.9)]";
      } else if (placedColor) {
        // 积木覆盖发光
        const colorBgMap: Record<string, string> = {
          red: 'bg-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.7)]',
          yellow: 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.7)]',
          blue: 'bg-blue-500 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.7)]',
          green: 'bg-green-500 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.7)]',
        };
        cellStyle = colorBgMap[placedColor] || 'bg-slate-300';
      } else if (isTarget) {
        // 题目点亮目标格 (计客经典的冰蓝冷光)
        cellStyle = "bg-[#38bdf8] border-[#bae6fd] shadow-[0_0_12px_rgba(56,189,248,0.85)]";
      } else if (isHint) {
        cellStyle = "bg-sky-500/40 border-dashed border-sky-300 animate-pulse";
      }

      if (isVictorious) {
        glowClass = "shadow-[0_0_16px_rgba(255,255,255,0.9)] brightness-125 animate-bounce";
      }

      gridCells.push(
        <div
          key={key}
          onClick={() => onGridClick?.(x, y)}
          data-grid-x={x}
          data-grid-y={y}
          className={`relative rounded-md flex items-center justify-center transition-all duration-150 aspect-square ${cellStyle} ${glowClass}`}
        >
          {/* 仿真 LED 导光小圆芯 */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />
        </div>
      );
    }
  }

  return (
    <div className="p-3 bg-[#111317] border-4 border-[#2b2f38] rounded-2xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.9),0_2px_8px_rgba(255,255,255,0.05)]">
      <div className="grid grid-cols-8 gap-1.5 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {gridCells}
      </div>
    </div>
  );
};

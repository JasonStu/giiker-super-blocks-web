import { forwardRef } from 'react';
import { Coord, PlacedBlock } from '../engine/types';

interface LedBoardProps {
  targetMask: bigint;
  placedBlocks: PlacedBlock[];
  errorCoords: Coord[];
  isVictorious: boolean;
  hintCells?: Coord[];
  ghostCells?: Coord[];
  ghostValid?: boolean;
  onGridClick?: (x: number, y: number) => void;
  onGridDoubleClick?: (x: number, y: number) => void;
}

export const LedBoard = forwardRef<HTMLDivElement, LedBoardProps>(({
  targetMask,
  placedBlocks,
  errorCoords,
  isVictorious,
  hintCells = [],
  ghostCells = [],
  ghostValid = true,
  onGridClick,
  onGridDoubleClick,
}, ref) => {
  const gridCells = [];

  const occupiedMap = new Map<string, { color: string; id: string }>();
  for (const block of placedBlocks) {
    for (const [x, y] of block.cells) {
      occupiedMap.set(`${x},${y}`, { color: block.color, id: block.id });
    }
  }

  const errorSet = new Set(errorCoords.map(([x, y]) => `${x},${y}`));
  const hintSet = new Set(hintCells.map(([x, y]) => `${x},${y}`));
  const ghostSet = new Set(ghostCells.map(([x, y]) => `${x},${y}`));

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const bitIndex = BigInt(y * 8 + x);
      const isTarget = (targetMask & (1n << bitIndex)) !== 0n;
      const key = `${x},${y}`;
      const placed = occupiedMap.get(key);
      const isError = errorSet.has(key);
      const isHint = hintSet.has(key);
      const isGhost = ghostSet.has(key);

      let cellStyle = "bg-[#181d24] border border-[#232a35]"; // 灭灯状态
      let glowClass = "";

      if (isError) {
        cellStyle = "bg-red-500 border-red-300 animate-pulse";
        glowClass = "shadow-[0_0_12px_rgba(239,68,68,0.9)]";
      } else if (placed) {
        // 积木覆盖发光
        const colorBgMap: Record<string, string> = {
          red: 'bg-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.7)]',
          yellow: 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.7)]',
          blue: 'bg-blue-500 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.7)]',
          green: 'bg-green-500 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.7)]',
        };
        cellStyle = colorBgMap[placed.color] || 'bg-slate-300';
      } else if (isGhost) {
        // 拖拽悬停时的实时磁吸投影高亮
        cellStyle = ghostValid
          ? "bg-emerald-400/50 border-2 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          : "bg-rose-500/50 border-2 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.8)]";
      } else if (isTarget) {
        // 题目点亮目标格 (计客经典的冰蓝冷光)
        cellStyle = "bg-[#38bdf8] border-[#bae6fd] shadow-[0_0_12px_rgba(56,189,248,0.85)]";
      } else if (isHint) {
        cellStyle = "bg-amber-400/60 border-2 border-dashed border-amber-300 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]";
      }

      if (isVictorious) {
        glowClass = "shadow-[0_0_16px_rgba(255,255,255,0.9)] brightness-125 animate-bounce";
      }

      gridCells.push(
        <div
          key={key}
          onClick={() => onGridClick?.(x, y)}
          onDoubleClick={() => onGridDoubleClick?.(x, y)}
          data-grid-x={x}
          data-grid-y={y}
          className={`relative rounded-md flex items-center justify-center transition-all duration-100 aspect-square select-none cursor-pointer ${cellStyle} ${glowClass}`}
        >
          {/* 仿真 LED 导光小圆芯 */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />

          {/* 若为积木，悬浮时轻微提示双击取下 */}
          {placed && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-md">
              <span className="text-[9px] text-white/80 font-bold">×</span>
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="p-3 bg-[#111317] border-4 border-[#2b2f38] rounded-2xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.9),0_2px_8px_rgba(255,255,255,0.05)]">
      {/* 内部精准 8x8 网格，由 ref 捕获准确尺寸与位置 */}
      <div
        ref={ref}
        className="grid grid-cols-8 gap-1.5 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 touch-none"
      >
        {gridCells}
      </div>
    </div>
  );
});

LedBoard.displayName = 'LedBoard';

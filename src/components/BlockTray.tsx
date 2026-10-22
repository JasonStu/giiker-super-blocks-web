import React, { useState } from 'react';
import { BlockId, BlockColor, Coord } from '../engine/types';
import { BLOCKS_8, rotateClockwise } from '../engine/polyominoes';
import { BlockPiece } from './BlockPiece';

interface BlockTrayProps {
  allowedColors: BlockColor[];
  placedBlockIds: Set<BlockId>;
  onStartDrag: (blockId: BlockId, cells: Coord[], clientX: number, clientY: number) => void;
}

export const BlockTray: React.FC<BlockTrayProps> = ({
  allowedColors,
  placedBlockIds,
  onStartDrag,
}) => {
  const [rotations, setRotations] = useState<Record<BlockId, Coord[]>>(() => {
    const init: Record<string, Coord[]> = {};
    for (const [id, block] of Object.entries(BLOCKS_8)) {
      init[id] = block.cells;
    }
    return init as Record<BlockId, Coord[]>;
  });

  const handleRotate = (id: BlockId) => {
    setRotations((prev) => ({
      ...prev,
      [id]: rotateClockwise(prev[id]),
    }));
  };

  const blocks = Object.values(BLOCKS_8);

  return (
    <div className="w-full max-w-md lg:max-w-sm p-4 bg-[#14171d]/95 border-2 border-[#262b35] rounded-3xl shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-300 tracking-wider">BLOCK TRAY</span>
          <span className="px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-[10px] text-sky-400 font-mono">
            8 PIECES
          </span>
        </div>
        <span className="text-[11px] text-slate-400">点击旋转 / 拖拽上盘</span>
      </div>

      {/* 8 块积木自适应网格，iPad / 桌面上一屏尽览无需滚动 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 p-1">
        {blocks.map((block) => {
          const isAllowed = allowedColors.includes(block.color);
          const isPlaced = placedBlockIds.has(block.id);
          const cells = rotations[block.id] || block.cells;

          return (
            <div
              key={block.id}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                isAllowed
                  ? 'bg-[#1b1f28] border-[#2c3342] shadow-sm'
                  : 'bg-[#15171d] border-[#20242e] opacity-35'
              }`}
            >
              <BlockPiece
                block={block}
                cells={cells}
                isPlaced={isPlaced}
                isAllowed={isAllowed}
                onRotate={() => handleRotate(block.id)}
                onPointerDown={(e) => {
                  onStartDrag(block.id, cells, e.clientX, e.clientY);
                }}
              />
              <span className="text-[10px] text-slate-400 mt-1 font-sans">
                {block.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

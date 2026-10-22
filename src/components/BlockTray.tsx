import React, { useState } from 'react';
import { BlockId, BlockColor, Coord } from '../engine/types';
import { BLOCKS_16, rotateClockwise } from '../engine/polyominoes';
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
    for (const [id, block] of Object.entries(BLOCKS_16)) {
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

  const blocks = Object.values(BLOCKS_16);

  return (
    <div className="w-full max-w-md lg:max-w-xs p-4 bg-[#14171d] border-2 border-[#262b35] rounded-3xl shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="text-xs font-bold text-slate-400 tracking-wider">BLOCK TRAY (16 PIECES)</span>
        <span className="text-xs text-sky-400">点击旋转 / 拖拽上盘</span>
      </div>

      {/* 四色分组容器 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto p-1">
        {blocks.map((block) => {
          const isAllowed = allowedColors.includes(block.color);
          const isPlaced = placedBlockIds.has(block.id);
          const cells = rotations[block.id] || block.cells;

          return (
            <div
              key={block.id}
              className="flex items-center justify-center p-2 bg-[#1b1f27] border border-[#2d3442] rounded-2xl"
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

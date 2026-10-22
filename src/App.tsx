import React, { useState, useEffect, useRef } from 'react';
import { BUILTIN_LEVELS } from './engine/levels';
import { BlockId, Coord, PlacedBlock } from './engine/types';
import { BLOCKS_16, rotateClockwise } from './engine/polyominoes';
import { coordsToBitmask, validatePlacement, checkVictory } from './engine/bitboard';
import { findSolution } from './engine/solver';
import { soundEngine } from './audio/soundEngine';
import { fireworksEngine } from './fx/fireworks';
import { ConsoleShell } from './components/ConsoleShell';
import { LedBoard } from './components/LedBoard';
import { BlockTray } from './components/BlockTray';
import { FireworksOverlay } from './components/FireworksOverlay';

interface DragState {
  blockId: BlockId;
  cells: Coord[];
  startX: number;
  startY: number;
  currX: number;
  currY: number;
}

export const App: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = BUILTIN_LEVELS[levelIndex];

  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [errorCoords, setErrorCoords] = useState<Coord[]>([]);
  const [hintCells, setHintCells] = useState<Coord[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 拖拽手势状态
  const [dragState, setDragState] = useState<DragState | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  // 切关或重置时清空状态
  const resetLevel = () => {
    setPlacedBlocks([]);
    setErrorCoords([]);
    setHintCells([]);
    setIsWon(false);
  };

  const handleNextLevel = () => {
    soundEngine.playClick();
    if (levelIndex < BUILTIN_LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
      resetLevel();
    }
  };

  const handlePrevLevel = () => {
    soundEngine.playClick();
    if (levelIndex > 0) {
      setLevelIndex(levelIndex - 1);
      resetLevel();
    }
  };

  // 提示模式 (Learn/Hint)
  const handleHint = () => {
    soundEngine.playClick();
    const solution = findSolution(currentLevel.targetMask, currentLevel.allowedColors);
    if (!solution || solution.length === 0) return;

    // 找到尚未放置的第一块解法积木并高亮其格子
    const placedSet = new Set(placedBlocks.map((b) => b.id));
    const nextPiece = solution.find((b) => !placedSet.has(b.id));
    if (nextPiece) {
      setHintCells(nextPiece.cells);
      setTimeout(() => setHintCells([]), 3500);
    }
  };

  // 处理盘面积木点击：如果已上盘，再次点击进行顺时针旋转；若旋转越界则弹回或取下
  const handleGridCellClick = (x: number, y: number) => {
    soundEngine.init();
    const clickedBlockIndex = placedBlocks.findIndex((b) =>
      b.cells.some(([cx, cy]) => cx === x && cy === y)
    );
    if (clickedBlockIndex === -1) return;

    const targetBlock = placedBlocks[clickedBlockIndex];
    const rotated = rotateClockwise(targetBlock.cells.map(([cx, cy]) => [cx - targetBlock.rootX, cy - targetBlock.rootY] as Coord));
    const newAbsolute: Coord[] = rotated.map(([cx, cy]) => [cx + targetBlock.rootX, cy + targetBlock.rootY]);

    const otherBlocks = placedBlocks.filter((_, idx) => idx !== clickedBlockIndex);
    let otherMask = 0n;
    for (const b of otherBlocks) otherMask |= coordsToBitmask(b.cells);

    const validation = validatePlacement(
      otherMask,
      currentLevel.targetMask,
      newAbsolute,
      targetBlock.color,
      currentLevel.allowedColors
    );

    if (validation.valid) {
      soundEngine.playClick();
      const updated = [...otherBlocks, { ...targetBlock, cells: newAbsolute }];
      setPlacedBlocks(updated);
      checkVictoryState(updated);
    } else {
      // 无法原地旋转则移除放回托盘
      soundEngine.playClick();
      setPlacedBlocks(otherBlocks);
    }
  };

  const checkVictoryState = (blocks: PlacedBlock[]) => {
    if (checkVictory(blocks, currentLevel.targetMask, currentLevel.allowedColors)) {
      setIsWon(true);
      soundEngine.playVictory(currentLevel.difficulty);
      fireworksEngine.launch(currentLevel.difficulty);
      setTimeout(() => {
        if (levelIndex < BUILTIN_LEVELS.length - 1) {
          setLevelIndex((prev) => prev + 1);
          resetLevel();
        }
      }, 4000);
    }
  };

  // 开始拖拽
  const handleStartDrag = (blockId: BlockId, cells: Coord[], clientX: number, clientY: number) => {
    soundEngine.init();
    soundEngine.playClick();
    setDragState({
      blockId,
      cells,
      startX: clientX,
      startY: clientY,
      currX: clientX,
      currY: clientY,
    });
  };

  // 全局 Pointer 事件追踪
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;
      setDragState((prev) => (prev ? { ...prev, currX: e.clientX, currY: e.clientY } : null));
    };

    const handlePointerUp = () => {
      if (!dragState) return;
      const { blockId, cells, currX, currY } = dragState;
      setDragState(null);

      if (!boardContainerRef.current) return;
      const boardRect = boardContainerRef.current.getBoundingClientRect();

      // iPad 体验：指尖上方 24px 视线偏移补偿（Review Focus 1）
      const touchAdjustedY = currY - 24;

      // 判断是否释放于 8x8 盘面区域
      if (
        currX >= boardRect.left &&
        currX <= boardRect.right &&
        touchAdjustedY >= boardRect.top &&
        touchAdjustedY <= boardRect.bottom
      ) {
        const cellSize = boardRect.width / 8;
        const gridX = Math.floor((currX - boardRect.left) / cellSize);
        const gridY = Math.floor((touchAdjustedY - boardRect.top) / cellSize);

        const absoluteCells: Coord[] = cells.map(([cx, cy]) => [cx + gridX, cy + gridY]);
        const blockDef = BLOCKS_16[blockId];

        let currentBoardMask = 0n;
        for (const b of placedBlocks) currentBoardMask |= coordsToBitmask(b.cells);

        const validation = validatePlacement(
          currentBoardMask,
          currentLevel.targetMask,
          absoluteCells,
          blockDef.color,
          currentLevel.allowedColors
        );

        if (validation.valid) {
          soundEngine.playSnap();
          const newPlaced: PlacedBlock = {
            id: blockId,
            color: blockDef.color,
            rootX: gridX,
            rootY: gridY,
            rotation: 0,
            cells: absoluteCells,
          };
          const nextBlocks = [...placedBlocks, newPlaced];
          setPlacedBlocks(nextBlocks);
          checkVictoryState(nextBlocks);
        } else {
          soundEngine.playError();
          setErrorCoords(absoluteCells);
          setTimeout(() => setErrorCoords([]), 600);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, placedBlocks, currentLevel, levelIndex]);

  const placedBlockIds = new Set(placedBlocks.map((b) => b.id));

  return (
    <div className="relative min-h-screen w-full bg-[#0d0f14] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none touch-none">
      <FireworksOverlay />

      {/* iPad 横竖自适应容器 */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 w-full max-w-6xl">
        {/* 掌机机身核心区 */}
        <ConsoleShell
          level={currentLevel}
          onPrev={handlePrevLevel}
          onNext={handleNextLevel}
          onReset={resetLevel}
          onHint={handleHint}
          isMuted={isMuted}
          onToggleSound={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            soundEngine.setMuted(nextMuted);
          }}
        >
          <div ref={boardContainerRef} className="relative">
            <LedBoard
              targetMask={currentLevel.targetMask}
              placedBlocks={placedBlocks}
              errorCoords={errorCoords}
              hintCells={hintCells}
              isVictorious={isWon}
              onGridClick={handleGridCellClick}
            />
          </div>
        </ConsoleShell>

        {/* 积木选择与备选舱 */}
        <BlockTray
          allowedColors={currentLevel.allowedColors}
          placedBlockIds={placedBlockIds}
          onStartDrag={handleStartDrag}
        />
      </div>

      {/* 拖拽浮动预览 */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transition-none"
          style={{
            left: dragState.currX,
            top: dragState.currY - 24,
            transform: 'translate(-50%, -50%) scale(1.1)',
          }}
        >
          <div
            className="grid gap-1 p-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${Math.max(...dragState.cells.map(([x]) => x)) + 1}, 28px)`,
              gridTemplateRows: `repeat(${Math.max(...dragState.cells.map(([, y]) => y)) + 1}, 28px)`,
            }}
          >
            {Array.from({ length: Math.max(...dragState.cells.map(([, y]) => y)) + 1 }).map((_, y) =>
              Array.from({ length: Math.max(...dragState.cells.map(([x]) => x)) + 1 }).map((_, x) => {
                const hasCell = dragState.cells.some(([cx, cy]) => cx === x && cy === y);
                const color = BLOCKS_16[dragState.blockId].color;
                const colorMap = {
                  red: 'bg-red-500 border-red-300',
                  yellow: 'bg-yellow-400 border-yellow-200',
                  blue: 'bg-blue-500 border-blue-300',
                  green: 'bg-green-500 border-green-300',
                }[color];
                return (
                  <div
                    key={`${x},${y}`}
                    className={`w-7 h-7 rounded-lg ${
                      hasCell ? `${colorMap} border shadow-lg` : 'bg-transparent'
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

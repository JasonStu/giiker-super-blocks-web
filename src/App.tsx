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
import { ArrowRight } from 'lucide-react';

interface DragState {
  blockId: BlockId;
  cells: Coord[];
  startX: number;
  startY: number;
  currX: number;
  currY: number;
  pointerType: string;
}

export const App: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = BUILTIN_LEVELS[levelIndex];

  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [errorCoords, setErrorCoords] = useState<Coord[]>([]);
  const [hintCells, setHintCells] = useState<Coord[]>([]);
  const [ghostCells, setGhostCells] = useState<Coord[]>([]);
  const [ghostValid, setGhostValid] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 拖拽手势状态
  const [dragState, setDragState] = useState<DragState | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 切关或重置时清空状态
  const resetLevel = () => {
    setPlacedBlocks([]);
    setErrorCoords([]);
    setHintCells([]);
    setGhostCells([]);
    setIsWon(false);
  };

  const handleNextLevel = () => {
    soundEngine.playClick();
    setLevelIndex((prev) => {
      if (prev < BUILTIN_LEVELS.length - 1) {
        resetLevel();
        return prev + 1;
      }
      return prev;
    });
  };

  const handlePrevLevel = () => {
    soundEngine.playClick();
    setLevelIndex((prev) => {
      if (prev > 0) {
        resetLevel();
        return prev - 1;
      }
      return prev;
    });
  };

  // 提示模式 (Learn/Hint)
  const handleHint = () => {
    soundEngine.playClick();
    const solution = findSolution(currentLevel.targetMask, currentLevel.allowedColors);
    if (!solution || solution.length === 0) {
      showToast("此关卡解法探索中或无可提示积木");
      return;
    }

    // 找到尚未放置的第一块解法积木并高亮其格子
    const placedSet = new Set(placedBlocks.map((b) => b.id));
    const nextPiece = solution.find((b) => !placedSet.has(b.id));
    if (nextPiece) {
      setHintCells(nextPiece.cells);
      showToast(`提示：请尝试摆放【${BLOCKS_16[nextPiece.id].name}】`);
      setTimeout(() => setHintCells([]), 4000);
    } else {
      showToast("所有必要积木已全部放置！");
    }
  };

  // 处理盘面积木双击：直接取下放回托盘
  const handleGridCellDoubleClick = (x: number, y: number) => {
    soundEngine.init();
    const clickedBlockIndex = placedBlocks.findIndex((b) =>
      b.cells.some(([cx, cy]) => cx === x && cy === y)
    );
    if (clickedBlockIndex === -1) return;

    soundEngine.playClick();
    const removed = placedBlocks[clickedBlockIndex];
    setPlacedBlocks((prev) => prev.filter((_, idx) => idx !== clickedBlockIndex));
    showToast(`已取下 ${BLOCKS_16[removed.id].name}`);
  };

  // 处理盘面积木单击：尝试顺时针旋转，无法旋转时报错保留，严禁擅自删除
  const handleGridCellClick = (x: number, y: number) => {
    soundEngine.init();
    const clickedBlockIndex = placedBlocks.findIndex((b) =>
      b.cells.some(([cx, cy]) => cx === x && cy === y)
    );
    if (clickedBlockIndex === -1) return;

    const targetBlock = placedBlocks[clickedBlockIndex];
    const rotatedRelative = rotateClockwise(
      targetBlock.cells.map(([cx, cy]) => [cx - targetBlock.rootX, cy - targetBlock.rootY] as Coord)
    );
    const newAbsolute: Coord[] = rotatedRelative.map(([cx, cy]) => [cx + targetBlock.rootX, cy + targetBlock.rootY]);

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
      // 无法旋转：仅报警抖动，严禁删除已放置积木
      soundEngine.playError();
      setErrorCoords(targetBlock.cells);
      setTimeout(() => setErrorCoords([]), 400);
      showToast("空间受限无法旋转（双击可取下）");
    }
  };

  const checkVictoryState = (blocks: PlacedBlock[]) => {
    if (checkVictory(blocks, currentLevel.targetMask, currentLevel.allowedColors)) {
      setIsWon(true);
      soundEngine.playVictory(currentLevel.difficulty);
      fireworksEngine.launch(currentLevel.difficulty);
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
      pointerType: 'mouse',
    });
  };

  // 全局 Pointer 事件追踪与精准对齐磁吸计算
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;
      const pointerType = e.pointerType || dragState.pointerType;
      const currX = e.clientX;
      const currY = e.clientY;

      setDragState((prev) => (prev ? { ...prev, currX, currY, pointerType } : null));

      // 实时计算悬停磁吸 Ghost 投影
      if (!gridContainerRef.current) {
        setGhostCells([]);
        return;
      }

      const gridRect = gridContainerRef.current.getBoundingClientRect();
      const isTouch = pointerType === 'touch';
      const touchAdjustedY = isTouch ? currY - 24 : currY;

      // 判断光标是否在网格范围内或接近网格
      if (
        currX >= gridRect.left - 20 &&
        currX <= gridRect.right + 20 &&
        touchAdjustedY >= gridRect.top - 20 &&
        touchAdjustedY <= gridRect.bottom + 20
      ) {
        const cellSize = gridRect.width / 8;
        const maxX = Math.max(...dragState.cells.map(([x]) => x));
        const maxY = Math.max(...dragState.cells.map(([, y]) => y));

        // 几何中心对齐换算为左上角 (0, 0) 网格索引
        const gridX = Math.round((currX - gridRect.left) / cellSize - (maxX + 1) / 2);
        const gridY = Math.round((touchAdjustedY - gridRect.top) / cellSize - (maxY + 1) / 2);

        const absoluteCells: Coord[] = dragState.cells.map(([cx, cy]) => [cx + gridX, cy + gridY]);
        const blockDef = BLOCKS_16[dragState.blockId];

        let currentBoardMask = 0n;
        for (const b of placedBlocks) currentBoardMask |= coordsToBitmask(b.cells);

        const validation = validatePlacement(
          currentBoardMask,
          currentLevel.targetMask,
          absoluteCells,
          blockDef.color,
          currentLevel.allowedColors
        );

        setGhostCells(absoluteCells);
        setGhostValid(validation.valid);
      } else {
        setGhostCells([]);
      }
    };

    const handlePointerUp = () => {
      if (!dragState) return;
      const { blockId, cells, currX, currY, pointerType } = dragState;
      setDragState(null);
      setGhostCells([]);

      if (!gridContainerRef.current) return;
      const gridRect = gridContainerRef.current.getBoundingClientRect();

      const isTouch = pointerType === 'touch';
      const touchAdjustedY = isTouch ? currY - 24 : currY;

      // 判定是否释放在有效 8x8 棋盘内
      if (
        currX >= gridRect.left - 10 &&
        currX <= gridRect.right + 10 &&
        touchAdjustedY >= gridRect.top - 10 &&
        touchAdjustedY <= gridRect.bottom + 10
      ) {
        const cellSize = gridRect.width / 8;
        const maxX = Math.max(...cells.map(([x]) => x));
        const maxY = Math.max(...cells.map(([, y]) => y));

        // 精准几何中心对齐
        const gridX = Math.round((currX - gridRect.left) / cellSize - (maxX + 1) / 2);
        const gridY = Math.round((touchAdjustedY - gridRect.top) / cellSize - (maxY + 1) / 2);

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
          setTimeout(() => setErrorCoords([]), 500);
          if (validation.reason === 'outside_target') {
            showToast("超出指定发光区域");
          } else if (validation.reason === 'overlap') {
            showToast("与其他积木重叠");
          } else if (validation.reason === 'color_disallowed') {
            showToast("本关不允许使用该颜色");
          } else {
            showToast("超出棋盘边界");
          }
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

      {/* 状态与操作提示气泡 */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-2 bg-slate-800/90 border border-slate-600 rounded-full text-xs font-semibold text-sky-300 shadow-xl backdrop-blur animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

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
          <div className="relative">
            <LedBoard
              ref={gridContainerRef}
              targetMask={currentLevel.targetMask}
              placedBlocks={placedBlocks}
              errorCoords={errorCoords}
              hintCells={hintCells}
              ghostCells={ghostCells}
              ghostValid={ghostValid}
              isVictorious={isWon}
              onGridClick={handleGridCellClick}
              onGridDoubleClick={handleGridCellDoubleClick}
            />

            {/* 通关快捷下一关按钮 */}
            {isWon && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-fade-in z-20 gap-3">
                <span className="text-xl font-extrabold text-amber-300 drop-shadow-md">
                  CHALLENGE CLEARED!
                </span>
                <button
                  onClick={handleNextLevel}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all cursor-pointer"
                >
                  <span>下一关</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </ConsoleShell>

        {/* 积木选择与备选舱 */}
        <div className="flex flex-col gap-2">
          <BlockTray
            allowedColors={currentLevel.allowedColors}
            placedBlockIds={placedBlockIds}
            onStartDrag={handleStartDrag}
          />
          <div className="text-[11px] text-slate-500 text-center font-mono">
            提示：盘面积木点击旋转，双击可取下放回托盘
          </div>
        </div>
      </div>

      {/* 拖拽浮动预览 */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transition-none"
          style={{
            left: dragState.currX,
            top: dragState.pointerType === 'touch' ? dragState.currY - 24 : dragState.currY,
            transform: 'translate(-50%, -50%) scale(1.08)',
          }}
        >
          <div
            className="grid gap-1 p-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl"
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
                  red: 'bg-red-500 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
                  yellow: 'bg-yellow-400 border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.7)]',
                  blue: 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.7)]',
                  green: 'bg-green-500 border-green-300 shadow-[0_0_8px_rgba(34,197,94,0.7)]',
                }[color];
                return (
                  <div
                    key={`${x},${y}`}
                    className={`w-7 h-7 rounded-lg ${
                      hasCell ? `${colorMap} border` : 'bg-transparent'
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

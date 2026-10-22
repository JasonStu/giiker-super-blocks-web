import { BlockId, BlockColor, Coord, PlacedBlock } from './types';
import { BLOCKS_16, rotateClockwise } from './polyominoes';
import { coordsToBitmask, isWithinBounds } from './bitboard';

export function findSolution(targetMask: bigint, allowedColors: BlockColor[]): PlacedBlock[] | null {
  const candidateBlocks = Object.values(BLOCKS_16).filter(b => allowedColors.includes(b.color));
  
  // 预生成所有可用积木在 4 个旋转方向下的相对坐标
  const pieceOrientations: { id: BlockId; color: BlockColor; rotation: 0 | 1 | 2 | 3; cells: Coord[] }[] = [];
  for (const block of candidateBlocks) {
    let cells = block.cells;
    for (let r = 0; r < 4; r++) {
      pieceOrientations.push({
        id: block.id,
        color: block.color,
        rotation: r as 0 | 1 | 2 | 3,
        cells,
      });
      cells = rotateClockwise(cells);
    }
  }

  const solution: PlacedBlock[] = [];
  const usedBlockIds = new Set<BlockId>();

  function search(currentMask: bigint): boolean {
    if (currentMask === targetMask) {
      return true;
    }

    // 找到尚未被覆盖的最小网格索引作为锚点剪枝
    let targetIndex = -1;
    for (let i = 0; i < 64; i++) {
      const bit = 1n << BigInt(i);
      if ((targetMask & bit) !== 0n && (currentMask & bit) === 0n) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) return false;

    const anchorX = targetIndex % 8;
    const anchorY = Math.floor(targetIndex / 8);

    for (const piece of pieceOrientations) {
      if (usedBlockIds.has(piece.id)) continue;

      // 尝试让积木的每个单元格对齐到 anchor 坐标
      for (const [cellX, cellY] of piece.cells) {
        const rootX = anchorX - cellX;
        const rootY = anchorY - cellY;
        const absoluteCells: Coord[] = piece.cells.map(([x, y]) => [x + rootX, y + rootY]);

        if (!isWithinBounds(absoluteCells)) continue;

        const pieceMask = coordsToBitmask(absoluteCells);
        // 不能有重叠，且必须落在 targetMask 内部
        if ((currentMask & pieceMask) === 0n && (pieceMask & ~targetMask) === 0n) {
          usedBlockIds.add(piece.id);
          solution.push({
            id: piece.id,
            color: piece.color,
            rootX,
            rootY,
            rotation: piece.rotation,
            cells: absoluteCells,
          });

          if (search(currentMask | pieceMask)) {
            return true;
          }

          solution.pop();
          usedBlockIds.delete(piece.id);
        }
      }
    }

    return false;
  }

  return search(0n) ? solution : null;
}

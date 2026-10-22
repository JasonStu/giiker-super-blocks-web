import { BlockId, BlockDefinition, Coord } from './types';

export function normalizeCells(cells: Coord[]): Coord[] {
  if (cells.length === 0) return [];
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Coord)
    .sort(([x1, y1], [x2, y2]) => (y1 !== y2 ? y1 - y2 : x1 - x2));
}

export function rotateClockwise(cells: Coord[]): Coord[] {
  // (x, y) 顺时针旋转90°: x' = -y, y' = x
  const rotated = cells.map(([x, y]) => [-y, x] as Coord);
  return normalizeCells(rotated);
}

export const BLOCKS_8: Record<BlockId, BlockDefinition> = {
  // 红色组（2块）
  r1: { id: 'r1', color: 'red', name: '单格点', cells: [[0, 0]] },
  r2: { id: 'r2', color: 'red', name: '四格田', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },

  // 黄色组（2块）
  y1: { id: 'y1', color: 'yellow', name: '双格棒', cells: [[0, 0], [1, 0]] },
  y2: { id: 'y2', color: 'yellow', name: '四格T', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },

  // 蓝色组（2块）
  b1: { id: 'b1', color: 'blue', name: '三格折角', cells: [[0, 0], [1, 0], [0, 1]] },
  b2: { id: 'b2', color: 'blue', name: '四格L', cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },

  // 绿色组（2块）
  g1: { id: 'g1', color: 'green', name: '三格长棒', cells: [[0, 0], [1, 0], [2, 0]] },
  g2: { id: 'g2', color: 'green', name: '四格Z', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
};

// 保持对旧引用别名兼容
export const BLOCKS_16 = BLOCKS_8;

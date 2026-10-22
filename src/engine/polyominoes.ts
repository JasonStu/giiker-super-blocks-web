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

export const BLOCKS_16: Record<BlockId, BlockDefinition> = {
  // 红色组：基础几何
  r1: { id: 'r1', color: 'red', name: '单格点', cells: [[0, 0]] },
  r2: { id: 'r2', color: 'red', name: '双格棒', cells: [[0, 0], [1, 0]] },
  r3: { id: 'r3', color: 'red', name: '小三折', cells: [[0, 0], [1, 0], [0, 1]] },
  r4: { id: 'r4', color: 'red', name: '四格田', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },

  // 黄色组：四格骨牌
  y1: { id: 'y1', color: 'yellow', name: '三格棒', cells: [[0, 0], [1, 0], [2, 0]] },
  y2: { id: 'y2', color: 'yellow', name: '四格T', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  y3: { id: 'y3', color: 'yellow', name: '四格L', cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  y4: { id: 'y4', color: 'yellow', name: '四格Z', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },

  // 蓝色组：扩展四格与五格
  b1: { id: 'b1', color: 'blue', name: '四格长棒', cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  b2: { id: 'b2', color: 'blue', name: '四格拐角', cells: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  b3: { id: 'b3', color: 'blue', name: '五格P', cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  b4: { id: 'b4', color: 'blue', name: '五格W', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },

  // 绿色组：复杂五格
  g1: { id: 'g1', color: 'green', name: '五格十字', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  g2: { id: 'g2', color: 'green', name: '五格U', cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  g3: { id: 'g3', color: 'green', name: '五格长L', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  g4: { id: 'g4', color: 'green', name: '五格V', cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
};

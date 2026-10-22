import { describe, it, expect } from 'vitest';
import { BLOCKS_16, rotateClockwise, normalizeCells } from './polyominoes';

describe('Polyomino Geometry Engine - TDD Verification', () => {
  it('should define exactly 16 blocks across 4 colors (4 each) with unique IDs', () => {
    const blocks = Object.values(BLOCKS_16);
    expect(blocks.length).toBe(16);

    const ids = new Set(blocks.map(b => b.id));
    expect(ids.size).toBe(16);
    
    const reds = blocks.filter(b => b.color === 'red');
    const yellows = blocks.filter(b => b.color === 'yellow');
    const blues = blocks.filter(b => b.color === 'blue');
    const greens = blocks.filter(b => b.color === 'green');

    expect(reds.length).toBe(4);
    expect(yellows.length).toBe(4);
    expect(blues.length).toBe(4);
    expect(greens.length).toBe(4);
  });

  it('should preserve cell count and integrity across all 4 rotation states for all 16 blocks', () => {
    for (const block of Object.values(BLOCKS_16)) {
      const originalCount = block.cells.length;
      let rotated = block.cells;

      for (let r = 0; r < 4; r++) {
        expect(rotated.length).toBe(originalCount);
        // 保证没有重叠塌缩的格子
        const coordSet = new Set(rotated.map(([x, y]) => `${x},${y}`));
        expect(coordSet.size).toBe(originalCount);

        // 保证归一化到 (0, 0) 起始边界
        const minX = Math.min(...rotated.map(([x]) => x));
        const minY = Math.min(...rotated.map(([, y]) => y));
        expect(minX).toBe(0);
        expect(minY).toBe(0);

        rotated = rotateClockwise(rotated);
      }

      // 4次旋转必须与原形状完全一致
      expect(normalizeCells(rotated).sort()).toEqual(normalizeCells(block.cells).sort());
    }
  });

  it('should rotate cells clockwise correctly', () => {
    // 3格L形：[[0,0], [1,0], [0,1]]
    const lShape: [number, number][] = [[0,0], [1,0], [0,1]];
    const rotated = rotateClockwise(lShape);
    
    expect(rotated).toContainEqual([0, 0]);
    expect(rotated.length).toBe(3);
  });
});

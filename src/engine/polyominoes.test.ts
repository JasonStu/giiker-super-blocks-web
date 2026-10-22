import { describe, it, expect } from 'vitest';
import { BLOCKS_16, rotateClockwise, normalizeCells } from './polyominoes';

describe('Polyomino Geometry Engine', () => {
  it('should define exactly 16 blocks across 4 colors (4 each)', () => {
    const blocks = Object.values(BLOCKS_16);
    expect(blocks.length).toBe(16);
    
    const reds = blocks.filter(b => b.color === 'red');
    const yellows = blocks.filter(b => b.color === 'yellow');
    const blues = blocks.filter(b => b.color === 'blue');
    const greens = blocks.filter(b => b.color === 'green');

    expect(reds.length).toBe(4);
    expect(yellows.length).toBe(4);
    expect(blues.length).toBe(4);
    expect(greens.length).toBe(4);
  });

  it('should rotate cells clockwise and stay normalized to (0,0)', () => {
    // 3格L形：[[0,0], [1,0], [0,1]]
    const lShape: [number, number][] = [[0,0], [1,0], [0,1]];
    const rotated = rotateClockwise(lShape);
    
    // 旋转90°: (x, y) -> (-y, x) 归一化后
    expect(rotated).toContainEqual([0, 0]);
    expect(rotated.length).toBe(3);
    
    // 连续旋转4次必须回到初始形状
    let current = lShape;
    for (let i = 0; i < 4; i++) {
      current = rotateClockwise(current);
    }
    expect(normalizeCells(current).sort()).toEqual(normalizeCells(lShape).sort());
  });
});

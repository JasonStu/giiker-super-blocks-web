import { describe, it, expect } from 'vitest';
import { BLOCKS_8, rotateClockwise, normalizeCells } from './polyominoes';

describe('Polyomino Geometry Engine (8 Blocks)', () => {
  it('should define exactly 8 blocks across 4 colors (2 each)', () => {
    const blocks = Object.values(BLOCKS_8);
    expect(blocks.length).toBe(8);

    const ids = new Set(blocks.map(b => b.id));
    expect(ids.size).toBe(8);
    
    const reds = blocks.filter(b => b.color === 'red');
    const yellows = blocks.filter(b => b.color === 'yellow');
    const blues = blocks.filter(b => b.color === 'blue');
    const greens = blocks.filter(b => b.color === 'green');

    expect(reds.length).toBe(2);
    expect(yellows.length).toBe(2);
    expect(blues.length).toBe(2);
    expect(greens.length).toBe(2);
  });

  it('should preserve cell count and integrity across all 4 rotation states for all 8 blocks', () => {
    for (const block of Object.values(BLOCKS_8)) {
      const originalCount = block.cells.length;
      let rotated = block.cells;

      for (let r = 0; r < 4; r++) {
        expect(rotated.length).toBe(originalCount);
        const coordSet = new Set(rotated.map(([x, y]) => `${x},${y}`));
        expect(coordSet.size).toBe(originalCount);

        const minX = Math.min(...rotated.map(([x]) => x));
        const minY = Math.min(...rotated.map(([, y]) => y));
        expect(minX).toBe(0);
        expect(minY).toBe(0);

        rotated = rotateClockwise(rotated);
      }

      expect(normalizeCells(rotated).sort()).toEqual(normalizeCells(block.cells).sort());
    }
  });
});

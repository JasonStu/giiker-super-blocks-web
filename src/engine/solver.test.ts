import { describe, it, expect } from 'vitest';
import { BUILTIN_LEVELS } from './levels';
import { findSolution } from './solver';
import { checkVictory } from './bitboard';

describe('Level Engine & Solver - Full Levels Solvability Test', () => {
  it('every builtin level must be mathematically solvable', () => {
    const unsolvableLevels: number[] = [];

    for (const lvl of BUILTIN_LEVELS) {
      const solution = findSolution(lvl.targetMask, lvl.allowedColors);
      if (!solution) {
        unsolvableLevels.push(lvl.id);
      } else {
        expect(checkVictory(solution, lvl.targetMask, lvl.allowedColors)).toBe(true);
      }
    }

    expect(unsolvableLevels, `Levels that have no solution: ${unsolvableLevels.join(', ')}`).toEqual([]);
  });
});

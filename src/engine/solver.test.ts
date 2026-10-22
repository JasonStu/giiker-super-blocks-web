import { describe, it, expect } from 'vitest';
import { BUILTIN_LEVELS } from './levels';
import { findSolution } from './solver';
import { checkVictory } from './bitboard';

describe('Level Engine & Solver - 100 Levels Full Solvability Test', () => {
  it('should contain exactly 100 levels across 5 difficulty tiers (20 each)', () => {
    expect(BUILTIN_LEVELS.length).toBe(100);

    const counts: Record<string, number> = {
      novice: 0,
      apprentice: 0,
      adept: 0,
      master: 0,
      grandmaster: 0,
    };

    for (const lvl of BUILTIN_LEVELS) {
      counts[lvl.difficulty] = (counts[lvl.difficulty] || 0) + 1;
    }

    expect(counts.novice).toBe(20);
    expect(counts.apprentice).toBe(20);
    expect(counts.adept).toBe(20);
    expect(counts.master).toBe(20);
    expect(counts.grandmaster).toBe(20);
  });

  it('every one of the 100 levels must be 100% mathematically solvable', () => {
    const unsolvable: number[] = [];

    for (const lvl of BUILTIN_LEVELS) {
      const solution = findSolution(lvl.targetMask, lvl.allowedColors);
      if (!solution) {
        unsolvable.push(lvl.id);
      } else {
        expect(checkVictory(solution, lvl.targetMask, lvl.allowedColors)).toBe(true);
      }
    }

    expect(unsolvable, `Levels with no solution: ${unsolvable.join(', ')}`).toEqual([]);
  });
});

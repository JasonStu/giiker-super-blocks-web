import { describe, it, expect } from 'vitest';
import { BUILTIN_LEVELS } from './levels';
import { findSolution } from './solver';
import { checkVictory } from './bitboard';

describe('Level Engine & Solver', () => {
  it('should contain tiered levels with valid configurations', () => {
    expect(BUILTIN_LEVELS.length).toBeGreaterThanOrEqual(10);
    const difficulties = new Set(BUILTIN_LEVELS.map(l => l.difficulty));
    expect(difficulties.has('beginner')).toBe(true);
    expect(difficulties.has('intermediate')).toBe(true);
    expect(difficulties.has('master')).toBe(true);
  });

  it('should find a valid solution for level 1 using solver', () => {
    const level1 = BUILTIN_LEVELS[0];
    const solution = findSolution(level1.targetMask, level1.allowedColors);
    expect(solution).not.toBeNull();
    if (solution) {
      expect(checkVictory(solution, level1.targetMask, level1.allowedColors)).toBe(true);
    }
  });
});

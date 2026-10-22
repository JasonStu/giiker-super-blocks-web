import { describe, it, expect } from 'vitest';
import { BUILTIN_LEVELS } from './levels';
import { findSolution } from './solver';
import { checkVictory } from './bitboard';

describe('Level Engine & Solver - TDD Verification', () => {
  it('should contain 12 tiered levels with beginner, intermediate, and master difficulties', () => {
    expect(BUILTIN_LEVELS.length).toBe(12);
    const difficulties = new Set(BUILTIN_LEVELS.map(l => l.difficulty));
    expect(difficulties.has('beginner')).toBe(true);
    expect(difficulties.has('intermediate')).toBe(true);
    expect(difficulties.has('master')).toBe(true);
  });

  it('should find valid solutions for sample beginner and intermediate levels', () => {
    const testLevels = [BUILTIN_LEVELS[0], BUILTIN_LEVELS[1], BUILTIN_LEVELS[3]];

    for (const lvl of testLevels) {
      const solution = findSolution(lvl.targetMask, lvl.allowedColors);
      expect(solution, `Solver should find solution for Level ${lvl.id} (${lvl.name})`).not.toBeNull();
      if (solution) {
        expect(checkVictory(solution, lvl.targetMask, lvl.allowedColors)).toBe(true);
      }
    }
  });

  it('should return null when target pattern cannot be satisfied by allowed colors', () => {
    // 假设关卡要求点亮 1 个格子，但只允许使用 4 格的积木，则无解
    const singleCellMask = 1n; // (0, 0)
    const impossibleSolution = findSolution(singleCellMask, ['blue']); // blue 全部是4格或5格积木
    expect(impossibleSolution).toBeNull();
  });
});

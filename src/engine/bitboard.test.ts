import { describe, it, expect } from 'vitest';
import { coordsToBitmask, isWithinBounds, validatePlacement, checkVictory } from './bitboard';
import { PlacedBlock } from './types';

describe('Bitboard & Rules Engine', () => {
  it('should accurately convert coordinates to 64-bit integer', () => {
    const mask = coordsToBitmask([[0, 0], [1, 0], [7, 7]]);
    expect(mask & (1n << 0n)).not.toBe(0n);
    expect(mask & (1n << 1n)).not.toBe(0n);
    expect(mask & (1n << 63n)).not.toBe(0n);
    expect(mask & (1n << 2n)).toBe(0n);
  });

  it('should reject out-of-bounds coordinates', () => {
    expect(isWithinBounds([[0, 0], [7, 7]])).toBe(true);
    expect(isWithinBounds([[0, 0], [8, 7]])).toBe(false);
    expect(isWithinBounds([[-1, 0]])).toBe(false);
  });

  it('should validate placement strictly matching target and color constraints', () => {
    const targetMask = coordsToBitmask([[0, 0], [1, 0]]);
    const currentBoard = 0n;

    // 合法放置：在发光区域内且颜色允许
    const resValid = validatePlacement(currentBoard, targetMask, [[0, 0], [1, 0]], 'red', ['red', 'yellow']);
    expect(resValid.valid).toBe(true);

    // 违规：超出目标发光区
    const resOutside = validatePlacement(currentBoard, targetMask, [[0, 0], [0, 1]], 'red', ['red']);
    expect(resOutside.valid).toBe(false);
    expect(resOutside.reason).toBe('outside_target');

    // 违规：使用了未授权颜色
    const resColor = validatePlacement(currentBoard, targetMask, [[0, 0], [1, 0]], 'blue', ['red']);
    expect(resColor.valid).toBe(false);
    expect(resColor.reason).toBe('color_disallowed');
  });

  it('should verify victory only when entire target mask is covered without leaks', () => {
    const targetCoords: [number, number][] = [[0, 0], [1, 0]];
    const targetMask = coordsToBitmask(targetCoords);

    const placed: PlacedBlock[] = [{
      id: 'r2',
      color: 'red',
      rootX: 0,
      rootY: 0,
      rotation: 0,
      cells: targetCoords,
    }];

    expect(checkVictory(placed, targetMask, ['red'])).toBe(true);

    // 如果用了未授权的颜色，即使盖满也不能通关（审查重点3）
    expect(checkVictory(placed, targetMask, ['yellow'])).toBe(false);
  });
});

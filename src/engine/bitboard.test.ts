import { describe, it, expect } from 'vitest';
import { coordsToBitmask, bitmaskToCoords, isWithinBounds, validatePlacement, checkVictory } from './bitboard';
import { PlacedBlock } from './types';

describe('Bitboard & Rules Engine - TDD Comprehensive Suite', () => {
  it('should accurately convert coordinates to 64-bit integer and round-trip', () => {
    const coords: [number, number][] = [[0, 0], [1, 0], [7, 7], [3, 4]];
    const mask = coordsToBitmask(coords);
    expect(mask & (1n << 0n)).not.toBe(0n);
    expect(mask & (1n << 1n)).not.toBe(0n);
    expect(mask & (1n << 63n)).not.toBe(0n);
    expect(mask & (1n << 2n)).toBe(0n);

    // Round-trip verification
    const recovered = bitmaskToCoords(mask);
    expect(recovered.sort()).toEqual(coords.sort());
  });

  it('should reject out-of-bounds coordinates across all 4 edges', () => {
    expect(isWithinBounds([[0, 0], [7, 7]])).toBe(true);
    // Left edge
    expect(isWithinBounds([[-1, 3]])).toBe(false);
    // Right edge
    expect(isWithinBounds([[8, 3]])).toBe(false);
    // Top edge
    expect(isWithinBounds([[3, -1]])).toBe(false);
    // Bottom edge
    expect(isWithinBounds([[3, 8]])).toBe(false);
  });

  it('should validate placement strictly matching target and color constraints', () => {
    const targetMask = coordsToBitmask([[0, 0], [1, 0]]);
    const currentBoard = 0n;

    // 1. 合法放置：完全在目标发光区域内且颜色被允许
    const resValid = validatePlacement(currentBoard, targetMask, [[0, 0], [1, 0]], 'red', ['red', 'yellow']);
    expect(resValid.valid).toBe(true);

    // 2. 违规：超出目标发光区
    const resOutside = validatePlacement(currentBoard, targetMask, [[0, 0], [0, 1]], 'red', ['red']);
    expect(resOutside.valid).toBe(false);
    expect(resOutside.reason).toBe('outside_target');

    // 3. 违规：使用了未授权颜色
    const resColor = validatePlacement(currentBoard, targetMask, [[0, 0], [1, 0]], 'blue', ['red']);
    expect(resColor.valid).toBe(false);
    expect(resColor.reason).toBe('color_disallowed');

    // 4. 违规：两块积木重叠在同一个格子上
    const occupiedBoard = coordsToBitmask([[0, 0]]);
    const resOverlap = validatePlacement(occupiedBoard, targetMask, [[0, 0], [1, 0]], 'red', ['red']);
    expect(resOverlap.valid).toBe(false);
    expect(resOverlap.reason).toBe('overlap');
  });

  it('should verify victory only when entire target mask is covered without leaks', () => {
    const targetCoords: [number, number][] = [[0, 0], [1, 0]];
    const targetMask = coordsToBitmask(targetCoords);

    // 空盘不能判赢
    expect(checkVictory([], targetMask, ['red'])).toBe(false);

    // 仅覆盖一半不能判赢
    const partialPlaced: PlacedBlock[] = [{
      id: 'r1',
      color: 'red',
      rootX: 0,
      rootY: 0,
      rotation: 0,
      cells: [[0, 0]],
    }];
    expect(checkVictory(partialPlaced, targetMask, ['red'])).toBe(false);

    // 完美覆盖判赢
    const fullPlaced: PlacedBlock[] = [{
      id: 'r2',
      color: 'red',
      rootX: 0,
      rootY: 0,
      rotation: 0,
      cells: targetCoords,
    }];
    expect(checkVictory(fullPlaced, targetMask, ['red'])).toBe(true);

    // 如果使用了未授权颜色，即使盖满也不能通关（审查重点3）
    expect(checkVictory(fullPlaced, targetMask, ['yellow'])).toBe(false);
  });
});

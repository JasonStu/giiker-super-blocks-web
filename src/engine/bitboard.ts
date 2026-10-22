import { Coord, PlacedBlock, BlockColor } from './types';

export function coordsToBitmask(coords: Coord[]): bigint {
  let mask = 0n;
  for (const [x, y] of coords) {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const bitIndex = BigInt(y * 8 + x);
      mask |= (1n << bitIndex);
    }
  }
  return mask;
}

export function bitmaskToCoords(mask: bigint): Coord[] {
  const coords: Coord[] = [];
  for (let i = 0; i < 64; i++) {
    if ((mask & (1n << BigInt(i))) !== 0n) {
      const x = i % 8;
      const y = Math.floor(i / 8);
      coords.push([x, y]);
    }
  }
  return coords;
}

export function isWithinBounds(coords: Coord[]): boolean {
  return coords.every(([x, y]) => x >= 0 && x < 8 && y >= 0 && y < 8);
}

export function validatePlacement(
  boardMask: bigint,
  targetMask: bigint,
  pieceCoords: Coord[],
  pieceColor: BlockColor,
  allowedColors: BlockColor[]
): { valid: boolean; reason?: 'out_of_bounds' | 'overlap' | 'outside_target' | 'color_disallowed' } {
  // 1. 越界检测
  if (!isWithinBounds(pieceCoords)) {
    return { valid: false, reason: 'out_of_bounds' };
  }

  // 2. 颜色约束检测
  if (!allowedColors.includes(pieceColor)) {
    return { valid: false, reason: 'color_disallowed' };
  }

  const pieceMask = coordsToBitmask(pieceCoords);

  // 3. 碰撞与重叠检测
  if ((boardMask & pieceMask) !== 0n) {
    return { valid: false, reason: 'overlap' };
  }

  // 4. 发光区约束检测：积木必须完全落在发光区之内，不得溢出
  if ((pieceMask & ~targetMask) !== 0n) {
    return { valid: false, reason: 'outside_target' };
  }

  return { valid: true };
}

export function checkVictory(
  placedBlocks: PlacedBlock[],
  targetMask: bigint,
  allowedColors: BlockColor[]
): boolean {
  let currentMask = 0n;
  for (const block of placedBlocks) {
    if (!allowedColors.includes(block.color)) {
      return false;
    }
    const mask = coordsToBitmask(block.cells);
    if ((currentMask & mask) !== 0n) {
      return false; // 重叠
    }
    currentMask |= mask;
  }
  return currentMask === targetMask && targetMask !== 0n;
}

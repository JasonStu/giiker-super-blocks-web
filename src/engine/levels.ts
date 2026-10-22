import { BlockColor, Coord } from './types';
import { coordsToBitmask } from './bitboard';

export type Difficulty = 'beginner' | 'intermediate' | 'master';

export interface LevelData {
  id: number;
  name: string;
  difficulty: Difficulty;
  targetMask: bigint;
  targetCoords: Coord[];
  allowedColors: BlockColor[];
}

function makeLevel(id: number, name: string, difficulty: Difficulty, allowedColors: BlockColor[], coords: Coord[]): LevelData {
  return {
    id,
    name,
    difficulty,
    allowedColors,
    targetCoords: coords,
    targetMask: coordsToBitmask(coords),
  };
}

export const BUILTIN_LEVELS: LevelData[] = [
  // 1-3 初级 (Beginner)
  makeLevel(1, "新手启蒙 01", 'beginner', ['red'], [[3, 3], [4, 3]]),
  makeLevel(2, "双格拼合 02", 'beginner', ['red'], [[2, 3], [3, 3], [2, 4], [3, 4]]),
  makeLevel(3, "角块入门 03", 'beginner', ['red'], [[2, 2], [3, 2], [2, 3], [4, 2], [5, 2]]),
  makeLevel(4, "红黄初试 04", 'beginner', ['red', 'yellow'], [[2, 3], [3, 3], [4, 3], [2, 4], [3, 4]]),

  // 4-7 中级 (Intermediate)
  makeLevel(5, "T形凹槽 05", 'intermediate', ['red', 'yellow'], [[2, 2], [3, 2], [4, 2], [3, 3], [3, 4], [4, 4]]),
  makeLevel(6, "阶梯跃升 06", 'intermediate', ['yellow', 'blue'], [
    [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
    [3, 3], [3, 4]
  ]),
  makeLevel(7, "风车回旋 07", 'intermediate', ['red', 'blue'], [[2, 2], [3, 2], [4, 2], [2, 3], [4, 3], [2, 4], [3, 4], [4, 4]]),
  makeLevel(8, "几何矩阵 08", 'intermediate', ['yellow', 'blue'], [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3]]),

  // 8-12 烧脑大师 (Master)
  makeLevel(9, "四色交响 09", 'master', ['red', 'yellow', 'blue', 'green'], [
    [1, 1], [2, 1], [3, 1], [4, 1],
    [1, 2], [2, 2], [3, 2], [4, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
  ]),
  makeLevel(10, "五格挑战 10", 'master', ['blue', 'green'], [
    [2, 2], [3, 2],
    [2, 3], [3, 3],
    [2, 4],
    [4, 2], [6, 2],
    [4, 3], [5, 3], [6, 3]
  ]),
  makeLevel(11, "迷宫之眼 11", 'master', ['red', 'yellow', 'green'], [
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [1, 2], [5, 2],
    [1, 3], [3, 3], [5, 3],
    [1, 4], [5, 4],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5],
  ]),
  makeLevel(12, "终极封神 12", 'master', ['red', 'yellow', 'blue', 'green'], [
    [2, 2], [3, 2], [4, 2], [5, 2],
    [2, 3], [3, 3], [4, 3], [5, 3],
    [2, 4], [3, 4], [4, 4], [5, 4],
    [2, 5], [3, 5], [4, 5], [5, 5],
  ]),
];

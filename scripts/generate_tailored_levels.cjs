const fs = require('fs');

const BLOCKS_8 = {
  r1: { id: 'r1', color: 'red', name: '单格点', cells: [[0, 0]] },
  r2: { id: 'r2', color: 'red', name: '四格田', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  y1: { id: 'y1', color: 'yellow', name: '双格棒', cells: [[0, 0], [1, 0]] },
  y2: { id: 'y2', color: 'yellow', name: '四格T', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  b1: { id: 'b1', color: 'blue', name: '三格折角', cells: [[0, 0], [1, 0], [0, 1]] },
  b2: { id: 'b2', color: 'blue', name: '四格L', cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  g1: { id: 'g1', color: 'green', name: '三格长棒', cells: [[0, 0], [1, 0], [2, 0]] },
  g2: { id: 'g2', color: 'green', name: '四格Z', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
};

function normalizeCells(cells) {
  if (cells.length === 0) return [];
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells
    .map(([x, y]) => [x - minX, y - minY])
    .sort(([x1, y1], [x2, y2]) => (y1 !== y2 ? y1 - y2 : x1 - x2));
}

function rotateClockwise(cells) {
  const rotated = cells.map(([x, y]) => [-y, x]);
  return normalizeCells(rotated);
}

function coordsToBitmask(coords) {
  let mask = 0n;
  for (const [x, y] of coords) {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
      mask |= (1n << BigInt(y * 8 + x));
    }
  }
  return mask;
}

function isWithinBounds(coords) {
  return coords.every(([x, y]) => x >= 0 && x < 8 && y >= 0 && y < 8);
}

const pieceOrientations = [];
for (const block of Object.values(BLOCKS_8)) {
  let cells = block.cells;
  for (let r = 0; r < 4; r++) {
    pieceOrientations.push({
      id: block.id,
      color: block.color,
      rotation: r,
      cells,
    });
    cells = rotateClockwise(cells);
  }
}

function findSolution(targetMask, allowedColors) {
  const candidates = pieceOrientations.filter(p => allowedColors.includes(p.color));
  const usedIds = new Set();
  const solution = [];

  function search(currentMask) {
    if (currentMask === targetMask) return true;

    let targetIndex = -1;
    for (let i = 0; i < 64; i++) {
      const bit = 1n << BigInt(i);
      if ((targetMask & bit) !== 0n && (currentMask & bit) === 0n) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) return false;

    const anchorX = targetIndex % 8;
    const anchorY = Math.floor(targetIndex / 8);

    for (const piece of candidates) {
      if (usedIds.has(piece.id)) continue;

      for (const [cx, cy] of piece.cells) {
        const rootX = anchorX - cx;
        const rootY = anchorY - cy;
        const absCells = piece.cells.map(([x, y]) => [x + rootX, y + rootY]);
        if (!isWithinBounds(absCells)) continue;

        const pieceMask = coordsToBitmask(absCells);
        if ((currentMask & pieceMask) === 0n && (pieceMask & ~targetMask) === 0n) {
          usedIds.add(piece.id);
          solution.push({ id: piece.id, rootX, rootY, cells: absCells });
          if (search(currentMask | pieceMask)) return true;
          solution.pop();
          usedIds.delete(piece.id);
        }
      }
    }
    return false;
  }

  return search(0n) ? solution : null;
}

let seed = 20261023;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const blockKeys = Object.keys(BLOCKS_8);

// 适合 5岁+ 儿童的趣味关卡命名库
const noviceNames = [
  "小梯子", "小红旗", "双拼小屋", "小锤子", "小帆船",
  "小火箭", "小手枪", "小风车", "小茶壶", "小鸭子",
  "长颈鹿", "小金鱼", "空间站", "小雨伞", "小蘑菇",
  "小汽车", "积木桥", "小宝剑", "小皇冠", "大风车"
];

const tierConfigs = [
  // 5岁+儿童专属入门：严格 2 ~ 3 块积木！总格数 5 ~ 8 格！必须拼接旋转，绝无 1 块单放！
  { difficulty: 'novice', minBlocks: 2, maxBlocks: 3, count: 20, minCells: 5, maxCells: 9 },
  // 初级：3 ~ 4 块积木，总格数 8 ~ 12 格
  { difficulty: 'apprentice', minBlocks: 3, maxBlocks: 4, count: 20, minCells: 8, maxCells: 13 },
  // 进阶：3 ~ 5 块积木，总格数 11 ~ 15 格
  { difficulty: 'adept', minBlocks: 4, maxBlocks: 5, count: 20, minCells: 12, maxCells: 16 },
  // 大师：4 ~ 6 块积木，总格数 14 ~ 18 格
  { difficulty: 'master', minBlocks: 4, maxBlocks: 6, count: 20, minCells: 15, maxCells: 19 },
  // 地狱：5 ~ 7 块积木，总格数 18 ~ 23 格
  { difficulty: 'grandmaster', minBlocks: 5, maxBlocks: 7, count: 20, minCells: 18, maxCells: 24 },
];

const levels = [];
let globalLevelId = 1;

for (const tier of tierConfigs) {
  let created = 0;
  let attempts = 0;

  while (created < tier.count && attempts < 10000) {
    attempts++;
    const numBlocks = Math.floor(random() * (tier.maxBlocks - tier.minBlocks + 1)) + tier.minBlocks;
    
    // 选出 numBlocks 块积木（入门前5关不选单格点 r1，以保证 5 岁儿童有扎实的实体几何拼合感）
    let availableKeys = [...blockKeys];
    if (tier.difficulty === 'novice' && created < 5) {
      availableKeys = availableKeys.filter(k => k !== 'r1'); // 前5关不用单点，全用2格/3格/4格拼
    }

    const shuffledKeys = shuffle(availableKeys).slice(0, numBlocks);

    let boardMask = 0n;
    const placedCells = [];
    const usedColors = new Set();
    let success = true;

    for (let bIdx = 0; bIdx < shuffledKeys.length; bIdx++) {
      const bKey = shuffledKeys[bIdx];
      const block = BLOCKS_8[bKey];
      usedColors.add(block.color);

      const orientations = pieceOrientations.filter(p => p.id === bKey);
      const chosenOrient = orientations[Math.floor(random() * orientations.length)];

      const candidates = [];
      for (let y = 1; y < 7; y++) {
        for (let x = 1; x < 7; x++) {
          const absCells = chosenOrient.cells.map(([cx, cy]) => [cx + x, cy + y]);
          if (!isWithinBounds(absCells)) continue;
          const mask = coordsToBitmask(absCells);
          if ((boardMask & mask) === 0n) {
            if (bIdx > 0) {
              const isAdjacent = absCells.some(([ax, ay]) =>
                [[ax+1,ay], [ax-1,ay], [ax,ay+1], [ax,ay-1]].some(([nx, ny]) =>
                  (boardMask & coordsToBitmask([[nx, ny]])) !== 0n
                )
              );
              if (!isAdjacent) continue;
            }
            candidates.push(absCells);
          }
        }
      }

      if (candidates.length === 0) {
        success = false;
        break;
      }

      const chosenCells = candidates[Math.floor(random() * candidates.length)];
      boardMask |= coordsToBitmask(chosenCells);
      placedCells.push(...chosenCells);
    }

    if (!success) continue;

    const uniqueCoords = Array.from(new Set(placedCells.map(([x, y]) => `${x},${y}`)))
      .map(s => s.split(',').map(Number));

    // 格数约束
    if (uniqueCoords.length < tier.minCells || uniqueCoords.length > tier.maxCells) {
      continue;
    }

    // 允许颜色：使用的颜色 + 最多1个干扰颜色（入门关卡少干扰，降低孩子挫败感）
    const allowedColors = Array.from(usedColors);
    if (tier.difficulty !== 'novice' && allowedColors.length < 4 && random() < 0.5) {
      const allColors = ['red', 'yellow', 'blue', 'green'];
      const unused = allColors.filter(c => !allowedColors.includes(c));
      if (unused.length > 0) {
        allowedColors.push(unused[Math.floor(random() * unused.length)]);
      }
    }

    // 确保求解器 100% 可解
    const sol = findSolution(boardMask, allowedColors);
    if (!sol) continue;

    let levelName = "";
    if (tier.difficulty === 'novice') {
      levelName = `${noviceNames[created] || '趣味入门'} (${String(globalLevelId).padStart(3, '0')})`;
    } else {
      const tierNameMap = {
        apprentice: '初级',
        adept: '进阶',
        master: '大师',
        grandmaster: '地狱',
      };
      levelName = `${tierNameMap[tier.difficulty]} ${String(globalLevelId).padStart(3, '0')}`;
    }

    levels.push({
      id: globalLevelId,
      name: levelName,
      difficulty: tier.difficulty,
      allowedColors,
      targetCoords: uniqueCoords,
    });

    globalLevelId++;
    created++;
  }

  console.log(`Successfully generated ${created} levels for ${tier.difficulty}`);
}

console.log(`Total generated levels: ${levels.length}`);

// 生成 levels.ts 内容
let fileContent = `import { BlockColor, Coord, Difficulty } from './types';
import { coordsToBitmask } from './bitboard';

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
`;

for (const lvl of levels) {
  fileContent += `  makeLevel(${lvl.id}, ${JSON.stringify(lvl.name)}, '${lvl.difficulty}', ${JSON.stringify(lvl.allowedColors)}, ${JSON.stringify(lvl.targetCoords)}),\n`;
}

fileContent += `];\n`;

fs.writeFileSync('src/engine/levels.ts', fileContent);
console.log('Successfully written tailored levels to src/engine/levels.ts');

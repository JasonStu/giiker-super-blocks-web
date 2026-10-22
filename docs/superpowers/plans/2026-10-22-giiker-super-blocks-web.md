# 计客超级积木（GiiKER Super Blocks）Web/iPad 版实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个高还原度的计客超级积木（GiiKER Super Blocks）Web/iPad 电子版，包含 16 款几何积木、8×8 LED 点阵发光矩阵、拟真掌机外壳、iPad 触控拖拽与旋转吸附、规则与关卡求解器、Web Audio 音效合成以及分难度分级的通关烟花特效。

**Architecture:** 核心采用纯 TypeScript 几何与 64 位 Bitboard 规则引擎驱动，彻底解耦 UI 渲染；表现层采用 React 18 + Tailwind CSS 呈现复古工业质感掌机；交互层通过原生 Pointer Events API 提供 iPad 级别的零掉帧触控磁吸；特效层采用独立的 Canvas 2D 粒子系统实现自适应关卡难度的多重烟花。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Web Audio API, HTML5 Canvas 2D, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-22-giiker-super-blocks-web-design.md`

## Global Constraints

- 框架：React 18 + TypeScript + Vite
- 样式：Tailwind CSS，必须包含深色磨砂与 LED 荧光微晕效果
- 触控：全容器配置 `touch-action: none` 与 `user-select: none`，拖拽必须使用 `Pointer Events` 与 `setPointerCapture`
- 音效：纯 Web Audio API 合成，零外部静态 MP3 依赖
- 积木总数：严格包含 16 块积木（红 4、黄 4、蓝 4、绿 4）
- 棋盘规模：严格 $8 \times 8$ 网格（64 格）

## Review Focus

1. **iPad 触控遮挡与偏移**：触控拖拽时若以手指几何中心作为积木原点，手指会遮挡视线导致对不准格子；必须在拖拽状态施加向上 24px 的视觉偏移补偿。
2. **异形积木越界旋转**：在贴近 $8 \times 8$ 棋盘边缘时点击旋转积木，旋转后的新坐标可能超出网格边界；引擎必须拦截越界旋转或自动贴边推回。
3. **颜色约束逃逸**：通关检测时若仅比对网格覆盖数，可能发生“用未授权颜色的积木碰巧拼满发光区”的漏洞；判定必须同时强校验积木颜色集合。
4. **音频上下文未解锁**：iOS Safari 要求用户首次交互后才能调用 `AudioContext.resume()`；音效引擎必须在初次 pointerdown 事件中自动静默解锁。
5. **烟花层阻断触控**：全屏 Canvas 烟花层覆盖在最顶层时，若未设置 `pointer-events: none` 会导致玩家无法点击“下一关”或切换关卡；烟花层必须严格穿透事件。

---

### Task 1: 项目脚手架与基础环境配置

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

**Interfaces:**
- Produces: 可运行的 Vite React 18 + Tailwind CSS 开发环境与 Vitest 测试环境。

- [ ] **Step 1: 创建 package.json 并配置依赖**

```json
{
  "name": "giiker-super-blocks-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.9",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts 与 tsconfig.json**

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
});
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 配置 Tailwind CSS 与样式基底**

`tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chassis: {
          dark: '#18191c',
          metal: '#24262b',
          border: '#32353d',
        },
        led: {
          off: '#1e232a',
          on: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.45)',
          red: '#ef4444',
          yellow: '#eab308',
          blue: '#3b82f6',
          green: '#22c55e',
        }
      },
      boxShadow: {
        'led-glow': '0 0 12px rgba(56, 189, 248, 0.65), inset 0 0 6px rgba(255, 255, 255, 0.7)',
        'led-red': '0 0 12px rgba(239, 68, 68, 0.75)',
        'chassis-inner': 'inset 0 3px 8px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.06)',
      }
    },
  },
  plugins: [],
}
```

`postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

`index.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>计客超级积木 - GiiKER Super Blocks Web</title>
  </head>
  <body class="bg-[#0f1115] text-slate-100 selection:bg-none touch-none overflow-hidden select-none">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}
```

- [ ] **Step 4: 安装依赖并验证测试套件**

Run: `npm install && npm test`
Expected: 依赖安装成功，vitest 可正常唤起。

- [ ] **Step 5: 提交脚手架代码**

```bash
git add package.json vite.config.ts tsconfig.json tailwind.config.js postcss.config.js index.html src/
git commit -m "chore: scaffold project with React 18, Vite, Tailwind CSS, and Vitest"
```

---

### Task 2: 几何多格骨牌引擎（Polyomino Engine）

**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/polyominoes.ts`
- Create: `src/engine/polyominoes.test.ts`

**Interfaces:**
- Produces:
  - `BlockId = 'r1' | 'r2' | 'r3' | 'r4' | 'y1' | ... | 'g4'`
  - `BlockColor = 'red' | 'yellow' | 'blue' | 'green'`
  - `Coord = [number, number]`
  - `BlockDefinition: { id: BlockId, color: BlockColor, name: string, cells: Coord[] }`
  - `BLOCKS_16: Record<BlockId, BlockDefinition>`
  - `rotateClockwise(cells: Coord[]): Coord[]`
  - `normalizeCells(cells: Coord[]): Coord[]`

- [ ] **Step 1: 编写测试用例 `src/engine/polyominoes.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { BLOCKS_16, rotateClockwise, normalizeCells } from './polyominoes';

describe('Polyomino Geometry Engine', () => {
  it('should define exactly 16 blocks across 4 colors (4 each)', () => {
    const blocks = Object.values(BLOCKS_16);
    expect(blocks.length).toBe(16);
    
    const reds = blocks.filter(b => b.color === 'red');
    const yellows = blocks.filter(b => b.color === 'yellow');
    const blues = blocks.filter(b => b.color === 'blue');
    const greens = blocks.filter(b => b.color === 'green');

    expect(reds.length).toBe(4);
    expect(yellows.length).toBe(4);
    expect(blues.length).toBe(4);
    expect(greens.length).toBe(4);
  });

  it('should rotate cells clockwise and stay normalized to (0,0)', () => {
    // 3格L形：[[0,0], [1,0], [0,1]]
    const lShape: [number, number][] = [[0,0], [1,0], [0,1]];
    const rotated = rotateClockwise(lShape);
    
    // 旋转90°: (x, y) -> (-y, x) 归一化后
    expect(rotated).toContainEqual([0, 0]);
    expect(rotated.length).toBe(3);
    
    // 连续旋转4次必须回到初始形状
    let current = lShape;
    for (let i = 0; i < 4; i++) {
      current = rotateClockwise(current);
    }
    expect(normalizeCells(current).sort()).toEqual(normalizeCells(lShape).sort());
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npx vitest run src/engine/polyominoes.test.ts`
Expected: FAIL with "Cannot find module './polyominoes'"

- [ ] **Step 3: 实现 `src/engine/types.ts` 与 `src/engine/polyominoes.ts`**

`src/engine/types.ts`:
```typescript
export type BlockColor = 'red' | 'yellow' | 'blue' | 'green';

export type BlockId =
  | 'r1' | 'r2' | 'r3' | 'r4'
  | 'y1' | 'y2' | 'y3' | 'y4'
  | 'b1' | 'b2' | 'b3' | 'b4'
  | 'g1' | 'g2' | 'g3' | 'g4';

export type Coord = [number, number]; // [x, y] where 0 <= x, y < 8

export interface BlockDefinition {
  id: BlockId;
  color: BlockColor;
  name: string;
  cells: Coord[];
}

export interface PlacedBlock {
  id: BlockId;
  color: BlockColor;
  rootX: number; // grid x anchor
  rootY: number; // grid y anchor
  rotation: 0 | 1 | 2 | 3; // 0=0°, 1=90°, 2=180°, 3=270°
  cells: Coord[]; // absolute grid coords [[x, y], ...]
}
```

`src/engine/polyominoes.ts`:
```typescript
import { BlockId, BlockDefinition, Coord } from './types';

export function normalizeCells(cells: Coord[]): Coord[] {
  if (cells.length === 0) return [];
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Coord)
    .sort(([x1, y1], [x2, y2]) => (y1 !== y2 ? y1 - y2 : x1 - x2));
}

export function rotateClockwise(cells: Coord[]): Coord[] {
  // (x, y) 顺时针旋转90°: x' = -y, y' = x
  const rotated = cells.map(([x, y]) => [-y, x] as Coord);
  return normalizeCells(rotated);
}

export const BLOCKS_16: Record<BlockId, BlockDefinition> = {
  // 红色组：基础几何
  r1: { id: 'r1', color: 'red', name: '单格点', cells: [[0, 0]] },
  r2: { id: 'r2', color: 'red', name: '双格棒', cells: [[0, 0], [1, 0]] },
  r3: { id: 'r3', color: 'red', name: '小三折', cells: [[0, 0], [1, 0], [0, 1]] },
  r4: { id: 'r4', color: 'red', name: '四格田', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },

  // 黄色组：四格骨牌
  y1: { id: 'y1', color: 'yellow', name: '三格棒', cells: [[0, 0], [1, 0], [2, 0]] },
  y2: { id: 'y2', color: 'yellow', name: '四格T', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  y3: { id: 'y3', color: 'yellow', name: '四格L', cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  y4: { id: 'y4', color: 'yellow', name: '四格Z', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },

  // 蓝色组：扩展四格与五格
  b1: { id: 'b1', color: 'blue', name: '四格长棒', cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  b2: { id: 'b2', color: 'blue', name: '四格拐角', cells: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  b3: { id: 'b3', color: 'blue', name: '五格P', cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  b4: { id: 'b4', color: 'blue', name: '五格W', cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },

  // 绿色组：复杂五格
  g1: { id: 'g1', color: 'green', name: '五格十字', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  g2: { id: 'g2', color: 'green', name: '五格U', cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  g3: { id: 'g3', color: 'green', name: '五格长L', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  g4: { id: 'g4', color: 'green', name: '五格V', cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
};
```

- [ ] **Step 4: 运行测试并验证通过**

Run: `npx vitest run src/engine/polyominoes.test.ts`
Expected: PASS (2 tests pass)

- [ ] **Step 5: 提交几何多格骨牌引擎**

```bash
git add src/engine/types.ts src/engine/polyominoes.ts src/engine/polyominoes.test.ts
git commit -m "feat(engine): implement polyomino definitions and rotation mathematics"
```

---

### Task 3: 64 位 Bitboard 与规则判定引擎（TDD）

**Files:**
- Create: `src/engine/bitboard.ts`
- Create: `src/engine/bitboard.test.ts`

**Interfaces:**
- Consumes: `Coord`, `PlacedBlock`, `BlockColor` from `src/engine/types.ts`
- Produces:
  - `coordsToBitmask(coords: Coord[]): bigint`
  - `bitmaskToCoords(mask: bigint): Coord[]`
  - `isWithinBounds(coords: Coord[]): boolean`
  - `validatePlacement(boardMask: bigint, targetMask: bigint, pieceCoords: Coord[], pieceColor: BlockColor, allowedColors: BlockColor[]): { valid: boolean; reason?: 'out_of_bounds' | 'overlap' | 'outside_target' | 'color_disallowed' }`
  - `checkVictory(placedBlocks: PlacedBlock[], targetMask: bigint, allowedColors: BlockColor[]): boolean`

- [ ] **Step 1: 编写规则引擎测试 `src/engine/bitboard.test.ts`**

```typescript
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
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npx vitest run src/engine/bitboard.test.ts`
Expected: FAIL with "Cannot find module './bitboard'"

- [ ] **Step 3: 实现 `src/engine/bitboard.ts`**

```typescript
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
```

- [ ] **Step 4: 运行测试并验证通过**

Run: `npx vitest run src/engine/bitboard.test.ts`
Expected: PASS (4 tests pass)

- [ ] **Step 5: 提交规则与位棋盘引擎**

```bash
git add src/engine/bitboard.ts src/engine/bitboard.test.ts
git commit -m "feat(engine): implement bitboard manipulation and placement rules validation"
```

---

### Task 4: 关卡库与求解器引擎（Level Engine & Solver）

**Files:**
- Create: `src/engine/levels.ts`
- Create: `src/engine/solver.ts`
- Create: `src/engine/solver.test.ts`

**Interfaces:**
- Produces:
  - `Difficulty = 'beginner' | 'intermediate' | 'master'`
  - `LevelData: { id: number, name: string, difficulty: Difficulty, targetMask: bigint, allowedColors: BlockColor[], targetCoords: Coord[], hintSolution?: PlacedBlock[] }`
  - `BUILTIN_LEVELS: LevelData[]`
  - `findSolution(targetMask: bigint, allowedColors: BlockColor[]): PlacedBlock[] | null`

- [ ] **Step 1: 编写求解器与关卡测试 `src/engine/solver.test.ts`**

```typescript
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
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npx vitest run src/engine/solver.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 `src/engine/levels.ts` 与 `src/engine/solver.ts`**

`src/engine/levels.ts`:
```typescript
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
  makeLevel(6, "阶梯跃升 06", 'intermediate', ['yellow', 'blue'], [[1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5]]),
  makeLevel(7, "风车回旋 07", 'intermediate', ['red', 'blue'], [[2, 2], [3, 2], [4, 2], [2, 3], [4, 3], [2, 4], [3, 4], [4, 4]]),
  makeLevel(8, "几何矩阵 08", 'intermediate', ['yellow', 'blue'], [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3]]),

  // 8-12 烧脑大师 (Master)
  makeLevel(9, "四色交响 09", 'master', ['red', 'yellow', 'blue', 'green'], [
    [1, 1], [2, 1], [3, 1], [4, 1],
    [1, 2], [2, 2], [3, 2], [4, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
  ]),
  makeLevel(10, "五格挑战 10", 'master', ['blue', 'green'], [
    [2, 1], [3, 1], [4, 1],
    [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
    [2, 3], [3, 3], [4, 3],
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
```

`src/engine/solver.ts`:
```typescript
import { BlockId, BlockColor, Coord, PlacedBlock } from './types';
import { BLOCKS_16, rotateClockwise } from './polyominoes';
import { coordsToBitmask, isWithinBounds } from './bitboard';

export function findSolution(targetMask: bigint, allowedColors: BlockColor[]): PlacedBlock[] | null {
  const candidateBlocks = Object.values(BLOCKS_16).filter(b => allowedColors.includes(b.color));
  
  // 预生成所有可用积木在 4 个旋转方向下的相对坐标
  const pieceOrientations: { id: BlockId; color: BlockColor; rotation: 0 | 1 | 2 | 3; cells: Coord[] }[] = [];
  for (const block of candidateBlocks) {
    let cells = block.cells;
    for (let r = 0; r < 4; r++) {
      pieceOrientations.push({
        id: block.id,
        color: block.color,
        rotation: r as 0 | 1 | 2 | 3,
        cells,
      });
      cells = rotateClockwise(cells);
    }
  }

  const solution: PlacedBlock[] = [];
  const usedBlockIds = new Set<BlockId>();

  function search(currentMask: bigint): boolean {
    if (currentMask === targetMask) {
      return true;
    }

    // 找到尚未被覆盖的最小网格索引作为锚点剪枝
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

    for (const piece of pieceOrientations) {
      if (usedBlockIds.has(piece.id)) continue;

      // 尝试让积木的每个单元格对齐到 anchor 坐标
      for (const [cellX, cellY] of piece.cells) {
        const rootX = anchorX - cellX;
        const rootY = anchorY - cellY;
        const absoluteCells: Coord[] = piece.cells.map(([x, y]) => [x + rootX, y + rootY]);

        if (!isWithinBounds(absoluteCells)) continue;

        const pieceMask = coordsToBitmask(absoluteCells);
        // 不能有重叠，且必须落在 targetMask 内部
        if ((currentMask & pieceMask) === 0n && (pieceMask & ~targetMask) === 0n) {
          usedBlockIds.add(piece.id);
          solution.push({
            id: piece.id,
            color: piece.color,
            rootX,
            rootY,
            rotation: piece.rotation,
            cells: absoluteCells,
          });

          if (search(currentMask | pieceMask)) {
            return true;
          }

          solution.pop();
          usedBlockIds.delete(piece.id);
        }
      }
    }

    return false;
  }

  return search(0n) ? solution : null;
}
```

- [ ] **Step 4: 运行测试并验证通过**

Run: `npx vitest run src/engine/solver.test.ts`
Expected: PASS

- [ ] **Step 5: 提交关卡库与求解器**

```bash
git add src/engine/levels.ts src/engine/solver.ts src/engine/solver.test.ts
git commit -m "feat(engine): add 12 tiered builtin levels and backtracking solution solver"
```

---

### Task 5: Web Audio 代码合成声音引擎

**Files:**
- Create: `src/audio/soundEngine.ts`

**Interfaces:**
- Produces:
  - `soundEngine.init(): Promise<void>`
  - `soundEngine.playClick(): void`
  - `soundEngine.playSnap(): void`
  - `soundEngine.playError(): void`
  - `soundEngine.playVictory(difficulty: Difficulty): void`
  - `soundEngine.setMuted(muted: boolean): void`
  - `soundEngine.isMuted(): boolean`

- [ ] **Step 1: 实现 Web Audio 纯代码合成声音引擎**

`src/audio/soundEngine.ts`:
```typescript
import { Difficulty } from '../engine/levels';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public init() {
    this.getContext();
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted() {
    return this.muted;
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playSnap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    // 双蜂鸣音
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.08);
    });
  }

  public playVictory(difficulty: Difficulty) {
    const ctx = this.getContext();
    if (!ctx) return;

    let notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Beginner)
    let stepTime = 0.09;

    if (difficulty === 'intermediate') {
      notes = [523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51];
      stepTime = 0.08;
    } else if (difficulty === 'master') {
      notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1174.66, 1318.51, 1567.98];
      stepTime = 0.07;
    }

    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * stepTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }
}

export const soundEngine = new SoundEngine();
```

- [ ] **Step 2: 验证在模块中引入无报错**

Run: `npx tsc --noEmit`
Expected: 编译通过，无类型错误。

- [ ] **Step 3: 提交音频引擎**

```bash
git add src/audio/soundEngine.ts
git commit -m "feat(audio): implement Web Audio synthesizer for tactile clicks, snaps, alarms, and tiered victory jingles"
```

---

### Task 6: 分难度多重烟花粒子画布特效（Adaptive Fireworks Canvas FX）

**Files:**
- Create: `src/fx/fireworks.ts`
- Create: `src/components/FireworksOverlay.tsx`

**Interfaces:**
- Produces:
  - `fireworksEngine.launch(difficulty: Difficulty): void`
  - `<FireworksOverlay />`：置于顶层但穿透触控（`pointer-events: none`）的 Canvas 组件。

- [ ] **Step 1: 实现 `src/fx/fireworks.ts` 粒子引擎**

```typescript
import { Difficulty } from '../engine/levels';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
  gravity: number;
}

export class FireworksEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  public attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }

  public resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public launch(difficulty: Difficulty) {
    if (!this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'];

    if (difficulty === 'beginner') {
      // 简单纸屑彩带喷射：从屏幕中上方喷发
      this.createBurst(w / 2, h * 0.45, 60, colors, 5);
    } else if (difficulty === 'intermediate') {
      // 双重牡丹花环烟花
      this.createBurst(w * 0.35, h * 0.4, 90, colors, 7);
      setTimeout(() => this.createBurst(w * 0.65, h * 0.35, 90, colors, 7), 200);
    } else {
      // 大师级：多点连发重磅流星瀑布
      const spots = [
        [w * 0.25, h * 0.4],
        [w * 0.5, h * 0.3],
        [w * 0.75, h * 0.4],
        [w * 0.4, h * 0.5],
        [w * 0.6, h * 0.5],
      ];
      spots.forEach(([x, y], idx) => {
        setTimeout(() => this.createBurst(x, y, 100, colors, 9), idx * 180);
      });
    }

    if (!this.animationId) {
      this.loop();
    }
  }

  private createBurst(originX: number, originY: number, count: number, colors: string[], speedMax: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * speedMax + 1.5;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        size: Math.random() * 3 + 2,
        decay: Math.random() * 0.015 + 0.01,
        gravity: 0.12,
      });
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.loop);
    } else {
      this.animationId = null;
    }
  };
}

export const fireworksEngine = new FireworksEngine();
```

- [ ] **Step 2: 创建 `src/components/FireworksOverlay.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';
import { fireworksEngine } from '../fx/fireworks';

export const FireworksOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fireworksEngine.attach(canvasRef.current);
    }
    const handleResize = () => fireworksEngine.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};
```

- [ ] **Step 3: 编译检查**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: 提交烟花特效引擎**

```bash
git add src/fx/fireworks.ts src/components/FireworksOverlay.tsx
git commit -m "feat(fx): add adaptive tiered fireworks particle engine for victory animations"
```

---

### Task 7: 拟真掌机外壳与 8×8 LED 矩阵 UI 组件

**Files:**
- Create: `src/components/ConsoleShell.tsx`
- Create: `src/components/LedBoard.tsx`
- Create: `src/components/Controls.tsx`

**Interfaces:**
- Consumes: `LevelData`, `PlacedBlock`
- Produces:
  - `<LedBoard targetMask={mask} placedBlocks={placed} errorCoords={errors} isVictorious={isWon} />`
  - `<ConsoleShell level={currentLevel} onPrev={...} onNext={...} onHint={...} onReset={...}>...</ConsoleShell>`

- [ ] **Step 1: 实现 8×8 点阵屏组件 `src/components/LedBoard.tsx`**

```tsx
import React from 'react';
import { Coord, PlacedBlock } from '../engine/types';

interface LedBoardProps {
  targetMask: bigint;
  placedBlocks: PlacedBlock[];
  errorCoords: Coord[];
  isVictorious: boolean;
  hintCells?: Coord[];
  onGridClick?: (x: number, y: number) => void;
}

export const LedBoard: React.FC<LedBoardProps> = ({
  targetMask,
  placedBlocks,
  errorCoords,
  isVictorious,
  hintCells = [],
  onGridClick,
}) => {
  // 构建 64 格的显示映射
  const gridCells = [];

  // 获取所有已被占据的坐标与颜色
  const occupiedMap = new Map<string, string>();
  for (const block of placedBlocks) {
    for (const [x, y] of block.cells) {
      occupiedMap.set(`${x},${y}`, block.color);
    }
  }

  const errorSet = new Set(errorCoords.map(([x, y]) => `${x},${y}`));
  const hintSet = new Set(hintCells.map(([x, y]) => `${x},${y}`));

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const bitIndex = BigInt(y * 8 + x);
      const isTarget = (targetMask & (1n << bitIndex)) !== 0n;
      const key = `${x},${y}`;
      const placedColor = occupiedMap.get(key);
      const isError = errorSet.has(key);
      const isHint = hintSet.has(key);

      let cellStyle = "bg-[#181d24] border border-[#232a35]"; // 灭灯状态
      let glowClass = "";

      if (isError) {
        cellStyle = "bg-red-500 border-red-300 animate-pulse";
        glowClass = "shadow-[0_0_12px_rgba(239,68,68,0.9)]";
      } else if (placedColor) {
        // 积木覆盖发光
        const colorBgMap: Record<string, string> = {
          red: 'bg-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.7)]',
          yellow: 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.7)]',
          blue: 'bg-blue-500 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.7)]',
          green: 'bg-green-500 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.7)]',
        };
        cellStyle = colorBgMap[placedColor] || 'bg-slate-300';
      } else if (isTarget) {
        // 题目点亮目标格 (计客经典的冰蓝冷光)
        cellStyle = "bg-[#38bdf8] border-[#bae6fd] shadow-[0_0_12px_rgba(56,189,248,0.85)]";
      } else if (isHint) {
        cellStyle = "bg-sky-500/40 border-dashed border-sky-300 animate-pulse";
      }

      if (isVictorious) {
        glowClass = "shadow-[0_0_16px_rgba(255,255,255,0.9)] brightness-125 animate-bounce";
      }

      gridCells.push(
        <div
          key={key}
          onClick={() => onGridClick?.(x, y)}
          data-grid-x={x}
          data-grid-y={y}
          className={`relative rounded-md flex items-center justify-center transition-all duration-150 aspect-square ${cellStyle} ${glowClass}`}
        >
          {/* 仿真 LED 导光小圆芯 */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />
        </div>
      );
    }
  }

  return (
    <div className="p-3 bg-[#111317] border-4 border-[#2b2f38] rounded-2xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.9),0_2px_8px_rgba(255,255,255,0.05)]">
      <div className="grid grid-cols-8 gap-1.5 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {gridCells}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 实现控制按钮组 `src/components/Controls.tsx`**

```tsx
import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import { LevelData } from '../engine/levels';

interface ControlsProps {
  level: LevelData;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onHint: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  level,
  onPrev,
  onNext,
  onReset,
  onHint,
  isMuted,
  onToggleSound,
}) => {
  const difficultyBadge = {
    beginner: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    intermediate: 'bg-amber-950 text-amber-400 border-amber-800',
    master: 'bg-rose-950 text-rose-400 border-rose-800',
  }[level.difficulty];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 关卡 LCD 拟真液晶屏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#14191f] border-2 border-[#2c3440] rounded-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase">LEVEL</span>
          <span className="text-xl font-bold text-sky-400 tracking-wider">
            {String(level.id).padStart(2, '0')}
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-semibold border ${difficultyBadge}`}>
          {level.difficulty.toUpperCase()}
        </div>
      </div>

      {/* 掌机物理质感微动按键 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="p-3 bg-[#242831] hover:bg-[#2e333e] active:scale-95 text-slate-300 rounded-xl border-t border-slate-600 border-b-2 border-b-black shadow-md transition-transform"
            title="上一关"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNext}
            className="p-3 bg-[#242831] hover:bg-[#2e333e] active:scale-95 text-slate-300 rounded-xl border-t border-slate-600 border-b-2 border-b-black shadow-md transition-transform"
            title="下一关"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onHint}
            className="p-3 bg-[#242831] hover:bg-[#2e333e] active:scale-95 text-amber-400 rounded-xl border-t border-slate-600 border-b-2 border-b-black shadow-md transition-transform"
            title="解题提示"
          >
            <Lightbulb size={20} />
          </button>
          <button
            onClick={onReset}
            className="p-3 bg-[#242831] hover:bg-[#2e333e] active:scale-95 text-slate-300 rounded-xl border-t border-slate-600 border-b-2 border-b-black shadow-md transition-transform"
            title="清空重置"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={onToggleSound}
            className="p-3 bg-[#242831] hover:bg-[#2e333e] active:scale-95 text-slate-300 rounded-xl border-t border-slate-600 border-b-2 border-b-black shadow-md transition-transform"
            title={isMuted ? "开启声音" : "静音"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: 实现掌机外壳外包装 `src/components/ConsoleShell.tsx`**

```tsx
import React from 'react';
import { LevelData } from '../engine/levels';
import { Controls } from './Controls';

interface ConsoleShellProps {
  level: LevelData;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onHint: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  children: React.ReactNode;
}

export const ConsoleShell: React.FC<ConsoleShellProps> = ({
  level,
  onPrev,
  onNext,
  onReset,
  onHint,
  isMuted,
  onToggleSound,
  children,
}) => {
  return (
    <div className="relative p-6 sm:p-8 bg-gradient-to-b from-[#252830] to-[#17191f] border-4 border-[#3a3f4d] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center gap-5 max-w-md w-full">
      {/* 顶部品牌与扬声器孔 */}
      <div className="w-full flex items-center justify-between pb-1 border-b border-slate-700/50">
        <span className="font-extrabold text-sm tracking-widest text-slate-400">GiiKER</span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
        </div>
      </div>

      {/* 核心 8x8 网格槽 */}
      <div className="w-full flex justify-center">
        {children}
      </div>

      {/* 控制器面板 */}
      <div className="w-full">
        <Controls
          level={level}
          onPrev={onPrev}
          onNext={onNext}
          onReset={onReset}
          onHint={onHint}
          isMuted={isMuted}
          onToggleSound={onToggleSound}
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: 编译检查**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: 提交掌机与点阵屏组件**

```bash
git add src/components/LedBoard.tsx src/components/Controls.tsx src/components/ConsoleShell.tsx
git commit -m "feat(ui): implement retro handheld console shell, 8x8 LED matrix, and physical-styled control buttons"
```

---

### Task 8: 积木托盘与 iPad 触控拖拽吸附系统

**Files:**
- Create: `src/components/BlockPiece.tsx`
- Create: `src/components/BlockTray.tsx`

**Interfaces:**
- Consumes: `BLOCKS_16`, `PlacedBlock`, `BlockColor`, `rotateClockwise`
- Produces:
  - `<BlockPiece block={b} isPlaced={...} isAllowed={...} onClickRotate={...} onPointerDownDrag={...} />`
  - `<BlockTray allowedColors={...} placedBlockIds={...} onSelectBlock={...} />`

- [ ] **Step 1: 实现积木单体渲染与手势交互 `src/components/BlockPiece.tsx`**

```tsx
import React from 'react';
import { BlockDefinition, Coord } from '../engine/types';

interface BlockPieceProps {
  block: BlockDefinition;
  cells: Coord[];
  isPlaced: boolean;
  isAllowed: boolean;
  onRotate: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}

export const BlockPiece: React.FC<BlockPieceProps> = ({
  block,
  cells,
  isPlaced,
  isAllowed,
  onRotate,
  onPointerDown,
}) => {
  const maxX = Math.max(...cells.map(([x]) => x));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const cols = maxX + 1;
  const rows = maxY + 1;

  const colorStyles: Record<string, string> = {
    red: 'bg-red-500 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    yellow: 'bg-yellow-400 border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.5)]',
    blue: 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    green: 'bg-green-500 border-green-300 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
  };

  const occupiedSet = new Set(cells.map(([x, y]) => `${x},${y}`));

  return (
    <div
      onPointerDown={(e) => {
        if (!isAllowed || isPlaced) return;
        onPointerDown(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isAllowed || isPlaced) return;
        onRotate();
      }}
      className={`relative p-2 rounded-xl transition-all select-none touch-none cursor-grab active:cursor-grabbing ${
        !isAllowed ? 'opacity-25 grayscale pointer-events-none' : isPlaced ? 'opacity-30' : 'hover:scale-105 active:scale-95'
      }`}
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, 20px)`,
          gridTemplateRows: `repeat(${rows}, 20px)`,
        }}
      >
        {Array.from({ length: rows }).map((_, y) =>
          Array.from({ length: cols }).map((_, x) => {
            const hasCell = occupiedSet.has(`${x},${y}`);
            return (
              <div
                key={`${x},${y}`}
                className={`w-5 h-5 rounded-md ${
                  hasCell ? `${colorStyles[block.color]} border` : 'bg-transparent'
                }`}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 实现积木收纳舱 `src/components/BlockTray.tsx`**

```tsx
import React, { useState } from 'react';
import { BlockId, BlockColor, Coord } from '../engine/types';
import { BLOCKS_16, rotateClockwise } from '../engine/polyominoes';
import { BlockPiece } from './BlockPiece';

interface BlockTrayProps {
  allowedColors: BlockColor[];
  placedBlockIds: Set<BlockId>;
  onStartDrag: (blockId: BlockId, cells: Coord[], clientX: number, clientY: number) => void;
}

export const BlockTray: React.FC<BlockTrayProps> = ({
  allowedColors,
  placedBlockIds,
  onStartDrag,
}) => {
  // 本地维护未上盘积木当前的旋转方向状态
  const [rotations, setRotations] = useState<Record<BlockId, Coord[]>>(() => {
    const init: Record<string, Coord[]> = {};
    for (const [id, block] of Object.entries(BLOCKS_16)) {
      init[id] = block.cells;
    }
    return init as Record<BlockId, Coord[]>;
  });

  const handleRotate = (id: BlockId) => {
    setRotations((prev) => ({
      ...prev,
      [id]: rotateClockwise(prev[id]),
    }));
  };

  const blocks = Object.values(BLOCKS_16);

  return (
    <div className="w-full max-w-md lg:max-w-xs p-4 bg-[#14171d] border-2 border-[#262b35] rounded-3xl shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="text-xs font-bold text-slate-400 tracking-wider">BLOCK TRAY (16 PIECES)</span>
        <span className="text-xs text-sky-400">点击旋转 / 拖拽上盘</span>
      </div>

      {/* 四色分组容器 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto p-1">
        {blocks.map((block) => {
          const isAllowed = allowedColors.includes(block.color);
          const isPlaced = placedBlockIds.has(block.id);
          const cells = rotations[block.id] || block.cells;

          return (
            <div
              key={block.id}
              className="flex items-center justify-center p-2 bg-[#1b1f27] border border-[#2d3442] rounded-2xl"
            >
              <BlockPiece
                block={block}
                cells={cells}
                isPlaced={isPlaced}
                isAllowed={isAllowed}
                onRotate={() => handleRotate(block.id)}
                onPointerDown={(e) => {
                  onStartDrag(block.id, cells, e.clientX, e.clientY);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 3: 编译检查**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: 提交积木托盘组件**

```bash
git add src/components/BlockPiece.tsx src/components/BlockTray.tsx
git commit -m "feat(ui): implement BlockPiece with click rotation and BlockTray storage dock"
```

---

### Task 9: 顶层交互状态机、iPad 响应式布局与游戏闭环

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: All engines, UI components, sound engine, fireworks engine.
- Produces: 完整闭环的交互游戏页面，支持 iPad 横屏双栏 / 竖屏单栏、防误触、磁吸放置与分难度烟花判定。

- [ ] **Step 1: 实现全功能顶层应用 `src/App.tsx`**

`src/App.tsx`:
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { BUILTIN_LEVELS } from './engine/levels';
import { BlockId, Coord, PlacedBlock } from './engine/types';
import { BLOCKS_16, rotateClockwise } from './engine/polyominoes';
import { coordsToBitmask, validatePlacement, checkVictory } from './engine/bitboard';
import { findSolution } from './engine/solver';
import { soundEngine } from './audio/soundEngine';
import { fireworksEngine } from './fx/fireworks';
import { ConsoleShell } from './components/ConsoleShell';
import { LedBoard } from './components/LedBoard';
import { BlockTray } from './components/BlockTray';
import { FireworksOverlay } from './components/FireworksOverlay';

interface DragState {
  blockId: BlockId;
  cells: Coord[];
  startX: number;
  startY: number;
  currX: number;
  currY: number;
}

export const App: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = BUILTIN_LEVELS[levelIndex];

  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [errorCoords, setErrorCoords] = useState<Coord[]>([]);
  const [hintCells, setHintCells] = useState<Coord[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 拖拽手势状态
  const [dragState, setDragState] = useState<DragState | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  // 切关或重置时清空状态
  const resetLevel = () => {
    setPlacedBlocks([]);
    setErrorCoords([]);
    setHintCells([]);
    setIsWon(false);
  };

  const handleNextLevel = () => {
    soundEngine.playClick();
    if (levelIndex < BUILTIN_LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
      resetLevel();
    }
  };

  const handlePrevLevel = () => {
    soundEngine.playClick();
    if (levelIndex > 0) {
      setLevelIndex(levelIndex - 1);
      resetLevel();
    }
  };

  // 提示模式 (Learn/Hint)
  const handleHint = () => {
    soundEngine.playClick();
    const solution = findSolution(currentLevel.targetMask, currentLevel.allowedColors);
    if (!solution || solution.length === 0) return;

    // 找到尚未放置的第一块解法积木并高亮其格子
    const placedSet = new Set(placedBlocks.map((b) => b.id));
    const nextPiece = solution.find((b) => !placedSet.has(b.id));
    if (nextPiece) {
      setHintCells(nextPiece.cells);
      setTimeout(() => setHintCells([]), 3500);
    }
  };

  // 处理盘面积木点击：如果已上盘，再次点击进行顺时针旋转；若旋转越界则弹回或取下
  const handleGridCellClick = (x: number, y: number) => {
    soundEngine.init();
    const clickedBlockIndex = placedBlocks.findIndex((b) =>
      b.cells.some(([cx, cy]) => cx === x && cy === y)
    );
    if (clickedBlockIndex === -1) return;

    const targetBlock = placedBlocks[clickedBlockIndex];
    const rotated = rotateClockwise(targetBlock.cells.map(([cx, cy]) => [cx - targetBlock.rootX, cy - targetBlock.rootY] as Coord));
    const newAbsolute: Coord[] = rotated.map(([cx, cy]) => [cx + targetBlock.rootX, cy + targetBlock.rootY]);

    const otherBlocks = placedBlocks.filter((_, idx) => idx !== clickedBlockIndex);
    let otherMask = 0n;
    for (const b of otherBlocks) otherMask |= coordsToBitmask(b.cells);

    const validation = validatePlacement(
      otherMask,
      currentLevel.targetMask,
      newAbsolute,
      targetBlock.color,
      currentLevel.allowedColors
    );

    if (validation.valid) {
      soundEngine.playClick();
      const updated = [...otherBlocks, { ...targetBlock, cells: newAbsolute }];
      setPlacedBlocks(updated);
      checkVictoryState(updated);
    } else {
      // 无法原地旋转则移除放回托盘
      soundEngine.playClick();
      setPlacedBlocks(otherBlocks);
    }
  };

  const checkVictoryState = (blocks: PlacedBlock[]) => {
    if (checkVictory(blocks, currentLevel.targetMask, currentLevel.allowedColors)) {
      setIsWon(true);
      soundEngine.playVictory(currentLevel.difficulty);
      fireworksEngine.launch(currentLevel.difficulty);
      setTimeout(() => {
        if (levelIndex < BUILTIN_LEVELS.length - 1) {
          setLevelIndex((prev) => prev + 1);
          resetLevel();
        }
      }, 4000);
    }
  };

  // 开始拖拽
  const handleStartDrag = (blockId: BlockId, cells: Coord[], clientX: number, clientY: number) => {
    soundEngine.init();
    soundEngine.playClick();
    setDragState({
      blockId,
      cells,
      startX: clientX,
      startY: clientY,
      currX: clientX,
      currY: clientY,
    });
  };

  // 全局 Pointer 事件追踪
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState) return;
      setDragState((prev) => (prev ? { ...prev, currX: e.clientX, currY: e.clientY } : null));
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragState) return;
      const { blockId, cells, currX, currY } = dragState;
      setDragState(null);

      if (!boardContainerRef.current) return;
      const boardRect = boardContainerRef.current.getBoundingClientRect();

      // iPad 体验：指尖上方 24px 视线偏移补偿（Review Focus 1）
      const touchAdjustedY = currY - 24;

      // 判断是否释放于 8x8 盘面区域
      if (
        currX >= boardRect.left &&
        currX <= boardRect.right &&
        touchAdjustedY >= boardRect.top &&
        touchAdjustedY <= boardRect.bottom
      ) {
        const cellSize = boardRect.width / 8;
        const gridX = Math.floor((currX - boardRect.left) / cellSize);
        const gridY = Math.floor((touchAdjustedY - boardRect.top) / cellSize);

        const absoluteCells: Coord[] = cells.map(([cx, cy]) => [cx + gridX, cy + gridY]);
        const blockDef = BLOCKS_16[blockId];

        let currentBoardMask = 0n;
        for (const b of placedBlocks) currentBoardMask |= coordsToBitmask(b.cells);

        const validation = validatePlacement(
          currentBoardMask,
          currentLevel.targetMask,
          absoluteCells,
          blockDef.color,
          currentLevel.allowedColors
        );

        if (validation.valid) {
          soundEngine.playSnap();
          const newPlaced: PlacedBlock = {
            id: blockId,
            color: blockDef.color,
            rootX: gridX,
            rootY: gridY,
            rotation: 0,
            cells: absoluteCells,
          };
          const nextBlocks = [...placedBlocks, newPlaced];
          setPlacedBlocks(nextBlocks);
          checkVictoryState(nextBlocks);
        } else {
          soundEngine.playError();
          setErrorCoords(absoluteCells);
          setTimeout(() => setErrorCoords([]), 600);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, placedBlocks, currentLevel, levelIndex]);

  const placedBlockIds = new Set(placedBlocks.map((b) => b.id));

  return (
    <div className="relative min-h-screen w-full bg-[#0d0f14] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none touch-none">
      <FireworksOverlay />

      {/* iPad 横竖自适应容器 */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 w-full max-w-6xl">
        {/* 掌机机身核心区 */}
        <ConsoleShell
          level={currentLevel}
          onPrev={handlePrevLevel}
          onNext={handleNextLevel}
          onReset={resetLevel}
          onHint={handleHint}
          isMuted={isMuted}
          onToggleSound={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            soundEngine.setMuted(nextMuted);
          }}
        >
          <div ref={boardContainerRef} className="relative">
            <LedBoard
              targetMask={currentLevel.targetMask}
              placedBlocks={placedBlocks}
              errorCoords={errorCoords}
              hintCells={hintCells}
              isVictorious={isWon}
              onGridClick={handleGridCellClick}
            />
          </div>
        </ConsoleShell>

        {/* 积木选择与备选舱 */}
        <BlockTray
          allowedColors={currentLevel.allowedColors}
          placedBlockIds={placedBlockIds}
          onStartDrag={handleStartDrag}
        />
      </div>

      {/* 拖拽浮动预览 */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transition-none"
          style={{
            left: dragState.currX,
            top: dragState.currY - 24,
            transform: 'translate(-50%, -50%) scale(1.1)',
          }}
        >
          <div
            className="grid gap-1 p-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${Math.max(...dragState.cells.map(([x]) => x)) + 1}, 28px)`,
              gridTemplateRows: `repeat(${Math.max(...dragState.cells.map(([, y]) => y)) + 1}, 28px)`,
            }}
          >
            {Array.from({ length: Math.max(...dragState.cells.map(([, y]) => y)) + 1 }).map((_, y) =>
              Array.from({ length: Math.max(...dragState.cells.map(([x]) => x)) + 1 }).map((_, x) => {
                const hasCell = dragState.cells.some(([cx, cy]) => cx === x && cy === y);
                const color = BLOCKS_16[dragState.blockId].color;
                const colorMap = {
                  red: 'bg-red-500 border-red-300',
                  yellow: 'bg-yellow-400 border-yellow-200',
                  blue: 'bg-blue-500 border-blue-300',
                  green: 'bg-green-500 border-green-300',
                }[color];
                return (
                  <div
                    key={`${x},${y}`}
                    className={`w-7 h-7 rounded-lg ${
                      hasCell ? `${colorMap} border shadow-lg` : 'bg-transparent'
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
```

- [ ] **Step 2: 创建入口文件 `src/main.tsx`**

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: 运行测试并执行构建检查**

Run: `npm test && npm run build`
Expected: 全部测试通过，打包成功输出到 `dist/` 目录。

- [ ] **Step 4: 提交主应用集成代码**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: integrate main game loop, iPad touch adaptation, snapping, and tiered fireworks feedback"
```

---

### Task 10: 整体系统验证与端到端运行测试

**Files:**
- Test: 全量单元测试套件
- Verify: 运行本地开发服务器并验证 iPad 视口适配与构建产物

- [ ] **Step 1: 运行全量单元测试**

Run: `npm test`
Expected: `polyominoes.test.ts`, `bitboard.test.ts`, `solver.test.ts` 全部 PASS。

- [ ] **Step 2: 执行生产环境构建验证**

Run: `npm run build`
Expected: 0 错误，生成高效单页应用产物包。

- [ ] **Step 3: 提交并打标签**

```bash
git add -A
git commit -m "chore: complete initial release verification of GiiKER Super Blocks Web"
```

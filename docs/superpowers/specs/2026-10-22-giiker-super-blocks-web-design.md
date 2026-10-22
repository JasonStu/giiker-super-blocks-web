# 计客超级积木（GiiKER Super Blocks）Web/iPad 版设计规范

**日期**：2026-10-22  
**状态**：已评审待执行  
**目标平台**：Web（现代桌面浏览器 + iPad Safari / PWA 触摸优化）

---

## 1. 概述与核心愿景

复刻经典益智硬件“计客超级积木（GiiKER Super Blocks）”的数字化 Web 版本。  
产品以**拟真硬件掌机风**呈现，还原黑灰磨砂质感外壳、8×8 LED 点阵发光矩阵、16 块四色几何积木，并针对 iPad 等触摸设备进行像素级触控手感与自适应排版优化。

针对通关反馈，新增**分难度阶梯式的通关烟花粒子光效系统**，强化成就感与游玩反馈。

---

## 2. 核心功能与玩法规则

### 2.1 游戏基础规则
1. **题面呈现**：
   - 8×8 LED 棋盘点亮特定网格（发光掩码 Target Mask）。
   - 侧边提示灯指示当前关卡**允许使用的积木颜色**（红、黄、蓝、绿）。
2. **积木摆放与操作**：
   - 玩家从右侧/底部托盘挑选允许颜色的积木。
   - **触控/鼠标操作**：
     - 单击积木：顺时针旋转 90°；
     - 按下拖拽：吸附到 8×8 棋盘网格；
     - 再次拖出或拖回托盘：移除该积木。
3. **判定与反馈机制**：
   - **有效放置**：积木落在未被占用的发光区域内，触发单次微光呼吸与入槽音。
   - **错误/违规反馈**：积木超出棋盘、重叠、覆盖了未点亮区域或使用了未允许颜色，错误格子高频闪烁报警（500ms）并自动弹回托盘。
   - **通关检测**：当棋盘当前覆盖掩码与目标掩码完全恒等（`currentMask === targetMask`）且无任何违规放置时，触发通关流程。

### 2.2 分难度通关烟花系统（Adaptive Victory Fireworks）
根据关卡难度（结合积木数量、形状复杂度和步长判定），渲染不同量级与色彩层次的 Canvas/SVG 烟花粒子：
* **初级关卡（Beginner，1~2 块积木）**：
  - **烟花类型**：微型单色/双色彩带纸屑喷发（Mini Confetti Popper）。
  - **音效**：清脆轻快的单音欢呼。
* **中级关卡（Intermediate，3~4 块积木）**：
  - **烟花类型**：双重环状牡丹花火（Double Ring Peony Fireworks）+ 金色余烬缓缓坠落。
  - **音效**：上升呼啸声 + 饱满爆炸琶音。
* **专家/烧脑关卡（Master/Expert，5 块及以上积木）**：
  - **烟花类型**：全屏多点连环重磅流星瀑布烟花（Grand Finale Multi-cluster Fireworks + Meteor Trails）+ 棋盘全亮彩虹跑马灯波浪。
  - **音效**：多重交响级通关号角与群响爆炸音。

### 2.3 教学与提示模式（Learn / Hint Mode）
- 提供“提示”按钮。当卡关时，内置回溯求解器（DLX / Backtracking）计算当前最少步可行解，以半透明呼吸光形态在棋盘上高亮引导下一块积木的位置和朝向。

---

## 3. 系统架构与技术选型

### 3.1 技术栈
- **框架**：React 18 / 19 + TypeScript
- **构建工具**：Vite（极速 HMR 与轻量打包）
- **样式方案**：Tailwind CSS + 自定义 CSS Glow / Neumorphic 硬件质感类
- **动画与粒子**：Canvas 2D 独立烟花层（轻量高性能，不干扰 DOM 状态）
- **触控方案**：原生 Pointer Events API（配合 `setPointerCapture` 与 `touch-action: none`）
- **音效引擎**：Web Audio API 代码合成器（无外部 MP3 依赖，零延迟）
- **移动端部署**：Web App Manifest + Apple Touch Icon（支持 iPad Safari PWA 添加到主屏幕全屏运行）

### 3.2 目录与模块划分

```
src/
├── engine/                  # 核心几何与规则引擎（无 UI 依赖）
│   ├── types.ts             # 积木、网格、关卡类型定义
│   ├── polyominoes.ts       # 16 款积木的标准坐标定义与旋转矩阵
│   ├── bitboard.ts          # 64 位 BigInt 位运算棋盘状态管理器
│   ├── levels.ts            # 内置关卡库（分级包含初、中、高级）
│   └── solver.ts            # DLX/回溯求解算法（验证与提示）
├── audio/                   # Web Audio 声音合成系统
│   ├── soundEngine.ts       # 咔嗒点击、入槽、报错哔声、难度通关乐
├── fx/                      # 特效系统
│   ├── fireworks.ts         # Canvas 粒子烟花引擎（按难度发射不同形态）
├── components/              # 视觉组件层
│   ├── ConsoleShell.tsx     # 拟真掌机机壳（磨砂深色金属/亚克力）
│   ├── LedBoard.tsx         # 8×8 点阵 LED 矩阵显示屏
│   ├── BlockPiece.tsx       # 独立积木渲染器（半透明质感，支持旋转预览）
│   ├── BlockTray.tsx        # 备选积木收纳舱（按四色分区与状态筛选）
│   ├── Controls.tsx         # 实体质感按钮（关卡加减、重置、提示、音量）
│   └── FireworksOverlay.tsx # 全屏透明烟花 Canvas 覆盖层
└── App.tsx                  # 顶层布局与 iPad 响应式状态流
```

---

## 4. 积木几何与位运算模型设计

### 4.1 积木拓扑定义（16 块多格骨牌）
每块积木具有独立唯一 ID、所属颜色（Red, Yellow, Blue, Green）和归一化坐标集合：
```typescript
export interface BlockDefinition {
  id: string;
  color: 'red' | 'yellow' | 'blue' | 'green';
  name: string;
  cells: Array<[number, number]>; // 例如 [[0,0], [0,1], [1,0]]
}
```

### 4.2 8×8 位棋盘计算（Bitboard）
每个格子映射到索引 $0 \sim 63$：
$$\text{bitIndex} = y \times 8 + x$$
一个 64 位整数（`BigInt`）即可完整表示棋盘状态：
- 重叠碰撞检测：`(currentBoard & newPieceMask) !== 0n`
- 越界检测：积木各坐标必须满足 $0 \le x < 8$ 且 $0 \le y < 8$
- 通关检测：`currentBoard === targetMask`

---

## 5. iPad 触控与响应式设计规格

### 5.1 屏幕适配模式
- **iPad 横屏（Landscape，优先推荐模式）**：
  - 左侧 60% 宽度：居中展示完整的拟真计客掌机机身。
  - 右侧 40% 宽度：纵向排列的“积木扩展舱”，方便右手随时抽取、点按旋转并推入棋盘。
- **iPad 竖屏（Portrait） / 手机**：
  - 上部 65% 高度：掌机主体。
  - 下部 35% 高度：横向滑动的积木收纳抽屉。

### 5.2 触控体验防错
1. 容器全局样式设定 `touch-action: none; user-select: none; -webkit-user-select: none;`。
2. 拖拽时启用 `setPointerCapture`，手指即使滑出积木边缘也不会丢帧或断触。
3. 拖拽偏移量微调：触控点位于积木中心偏下 24px，手指按下时积木向上微凸，确保视线不被指尖完全遮挡。

---

## 6. 测试与验收标准

1. **几何与算法准确性**：
   - 16 块积木的 4 种旋转方向坐标计算全部通过单元测试；
   - 求解器对所有内置关卡均能正确求出可行解。
2. **规则判断无漏洞**：
   - 非法颜色、重叠放置、多余覆盖均能精准拦截并触发红色连闪错误提示；
   - 覆盖所有发光点且无多余时 100% 触发通关。
3. **iPad Safari 运行体验**：
   - 连续触摸拖拽 0 掉帧（稳定 60~120 fps）；
   - 无任何滚动条跳动、橡皮筋反弹或页面误放大。
4. **视觉与音效**：
   - LED 具有发光呼吸感；
   - 通关时根据当前难度准确播放对应的初/中/高级烟花粒子与胜利音效。

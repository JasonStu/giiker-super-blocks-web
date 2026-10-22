# 计客超级积木 Web / iPad 电子复刻版 (GiiKER Super Blocks Web)

> 🎮 完美复刻经典益智掌机「计客超级积木」，专为 iPad 触控与现代 Web 打造，包含 100 个 100% 可解关卡、5 阶动态难度机身主题与全套拟真交互音效。

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 核心特性

- 🕹️ **拟真掌机工业质感**：黑灰磨砂机身外壳、立体微动按键、音效扬声器微孔与 $8 \times 8$ 冰蓝冷光 LED 点阵屏。
- 🧩 **精简 8 块经典多格骨牌（Polyominoes）**：
  - **红（2块）**：单格点（1格）、四格田（4格）
  - **黄（2块）**：双格棒（2格）、四格T（4格）
  - **蓝（2块）**：三格折角（3格）、四格L（4格）
  - **绿（2块）**：三格长棒（3格）、四格Z（4格）
  - 零滚动自适应网格，iPad / 桌面上一屏尽览。
- 🏆 **100 个递进关卡（100% 数学严密可解）**：通过逆向骨牌平铺算法与 DLX 回溯求解器严密验证，杜绝任何死关。
- 🎨 **5 阶难度与动态背景板主题**：
  - **入门 (Novice, 001~020)**：极客青蓝（Cyber Cyan）
  - **初级 (Apprentice, 021~040)**：翡翠幽绿（Emerald Green）
  - **进阶 (Adept, 041~060)**：琥珀耀金（Amber Gold）
  - **大师 (Master, 061~080)**：魅影霓紫（Neon Violet）
  - **地狱 (Grandmaster, 081~100)**：熔岩赤红（Crimson Inferno）
- 📱 **iPad 触控优化与防误触**：
  - 全容器 `touch-action: none`，消除 Safari 橡皮筋滚动与双击缩放；
  - 磁吸半透明高亮投影（Ghost Preview），所见即所得；
  - 盘面积木**单击旋转**、**双击秒级卸下退回托盘**，操作流畅防误删。
- 🎆 **阶梯式 Canvas 烟花与纯代码合成音效**：根据关卡难度触发不同规模的烟花粒子与交响通关和弦，零外部 MP3 依赖。
- 💡 **智能解题提示（Hint Mode）**：卡关时点击灯泡💡按键，棋盘以琥珀色呼吸虚线指引最优解法。

---

## 🛠️ 本地运行与开发

### 1. 环境准备
确保已安装 [Node.js](https://nodejs.org/) (>= 18)。

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器（支持局域网 iPad 预览）
```bash
npm run dev -- --host
```
启动后终端将输出本机地址与局域网 IP（例如 `http://192.168.x.x:5173/`）。

### 4. 在 iPad 上全屏体验（推荐）
1. 确保 iPad 与电脑连接在同一 Wi-Fi 下；
2. 用 iPad Safari 打开终端显示的局域网地址；
3. 点击 Safari 导航栏的 **“分享” $\to$ “添加到主屏幕”**；
4. 从主屏幕启动，即可享受无浏览器边框的 100% 独立原生掌机全屏体验！

### 5. 运行测试
```bash
npm test
```

### 6. 打包构建
```bash
npm run build
```

---

## 📂 目录结构

```
src/
├── engine/                  # 核心几何与规则引擎（无 UI 依赖）
│   ├── types.ts             # 骨牌、网格、关卡类型定义
│   ├── polyominoes.ts       # 8 款积木的标准坐标定义与旋转矩阵
│   ├── bitboard.ts          # 64 位 BigInt 位运算棋盘状态管理器
│   ├── levels.ts            # 100 个 100% 可解关卡数据
│   └── solver.ts            # DLX / 回溯求解算法
├── audio/                   # Web Audio 声音合成系统
│   └── soundEngine.ts       # 咔嗒点击、入槽、报错哔声、五阶通关旋律
├── fx/                      # 特效系统
│   └── fireworks.ts         # Canvas 粒子烟花引擎（按难度发射不同形态）
├── components/              # 视觉组件层
│   ├── ConsoleShell.tsx     # 拟真掌机机壳（动态 5 阶难度主题）
│   ├── LedBoard.tsx         # 8×8 点阵 LED 矩阵显示屏
│   ├── BlockPiece.tsx       # 独立积木渲染器（半透明质感，支持旋转预览）
│   ├── BlockTray.tsx        # 8 块精简积木收纳舱
│   ├── Controls.tsx         # 难度选择器与物理质感按钮
│   └── FireworksOverlay.tsx # 全屏透明烟花 Canvas 覆盖层
└── App.tsx                  # 顶层布局与 iPad 响应式状态流
```

---

## 📄 开源许可

[MIT License](LICENSE)

import { BlockId, Difficulty } from '../engine/types';

export type Language = 'en' | 'zh';

export function getDefaultLanguage(): Language {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (browserLang.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
  }
  return 'en'; // 海外默认纯正英文
}

export interface Translations {
  brandTitle: string;
  brandSubtitle: string;
  level: string;
  difficulties: Record<Difficulty, string>;
  blocks: Record<BlockId, string>;
  trayTitle: string;
  trayPiecesCount: string;
  trayActionHint: string;
  boardBottomHint: string;
  prevLevel: string;
  nextLevel: string;
  hintBtn: string;
  resetBtn: string;
  muteBtn: string;
  unmuteBtn: string;
  challengeCleared: string;
  nextLevelBtn: string;
  toasts: {
    outsideTarget: string;
    overlap: string;
    colorDisallowed: string;
    outOfBounds: string;
    cannotRotate: string;
    removedBlock: (name: string) => string;
    hintToast: (name: string) => string;
    allBlocksPlaced: string;
    noHintAvailable: string;
    levelSwitched: (diffName: string, levelNum: number) => string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    brandTitle: "SUPER BLOCKS",
    brandSubtitle: "SMART CONSOLE",
    level: "LEVEL",
    difficulties: {
      novice: "Novice",
      apprentice: "Easy",
      adept: "Medium",
      master: "Hard",
      grandmaster: "Expert",
    },
    blocks: {
      r1: "Single Dot",
      r2: "Square 2x2",
      y1: "Domino 1x2",
      y2: "T-Shape",
      b1: "Corner 3",
      b2: "L-Shape",
      g1: "Bar 1x3",
      g2: "Z-Shape",
    },
    trayTitle: "BLOCK TRAY",
    trayPiecesCount: "8 PIECES",
    trayActionHint: "Tap to rotate · Drag to place",
    boardBottomHint: "Tap placed block to rotate, double-tap to remove",
    prevLevel: "Previous Level",
    nextLevel: "Next Level",
    hintBtn: "Hint",
    resetBtn: "Reset",
    muteBtn: "Mute",
    unmuteBtn: "Unmute",
    challengeCleared: "CHALLENGE CLEARED!",
    nextLevelBtn: "Next Level",
    toasts: {
      outsideTarget: "Outside target illuminated area",
      overlap: "Overlapping with another block",
      colorDisallowed: "Color not permitted for this level",
      outOfBounds: "Exceeds board boundary",
      cannotRotate: "Cannot rotate here (double-tap to remove)",
      removedBlock: (name) => `Removed ${name}`,
      hintToast: (name) => `Hint: Try placing [${name}]`,
      allBlocksPlaced: "All required blocks are already on the board!",
      noHintAvailable: "Analyzing solution or no hints available",
      levelSwitched: (diffName, levelNum) => `Switched to [${diffName}] Level ${levelNum}`,
    },
  },
  zh: {
    brandTitle: "SUPER BLOCKS",
    brandSubtitle: "智能空间掌机",
    level: "关卡",
    difficulties: {
      novice: "入门",
      apprentice: "初级",
      adept: "进阶",
      master: "大师",
      grandmaster: "地狱",
    },
    blocks: {
      r1: "单格点",
      r2: "四格田",
      y1: "双格棒",
      y2: "四格T",
      b1: "三格折角",
      b2: "四格L",
      g1: "三格长棒",
      g2: "四格Z",
    },
    trayTitle: "积木收纳舱",
    trayPiecesCount: "8 块积木",
    trayActionHint: "点击旋转 · 拖拽上盘",
    boardBottomHint: "提示：盘面积木点击旋转，双击可取下放回托盘",
    prevLevel: "上一关",
    nextLevel: "下一关",
    hintBtn: "解题提示",
    resetBtn: "清空重置",
    muteBtn: "静音",
    unmuteBtn: "开启声音",
    challengeCleared: "挑战成功！",
    nextLevelBtn: "下一关",
    toasts: {
      outsideTarget: "超出指定发光区域",
      overlap: "与其他积木重叠",
      colorDisallowed: "本关不允许使用该颜色",
      outOfBounds: "超出棋盘边界",
      cannotRotate: "空间受限无法旋转（双击可取下）",
      removedBlock: (name) => `已取下 ${name}`,
      hintToast: (name) => `提示：请尝试摆放【${name}】`,
      allBlocksPlaced: "所有必要积木已全部放置！",
      noHintAvailable: "此关卡解法探索中或无可提示积木",
      levelSwitched: (diffName, levelNum) => `已切换至【${diffName}】第 ${levelNum} 关`,
    },
  },
};

const NOVICE_EN_NAMES: Record<number, string> = {
  1: "Ladder",
  2: "Mini Flag",
  3: "Cabin",
  4: "Hammer",
  5: "Sailboat",
  6: "Rocket",
  7: "Raygun",
  8: "Windmill",
  9: "Teapot",
  10: "Duckling",
  11: "Giraffe",
  12: "Goldfish",
  13: "Space Station",
  14: "Umbrella",
  15: "Mushroom",
  16: "Mini Car",
  17: "Arch Bridge",
  18: "Sword",
  19: "Crown",
  20: "Pinwheel",
};

export function getLevelDisplayName(levelId: number, levelName: string, difficulty: Difficulty, lang: Language): string {
  const padId = String(levelId).padStart(3, '0');
  if (lang === 'zh') {
    return levelName;
  }

  // 英文翻译
  if (difficulty === 'novice') {
    const enName = NOVICE_EN_NAMES[levelId] || 'Novice';
    return `${enName} (${padId})`;
  }

  const diffLabel = translations.en.difficulties[difficulty];
  return `${diffLabel} ${padId}`;
}

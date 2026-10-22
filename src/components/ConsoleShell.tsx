import React from 'react';
import { LevelData } from '../engine/levels';
import { Difficulty } from '../engine/types';
import { Controls } from './Controls';

interface ConsoleShellProps {
  level: LevelData;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onHint: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
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
  onSelectDifficulty,
  isMuted,
  onToggleSound,
  children,
}) => {
  // 根据 5 级难度动态变换掌机机身背景板与氛围边缘光
  const themeStyles: Record<Difficulty, { chassis: string; border: string; glow: string; text: string }> = {
    novice: {
      chassis: 'from-[#17212b] to-[#0e141b]',
      border: 'border-[#1f3244]',
      glow: 'shadow-[0_20px_50px_rgba(6,182,212,0.18),inset_0_1px_2px_rgba(56,189,248,0.2)]',
      text: 'text-cyan-400',
    },
    apprentice: {
      chassis: 'from-[#13231a] to-[#0c1610]',
      border: 'border-[#1d3828]',
      glow: 'shadow-[0_20px_50px_rgba(16,185,129,0.18),inset_0_1px_2px_rgba(52,211,153,0.2)]',
      text: 'text-emerald-400',
    },
    adept: {
      chassis: 'from-[#241e12] to-[#141009]',
      border: 'border-[#3f311a]',
      glow: 'shadow-[0_20px_50px_rgba(245,158,11,0.18),inset_0_1px_2px_rgba(251,191,36,0.2)]',
      text: 'text-amber-400',
    },
    master: {
      chassis: 'from-[#221327] to-[#130917]',
      border: 'border-[#3d1d47]',
      glow: 'shadow-[0_20px_50px_rgba(168,85,247,0.18),inset_0_1px_2px_rgba(192,132,252,0.2)]',
      text: 'text-purple-400',
    },
    grandmaster: {
      chassis: 'from-[#261012] to-[#140608]',
      border: 'border-[#47181c]',
      glow: 'shadow-[0_20px_50px_rgba(244,63,94,0.22),inset_0_1px_2px_rgba(251,113,133,0.25)]',
      text: 'text-rose-400',
    },
  };

  const currentTheme = themeStyles[level.difficulty];

  return (
    <div
      className={`relative p-5 sm:p-7 bg-gradient-to-b ${currentTheme.chassis} border-4 ${currentTheme.border} rounded-3xl ${currentTheme.glow} transition-all duration-500 flex flex-col items-center gap-4 max-w-md w-full`}
    >
      {/* 顶部品牌与扬声器孔 */}
      <div className="w-full flex items-center justify-between pb-1 border-b border-slate-700/40">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm tracking-widest text-slate-300">GiiKER</span>
          <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${currentTheme.text}`}>
            PRO EDITION
          </span>
        </div>
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
          onSelectDifficulty={onSelectDifficulty}
          isMuted={isMuted}
          onToggleSound={onToggleSound}
        />
      </div>
    </div>
  );
};

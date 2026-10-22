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

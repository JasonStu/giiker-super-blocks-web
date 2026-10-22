import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import { LevelData } from '../engine/levels';
import { Difficulty } from '../engine/types';

interface ControlsProps {
  level: LevelData;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onHint: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  level,
  onPrev,
  onNext,
  onReset,
  onHint,
  onSelectDifficulty,
  isMuted,
  onToggleSound,
}) => {
  const difficultyConfig: Record<Difficulty, { label: string; badge: string; activeBtn: string }> = {
    novice: {
      label: '入门',
      badge: 'bg-cyan-950 text-cyan-400 border-cyan-700',
      activeBtn: 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.6)]',
    },
    apprentice: {
      label: '初级',
      badge: 'bg-emerald-950 text-emerald-400 border-emerald-700',
      activeBtn: 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.6)]',
    },
    adept: {
      label: '进阶',
      badge: 'bg-amber-950 text-amber-400 border-amber-700',
      activeBtn: 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.6)]',
    },
    master: {
      label: '大师',
      badge: 'bg-purple-950 text-purple-400 border-purple-700',
      activeBtn: 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.6)]',
    },
    grandmaster: {
      label: '地狱',
      badge: 'bg-rose-950 text-rose-400 border-rose-700',
      activeBtn: 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]',
    },
  };

  const currentDiff = difficultyConfig[level.difficulty];

  const tiers: Difficulty[] = ['novice', 'apprentice', 'adept', 'master', 'grandmaster'];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 5 级难度快捷切换胶囊栏 */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#12141a]/90 border border-slate-700/60 rounded-xl">
        {tiers.map((d) => {
          const cfg = difficultyConfig[d];
          const isActive = level.difficulty === d;
          return (
            <button
              key={d}
              onClick={() => onSelectDifficulty(d)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? cfg.activeBtn
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 active:scale-95'
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* 关卡 LCD 拟真液晶屏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12161d] border-2 border-[#262f3a] rounded-xl shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase">LEVEL</span>
          <span className="text-xl font-bold text-sky-400 tracking-wider">
            {String(level.id).padStart(3, '0')}
          </span>
          <span className="text-xs text-slate-600">/ 100</span>
        </div>
        <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${currentDiff.badge}`}>
          {currentDiff.label}
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

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

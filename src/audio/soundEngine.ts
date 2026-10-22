import { Difficulty } from '../engine/types';

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

    let notes: number[] = [];
    let stepTime = 0.08;

    if (difficulty === 'novice') {
      notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    } else if (difficulty === 'apprentice') {
      notes = [523.25, 659.25, 783.99, 880.00, 1046.50];
    } else if (difficulty === 'adept') {
      notes = [440.00, 554.37, 659.25, 880.00, 1108.73, 1318.51];
    } else if (difficulty === 'master') {
      notes = [523.25, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
      stepTime = 0.07;
    } else {
      // grandmaster
      notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1174.66, 1318.51, 1567.98];
      stepTime = 0.06;
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

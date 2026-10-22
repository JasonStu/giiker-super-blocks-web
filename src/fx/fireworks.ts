import { Difficulty } from '../engine/types';

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

    const cyanPalette = ['#06b6d4', '#38bdf8', '#bae6fd', '#ffffff'];
    const greenPalette = ['#10b981', '#34d399', '#a7f3d0', '#facc15'];
    const amberPalette = ['#f59e0b', '#fbbf24', '#fef08a', '#fb923c'];
    const purplePalette = ['#a855f7', '#c084fc', '#e9d5ff', '#ec4899', '#38bdf8'];
    const crimsonPalette = ['#ef4444', '#f87171', '#fca5a5', '#fbbf24', '#ffffff'];

    if (difficulty === 'novice') {
      this.createBurst(w / 2, h * 0.45, 60, cyanPalette, 5);
    } else if (difficulty === 'apprentice') {
      this.createBurst(w * 0.38, h * 0.42, 80, greenPalette, 6);
      setTimeout(() => this.createBurst(w * 0.62, h * 0.38, 80, greenPalette, 6), 180);
    } else if (difficulty === 'adept') {
      this.createBurst(w * 0.3, h * 0.45, 90, amberPalette, 7);
      setTimeout(() => this.createBurst(w * 0.5, h * 0.32, 100, amberPalette, 8), 150);
      setTimeout(() => this.createBurst(w * 0.7, h * 0.45, 90, amberPalette, 7), 300);
    } else if (difficulty === 'master') {
      const spots = [
        [w * 0.25, h * 0.4],
        [w * 0.5, h * 0.28],
        [w * 0.75, h * 0.4],
        [w * 0.4, h * 0.48],
        [w * 0.6, h * 0.48],
      ];
      spots.forEach(([x, y], idx) => {
        setTimeout(() => this.createBurst(x, y, 90, purplePalette, 8), idx * 150);
      });
    } else {
      // grandmaster
      const spots = [
        [w * 0.2, h * 0.35],
        [w * 0.5, h * 0.25],
        [w * 0.8, h * 0.35],
        [w * 0.35, h * 0.45],
        [w * 0.65, h * 0.45],
        [w * 0.5, h * 0.55],
      ];
      spots.forEach(([x, y], idx) => {
        setTimeout(() => this.createBurst(x, y, 110, crimsonPalette, 10), idx * 130);
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

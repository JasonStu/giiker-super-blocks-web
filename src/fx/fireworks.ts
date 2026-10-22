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

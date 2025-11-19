
import * as PIXI from 'pixi.js';

const ZONES = [
  { from: '#1e3a8a', to: '#0c1e4a' }, // Deep Blue Space
  { from: '#4c1d95', to: '#2a0f5e' }, // Purple Nebula
  { from: '#b91c1c', to: '#7f1d1d' }, // Red Giant
  { from: '#065f46', to: '#043f2e' }, // Emerald Galaxy
  { from: '#fde047', to: '#facc15' }, // Golden Star
];

export class Background extends PIXI.Graphics {
  constructor(app: PIXI.Application) {
    super();
    app.stage.addChildAt(this, 0); // Add to back
  }

  updateZone(zone: number, width: number, height: number) {
    const zoneColors = ZONES[zone % ZONES.length];
    
    this.clear();
    
    const gradient = this.createGradient(zoneColors.from, zoneColors.to, width, height);
    
    this.beginTextureFill({ texture: gradient });
    this.drawRect(0, 0, width, height);
    this.endFill();
  }

  createGradient(from: string, to: string, width: number, height: number): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return PIXI.Texture.from(canvas);
  }
}

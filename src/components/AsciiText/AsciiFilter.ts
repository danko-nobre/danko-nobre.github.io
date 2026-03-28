import type { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

export interface AsciiFilterOpts {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
}

export class AsciiFilter {
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  width = 0;
  height = 0;
  cols = 0;
  rows = 0;
  deg = 0;
  hueBoost = 0;
  mouse = { x: 0, y: 0 };
  center = { x: 0, y: 0 };

  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;

  private readonly renderer: WebGLRenderer;

  constructor(renderer: WebGLRenderer, opts: AsciiFilterOpts = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    Object.assign(this.domElement.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
    });

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.domElement.appendChild(this.canvas);

    this.invert = opts.invert ?? true;
    this.fontSize = opts.fontSize ?? 12;
    this.fontFamily = opts.fontFamily ?? "'JetBrains Mono', monospace";
    this.charset = opts.charset ?? " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    this.context.imageSmoothingEnabled = false;
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h);
    this.reset();
    this.center = { x: w / 2, y: h / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  private reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const cw = this.context.measureText('A').width;
    this.cols = Math.floor(this.width / cw);
    this.rows = Math.floor(this.height / this.fontSize);
    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    Object.assign(this.pre.style, {
      fontFamily: this.fontFamily, fontSize: `${this.fontSize}px`,
      margin: '0', padding: '0', lineHeight: '1em',
      position: 'absolute', left: '0', top: '0', zIndex: '9',
    });
  }

  render(scene: Scene, camera: PerspectiveCamera) {
    this.renderer.render(scene, camera);
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (w && h) this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    this.asciify(w, h);
    this.hue();
  }

  private hue() {
    const dx = this.mouse.x - this.center.x;
    const dy = this.mouse.y - this.center.y;
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.hueBoost *= 0.95;
    this.domElement.style.filter = `hue-rotate(${(this.deg + this.hueBoost).toFixed(1)}deg)`;
  }

  private asciify(w: number, h: number) {
    if (!w || !h) return;
    const imgData = this.context.getImageData(0, 0, w, h).data;
    let str = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (x + y * w) * 4;
        const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
        if (a === 0) { str += ' '; continue; }
        const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) idx = this.charset.length - idx - 1;
        str += this.charset[idx];
      }
      str += '\n';
    }
    this.pre.textContent = str;
  }

  dispose() {
    // cleanup handled by AsciiRenderer
  }
}

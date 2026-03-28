export interface TextCanvasOpts {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export class TextCanvas {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly text: string;
  private readonly font: string;
  private readonly color: string;

  constructor(text: string, opts: TextCanvasOpts = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.text = text;
    this.color = opts.color ?? '#fdf9f3';
    this.font = `600 ${opts.fontSize ?? 200}px ${opts.fontFamily ?? 'Arial'}`;
  }

  resize() {
    this.ctx.font = this.font;
    const m = this.ctx.measureText(this.text);
    this.canvas.width = Math.ceil(m.width) + 20;
    this.canvas.height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 20;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.color;
    this.ctx.font = this.font;
    const m = this.ctx.measureText(this.text);
    this.ctx.fillText(this.text, 10, 10 + m.actualBoundingBoxAscent);
  }
}

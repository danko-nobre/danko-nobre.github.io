import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';
import { clamp, mapRange } from './utils';
import { AsciiFilter } from './AsciiFilter';
import { TextCanvas } from './TextCanvas';

export interface AsciiRendererOpts {
  text: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  enableWaves: boolean;
}

/** Maximum rotation in radians (~17°) to prevent the text disappearing. */
const MAX_ROTATION = 0.3;

export class AsciiRenderer {
  private readonly container: HTMLElement;
  private width: number;
  private height: number;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private mouse = { x: 0, y: 0 };
  private textCanvas!: TextCanvas;
  private texture!: THREE.CanvasTexture;
  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.ShaderMaterial;
  private mesh!: THREE.Mesh;
  private renderer!: THREE.WebGLRenderer;
  private filter!: AsciiFilter;
  private animationFrameId = 0;
  private isHovering = false;
  private targetWave: number;
  private targetGlitch = 0;
  private clickWaveBoost = 0;

  constructor(
    private readonly opts: AsciiRendererOpts,
    container: HTMLElement,
    w: number,
    h: number,
  ) {
    this.container = container;
    this.width = w;
    this.height = h;
    this.targetWave = opts.enableWaves ? 0.6 : 0;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    this.camera.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: w / 2, y: h / 2 };

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onLeave = this._onLeave.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  async init() {
    try {
      await document.fonts.load('600 200px "JetBrains Mono"');
      await document.fonts.load('500 12px "JetBrains Mono"');
    } catch { /* fonts may not be available */ }
    await document.fonts.ready;
    this.setupMesh();
    this.setupRenderer();
  }

  private setupMesh() {
    this.textCanvas = new TextCanvas(this.opts.text, {
      fontSize: this.opts.textFontSize,
      fontFamily: 'JetBrains Mono',
      color: this.opts.textColor,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.canvas);
    this.texture.minFilter = THREE.NearestFilter;

    const aspect = this.textCanvas.canvas.width / this.textCanvas.canvas.height;
    const bh = this.opts.planeBaseHeight;

    this.geometry = new THREE.PlaneGeometry(bh * aspect, bh, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.opts.enableWaves ? 1.0 : 0.0 },
        uGlitch: { value: 0.0 },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: this.opts.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('touchmove', this._onMouseMove);
    this.container.addEventListener('mouseenter', this._onEnter);
    this.container.addEventListener('mouseleave', this._onLeave);
    this.container.addEventListener('click', this._onClick);
  }

  // --- Event handlers ---

  private _onEnter() {
    this.isHovering = true;
    this.targetWave = 1.5;
    this.targetGlitch = 1.0;
    this.container.classList.add('is-glitching');
  }

  private _onLeave() {
    this.isHovering = false;
    this.targetWave = this.opts.enableWaves ? 0.6 : 0.0;
    this.targetGlitch = 0.0;
    this.container.classList.remove('is-glitching');
  }

  private _onClick() {
    this.filter.hueBoost += (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 120);
    this.clickWaveBoost = 3.0;
    this.targetGlitch = 1.5;
    this.container.classList.add('ascii-click-bounce');
    setTimeout(() => {
      this.container.classList.remove('ascii-click-bounce');
      this.targetGlitch = this.isHovering ? 1.0 : 0.0;
    }, 400);
  }

  private _onMouseMove(evt: MouseEvent | TouchEvent) {
    const e = 'touches' in evt ? evt.touches[0] : evt;
    const b = this.container.getBoundingClientRect();
    this.mouse = { x: e.clientX - b.left, y: e.clientY - b.top };
    this.filter.mouse = { x: e.clientX, y: e.clientY };
  }

  // --- Lifecycle ---

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.filter.setSize(w, h);
  }

  load() {
    const frame = () => {
      this.animationFrameId = requestAnimationFrame(frame);
      this.tick();
    };
    frame();
  }

  private tick() {
    const t = performance.now() * 0.001;

    const u = this.material.uniforms;
    u.uTime.value = Math.sin(t);

    this.clickWaveBoost *= 0.93;
    u.uEnableWaves.value += (this.targetWave + this.clickWaveBoost - u.uEnableWaves.value) * 0.08;
    u.uGlitch.value += (this.targetGlitch - u.uGlitch.value) * 0.1;

    const rx = clamp(mapRange(this.mouse.y, 0, this.height, 0.15, -0.15), -MAX_ROTATION, MAX_ROTATION);
    const ry = clamp(mapRange(this.mouse.x, 0, this.width, -0.15, 0.15), -MAX_ROTATION, MAX_ROTATION);
    this.mesh.rotation.x += (rx - this.mesh.rotation.x) * 0.03;
    this.mesh.rotation.y += (ry - this.mesh.rotation.y) * 0.03;

    this.filter.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.filter) {
      this.filter.dispose();
      if (this.filter.domElement.parentNode) {
        this.filter.domElement.remove();
      }
    }
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('touchmove', this._onMouseMove);
    this.container.removeEventListener('mouseenter', this._onEnter);
    this.container.removeEventListener('mouseleave', this._onLeave);
    this.container.removeEventListener('click', this._onClick);
    this.scene.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose();
        if (mesh.material) {
          const mat = mesh.material as THREE.Material;
          mat.dispose();
        }
      }
    });
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
  }
}

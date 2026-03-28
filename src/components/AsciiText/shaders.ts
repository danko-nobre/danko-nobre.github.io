export const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uEnableWaves;

  void main() {
    vUv = uv;
    float time = uTime * 2.0;
    float wf = uEnableWaves;
    vec3 t = position;
    t.x += sin(time + position.y) * 0.15 * wf;
    t.y += cos(time + position.z) * 0.05 * wf;
    t.z += sin(time + position.x) * 0.1 * wf;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(t, 1.0);
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uGlitch;
  uniform sampler2D uTexture;

  void main() {
    float time = uTime;
    vec2 pos = vUv;
    float s = 0.005 + uGlitch * 0.02;
    float r = texture2D(uTexture, pos + cos(time * 2.0 - time + pos.x) * s).r;
    float g = texture2D(uTexture, pos + tan(time * 0.5 + pos.x - time) * s).g;
    float b = texture2D(uTexture, pos - cos(time * 2.0 + time + pos.y) * s).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
  }
`;

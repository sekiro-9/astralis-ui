export const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const FRAGMENT_SHADER = `
// The hash needs more than 16-bit floats, which some phone GPUs use for mediump.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_offset;
uniform vec2 u_fade;
uniform float u_warp;
uniform float u_speed;
uniform float u_scale;
uniform float u_angle;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_c;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = m * p;
    amp *= 0.5;
  }
  return v;
}

float field(vec2 p, float t) {
  vec2 q = vec2(fbm(p + t * 0.6), fbm(p + vec2(5.2, 1.3) - t * 0.4));
  vec2 r = vec2(
    fbm(p + u_warp * q + vec2(1.7, 9.2) + t * 0.3),
    fbm(p + u_warp * q + vec2(8.3, 2.8) - t * 0.2)
  );
  return fbm(p + u_warp * r);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float cs = cos(u_angle);
  float sn = sin(u_angle);
  vec2 ruv = mat2(cs, -sn, sn, cs) * uv;
  vec2 p = ruv * u_scale + u_offset;
  float t = u_time * u_speed;

  float f = field(p, t);
  float e = 0.003;
  float fx = field(p + vec2(e, 0.0), t) - f;
  float fy = field(p + vec2(0.0, e), t) - f;
  vec3 n = normalize(vec3(-fx, -fy, e * 1.1));

  vec3 l = normalize(vec3(cos(t * 0.9) * 0.7, 0.75, 0.55));
  vec3 v = vec3(0.0, 0.0, 1.0);
  vec3 h = normalize(l + v);
  float diff = clamp(dot(n, l), 0.0, 1.0);
  float spec = pow(clamp(dot(n, h), 0.0, 1.0), 40.0);
  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);

  vec3 base = mix(u_a, u_b, smoothstep(0.3, 0.7, f));
  vec3 col = base * (0.12 + 1.0 * diff) + fres * u_c * 1.1 + spec * 1.0;

  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.018;

  // Edge to edge, except a ragged fade on the left, under the copy. The fade is
  // transparency, not a blend towards a colour, so the page shows through in
  // either theme and a theme switch never needs a rebuild.
  float sx = gl_FragCoord.x / u_res.x;
  float mask = smoothstep(u_fade.x, u_fade.y, sx + (f - 0.5) * 0.08);
  gl_FragColor = vec4(col * mask, mask);
}
`;

"use client";

import { useEffect, useRef, useState } from "react";
import { hexToRgb, type Rgb } from "./scene-colors";
import type { SceneVariant } from "./scene-seed";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./scene-shader";
import styles from "./scene.module.css";

/*
 * The form is soft and blurred, so it renders at half the element's CSS size
 * and the browser scales it up; nobody can see the difference, and it is a
 * quarter of the pixels. Together with 30fps and pausing off screen, that keeps
 * integrated GPUs, which also draw the desktop, well clear of saturation.
 */
const RENDER_SCALE = 0.5;
const MAX_WIDTH = 960;
const FRAME_MS = 1000 / 30;
/** The hero goes two-column at Tailwind's lg breakpoint (64rem). */
const LG_PX = 1024;

/** Deep, mid and light shades of the brand, as hex. */
export type ScenePalette = readonly [string, string, string];

/**
 * Where the form gives way to the page: `left` fades it out across a copy
 * column on the left (side by side at lg and up); `none` runs it edge to edge,
 * for content centred over it with its own veil.
 */
export type SceneFade = "left" | "none";

/** `palette` changes without a rebuild; the scene eases into the new colours. */
export function SceneCanvas({
  variant,
  palette,
  fade,
}: {
  variant: SceneVariant;
  palette: ScenePalette;
  fade: SceneFade;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const paletteRef = useRef(palette);
  const [unsupported, setUnsupported] = useState(false);
  const [deep, mid, light] = palette;

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) return;

    const created = createScene(canvas, variant, fade, paletteRef.current, () => setUnsupported(true));
    if (created === null) {
      setUnsupported(true);
      return;
    }
    scene.current = created;
    return () => {
      created.dispose();
      scene.current = null;
    };
  }, [variant, fade]);

  useEffect(() => {
    paletteRef.current = [deep, mid, light];
    scene.current?.setPalette(paletteRef.current);
  }, [deep, mid, light]);

  return unsupported ? (
    <div className={styles.fallback} />
  ) : (
    <canvas ref={ref} className={styles.canvas} aria-hidden />
  );
}

interface Scene {
  readonly dispose: () => void;
  readonly setPalette: (palette: ScenePalette) => void;
}

const FALLBACK_PALETTE: readonly [Rgb, Rgb, Rgb] = [
  [0.45, 0.3, 0.02],
  [0.98, 0.8, 0.08],
  [0.99, 0.88, 0.3],
];

function toRgb(palette: ScenePalette): [Rgb, Rgb, Rgb] {
  return [0, 1, 2].map((i) => hexToRgb(palette[i]) ?? FALLBACK_PALETTE[i]) as [Rgb, Rgb, Rgb];
}

function createScene(
  canvas: HTMLCanvasElement,
  variant: SceneVariant,
  fadeMode: SceneFade,
  palette: ScenePalette,
  onLost: () => void,
): Scene | null {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (gl === null) return null;

  const program = compile(gl);
  if (program === null) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  setUniforms(gl, program, variant);

  const colours = createColours(gl, program, toRgb(palette));
  const loop = startLoop(canvas, { gl, program, variant, fadeMode, beforeDraw: colours.step });
  const lost = (event: Event) => {
    event.preventDefault();
    loop.stop();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);
  return {
    dispose: () => {
      loop.stop();
      canvas.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
    setPalette: (next) => {
      colours.retarget(toRgb(next), loop.still);
      loop.redrawIfStill();
    },
  };
}

const EASE_PER_SECOND = 7;

/** The three colour uniforms, easing from where they are towards a target. */
function createColours(gl: WebGLRenderingContext, program: WebGLProgram, initial: [Rgb, Rgb, Rgb]) {
  const locations = ["u_a", "u_b", "u_c"].map((name) => gl.getUniformLocation(program, name));
  const current = initial.map((rgb) => [...rgb]);
  let target = initial;
  let last = 0;

  const upload = () => current.forEach((rgb, i) => gl.uniform3fv(locations[i], rgb));
  upload();

  return {
    retarget(next: [Rgb, Rgb, Rgb], jump: boolean) {
      target = next;
      if (jump) {
        next.forEach((rgb, i) => (current[i] = [...rgb]));
        upload();
      }
    },
    step(now: number) {
      const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      const k = 1 - Math.exp(-EASE_PER_SECOND * dt);
      current.forEach((rgb, i) => rgb.forEach((c, j) => (rgb[j] = c + (target[i][j] - c) * k)));
      upload();
    },
  };
}

function setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, variant: SceneVariant): void {
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform2fv(uniform("u_offset"), variant.offset);
  gl.uniform1f(uniform("u_warp"), variant.warp);
  gl.uniform1f(uniform("u_speed"), variant.speed);
  gl.uniform1f(uniform("u_scale"), variant.scale);
  gl.uniform1f(uniform("u_angle"), variant.angle);
}

/** Draws at 30fps while the canvas is on screen and the tab is visible, once
 *  when motion is reduced, and again on resize. */
function startLoop(
  canvas: HTMLCanvasElement,
  {
    gl,
    program,
    variant,
    fadeMode,
    beforeDraw,
  }: {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    variant: SceneVariant;
    fadeMode: SceneFade;
    beforeDraw: (now: number) => void;
  },
): { stop: () => void; redrawIfStill: () => void; still: boolean } {
  const resolution = gl.getUniformLocation(program, "u_res");
  const fade = gl.getUniformLocation(program, "u_fade");
  const time = gl.getUniformLocation(program, "u_time");
  const phase = variant.seed % 1000;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const started = performance.now();
  let frame = 0;
  let lastDrawn = 0;
  let onScreen = true;

  const draw = (elapsed: number) => {
    gl.uniform1f(time, elapsed + phase);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const resize = () => {
    const width = Math.min(Math.round(canvas.clientWidth * RENDER_SCALE), MAX_WIDTH);
    const height = Math.round(canvas.clientHeight * (width / Math.max(canvas.clientWidth, 1)));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform2f(resolution, width, height);
    // Side by side (lg and up), the form fades out across the copy column.
    // Stacked, or with no fade, it runs edge to edge and a CSS veil handles contrast.
    const sideBySide = fadeMode === "left" && canvas.clientWidth >= LG_PX;
    gl.uniform2f(fade, sideBySide ? 0.44 : -1, sideBySide ? 0.64 : -0.5);
  };
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    if (now - lastDrawn < FRAME_MS) return;
    lastDrawn = now;
    beforeDraw(now);
    draw((now - started) / 1000);
  };
  const start = () => {
    if (frame !== 0 || !onScreen || document.hidden) return;
    if (still) draw(0);
    else frame = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const onVisibility = () => (document.hidden ? stop() : start());
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (still) draw(0);
  });
  const viewObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
    if (onScreen) start();
    else stop();
  });
  resize();
  resizeObserver.observe(canvas);
  viewObserver.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  start();

  return {
    stop: () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
    redrawIfStill: () => {
      if (still) draw(0);
    },
    still,
  };
}

/** Null when a shader fails to compile or the program to link; the page then
 *  shows the flat fallback, and the log says why. */
function compile(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = vertex && fragment ? gl.createProgram() : null;

  if (program && vertex && fragment) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
  }
  if (vertex) gl.deleteShader(vertex);
  if (fragment) gl.deleteShader(fragment);
  if (!program) return null;

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.warn("Hero scene failed to link:", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (shader === null) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn("Hero scene failed to compile:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

"use client";

import dynamic from "next/dynamic";
import type { ScenePalette } from "./scene-canvas";
import styles from "./scene.module.css";

const SceneMount = dynamic(() => import("./scene-mount").then((m) => m.SceneMount), {
  ssr: false,
  loading: () => <div className={styles.fallback} />,
});

/** A new form on every visit, painted in the brand's deep, mid and light shades. */
export function HeroScene({ palette }: { palette: ScenePalette }) {
  return <SceneMount palette={palette} />;
}

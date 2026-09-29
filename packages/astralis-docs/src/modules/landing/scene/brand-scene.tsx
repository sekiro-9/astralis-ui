"use client";

import dynamic from "next/dynamic";
import type { SceneFade } from "./scene-canvas";
import styles from "./scene.module.css";

const SceneMount = dynamic(() => import("./scene-mount").then((m) => m.SceneMount), {
  ssr: false,
  loading: () => <div className={styles.fallback} />,
});

/** A new form on every visit, painted in the site's brand and following the picker. */
export function BrandScene({ fade }: { fade: SceneFade }) {
  return <SceneMount fade={fade} />;
}

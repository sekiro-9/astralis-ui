/* The interaction-state prop names, apart from the engine that resolves them,
   so code that only needs to recognise a state prop (the development identity
   attributes) does not pull the style maps into a browser bundle. */

/** State prop name -> the CSS variant it compiles to. */
export const STATE_VARIANTS = {
  hover: "hover",
  focusVisible: "focus-visible",
  active: "active",
} as const;

export type StatePropName = keyof typeof STATE_VARIANTS;

export const STATE_PROP_NAMES = Object.keys(STATE_VARIANTS) as StatePropName[];

const STATE_PROP_SET = new Set<string>(STATE_PROP_NAMES);

/** True when a prop key is an interaction-state object rather than a style prop. */
export const isStateProp = (key: string): key is StatePropName => STATE_PROP_SET.has(key);

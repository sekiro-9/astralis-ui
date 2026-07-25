/**
 * The semantic token SPEC — the single source of truth for how every semantic
 * role resolves, in light and in dark.
 *
 * Before this file, the same formulas lived in two places: hand-written
 * light/dark blocks in tokens/semantic.css, and a `mode === "dark" ? ... : ...`
 * ternary in theme-math.ts that a comment described as "mirrors the brand role
 * formulas in semantic.css". Two copies, synced by hand.
 *
 * Now both are generated from here:
 *   - tokens/semantic.css  via scripts/gen-semantic-css.mjs (build time)
 *   - the provider's inline overrides via theme-math.ts (runtime)
 *
 * Dependency- and React-free, like theme-math.ts — it runs in Node for the
 * generator and the CLI, and in the browser for the provider.
 */

/**
 * Every palette that implements the role vocabulary.
 *
 * The first ten are literal hues and are deliberately NOT themeable — a token
 * named `orange` must always contain orange, or `colorScheme="orange"` becomes
 * a lie.
 *
 * The last five are ROLE palettes. Each aliases a hue by default (see
 * tokens/color.css) but is a first-class palette in its own right, so seeding
 * one regenerates it without touching the hue underneath. That is how
 * `warningColor: "#eab308"` can be yellow while `orange-*` stays orange.
 */
export const HUES = [
  "gray", "red", "orange", "yellow", "green",
  "teal", "blue", "cyan", "purple", "pink",
  "brand", "error", "warning", "success", "info",
] as const;

/** The role palettes and the hue each falls back to. */
export const ROLE_PALETTES = {
  brand: "yellow",
  error: "red",
  warning: "orange",
  success: "green",
  info: "blue",
} as const;

export const ROLES = [
  "solid", "contrast", "label", "subtle", "muted", "stroke", "ring",
] as const;

/** Ramp steps. Note 950: gray-950 backs surface-raised in dark mode. */
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type Hue = (typeof HUES)[number];
export type Role = (typeof ROLES)[number];
export type Step = (typeof STEPS)[number];
export type Mode = "light" | "dark";

/**
 * A role resolves to a ramp step, to flat white/black, or to "auto".
 *
 * "auto" means "compute a readable contrast against this hue's solid fill".
 * Only `brand` uses it, and that is the point: brand's solid is user-supplied,
 * so its contrast cannot be authored ahead of time. Previously semantic.css
 * hardcoded black here, which was correct only because the default brand is
 * yellow — change the default hue and that line silently goes wrong. Both the
 * generator and the provider now resolve "auto" through contrastOn().
 */
export type RoleTarget = Step | "white" | "black" | "auto";

/**
 * The recipe every hue follows unless it overrides below. `contrast` is the
 * readable text color on the `solid` fill — for a static hue it is authored,
 * for the dynamic brand it is computed (see contrastOn in theme-math.ts).
 */
const STANDARD: Record<Mode, Record<Role, RoleTarget>> = {
  light: {
    solid: 600, contrast: "white", label: 700, subtle: 100,
    muted: 200, stroke: 500, ring: 500,
  },
  dark: {
    solid: 600, contrast: "white", label: 300, subtle: 900,
    muted: 800, stroke: 400, ring: 500,
  },
};

/**
 * Per-hue deviations from STANDARD.
 *
 *  - gray   is the neutral: its solid is near-black (light) / white (dark),
 *           and its strokes sit far lower-contrast than a chromatic hue's.
 *  - yellow is too luminous at 600 to carry white text, so its solid drops to
 *           300 and takes black contrast.
 *  - orange has the same problem in dark mode only.
 *  - brand  puts solid at 500 because 500 IS the user-supplied color.
 *
 * Every SEEDABLE palette takes contrast: "auto". A literal here is an answer
 * computed for one specific colour, and it is only right until someone supplies
 * a different one — a pale mint successColor with a hardcoded "white" gives
 * white text on a light green fill. "auto" stores the rule instead of the
 * answer. Verified: against the shipped defaults it reproduces every literal it
 * replaces, so this changes nothing until a seed is passed.
 *
 * The role palettes inherit their fallback hue's geometry (warning mirrors
 * orange's dark solid) so an unseeded theme renders exactly as before.
 */
const OVERRIDES: Partial<Record<Hue, Partial<Record<Mode, Partial<Record<Role, RoleTarget>>>>>> = {
  gray: {
    light: { solid: 900, label: 800, stroke: 200, ring: 400 },
    dark: { solid: "white", contrast: "black", label: 200, stroke: 800, ring: 400 },
  },
  orange: {
    dark: { solid: 500, contrast: "black" },
  },
  yellow: {
    light: { solid: 300, contrast: "black", label: 800 },
    dark: { solid: 300, contrast: "black", stroke: 500 },
  },
  brand: {
    light: { solid: 500, contrast: "auto" },
    dark: { solid: 500, contrast: "auto" },
  },
  error: {
    light: { contrast: "auto" },
    dark: { contrast: "auto" },
  },
  warning: {
    light: { contrast: "auto" },
    // Mirrors orange: 600 is too luminous to carry text on a dark surface.
    dark: { solid: 500, contrast: "auto" },
  },
  success: {
    light: { contrast: "auto" },
    dark: { contrast: "auto" },
  },
  info: {
    light: { contrast: "auto" },
    dark: { contrast: "auto" },
  },
};

/** The resolved role recipe for one hue in one mode. */
export function roleTargets(hue: Hue, mode: Mode): Record<Role, RoleTarget> {
  return { ...STANDARD[mode], ...(OVERRIDES[hue]?.[mode] ?? {}) };
}

/**
 * Neutral roles that carry no hue — the surface / label / stroke vocabulary
 * components reach for when they aren't painting with a palette.
 * Values are [light, dark] references into the primitive layer.
 *
 * Each family here is a LADDER: rungs measuring emphasis, nothing else. Status
 * colours deliberately do NOT live here. `surface-error` was never a rung on
 * the surface ladder — it is meaning, not elevation — and filing it under the
 * same prefix bought a second vocabulary for a job the palettes already did.
 * The two disagreed: `label-error` resolved to error-600 while `error-label`
 * resolved to error-700, so a validation message and an error Alert rendered
 * different reds. Status is a palette like any other: use `error-subtle`,
 * `error-label`, `error-stroke` — the same seven roles every hue implements,
 * and the same ones .astralis-accent-{status} rebinds onto the accent channel.
 */
export const GLOBAL_SEMANTICS: Record<string, [string, string]> = {
  /*
   * Layering surfaces. `base` is the page; anything sitting ON the page that
   * wants to be an alternate value is `subtle`; nested one level deeper it
   * goes back to `base`. `muted` is the filled-control surface (inputs, table
   * headers, disabled). `raised` is NOT a fourth neutral — it is `base` plus
   * dark-mode elevation: identical to base in light, one step lighter in dark,
   * where a shadow cannot read. Floating layers only.
   */
  "surface-base": ["white", "black"],
  "surface-subtle": ["gray-100", "gray-900"],
  "surface-muted": ["gray-200", "gray-800"],
  "surface-raised": ["white", "gray-950"],
  "surface-inverted": ["black", "white"],

  /*
   * Labels are ordered by contrast against the page: base > muted > subtle in
   * both modes. Every step here clears WCAG AA (4.5:1) on the page it sits on,
   * because `subtle` paints real content — placeholders, empty states, listbox
   * group headers, calendar weekday rows — not just decoration.
   *
   *   light  gray-900 17.7  |  gray-600 7.7  |  gray-500 4.8
   *   dark   gray-50  19.1  |  gray-300 13.5 |  gray-400 7.8
   *
   * `subtle` was gray-400 in light (2.6:1 on white, 2.0:1 on a muted card) —
   * a placeholder nobody could read. Dark is spaced one step wider than light
   * because the ramp offers nothing between gray-400 (7.8) and gray-500 (4.1)
   * on a near-black page: holding `muted` at gray-400 would have forced
   * `subtle` to 4.1 and missed AA.
   */
  "label-base": ["gray-900", "gray-50"],
  "label-muted": ["gray-600", "gray-300"],
  "label-subtle": ["gray-500", "gray-400"],
  "label-inverted": ["white", "black"],

  /*
   * Strokes are NOT a ladder climbing away from nothing the way surfaces are.
   * A default background is the absence of tint, so surfaces can only step up
   * from `base`. A default BORDER has to be visible, so `base` sits in the
   * middle and the other two step either side of it:
   *
   *   subtle  <  base  <  muted
   *   divider   default   hover / stronger
   *
   * Ordered by contrast against the page, so the light values ascend and the
   * dark ones descend. Keep `muted` on the far side of `base` in BOTH modes —
   * when it sat at gray-200 the light ramp read subtle < muted < base, and a
   * base-to-muted hover made the border fainter in light while strengthening
   * it in dark, from one line of code.
   */
  "stroke-base": ["gray-300", "gray-800"],
  "stroke-muted": ["gray-400", "gray-700"],
  "stroke-subtle": ["gray-100", "gray-900"],
  "stroke-inverted": ["black", "white"],
};

/* ==========================================================================
   THE SEED
   --------------------------------------------------------------------------
   The small set of inputs a theme is authored from. Everything else in the
   token layer is either derived from these or is structural (breakpoints,
   z-index, aspect ratios) and deliberately not themeable — changing those at
   runtime would desync the precompiled utility CSS.

   This type is the contract shared by the provider, the CLI, and (later) the
   docs theme builder and its AI generator.
   ========================================================================== */

export type ThemeSeed = {
  /** Brand hue. Becomes the brand ramp's 500 step; drives brand + accent roles. */
  brandColor?: string;
  /**
   * Neutral hue. Becomes the gray ramp's 500 step; drives every surface, label
   * and border — and, being the endpoints of the same ramp, white and black too,
   * so the page background follows the neutral instead of staying cool.
   */
  grayColor?: string;

  /*
   * Status colours. Each seeds its own ROLE palette (see ROLE_PALETTES), never
   * the hue underneath: `warningColor: "#eab308"` makes warnings yellow while
   * `--astralis-color-orange-*` and `colorScheme="orange"` stay orange.
   */
  /** Error / danger. Defaults to red. */
  errorColor?: string;
  /** Warning / caution. Defaults to orange. */
  warningColor?: string;
  /** Success / confirmation. Defaults to green. */
  successColor?: string;
  /** Informational. Defaults to blue. */
  infoColor?: string;

  /** Typeface for the Heading component. */
  fontHeading?: string;
  /** Typeface for body copy — also drives the .astralis reset. */
  fontBody?: string;
  /** Typeface for Code / CodeBlock. */
  fontMono?: string;

  /** Multiplier on the border-radius scale. 1 = default; 0 squares everything off. */
  radiusScale?: number;
  /** Multiplier on the spacing scale — the density dial. */
  spacingScale?: number;
  /** Multiplier on the font-size scale. */
  fontSizeScale?: number;
  /** Multiplier on transition durations. 0 effectively disables motion. */
  motionScale?: number;
};

/**
 * Base values for the scalable numeric ramps, in rem.
 *
 * These mirror tokens/{border,spacing,typography}.css. Those files stay
 * hand-authored (they carry non-scalable siblings like border styles and font
 * weights), so scripts/check-token-sync.mjs asserts these tables still match
 * the CSS rather than letting them drift silently.
 *
 * Keys are the token suffix as it appears in CSS — note the escaped dot in
 * "0\\.5". See scaleVarName() for why that escaping is context-dependent.
 */
export const SPACING_SCALE: Record<string, number> = {
  "0.5": 0.125, "1": 0.25, "1.5": 0.375, "2": 0.5, "2.5": 0.625, "3": 0.75,
  "3.5": 0.875, "4": 1, "4.5": 1.125, "5": 1.25, "6": 1.5, "7": 1.75, "8": 2,
  "9": 2.25, "10": 2.5, "11": 2.75, "12": 3, "14": 3.5, "16": 4, "20": 5,
  "24": 6, "28": 7, "32": 8, "36": 9, "40": 10, "44": 11, "48": 12, "52": 13,
  "56": 14, "60": 15, "64": 16, "72": 18, "80": 20, "96": 24,
};

/** Radius steps in rem. "none" (0) and "full" (9999px) are not scalable. */
export const RADIUS_SCALE: Record<string, number> = {
  "2xs": 0.0625, xs: 0.125, sm: 0.25, md: 0.375, lg: 0.5,
  xl: 0.75, "2xl": 1, "3xl": 1.5, "4xl": 2,
};

/** Transition durations in ms — the only scale not expressed in rem. */
export const DURATION_SCALE: Record<string, number> = {
  fastest: 50, faster: 100, fast: 150, moderate: 200,
  slow: 300, slower: 400, slowest: 500,
};

export const FONT_SIZE_SCALE: Record<string, number> = {
  "3xs": 0.5, "2xs": 0.625, xs: 0.75, sm: 0.875, md: 1, lg: 1.125, xl: 1.25,
  "2xl": 1.5, "3xl": 1.875, "4xl": 2.25, "5xl": 3, "6xl": 3.75, "7xl": 4.5,
  "8xl": 6, "9xl": 8,
};

/**
 * Custom property name for a scale step.
 *
 * Fractional steps are written escaped in a stylesheet — `--astralis-spacing-0\.5`,
 * `--astralis-size-1\/2` — because a bare dot or slash would end the identifier.
 * But the property's ACTUAL name has no backslash, so setting it from JS
 * (style.setProperty, a React style object) must use the unescaped form.
 *
 * Neither channel errors when you get it wrong, and they fail differently:
 *   - CSS text, unescaped  -> the declaration is a parse error and is DROPPED
 *   - setProperty, escaped -> SUCCEEDS, but defines a distinct property whose
 *                             name literally contains a backslash, so nothing
 *                             reading the real token ever sees it
 * Both leave the token at its old value with no diagnostic. Verified in-browser.
 *
 * Both characters are escaped even though only "." appears in the scale tables
 * today: size.css carries 25 slash-bearing fraction tokens, and the day one of
 * them becomes seedable this would otherwise fail silently.
 */
export const scaleVarName = (group: string, step: string, forCss: boolean) =>
  `--astralis-${group}-${forCss ? step.replace(/[./]/g, (c) => `\\${c}`) : step}`;

/* ==========================================================================
   THEME-NAMESPACE ALIASES
   --------------------------------------------------------------------------
   The utilities do not all read the source token. `@theme` maps an Astralis
   token onto a Tailwind namespace, and `prefix(astralis)` renames that
   namespace back into our own — so `--radius-lg: var(--astralis-border-radius-lg)`
   ships as `--astralis-radius-lg: var(--astralis-border-radius-lg)`, and
   `.astralis:rounded-lg` reads the ALIAS, not the source.

   That alias is declared at :root, where its var() resolves ONCE — the same
   baking problem the colour roles have. Overriding only the source token on a
   wrapper div therefore does nothing: verified in-browser, an override of
   --astralis-border-radius-lg alone left the utility at its default 8px, while
   setting both names moved it to 32px.

   Where the Tailwind name happens to match the source name (spacing, fonts),
   the two collide into one declaration and the source override works directly.
   Those groups have alias: null.

   scripts/check-token-sync.mjs asserts this table against tailwind-entry.css.
   ========================================================================== */

export type ScaleGroup = {
  /** The Astralis source token group, e.g. "border-radius". */
  source: string;
  /** The prefixed Tailwind namespace the utilities read, if it differs. */
  alias: string | null;
  /**
   * Base var for Tailwind's dynamic spacing form. Integer steps compile to
   * `var(--astralis-spacing-4)`, but fractional ones compile to
   * `calc(var(--astralis-spacing) * .5)` — so the base must be scaled too or
   * half-steps silently keep their default size.
   */
  baseVar?: { name: string; value: number };
};

export const SCALE_GROUPS = {
  spacing: { source: "spacing", alias: null, baseVar: { name: "--astralis-spacing", value: 0.25 } },
  radius: { source: "border-radius", alias: "radius" },
  fontSize: { source: "font-size", alias: "text" },
  duration: { source: "duration", alias: "transition-duration" },
} as const satisfies Record<string, ScaleGroup>;

/** `--astralis-color-*` name for a primitive reference like "gray-100". */
export const primitiveVar = (ref: string) => `--astralis-color-${ref}`;

/** The primitive a role points at, as a reference string ("blue-600", "white"). */
export const roleRef = (hue: Hue, target: RoleTarget): string =>
  target === "white" || target === "black" ? target : `${hue}-${target}`;

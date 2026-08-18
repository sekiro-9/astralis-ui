/* ==========================================================================
   ASTRALIS — CSS VALUE GRAMMAR (Tier C)
   --------------------------------------------------------------------------
   Classifies an ARBITRARY channel value (a string that is not a token)
   against the value type its channel carries — length, color, shadow,
   number, integer (spec propGroups[*].valueType).

   The design rule: NEVER reject valid CSS. A false "invalid" kills trust in
   the whole validator, so the grammar only condemns what is definitely
   wrong — a lone identifier outside the property's keyword set ("surfase",
   "fulll"), a unit that doesn't exist ("37pxx"), a function that cannot
   produce this value type (a gradient where a plain color goes). Anything
   it cannot decide — multi-part shorthands, layered shadows, exotic but
   plausible syntax — returns "no-claim" and passes.

   Verdicts: ok | invalid (+reason) | bare-number (caller warns, same rule
   as the runtime) | no-claim.
   ========================================================================== */

const CSS_WIDE = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);

const LENGTH_KEYWORDS = new Set([
  "auto", "none", "max-content", "min-content", "fit-content", "stretch",
]);

const LENGTH_UNITS = new Set([
  "px", "em", "rem", "ex", "ch", "cap", "ic", "lh", "rlh",
  "vw", "vh", "vi", "vb", "vmin", "vmax",
  "dvw", "dvh", "svw", "svh", "lvw", "lvh",
  "cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax",
  "cm", "mm", "q", "in", "pt", "pc",
]);

const FUNCTIONS = {
  length: new Set(["var", "calc", "min", "max", "clamp", "env", "fit-content"]),
  color: new Set([
    "var", "rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch",
    "color", "color-mix", "light-dark",
  ]),
  shadow: new Set(["var"]),
  number: new Set(["var", "calc", "min", "max", "clamp"]),
  integer: new Set(["var", "calc"]),
};

/** The CSS named colors, plus transparent/currentColor. */
const NAMED_COLORS = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque",
  "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood",
  "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk",
  "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
  "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen",
  "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
  "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
  "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue",
  "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro",
  "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey",
  "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
  "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
  "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
  "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
  "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen",
  "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue",
  "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
  "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue",
  "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
  "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff",
  "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
  "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
  "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray",
  "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle",
  "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
  "yellowgreen",
  "transparent", "currentcolor",
]);

const ok = { verdict: "ok" };
const invalid = (reason) => ({ verdict: "invalid", reason });

/**
 * Classify one arbitrary channel value against its value type.
 * @returns {{ verdict: "ok"|"invalid"|"bare-number"|"no-claim", reason?: string }}
 */
export function classifyChannelValue(raw, type) {
  const value = raw.trim();

  // Function calls first — their arguments may contain spaces and commas.
  const fn = value.match(/^([a-zA-Z-]+)\((.*)\)$/s);
  if (fn) {
    const name = fn[1].toLowerCase();
    if (FUNCTIONS[type]?.has(name)) return ok;
    if (type === "color" && name.endsWith("gradient")) {
      return invalid(
        `${name}() is a background-image — this channel sets a plain color; use style={{ backgroundImage: ... }} for gradients`,
      );
    }
    return invalid(`${name}() cannot produce a ${type}`);
  }

  // Multi-part values (padding shorthands, layered shadows): no claim.
  if (/[\s,]/.test(value)) return { verdict: "no-claim" };

  if (CSS_WIDE.has(value.toLowerCase())) return ok;

  // Numbers, with or without a unit.
  const num = value.match(/^[+-]?(?:\d+\.?\d*|\.\d+)([a-z%]*)$/i);
  if (num) {
    const unit = num[1].toLowerCase();
    switch (type) {
      case "integer":
        return unit === "" && /^[+-]?\d+$/.test(value) ? ok : invalid("takes a whole number");
      case "number":
        return unit === "" || unit === "%" ? ok : invalid("takes a plain number or percentage");
      case "length":
        if (unit === "") return { verdict: "bare-number" };
        return unit === "%" || LENGTH_UNITS.has(unit)
          ? ok
          : invalid(`"${unit}" is not a CSS length unit`);
      default:
        return invalid(`a number is not a ${type}`);
    }
  }

  // A lone identifier — the class the grammar exists for ("surfase", "fulll").
  if (/^[a-z-]+$/i.test(value)) {
    const word = value.toLowerCase();
    if (type === "color") return NAMED_COLORS.has(word) ? ok : invalid("not a CSS color name");
    if (type === "length") return LENGTH_KEYWORDS.has(word) ? ok : invalid("not a CSS sizing keyword");
    if (type === "shadow") return word === "none" ? ok : invalid("not a shadow");
    return invalid(`takes a ${type === "integer" ? "whole number" : "number"}`);
  }

  if (type === "color") {
    const hex = value.match(/^#([0-9a-f]+)$/i);
    if (hex) {
      return [3, 4, 6, 8].includes(hex[1].length) ? ok : invalid("malformed hex color");
    }
  }

  return { verdict: "no-claim" };
}

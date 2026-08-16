import { splitPlacement } from "../../utils/placement";
import type { HTMLAttributes, Ref } from "react";
import { astralisMerge } from "../../utils/astralis-merge";
import { textColors } from "../../const/color-mappings";
import { iconVariants } from "./icon.styles";
import type { IconProps } from "./icon.types";

/**
 * Icon — a bring-your-own-icon wrapper. It standardizes size (our sizing tokens),
 * colour (semantic tokens, inherited via `currentColor`), and stroke width, then
 * renders the icon you supply via `as` (an icon component) or `children` (a raw
 * `<svg>`). The library bundles NO icon set, so consumers ship only what they use.
 *
 * Decorative by default (`aria-hidden`); pass `aria-label` to expose it to AT.
 */
function Icon({
  as: As,
  children,
  size = "md",
  color,
  strokeWidth,
  className,
  ref,
  ...rest
}: IconProps & { ref?: Ref<SVGSVGElement> }) {
  // `style` stays in rest so splitPlacement folds the channel vars under it;
  // we then lift the combined style out to weave in Icon's own pieces.
  const { placementClass, rest: domProps } = splitPlacement(rest);
    const { style: incomingStyle, ...domRest } = domProps as typeof domProps & {
      style?: Record<string, unknown>;
    };

    const isToken = typeof size === "string";
    const classes = astralisMerge(
      iconVariants({ size: isToken ? size : undefined }),
      placementClass, className,
    );
    // `textColors` is a VALUE map since the var-channel migration — its
    // entries are CSS values, not classes, so colour is applied via style.
    // Non-token strings pass through raw, same as the channel props.
    const mergedStyle = {
      ...(color ? { color: textColors[color as keyof typeof textColors] ?? color } : {}),
      ...(isToken ? {} : { width: size, height: size }),
      ...incomingStyle, // channel vars first, caller's style last — both win over ours
    };
    const styleAttr = Object.keys(mergedStyle).length ? mergedStyle : undefined;
    const a11y = (rest as { "aria-label"?: string })["aria-label"]
      ? { role: "img" as const }
      : { "aria-hidden": true };

    if (As) {
      return (
        <As
          ref={ref}
          className={classes}
          style={styleAttr}
          {...(strokeWidth != null ? { strokeWidth } : {})}
          {...a11y}
          {...domRest}
        />
      );
    }

    if (children) {
      // domRest carries <svg> attrs; only the shared HTML/aria ones apply to a
      // <span>. (The SPLIT rest, not the raw one — the raw spread leaked
      // placement props onto the DOM as attributes.)
      return (
        <span
          ref={ref as unknown as Ref<HTMLSpanElement>}
          className={classes}
          style={styleAttr}
          {...a11y}
          {...(domRest as HTMLAttributes<HTMLSpanElement>)}
        >
          {children}
        </span>
      );
    }

    return null;
}

Icon.displayName = "Icon";
export default Icon;

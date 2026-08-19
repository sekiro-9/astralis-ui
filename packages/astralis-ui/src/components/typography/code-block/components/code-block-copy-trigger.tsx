"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, Ref } from "react";
import { codeBlockCopyTriggerClasses } from "../code-block.styles";
import type { CodeBlockCopyTriggerProps } from "../code-block.types";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { CheckIcon, CopyIcon } from "../../../icon/internal-icons";

const iconClasses = "astralis:size-3.5 astralis:shrink-0";

export function CodeBlockCopyTrigger({
  code,
  className = "",
  style,
  children,
  onClick,
  ref,
  ...rest
}: CodeBlockCopyTriggerProps & { ref?: Ref<HTMLButtonElement> }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    // No context: the trigger is the compound's ONLY client leaf, so it reads
    // the rendered code straight from the DOM at click time — the <code>
    // inside the nearest CodeBlock root is exactly what the user sees.
    const text =
      code ??
      event.currentTarget.closest("[data-astralis-codeblock]")?.querySelector("code")?.textContent ??
      undefined;
    if (!text || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be denied (permissions policy, insecure context) —
      // never surface that as an unhandled rejection.
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-label={copied ? "Copied" : "Copy code"}
      data-copied={copied || undefined}
      className={astralisMerge(codeBlockCopyTriggerClasses, className)}
      style={style}
      {...rest}
    >
      {typeof children === "function"
        ? children(copied)
        : (children ?? (copied ? <CheckIcon className={iconClasses} /> : <CopyIcon className={iconClasses} />))}
    </button>
  );
}

CodeBlockCopyTrigger.displayName = "CodeBlock.CopyTrigger";

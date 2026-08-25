"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, Ref } from "react";
import { Button } from "../../button";
import type { CopyButtonProps } from "../copy-button.types";
import { CheckIcon, CopyIcon } from "../../../icon/internal-icons";

const iconClasses = "astralis:size-3.5 astralis:shrink-0";

/**
 * A Button that writes `value` to the clipboard and confirms with a transient
 * copied state — the general-purpose sibling of `CodeBlock.CopyTrigger`.
 * Every Button prop (variant, size, colorScheme, …) passes through.
 */
export function CopyButton({
  value,
  copiedLabel = "Copied",
  timeout = 1600,
  children = "Copy",
  onClick,
  ref,
  ...buttonProps
}: CopyButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access can be denied (permissions policy, insecure context) —
      // never surface that as an unhandled rejection.
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), timeout);
  };

  return (
    <Button
      ref={ref}
      type="button"
      onClick={handleClick}
      data-copied={copied || undefined}
      leftIcon={copied ? <CheckIcon className={iconClasses} /> : <CopyIcon className={iconClasses} />}
      {...buttonProps}
    >
      {copied ? copiedLabel : children}
    </Button>
  );
}

CopyButton.displayName = "CopyButton";

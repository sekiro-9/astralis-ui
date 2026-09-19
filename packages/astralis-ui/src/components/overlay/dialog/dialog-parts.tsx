"use client";

import { useEffect, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { astralisMerge } from "../../../utils/astralis-merge";
import { useMergedRefs } from "../../../utils/merge-refs";
import { cloneSlot, resolveSlotChild, slotChildRef, type SlotElement } from "../slot";
import type { DialogCoreValue } from "./dialog-core";

/* The parts Modal, Drawer and AlertDialog share. Each family wraps them with
   its own context hook, so a part binds to its own family's nearest root. */

interface SlotPartProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  ctx: DialogCoreValue;
  children: SlotElement;
  ref?: Ref<HTMLElement>;
}

export function DialogTriggerPart({ ctx, children, ref, ...rest }: SlotPartProps) {
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(ref, slotChildRef(child));
  return cloneSlot(child, rest, {
    ref: mergedRef,
    onClick: () => ctx.setOpen(true),
    "aria-haspopup": "dialog",
    "aria-expanded": ctx.open,
  });
}

export function DialogClosePart({ ctx, children, ref, ...rest }: SlotPartProps) {
  const child = resolveSlotChild(children);
  const mergedRef = useMergedRefs<HTMLElement>(ref, slotChildRef(child));
  return cloneSlot(child, rest, { ref: mergedRef, onClick: ctx.close });
}

interface TextPartProps extends HTMLAttributes<HTMLElement> {
  ctx: DialogCoreValue;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

export function DialogTitlePart({ ctx, className, ref, ...rest }: TextPartProps) {
  const { titleId, setHasTitle } = ctx;
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return (
    <h2
      {...rest}
      ref={ref as Ref<HTMLHeadingElement>}
      id={titleId}
      className={astralisMerge("astralis:text-lg astralis:font-semibold astralis:text-label-base", className)}
    />
  );
}

export function DialogDescriptionPart({ ctx, className, ref, ...rest }: TextPartProps) {
  const { descriptionId, setHasDescription } = ctx;
  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);
  return (
    <p
      {...rest}
      ref={ref as Ref<HTMLParagraphElement>}
      id={descriptionId}
      className={astralisMerge("astralis:text-sm astralis:text-label-muted", className)}
    />
  );
}

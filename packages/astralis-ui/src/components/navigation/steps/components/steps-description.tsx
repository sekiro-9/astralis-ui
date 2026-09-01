"use client";

import { Text } from "../../../typography/text";
import { useStepsContext } from "../steps.context";
import { stepSizeClasses } from "../steps.styles";
import type { StepsDescriptionProps } from "../steps.types";

/** Steps.Description — secondary text beneath the title. Always muted. */
export function StepsDescription({ children, className, ...rest }: StepsDescriptionProps) {
  const { size } = useStepsContext();

  return (
    <Text size={stepSizeClasses[size].descSize} color="muted" className={className} {...rest}>
      {children}
    </Text>
  );
}

StepsDescription.displayName = "Steps.Description";

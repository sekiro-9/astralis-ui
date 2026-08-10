"use client";

import { Stat, VStack } from "astralis-ui";

const sizes = ["sm", "md", "lg", "xl"] as const;

export function StatSizes() {
  return (
    <VStack gap="6" alignItems="start">
      {sizes.map((size) => (
        <Stat key={size} size={size}>
          <Stat.Label>Monthly revenue · {size}</Stat.Label>
          <Stat.Value>$48,200</Stat.Value>
          <Stat.HelpText>
            <Stat.Indicator type="increase">8.1%</Stat.Indicator> from last month
          </Stat.HelpText>
        </Stat>
      ))}
    </VStack>
  );
}

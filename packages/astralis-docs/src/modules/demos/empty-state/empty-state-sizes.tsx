import { EmptyState, Flex } from "astralis-ui";
import { SearchX } from "lucide-react";

export function EmptyStateSizes() {
  return (
    <Flex gap="6" alignItems="start" wrap="wrap">
      {(["sm", "md", "lg"] as const).map((size) => (
        <EmptyState key={size} size={size}>
          <EmptyState.Indicator>
            <SearchX />
          </EmptyState.Indicator>
          <EmptyState.Title>No results</EmptyState.Title>
          <EmptyState.Description>size=&quot;{size}&quot;</EmptyState.Description>
        </EmptyState>
      ))}
    </Flex>
  );
}

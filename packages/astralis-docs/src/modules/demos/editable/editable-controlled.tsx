"use client";

import { useState } from "react";
import { Editable, Text, VStack } from "astralis-ui";

export function EditableControlled() {
  const [name, setName] = useState("Nova Starling");
  const [saved, setSaved] = useState("Nova Starling");

  return (
    <VStack gap="2" alignItems="start">
      <Editable value={name} onChange={setName} onSubmit={setSaved} onCancel={() => setName(saved)}>
        <Editable.Preview />
        <Editable.Input aria-label="Display name" />
      </Editable>
      <Text size="sm" color="muted">
        Saved: {saved}
      </Text>
    </VStack>
  );
}

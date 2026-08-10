import type { ReactNode } from "react";
import {
  Box,
  Code,
  Flex,
  Heading,
  List,
  ListItem,
  Separator,
  Tag,
  Text,
  VStack,
} from "astralis-ui";
import { CopyCommand } from "@/modules/docs/copy-command";
import { categoryLabel, type BlockSummary } from "@/lib/blocks";
import { BackLink } from "./back-link";
import { BlockWorkbench } from "./block-workbench";

interface BlockDetailProps {
  meta: BlockSummary;
  filename: string;
  code: ReactNode;
}

/**
 * A single block: what it is, a resizable live preview beside its source, and
 * how to pull it into a project.
 *
 * Server Component — hence the flat `ListItem` import rather than `List.Item`.
 * Namespace access on a client-reference stub resolves to undefined across the
 * RSC boundary.
 */
export function BlockDetail({ meta, filename, code }: BlockDetailProps) {
  const command = `astralis add ${meta.id}`;

  return (
    <VStack gap="8">
      <VStack gap="4">
        <BackLink href="/blocks">All blocks</BackLink>

        {/* Name and install command share a line: the command is the one thing
            a reader came here to act on, and the description said nothing the
            preview below does not show. It still feeds the page metadata. */}
        <Flex wrap="wrap" alignItems="end" justifyContent="between" columnGap="6" rowGap="3">
          {/* `minW="0"` lets a long block name shrink instead of shoving the
              install command off the row. This was a raw div until the sizing
              scale gained its zero. */}
          <Flex minW="0" alignItems="center" gap="3">
            <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight">
              {meta.name}
            </Heading>
            <Tag size="sm" variant="subtle" colorScheme="brand">
              {categoryLabel(meta.category)}
            </Tag>
          </Flex>
          <CopyCommand command={command} />
        </Flex>

        {/* Tag, not Badge: Badge is the status pill (Active, Beta), Tag is the
            keyword chip. The id is not repeated here — it is right above in the
            install command. */}
        <Flex wrap="wrap" alignItems="center" gap="1.5">
          {meta.tags.map((tag) => (
            <Tag key={tag} size="sm" variant="subtle" colorScheme="gray">
              {tag}
            </Tag>
          ))}
        </Flex>
      </VStack>

      <BlockWorkbench id={meta.id} name={meta.name} code={code} />

      <Separator />

      <VStack as="section" gap="4">
        <Heading as="h2" size="lg" weight="semibold" letterSpacing="tight">
          Add it to your project
        </Heading>

        {/* `as="ol"`: List renders a <ul> by default, and numbered steps are an
            ordered list — decimal markers alone don't carry that to a reader. */}
        <List as="ol" styleType="decimal" spacing="3" className="astralis:pl-5">
          <ListItem>
            <Text color="muted" lineHeight="relaxed">
              Run the command — it writes{" "}
              <Code>components/blocks/{filename}</Code> and leaves the rest of
              your project untouched.
            </Text>
            <Box mt="2">
              <CopyCommand command={command} />
            </Box>
          </ListItem>
          <ListItem>
            <Text color="muted" lineHeight="relaxed">
              Import it where you need it. The block only depends on{" "}
              <Code>astralis-ui</Code>, so it compiles in any React project — no
              extra packages, no framework lock-in.
            </Text>
          </ListItem>
          <ListItem>
            <Text color="muted" lineHeight="relaxed">
              Edit it. The copy, links and layout are plain JSX in your repo now
              — this is your file, not a dependency to configure around.
            </Text>
          </ListItem>
        </List>

        <Text size="sm" color="muted" lineHeight="relaxed">
          Composes{" "}
          {meta.uses.map((name, index) => (
            <span key={name}>
              {index > 0 && ", "}
              <Code size="sm">{name}</Code>
            </span>
          ))}
          .
        </Text>
      </VStack>
    </VStack>
  );
}

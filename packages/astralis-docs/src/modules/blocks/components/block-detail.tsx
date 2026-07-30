import type { ReactNode } from "react";
import { Badge, Code, Heading, List, ListItem, Separator, Text } from "astralis-ui";
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <BackLink href="/blocks">All blocks</BackLink>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Text size="xs" color="subtle" weight="medium" casing="uppercase" letterSpacing="wider">
              {categoryLabel(meta.category)}
            </Text>
            <Heading as="h1" size="2xl" weight="semibold" letterSpacing="tight" className="astralis:mt-1.5">
              {meta.name}
            </Heading>
            <Text color="muted" lineHeight="relaxed" className="astralis:mt-2">
              {meta.description}
            </Text>
          </div>
          <CopyCommand command={command} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" size="xs" className="font-mono lowercase">
            {meta.id}
          </Badge>
          {meta.tags.map((tag) => (
            <Badge key={tag} variant="subtle" colorScheme="gray" size="xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <BlockWorkbench id={meta.id} name={meta.name} code={code} />

      <Separator />

      <section className="flex flex-col gap-4">
        <Heading as="h2" size="lg" weight="semibold" letterSpacing="tight">
          Add it to your project
        </Heading>

        {/* `as="ol"`: List renders a <ul> by default, and numbered steps are an
            ordered list — decimal markers alone don't carry that to a reader. */}
        <List as="ol" styleType="decimal" spacing="3" className="astralis:ps-5">
          <ListItem>
            <Text color="muted" lineHeight="relaxed">
              Run the command — it writes <Code>components/blocks/{filename}</Code> and leaves
              the rest of your project untouched.
            </Text>
            <div className="mt-2">
              <CopyCommand command={command} />
            </div>
          </ListItem>
          <ListItem>
            <Text color="muted" lineHeight="relaxed">
              Import it where you need it. The block only depends on <Code>astralis-ui</Code>,
              so it compiles in any React project — no extra packages, no framework lock-in.
            </Text>
          </ListItem>
          <ListItem>
            <Text color="muted" lineHeight="relaxed">
              Edit it. The copy, links and layout are plain JSX in your repo now — this is your
              file, not a dependency to configure around.
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
      </section>
    </div>
  );
}

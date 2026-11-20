import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import React from "react";
import NextLink from "next/link";
import type { BundledLanguage } from "shiki";
// Flat parts by preference (compound `Table.*` dot-access also works
// server-side since 0.7.2: the client-reference-stub problem this map used
// to work around is gone).
import {
  Blockquote,
  Box,
  Code,
  Link,
  List,
  ListItem,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "astralis-ui";
import { CodeBlock } from "@/modules/docs/code-block";
import { ComponentPreview } from "@/modules/docs/component-preview";
import { PropsTable } from "@/modules/docs/props-table";

type HeadingProps = ComponentPropsWithoutRef<"h2">;

/*
 * The headings are Text rather than Heading: Heading pins `lineHeight="tight"`,
 * and these take each size's own line height, which no lineHeight token names.
 */

/** The "#" link a section heading reveals on hover (ids come from rehype-slug). */
function HeadingAnchor({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <Link
      href={`#${id}`}
      aria-label="Link to this section"
      // The TOC reads heading text; the "#" is not part of it.
      data-heading-anchor
      variant="plain"
      // An explicit colour also turns off Link's hover colour shift.
      color="brand-label"
      ml="2"
      // Link has no opacity prop, and the reveal follows the heading's hover.
      className="opacity-0 transition-opacity group-hover:opacity-100"
    >
      #
    </Link>
  );
}

function H2({ id, children, ...props }: HeadingProps) {
  return (
    <Text
      as="h2"
      id={id}
      fontFamily="heading"
      size="xl"
      weight="semibold"
      letterSpacing="tight"
      color="base"
      mt="12"
      mb="4"
      // `group` drives the anchor's reveal. Text takes no scroll margin,
      // padding or border props, so the rule above the section stays classes.
      className="group scroll-m-24 border-t border-stroke-base pt-10"
      {...props}
    >
      {children}
      <HeadingAnchor id={id} />
    </Text>
  );
}

function H3({ id, children, ...props }: HeadingProps) {
  return (
    <Text
      as="h3"
      id={id}
      fontFamily="heading"
      size="md"
      weight="semibold"
      lineHeight="normal"
      color="base"
      mt="8"
      mb="3"
      className="group scroll-m-24"
      {...props}
    >
      {children}
      <HeadingAnchor id={id} />
    </Text>
  );
}

/**
 * Fenced code blocks arrive as <pre><code className="language-x">…</code></pre>.
 * Re-render them through the Shiki CodeBlock instead.
 */
function Pre({ children }: { children?: ReactNode }) {
  const codeElement = React.Children.toArray(children).find(
    (child): child is React.ReactElement<{ className?: string; children?: ReactNode }> =>
      React.isValidElement(child),
  );

  const className = codeElement?.props.className ?? "";
  const lang = (className.replace("language-", "") || "tsx") as BundledLanguage;
  const code = codeElement?.props.children;

  if (typeof code !== "string") return <pre>{children}</pre>;

  return (
    <Box my="6">
      <CodeBlock code={code} lang={lang} />
    </Box>
  );
}

/*
 * Prose links keep their accent colour on hover and shift only the underline,
 * so the colour is set explicitly (which turns Link's own hover colour off)
 * and the underline's colour and offset, which have no props, stay classes.
 */
const proseLinkClass =
  "decoration-accent-stroke underline-offset-4 hover:decoration-accent-label";

const components: MDXComponents = {
  h1: (props) => (
    <Text
      as="h1"
      fontFamily="heading"
      size="3xl"
      weight="semibold"
      letterSpacing="tight"
      color="base"
      {...props}
    />
  ),
  h2: H2,
  h3: H3,
  p: (props) => (
    <Text
      color="muted"
      // The margin stays a class: the lead paragraph under the title and a
      // paragraph inside a list item override it by selector, and a class
      // cannot override a margin prop. 1.75rem is off the lineHeight scale.
      className="my-4 leading-7 [h1+&]:mt-3 [h1+&]:text-lg"
      {...props}
    />
  ),
  a: ({ href = "", ...props }) => {
    const external = href.startsWith("http");
    return external ? (
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        variant="underline"
        color="brand-label"
        weight="medium"
        className={proseLinkClass}
        {...props}
      />
    ) : (
      <Link
        as={NextLink}
        href={href}
        variant="underline"
        color="brand-label"
        weight="medium"
        className={proseLinkClass}
        {...props}
      />
    );
  },
  // List has no marker colour prop.
  ul: (props) => <List my="4" color="muted" className="marker:text-label-subtle" {...props} />,
  ol: (props) => (
    <List as="ol" styleType="decimal" my="4" color="muted" className="marker:text-label-subtle" {...props} />
  ),
  // ListItem has no line-height prop, and a paragraph inside an item loses its margins by selector.
  li: (props) => <ListItem className="leading-7 [&>p]:my-0" {...props} />,
  // A Box, not a Text: Text always sets a font size, and bold text must keep the size of its sentence.
  strong: (props) => <Box as="strong" color="base" className="font-semibold" {...props} />,
  /*
   * Prose primitives that map 1:1 onto library components. The docs page for
   * each of these documents the very component now rendering it: Code,
   * Blockquote, Table and Separator all paint from the same tokens as the
   * examples beside them, which is the whole point of dogfooding.
   */
  code: (props) => (
    <Code variant="outline" style={{ color: "var(--astralis-color-label-base)" }} {...props} />
  ),
  pre: Pre,
  blockquote: (props) => <Blockquote my="6" {...props} />,
  table: (props) => <Table variant="outline" my="6" className="docs-scroll" {...props} />,
  thead: (props) => <TableHeader {...props} />,
  tbody: (props) => <TableBody {...props} />,
  tr: (props) => <TableRow {...props} />,
  th: (props) => <TableHead {...props} />,
  td: (props) => (
    <TableCell
      className="leading-relaxed"
      style={{ color: "var(--astralis-color-label-muted)" }}
      {...props}
    />
  ),
  hr: () => <Separator my="10" />,
  // Docs building blocks available in every MDX page without imports.
  ComponentPreview,
  PropsTable,
  CodeBlock,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

import { Blockquote, Code, CodeBlock, Heading, Highlight, Icon, Kbd, Link, List, Text } from "astralis-ui";
import { blockquoteProps } from "../blockquote/blockquote-props";
import { codeProps } from "../code/code-props";
import { codeBlockProps } from "../code-block/code-block-props";
import { headingProps } from "../heading/heading-props";
import { highlightProps } from "../highlight/highlight-props";
import { iconProps } from "../icon/icon-props";
import { kbdProps } from "../kbd/kbd-props";
import { linkProps } from "../link/link-props";
import { listProps } from "../list/list-props";
import { textProps } from "../text/text-props";
import { asEntry, definePlaygrounds } from "./define";

export const typographyPlaygrounds = definePlaygrounds({
  "text-demo": {
    tag: "Text",
    component: asEntry(Text),
    rows: textProps,
    children: "The quick brown fox jumps over the lazy dog.",
    childrenLabel: "Content",
  },
  "heading-demo": {
    tag: "Heading",
    component: asEntry(Heading),
    rows: headingProps,
    children: "The quick brown fox",
  },
  "kbd-demo": { tag: "Kbd", component: asEntry(Kbd), rows: kbdProps, children: "Ctrl" },
  "code-demo": { tag: "Code", component: asEntry(Code), rows: codeProps, children: "npm i" },
  "link-demo": {
    tag: "Link",
    component: asEntry(Link),
    rows: linkProps,
    children: "Read the docs",
  },
  "list-demo": {
    tag: "List",
    component: asEntry(List),
    rows: listProps,
    fixture: (
      <>
        <List.Item>Semantic tokens over raw colors</List.Item>
        <List.Item>Responsive props on every primitive</List.Item>
        <List.Item>Precompiled CSS — no build step</List.Item>
      </>
    ),
  },
  "blockquote-demo": {
    tag: "Blockquote",
    component: asEntry(Blockquote),
    rows: blockquoteProps,
    baseProps: { cite: "Carl Sagan, Cosmos" },
    children: "The cosmos is within us. We are made of star-stuff.",
    childrenLabel: "Quote",
  },
  /* The query is required and bound to the sample text, so it rides along as a
     base prop; the text itself is what you edit. */
  "highlight-demo": {
    tag: "Highlight",
    component: asEntry(Highlight),
    rows: highlightProps,
    baseProps: { query: "tokens" },
    children: "Semantic tokens restyle every component. Swap the tokens, not the components.",
    childrenLabel: "Text",
  },
  /* A raw svg rather than an icon component: `as` takes a function, which the
     generated code couldn't carry. */
  "icon-demo": {
    tag: "Icon",
    component: asEntry(Icon),
    rows: iconProps,
    fixture: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z" />
      </svg>
    ),
  },
  "code-block-demo": {
    tag: "CodeBlock.Root",
    component: asEntry(CodeBlock.Root),
    rows: codeBlockProps,
    baseProps: { code: "npx astralis-cli init" },
    fixture: (
      <>
        <CodeBlock.Header>
          <CodeBlock.Title>Terminal</CodeBlock.Title>
          <CodeBlock.Control>
            <CodeBlock.CopyTrigger />
          </CodeBlock.Control>
        </CodeBlock.Header>
        <CodeBlock.Content>
          <CodeBlock.Code />
        </CodeBlock.Content>
      </>
    ),
  },
});

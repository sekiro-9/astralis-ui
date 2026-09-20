import { describe, expect, it } from "vitest";
import { docAsMarkdown, listDocs } from "./docs-markdown";

describe("docs as markdown", () => {
  const docs = listDocs();

  it("lists every guide and component page", () => {
    expect(docs.filter((doc) => doc.kind === "guide").length).toBeGreaterThan(5);
    expect(docs.filter((doc) => doc.kind === "component").length).toBeGreaterThan(50);
  });

  // The corpus behind llms.txt and the MCP server: no JSX may survive into it.
  it.each(docs.map((doc) => [doc.slug]))("%s renders to plain markdown", (slug) => {
    const md = docAsMarkdown(slug);
    expect(md).not.toBeNull();
    expect(md).not.toMatch(/<PropsTable\b/);
    expect(md).not.toMatch(/^export const metadata/m);
  });

  it("keeps the import lines inside code examples, and drops the MDX's own", () => {
    const md = docAsMarkdown("button") ?? "";
    expect(md).toMatch(/```tsx\nimport \{ Button \} from "astralis-ui";\n```/);
    expect(md).not.toMatch(/^import .* from "@\//m);
  });
});

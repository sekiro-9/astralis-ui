import type { Snapshot } from "astralis-cli/snapshot";
import { Alert, DataList, Heading, Text } from "astralis-ui";

import { CodeBlock } from "@/modules/docs/code-block";
import { plural } from "@/lib/issues/format";
import type { ReproCheck } from "@/server/repro";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading as="h3" size="sm" weight="semibold">
        {title}
      </Heading>
      {children}
    </section>
  );
}

function Findings({ findings }: { findings: NonNullable<Snapshot["findings"]> }) {
  return (
    <ul className="flex flex-col gap-2">
      {findings.map((f, i) => (
        <li key={i} className="rounded-lg border border-stroke-base px-3 py-2">
          <Text size="xs" color="muted" className="font-mono">
            {f.code} · {f.file}:{f.line}:{f.column}
          </Text>
          <Text size="sm">{f.message}</Text>
        </li>
      ))}
    </ul>
  );
}

function environmentRows(s: Snapshot): [string, string][] {
  const env = s.environment;
  const rows: [string, string | null][] = [
    ["astralis-ui", `${s.library.version} (spec ${s.library.specVersion}, ${s.library.specSha256.slice(0, 12)})`],
    ["Framework", env.framework.name ? `${env.framework.name === "next" ? "Next.js" : "Vite"} ${env.framework.version ?? ""}`.trim() : null],
    ["React", env.react],
    ["Browser", env.browser],
    ["Viewport", env.viewport ? `${env.viewport.width} × ${env.viewport.height}` : null],
    ["Colour mode", env.colorMode],
    ["Route", s.route],
    ["Captured with", s.source === "cli" ? "astralis report" : "Astralis DevTools"],
  ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}

/**
 * Everything a snapshot carries, rendered as text. Nothing in it is run:
 * repro.tsx is highlighted and checked by the validator's parser, and the
 * screenshot, the only non-text part, is a PNG or JPEG data URL the schema
 * has already checked.
 */
export function SnapshotView({ snapshot, repro }: { snapshot: Snapshot; repro: ReproCheck }) {
  const findings = snapshot.findings ?? [];
  return (
    <div className="flex flex-col gap-8">
      <Section title="Reproduction">
        <Text size="sm" color="muted">
          The reported component tree as a file that renders it. Page text the reporter did not share
          appears as the word “Text”.
        </Text>
        <CodeBlock code={repro.source} filename="repro.tsx" />
        {repro.errors.length === 0 ? (
          <Alert status="success" variant="subtle">
            <Alert.Description>
              repro.tsx passes the validator for astralis-ui {repro.checkedWith}
              {repro.warnings.length > 0 && `, with ${plural(repro.warnings.length, "warning")}`}.
            </Alert.Description>
          </Alert>
        ) : (
          <Alert status="warning" variant="subtle">
            <Alert.Title>
              The validator reproduces {plural(repro.errors.length, "error")} in repro.tsx with astralis-ui{" "}
              {repro.checkedWith}
            </Alert.Title>
            <Alert.Description>
              <ul className="mt-1 flex flex-col gap-1">
                {repro.errors.map((f, i) => (
                  <li key={i}>
                    <span className="font-mono text-xs">{f.code}</span> {f.message}
                  </li>
                ))}
              </ul>
            </Alert.Description>
          </Alert>
        )}
      </Section>

      <Section title={`Findings in the project (${findings.length})`}>
        {findings.length ? (
          <Findings findings={findings} />
        ) : (
          <Text size="sm" color="muted">
            {snapshot.findings ? "The validator found nothing in the files checked." : "The reporter left the findings out."}
          </Text>
        )}
      </Section>

      <Section title="Environment">
        <DataList>
          {environmentRows(snapshot).map(([label, value]) => (
            <DataList.Item key={label}>
              <DataList.Label>{label}</DataList.Label>
              <DataList.Value className="font-mono text-sm">{value}</DataList.Value>
            </DataList.Item>
          ))}
        </DataList>
      </Section>

      {snapshot.console && snapshot.console.length > 0 && (
        <Section title={`Console errors (${snapshot.console.length})`}>
          <pre className="docs-scroll overflow-x-auto whitespace-pre-wrap rounded-xl border border-stroke-base bg-surface-subtle p-4 font-mono text-xs text-label">
            {snapshot.console.join("\n\n")}
          </pre>
        </Section>
      )}

      {snapshot.screenshot && (
        <Section title="Screenshot">
          {/* A data URL the schema allows only as PNG or JPEG; next/image has nothing to optimise. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={snapshot.screenshot}
            alt="The page when the report was made"
            className="max-w-full rounded-xl border border-stroke-base"
          />
        </Section>
      )}
    </div>
  );
}

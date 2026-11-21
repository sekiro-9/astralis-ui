import type { Snapshot } from "astralis-cli/snapshot";
import { Alert, Box, DataList, Heading, Stack, Text } from "astralis-ui";

import { CodeBlock } from "@/modules/docs/code-block";
import { plural } from "@/lib/issues/format";
import type { ReproCheck } from "@/lib/issues/repro";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack as="section" gap="3">
      <Heading as="h3" size="sm" weight="semibold">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

function Findings({ findings }: { findings: NonNullable<Snapshot["findings"]> }) {
  return (
    <Stack as="ul" gap="2">
      {findings.map((f, i) => (
        <Box as="li" key={i} px="3" py="2" rounded="lg" border="normal" borderColor="base">
          <Text size="xs" color="muted" fontFamily="mono">
            {f.code} · {f.file}:{f.line}:{f.column}
          </Text>
          <Text size="sm">{f.message}</Text>
        </Box>
      ))}
    </Stack>
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
    <Stack gap="8">
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
              <Stack as="ul" gap="1" mt="1">
                {repro.errors.map((f, i) => (
                  <Box as="li" key={i}>
                    <Text as="span" fontFamily="mono" size="xs" color="inherit">
                      {f.code}
                    </Text>{" "}
                    {f.message}
                  </Box>
                ))}
              </Stack>
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
              <DataList.Value>
                <Text as="span" fontFamily="mono" size="sm" color="inherit">
                  {value}
                </Text>
              </DataList.Value>
            </DataList.Item>
          ))}
        </DataList>
      </Section>

      {snapshot.console && snapshot.console.length > 0 && (
        <Section title={`Console errors (${snapshot.console.length})`}>
          <Box as="pre" p="4" rounded="xl" border="normal" borderColor="base" bg="subtle" overflowX="auto" whiteSpace="pre-wrap" className="docs-scroll">
            <Text as="span" fontFamily="mono" size="xs">
              {snapshot.console.join("\n\n")}
            </Text>
          </Box>
        </Section>
      )}

      {snapshot.screenshot && (
        <Section title="Screenshot">
          {/* A data URL the schema allows only as PNG or JPEG; next/image has nothing to optimise. */}
          <Box as="img" src={snapshot.screenshot} alt="The page when the report was made" maxW="full" rounded="xl" border="normal" borderColor="base" />
        </Section>
      )}
    </Stack>
  );
}

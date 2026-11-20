import NextLink from "next/link";
import { MessageSquare } from "lucide-react";
import { Avatar, Flex, Icon, Link, Stack, Text } from "astralis-ui";

import { formatDate } from "@/lib/issues/format";
import type { IssueSummary } from "@/lib/issues/github";

import { LabelTag, StateBadge } from "./badges";

export function IssueList({ issues }: { issues: IssueSummary[] }) {
  return (
    <Stack as="ul" gap="0" rounded="xl" border="normal" borderColor="base" overflow="hidden" className="divide-y divide-stroke-base">
      {issues.map((issue) => (
        <Flex
          as="li"
          key={issue.number}
          direction={{ base: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          gap={{ base: "2", sm: "4" }}
          px="4"
          py="3.5"
          hover={{ bg: "subtle" }}
          className="transition-colors"
        >
          <Stack gap="1.5" minW="0" flex="1">
            <Link as={NextLink} href={`/issues/${issue.number}`} weight="medium" color="base" alignSelf="start">
              {issue.title}
            </Link>
            <Flex wrap="wrap" alignItems="center" columnGap="2" rowGap="1">
              <Text as="span" size="xs" color="muted" fontFamily="mono">
                #{issue.number}
                {issue.component && ` · ${issue.component}`} · updated {formatDate(issue.updatedAt)}
              </Text>
              {issue.labels.map((label) => (
                <LabelTag key={label.name} label={label} />
              ))}
            </Flex>
          </Stack>
          <Flex alignItems="center" gap="3" shrink="0">
            <StateBadge state={issue.state} />
            <Flex as="span" w="10" alignItems="center" justifyContent={{ base: "start", sm: "end" }} gap="1" color="muted">
              {issue.comments > 0 && (
                <>
                  <Icon as={MessageSquare} size="xs" aria-hidden />
                  <Text as="span" size="xs" color="inherit" className="tabular-nums" aria-label={`${issue.comments} comments`}>
                    {issue.comments}
                  </Text>
                </>
              )}
            </Flex>
            {issue.author && <Avatar size="xs" src={issue.author.avatar} name={issue.author.login} title={issue.author.login} />}
          </Flex>
        </Flex>
      ))}
    </Stack>
  );
}

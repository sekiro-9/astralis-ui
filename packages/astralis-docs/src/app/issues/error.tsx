"use client";

import { useEffect } from "react";
import { Alert, Button, Flex, Stack } from "astralis-ui";

/**
 * An issue page that fails, most often because GitHub could not be reached or
 * its rate limit for this site is used up, shows this instead of the site's
 * bare error page. In production the error's message is withheld from the
 * browser, so the text stays general.
 */
export default function IssuesError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Alert status="warning" variant="subtle">
      <Alert.Title>The issues could not be read from GitHub right now</Alert.Title>
      <Alert.Description>
        <Stack as="span" alignItems="start" gap="3">
          GitHub did not answer, or this site has used up its requests for the hour. The issues are all on
          GitHub in the meantime.
          <Flex as="span" wrap="wrap" gap="2">
            <Button size="sm" variant="outline" colorScheme="gray" onClick={() => retry()}>
              Try again
            </Button>
            <Button as="a" href="https://github.com/paulandy789/astralis-ui/issues" size="sm" variant="text" colorScheme="gray">
              Open GitHub issues
            </Button>
          </Flex>
        </Stack>
      </Alert.Description>
    </Alert>
  );
}

"use client";

import { useEffect } from "react";
import { Alert, Button } from "astralis-ui";

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
        <span className="flex flex-col items-start gap-3">
          GitHub did not answer, or this site has used up its requests for the hour. The issues are all on
          GitHub in the meantime.
          <span className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" colorScheme="gray" onClick={() => retry()}>
              Try again
            </Button>
            <Button as="a" href="https://github.com/sekiro-9/astralis-ui/issues" size="sm" variant="text" colorScheme="gray">
              Open GitHub issues
            </Button>
          </span>
        </span>
      </Alert.Description>
    </Alert>
  );
}

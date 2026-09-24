"use client";

import { useEffect } from "react";
import { Alert, Button } from "astralis-ui";

/**
 * Any issue page that fails, most often because the database cannot be
 * reached, shows this instead of the site's bare error page. In production the
 * error's message is withheld from the browser, so the text stays general.
 */
export default function IssuesError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Alert status="warning" variant="subtle">
      <Alert.Title>The issue platform is unavailable right now</Alert.Title>
      <Alert.Description>
        <span className="flex flex-col items-start gap-3">
          Its database could not be reached, or something else went wrong on the server. Drafts you have
          already sent are kept for 24 hours, so nothing is lost; try again in a moment.
          <Button size="sm" variant="outline" colorScheme="gray" onClick={() => retry()}>
            Try again
          </Button>
        </span>
      </Alert.Description>
    </Alert>
  );
}

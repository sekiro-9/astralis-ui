import { Alert } from "astralis-ui";

/** Shown by every issue page on a deployment without a database. */
export function NotConfigured() {
  return (
    <Alert status="info" variant="subtle">
      <Alert.Title>The issue platform is not set up on this deployment</Alert.Title>
      <Alert.Description>
        It needs a Postgres database and GitHub sign-in; see .env.example in astralis-docs. The rest of the
        site works without them.
      </Alert.Description>
    </Alert>
  );
}

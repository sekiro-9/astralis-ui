import { Checkbox, CheckboxCard, Grid } from "astralis-ui";

export function CheckboxCardDemo() {
  return (
    <Checkbox.Group defaultValue={["analytics"]}>
      <Grid columns={{ base: "1", sm: "3" }} gap="3" w="full" maxW="2xl">
        <CheckboxCard value="analytics" description="Traffic and conversion reports">
          Analytics
        </CheckboxCard>
        <CheckboxCard value="automation" description="Workflows and triggers">
          Automation
        </CheckboxCard>
        <CheckboxCard value="support" description="Shared inbox and live chat">
          Support
        </CheckboxCard>
      </Grid>
    </Checkbox.Group>
  );
}

import { Radio, RadioCard, Grid } from "astralis-ui";

export function RadioCardDemo() {
  return (
    <Radio.Group defaultValue="pro">
      <Grid columns={{ base: "1", sm: "3" }} gap="3" w="full" maxW="2xl">
        <RadioCard value="free" description="For personal projects">
          Free
        </RadioCard>
        <RadioCard value="pro" description="For growing teams">
          Pro — $12/mo
        </RadioCard>
        <RadioCard value="enterprise" description="SSO, audit log, SLAs">
          Enterprise
        </RadioCard>
      </Grid>
    </Radio.Group>
  );
}

import { Checkbox, CheckboxCard, Icon, VStack } from "astralis-ui";
import { Bell, Mail, MessageSquare } from "lucide-react";

export function CheckboxCardAddon() {
  return (
    <Checkbox.Group defaultValue={["email"]}>
      <VStack gap="2" alignItems="stretch" w="full" maxW="sm">
        <CheckboxCard value="email" size="sm" addon={<Icon as={Mail} />} description="A digest every morning">
          Email
        </CheckboxCard>
        <CheckboxCard value="push" size="sm" addon={<Icon as={Bell} />} description="As things happen">
          Push notifications
        </CheckboxCard>
        <CheckboxCard value="sms" size="sm" addon={<Icon as={MessageSquare} />} description="Security alerts only" disabled>
          SMS
        </CheckboxCard>
      </VStack>
    </Checkbox.Group>
  );
}

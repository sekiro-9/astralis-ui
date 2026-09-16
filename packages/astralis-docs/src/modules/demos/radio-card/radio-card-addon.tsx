import { Icon, Radio, RadioCard, VStack } from "astralis-ui";
import { Bike, Car, Truck } from "lucide-react";

export function RadioCardAddon() {
  return (
    <Radio.Group defaultValue="standard" name="delivery">
      <VStack gap="2" alignItems="stretch" w="full" maxW="sm">
        <RadioCard value="courier" size="sm" addon={<Icon as={Bike} />} description="Within 2 hours, city centre only">
          Courier
        </RadioCard>
        <RadioCard value="standard" size="sm" addon={<Icon as={Car} />} description="Next working day">
          Standard
        </RadioCard>
        <RadioCard value="freight" size="sm" addon={<Icon as={Truck} />} description="Pallets and bulky items">
          Freight
        </RadioCard>
      </VStack>
    </Radio.Group>
  );
}

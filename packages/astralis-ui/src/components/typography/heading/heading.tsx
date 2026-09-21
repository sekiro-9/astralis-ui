import type { HeadingElement, HeadingProps } from "./heading.types";
import Text from "../text";
import { identify } from "../../../utils/dev-identity";

const Heading = identify("Heading", function Heading<T extends HeadingElement = "h2">({ as, ...props }: HeadingProps<T>) {
  const element: HeadingElement = as ?? "h2";
  return (
    <Text
      as={element}
      fontFamily="heading"
      lineHeight="tight"
      letterSpacing="tight"
      {...(props as HeadingProps<HeadingElement>)}
    />
  );
});

export default Heading;

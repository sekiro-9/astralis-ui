import { Accordion, Carousel, Center, Collapsible, Pagination, Text } from "astralis-ui";
import { accordionProps } from "../accordion/accordion-props";
import { carouselProps } from "../carousel/carousel-props";
import { collapsibleProps } from "../collapsible/collapsible-props";
import { paginationProps } from "../pagination/pagination-props";
import { asEntry, definePlaygrounds } from "./define";

export const disclosurePlaygrounds = definePlaygrounds({
  "accordion-demo": {
    tag: "Accordion",
    component: asEntry(Accordion),
    rows: accordionProps,
    fixture: (
      <>
        <Accordion.Item value="tokens">
          <Accordion.Trigger>What are semantic tokens?</Accordion.Trigger>
          <Accordion.Content>
            Named colors that resolve differently in light and dark mode.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="build">
          <Accordion.Trigger>Do I need a build step?</Accordion.Trigger>
          <Accordion.Content>No — the library ships precompiled CSS.</Accordion.Content>
        </Accordion.Item>
      </>
    ),
  },
  "collapsible-demo": {
    tag: "Collapsible",
    component: asEntry(Collapsible),
    rows: collapsibleProps,
    fixture: (
      <>
        <Collapsible.Trigger>What ships to the browser?</Collapsible.Trigger>
        <Collapsible.Content>Nothing but HTML: the toggle is the native details element.</Collapsible.Content>
      </>
    ),
  },
  "carousel-demo": {
    tag: "Carousel",
    component: asEntry(Carousel),
    rows: carouselProps,
    fixture: (
      <>
        <Carousel.Track>
          <Carousel.Slide>
            <Center bg="brand-subtle" h="32" rounded="xl">
              <Text weight="medium">Slide one</Text>
            </Center>
          </Carousel.Slide>
          <Carousel.Slide>
            <Center bg="teal-subtle" h="32" rounded="xl">
              <Text weight="medium">Slide two</Text>
            </Center>
          </Carousel.Slide>
          <Carousel.Slide>
            <Center bg="purple-subtle" h="32" rounded="xl">
              <Text weight="medium">Slide three</Text>
            </Center>
          </Carousel.Slide>
        </Carousel.Track>
        <Carousel.Control>
          <Carousel.Prev />
          <Carousel.Indicators />
          <Carousel.Next />
        </Carousel.Control>
      </>
    ),
  },
  "pagination-demo": {
    tag: "Pagination",
    component: asEntry(Pagination),
    rows: paginationProps,
    baseProps: { totalPages: 10, defaultPage: 3 },
    fixture: (
      <Pagination.List>
        <Pagination.Prev />
        <Pagination.Pages />
        <Pagination.Next />
      </Pagination.List>
    ),
  },
});

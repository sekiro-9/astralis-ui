"use client";

import { Carousel, Card, Text, Box } from "astralis-ui";

const reviews = [
  "Arrived in two days and fits perfectly.",
  "The fabric is softer than the photos suggest.",
  "Third pair I've bought. Still my favourite.",
  "Runs a little large; size down if unsure.",
  "Great colour, and it survived the wash.",
  "Good value for the quality.",
];

export function CarouselResponsive() {
  return (
    <Box w="full">
      {/* One review per view on a phone, two from md, three from lg. */}
      <Carousel slidesPerView={{ base: 1, md: 2, lg: 3 }} slideGap={{ base: 12, lg: 24 }}>
        <Carousel.Track>
          {reviews.map((review) => (
            <Carousel.Slide key={review}>
              <Card variant="outline" h="full">
                <Card.Body>
                  <Text size="sm">{review}</Text>
                </Card.Body>
              </Card>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
        <Carousel.Control>
          <Carousel.Prev />
          <Carousel.Indicators />
          <Carousel.Next />
        </Carousel.Control>
      </Carousel>
    </Box>
  );
}

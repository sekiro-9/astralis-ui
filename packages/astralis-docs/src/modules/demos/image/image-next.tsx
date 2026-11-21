"use client";

import NextImage from "next/image";
import { Box, Image } from "astralis-ui";

export function ImageNext() {
  return (
    <Box w="full" maxW="sm">
      <Image
        as={NextImage}
        src="/image-demo.jpg"
        alt="A starfield gradient"
        fill
        sizes="(min-width: 40rem) 24rem, 100vw"
        aspectRatio="video"
        rounded="xl"
        w="full"
      />
    </Box>
  );
}

"use client";

import Link from "next/link";
import { Button } from "astralis-ui";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { BrandScene } from "./scene/brand-scene";

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-36 lg:py-44">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <BrandScene fade="none" />
        <div className="cta-veil absolute inset-0" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal>
          <h2 className="font-display text-balance text-5xl font-semibold tracking-tight text-label sm:text-6xl">
            Ship something <span className="text-gradient">stellar</span>
          </h2>
          <p className="mx-auto mt-6 text-balance text-lg text-label-muted lg:whitespace-nowrap">
            Install the package, add the provider, and every component here is yours.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button as={Link} href="/docs" size="lg" rounded="xl" rightIcon={<ArrowRight size={18} />}>
              Start building
            </Button>
            <Button
              as={Link}
              href="/docs/components/button"
              size="lg"
              rounded="xl"
              variant="outline"
              colorScheme="gray"
              className="bg-surface/60 backdrop-blur"
            >
              Read the docs
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

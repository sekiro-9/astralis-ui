/* ==========================================================================
   AUTO-GENERATED — DO NOT EDIT BY HAND
   Source: scripts/build-registry.mjs
   The live component behind every registry id, for docs previews and Studio.
   ========================================================================== */

import type { JSX } from "react";
import type { BlockRegistryEntry } from "./registry";
import { FeaturesGrid01 } from "./features/features-grid/features-grid-01/features-grid-01";
import { FeaturesGrid02 } from "./features/features-grid/features-grid-02/features-grid-02";
import { FeaturesGrid03 } from "./features/features-grid/features-grid-03/features-grid-03";
import { ForgotPassword01 } from "./auth/forgot-password/forgot-password-01/forgot-password-01";
import { HeroSplit01 } from "./hero/hero-split/hero-split-01/hero-split-01";
import { HeroSplit02 } from "./hero/hero-split/hero-split-02/hero-split-02";
import { HeroSplit03 } from "./hero/hero-split/hero-split-03/hero-split-03";
import { Login01 } from "./auth/login/login-01/login-01";
import { PricingTiers01 } from "./pricing/pricing-tiers/pricing-tiers-01/pricing-tiers-01";
import { PricingTiers02 } from "./pricing/pricing-tiers/pricing-tiers-02/pricing-tiers-02";
import { PricingTiers03 } from "./pricing/pricing-tiers/pricing-tiers-03/pricing-tiers-03";
import { Signup01 } from "./auth/signup/signup-01/signup-01";
import featuresGrid01Meta from "./features/features-grid/features-grid-01/meta";
import featuresGrid02Meta from "./features/features-grid/features-grid-02/meta";
import featuresGrid03Meta from "./features/features-grid/features-grid-03/meta";
import forgotPassword01Meta from "./auth/forgot-password/forgot-password-01/meta";
import heroSplit01Meta from "./hero/hero-split/hero-split-01/meta";
import heroSplit02Meta from "./hero/hero-split/hero-split-02/meta";
import heroSplit03Meta from "./hero/hero-split/hero-split-03/meta";
import login01Meta from "./auth/login/login-01/meta";
import pricingTiers01Meta from "./pricing/pricing-tiers/pricing-tiers-01/meta";
import pricingTiers02Meta from "./pricing/pricing-tiers/pricing-tiers-02/meta";
import pricingTiers03Meta from "./pricing/pricing-tiers/pricing-tiers-03/meta";
import signup01Meta from "./auth/signup/signup-01/meta";

export interface BlockEntry {
  meta: BlockRegistryEntry;
  component: () => JSX.Element;
}

export const blocks = {
  "features-grid-01": {
    meta: {
      ...featuresGrid01Meta,
      files: ["features-grid-01.tsx"],
      component: "FeaturesGrid01",
      uses: ["Box","Container","Flex","Grid","Heading","Icon","Stack","Text"],
    },
    component: FeaturesGrid01,
  },
  "features-grid-02": {
    meta: {
      ...featuresGrid02Meta,
      files: ["features-grid-02.tsx"],
      component: "FeaturesGrid02",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","Stack","Text"],
    },
    component: FeaturesGrid02,
  },
  "features-grid-03": {
    meta: {
      ...featuresGrid03Meta,
      files: ["features-grid-03.tsx"],
      component: "FeaturesGrid03",
      uses: ["Box","Container","Flex","Grid","GridItem","Heading","Icon","Stack","Text"],
    },
    component: FeaturesGrid03,
  },
  "forgot-password-01": {
    meta: {
      ...forgotPassword01Meta,
      files: ["forgot-password-01.tsx"],
      component: "ForgotPassword01",
      uses: ["Box","Button","Container","FieldHelpText","FieldLabel","FieldRoot","Flex","Heading","Icon","Input","Link","Stack","Text"],
    },
    component: ForgotPassword01,
  },
  "hero-split-01": {
    meta: {
      ...heroSplit01Meta,
      files: ["hero-split-01.tsx"],
      component: "HeroSplit01",
      uses: ["AspectRatio","Badge","Box","Button","Container","Flex","Grid","Heading","Stack","Text"],
    },
    component: HeroSplit01,
  },
  "hero-split-02": {
    meta: {
      ...heroSplit02Meta,
      files: ["hero-split-02.tsx"],
      component: "HeroSplit02",
      uses: ["AspectRatio","Box","Button","Container","Flex","FlexItem","Grid","GridItem","Heading","Input","Stack","Text"],
    },
    component: HeroSplit02,
  },
  "hero-split-03": {
    meta: {
      ...heroSplit03Meta,
      files: ["hero-split-03.tsx"],
      component: "HeroSplit03",
      uses: ["Box","Button","CardBody","CardRoot","Container","Flex","Grid","Heading","Icon","List","ListItem","Stack","Text"],
    },
    component: HeroSplit03,
  },
  "login-01": {
    meta: {
      ...login01Meta,
      files: ["login-01.tsx"],
      component: "Login01",
      uses: ["Box","Button","Checkbox","Container","FieldLabel","FieldRoot","Flex","FlexItem","Heading","Icon","Input","InputPassword","Link","Separator","Stack","Text"],
    },
    component: Login01,
  },
  "pricing-tiers-01": {
    meta: {
      ...pricingTiers01Meta,
      files: ["pricing-tiers-01.tsx"],
      component: "PricingTiers01",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","List","ListItem","Separator","Stack","Text"],
    },
    component: PricingTiers01,
  },
  "pricing-tiers-02": {
    meta: {
      ...pricingTiers02Meta,
      files: ["pricing-tiers-02.tsx"],
      component: "PricingTiers02",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","List","ListItem","Stack","Text"],
    },
    component: PricingTiers02,
  },
  "pricing-tiers-03": {
    meta: {
      ...pricingTiers03Meta,
      files: ["pricing-tiers-03.tsx"],
      component: "PricingTiers03",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","List","ListItem","Stack","Text"],
    },
    component: PricingTiers03,
  },
  "signup-01": {
    meta: {
      ...signup01Meta,
      files: ["signup-01.tsx"],
      component: "Signup01",
      uses: ["Box","Button","Checkbox","Container","FieldHelpText","FieldLabel","FieldRoot","Flex","FlexItem","Heading","Icon","Input","InputPassword","Link","List","ListItem","Separator","Stack","Text"],
    },
    component: Signup01,
  },
} as const satisfies Record<string, BlockEntry>;

export type BlockId = keyof typeof blocks;

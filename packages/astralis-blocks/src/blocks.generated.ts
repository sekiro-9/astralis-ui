/* ==========================================================================
   AUTO-GENERATED — DO NOT EDIT BY HAND
   Source: scripts/build-registry.mjs
   The live component behind every registry id, for docs previews and Studio.
   ========================================================================== */

import type { JSX } from "react";
import type { BlockRegistryEntry } from "./registry";
import { Contact01 } from "./contact/contact-01/contact-01";
import { Contact02 } from "./contact/contact-02/contact-02";
import { Contact03 } from "./contact/contact-03/contact-03";
import { Cta01 } from "./cta/cta-01/cta-01";
import { Cta02 } from "./cta/cta-02/cta-02";
import { Cta03 } from "./cta/cta-03/cta-03";
import { Dashboard01 } from "./dashboard/dashboard-01/dashboard-01";
import { Dashboard02 } from "./dashboard/dashboard-02/dashboard-02";
import { Dashboard03 } from "./dashboard/dashboard-03/dashboard-03";
import { Features01 } from "./features/features-01/features-01";
import { Features02 } from "./features/features-02/features-02";
import { Features03 } from "./features/features-03/features-03";
import { Footer01 } from "./footer/footer-01/footer-01";
import { Footer02 } from "./footer/footer-02/footer-02";
import { Footer03 } from "./footer/footer-03/footer-03";
import { ForgotPassword01 } from "./forgot-password/forgot-password-01/forgot-password-01";
import { Hero01 } from "./hero/hero-01/hero-01";
import { Hero02 } from "./hero/hero-02/hero-02";
import { Hero03 } from "./hero/hero-03/hero-03";
import { Login01 } from "./login/login-01/login-01";
import { Navbar01 } from "./navbar/navbar-01/navbar-01";
import { Navbar02 } from "./navbar/navbar-02/navbar-02";
import { Navbar03 } from "./navbar/navbar-03/navbar-03";
import { Pricing01 } from "./pricing/pricing-01/pricing-01";
import { Pricing02 } from "./pricing/pricing-02/pricing-02";
import { Pricing03 } from "./pricing/pricing-03/pricing-03";
import { Signup01 } from "./signup/signup-01/signup-01";
import { Stats01 } from "./stats/stats-01/stats-01";
import { Stats02 } from "./stats/stats-02/stats-02";
import { Stats03 } from "./stats/stats-03/stats-03";
import { Team01 } from "./team/team-01/team-01";
import { Team02 } from "./team/team-02/team-02";
import { Team03 } from "./team/team-03/team-03";
import { Testimonials01 } from "./testimonials/testimonials-01/testimonials-01";
import { Testimonials02 } from "./testimonials/testimonials-02/testimonials-02";
import { Testimonials03 } from "./testimonials/testimonials-03/testimonials-03";
import contact01Meta from "./contact/contact-01/meta";
import contact02Meta from "./contact/contact-02/meta";
import contact03Meta from "./contact/contact-03/meta";
import cta01Meta from "./cta/cta-01/meta";
import cta02Meta from "./cta/cta-02/meta";
import cta03Meta from "./cta/cta-03/meta";
import dashboard01Meta from "./dashboard/dashboard-01/meta";
import dashboard02Meta from "./dashboard/dashboard-02/meta";
import dashboard03Meta from "./dashboard/dashboard-03/meta";
import features01Meta from "./features/features-01/meta";
import features02Meta from "./features/features-02/meta";
import features03Meta from "./features/features-03/meta";
import footer01Meta from "./footer/footer-01/meta";
import footer02Meta from "./footer/footer-02/meta";
import footer03Meta from "./footer/footer-03/meta";
import forgotPassword01Meta from "./forgot-password/forgot-password-01/meta";
import hero01Meta from "./hero/hero-01/meta";
import hero02Meta from "./hero/hero-02/meta";
import hero03Meta from "./hero/hero-03/meta";
import login01Meta from "./login/login-01/meta";
import navbar01Meta from "./navbar/navbar-01/meta";
import navbar02Meta from "./navbar/navbar-02/meta";
import navbar03Meta from "./navbar/navbar-03/meta";
import pricing01Meta from "./pricing/pricing-01/meta";
import pricing02Meta from "./pricing/pricing-02/meta";
import pricing03Meta from "./pricing/pricing-03/meta";
import signup01Meta from "./signup/signup-01/meta";
import stats01Meta from "./stats/stats-01/meta";
import stats02Meta from "./stats/stats-02/meta";
import stats03Meta from "./stats/stats-03/meta";
import team01Meta from "./team/team-01/meta";
import team02Meta from "./team/team-02/meta";
import team03Meta from "./team/team-03/meta";
import testimonials01Meta from "./testimonials/testimonials-01/meta";
import testimonials02Meta from "./testimonials/testimonials-02/meta";
import testimonials03Meta from "./testimonials/testimonials-03/meta";

export interface BlockEntry {
  meta: BlockRegistryEntry;
  component: () => JSX.Element;
}

export const blocks = {
  "contact-01": {
    meta: {
      ...contact01Meta,
      files: ["contact-01.tsx"],
      component: "Contact01",
      uses: ["Box","Button","Container","FieldLabel","FieldRoot","Flex","Grid","Heading","Icon","Input","InputTextarea","Link","Stack","Text"],
    },
    component: Contact01,
  },
  "contact-02": {
    meta: {
      ...contact02Meta,
      files: ["contact-02.tsx"],
      component: "Contact02",
      uses: ["Box","Button","Container","FieldLabel","FieldRoot","Flex","Grid","GridItem","Heading","Input","InputTextarea","Select","Stack","Text"],
    },
    component: Contact02,
  },
  "contact-03": {
    meta: {
      ...contact03Meta,
      files: ["contact-03.tsx"],
      component: "Contact03",
      uses: ["Box","Button","Container","FieldLabel","FieldRoot","Flex","Grid","Heading","Icon","Input","InputTextarea","Stack","Text"],
    },
    component: Contact03,
  },
  "cta-01": {
    meta: {
      ...cta01Meta,
      files: ["cta-01.tsx"],
      component: "Cta01",
      uses: ["Badge","Box","Button","Container","Flex","Heading","Icon","Stack","Text"],
    },
    component: Cta01,
  },
  "cta-02": {
    meta: {
      ...cta02Meta,
      files: ["cta-02.tsx"],
      component: "Cta02",
      uses: ["Box","Button","Container","Flex","Heading","Icon","Link","Stack","Text"],
    },
    component: Cta02,
  },
  "cta-03": {
    meta: {
      ...cta03Meta,
      files: ["cta-03.tsx"],
      component: "Cta03",
      uses: ["Box","Button","Container","Flex","FlexItem","Heading","Input","Link","Stack","Text"],
    },
    component: Cta03,
  },
  "dashboard-01": {
    meta: {
      ...dashboard01Meta,
      files: ["dashboard-01.tsx"],
      component: "Dashboard01",
      uses: ["Avatar","Badge","Box","BreadcrumbItem","BreadcrumbLink","BreadcrumbRoot","Flex","Grid","Icon","Input","Kbd","Stack","Text"],
    },
    component: Dashboard01,
  },
  "dashboard-02": {
    meta: {
      ...dashboard02Meta,
      files: ["dashboard-02.tsx"],
      component: "Dashboard02",
      uses: ["Avatar","Box","Button","Flex","Icon","Input","Stack","Text"],
    },
    component: Dashboard02,
  },
  "dashboard-03": {
    meta: {
      ...dashboard03Meta,
      files: ["dashboard-03.tsx"],
      component: "Dashboard03",
      uses: ["Avatar","Badge","Box","Flex","Grid","Icon","Separator","Stack","Text"],
    },
    component: Dashboard03,
  },
  "features-01": {
    meta: {
      ...features01Meta,
      files: ["features-01.tsx"],
      component: "Features01",
      uses: ["Box","Container","Flex","Grid","Heading","Icon","Stack","Text"],
    },
    component: Features01,
  },
  "features-02": {
    meta: {
      ...features02Meta,
      files: ["features-02.tsx"],
      component: "Features02",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","Stack","Text"],
    },
    component: Features02,
  },
  "features-03": {
    meta: {
      ...features03Meta,
      files: ["features-03.tsx"],
      component: "Features03",
      uses: ["Box","Container","Flex","Grid","GridItem","Heading","Icon","Stack","Text"],
    },
    component: Features03,
  },
  "footer-01": {
    meta: {
      ...footer01Meta,
      files: ["footer-01.tsx"],
      component: "Footer01",
      uses: ["Box","Container","Flex","Grid","GridItem","Icon","Link","Separator","Stack","Text"],
    },
    component: Footer01,
  },
  "footer-02": {
    meta: {
      ...footer02Meta,
      files: ["footer-02.tsx"],
      component: "Footer02",
      uses: ["Box","Button","Container","Flex","FlexItem","Grid","GridItem","Input","Link","Separator","Stack","Text"],
    },
    component: Footer02,
  },
  "footer-03": {
    meta: {
      ...footer03Meta,
      files: ["footer-03.tsx"],
      component: "Footer03",
      uses: ["Box","Container","Flex","Grid","GridItem","Icon","Link","Separator","Stack","Text"],
    },
    component: Footer03,
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
  "hero-01": {
    meta: {
      ...hero01Meta,
      files: ["hero-01.tsx"],
      component: "Hero01",
      uses: ["AspectRatio","Badge","Box","Button","Container","Flex","Grid","Heading","Stack","Text"],
    },
    component: Hero01,
  },
  "hero-02": {
    meta: {
      ...hero02Meta,
      files: ["hero-02.tsx"],
      component: "Hero02",
      uses: ["AspectRatio","Box","Button","Container","Flex","FlexItem","Grid","GridItem","Heading","Input","Stack","Text"],
    },
    component: Hero02,
  },
  "hero-03": {
    meta: {
      ...hero03Meta,
      files: ["hero-03.tsx"],
      component: "Hero03",
      uses: ["Box","Button","CardBody","CardRoot","Container","Flex","Grid","Heading","Icon","List","ListItem","Stack","Text"],
    },
    component: Hero03,
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
  "navbar-01": {
    meta: {
      ...navbar01Meta,
      files: ["navbar-01.tsx"],
      component: "Navbar01",
      uses: ["Box","Button","Container","Flex","Icon","Link","Stack","Text"],
    },
    component: Navbar01,
  },
  "navbar-02": {
    meta: {
      ...navbar02Meta,
      files: ["navbar-02.tsx"],
      component: "Navbar02",
      uses: ["Badge","Box","Button","Container","Flex","Icon","Link","Stack","Text"],
    },
    component: Navbar02,
  },
  "navbar-03": {
    meta: {
      ...navbar03Meta,
      files: ["navbar-03.tsx"],
      component: "Navbar03",
      uses: ["Box","Button","Container","Flex","Icon","Link","Separator","Stack","Text"],
    },
    component: Navbar03,
  },
  "pricing-01": {
    meta: {
      ...pricing01Meta,
      files: ["pricing-01.tsx"],
      component: "Pricing01",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","List","ListItem","Separator","Stack","Text"],
    },
    component: Pricing01,
  },
  "pricing-02": {
    meta: {
      ...pricing02Meta,
      files: ["pricing-02.tsx"],
      component: "Pricing02",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","List","ListItem","Stack","Text"],
    },
    component: Pricing02,
  },
  "pricing-03": {
    meta: {
      ...pricing03Meta,
      files: ["pricing-03.tsx"],
      component: "Pricing03",
      uses: ["Badge","Box","Button","Container","Flex","Grid","Heading","Icon","List","ListItem","Stack","Text"],
    },
    component: Pricing03,
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
  "stats-01": {
    meta: {
      ...stats01Meta,
      files: ["stats-01.tsx"],
      component: "Stats01",
      uses: ["Box","Container","Grid","Heading","Stack","Text"],
    },
    component: Stats01,
  },
  "stats-02": {
    meta: {
      ...stats02Meta,
      files: ["stats-02.tsx"],
      component: "Stats02",
      uses: ["Box","Container","Grid","Heading","Stack","Stat","StatHelpText","StatIndicator","StatLabel","StatValue","Text"],
    },
    component: Stats02,
  },
  "stats-03": {
    meta: {
      ...stats03Meta,
      files: ["stats-03.tsx"],
      component: "Stats03",
      uses: ["Box","Container","Grid","GridItem","Heading","Stack","Text"],
    },
    component: Stats03,
  },
  "team-01": {
    meta: {
      ...team01Meta,
      files: ["team-01.tsx"],
      component: "Team01",
      uses: ["Avatar","Box","Container","Flex","Grid","Heading","Icon","Link","Stack","Text"],
    },
    component: Team01,
  },
  "team-02": {
    meta: {
      ...team02Meta,
      files: ["team-02.tsx"],
      component: "Team02",
      uses: ["Avatar","Box","Container","Flex","Grid","Heading","Icon","Link","Stack","Text"],
    },
    component: Team02,
  },
  "team-03": {
    meta: {
      ...team03Meta,
      files: ["team-03.tsx"],
      component: "Team03",
      uses: ["Avatar","Box","Button","Container","Grid","GridItem","Heading","Stack","Text"],
    },
    component: Team03,
  },
  "testimonials-01": {
    meta: {
      ...testimonials01Meta,
      files: ["testimonials-01.tsx"],
      component: "Testimonials01",
      uses: ["Avatar","Box","Container","Flex","Grid","Heading","Icon","Stack","Text"],
    },
    component: Testimonials01,
  },
  "testimonials-02": {
    meta: {
      ...testimonials02Meta,
      files: ["testimonials-02.tsx"],
      component: "Testimonials02",
      uses: ["Avatar","Box","Container","Flex","Grid","Heading","Stack","Text"],
    },
    component: Testimonials02,
  },
  "testimonials-03": {
    meta: {
      ...testimonials03Meta,
      files: ["testimonials-03.tsx"],
      component: "Testimonials03",
      uses: ["Avatar","Box","Container","Flex","Grid","Heading","Icon","Stack","Text"],
    },
    component: Testimonials03,
  },
} as const satisfies Record<string, BlockEntry>;

export type BlockId = keyof typeof blocks;

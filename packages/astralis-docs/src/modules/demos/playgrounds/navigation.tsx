import { Breadcrumb, Steps, TableOfContents, Tabs } from "astralis-ui";
import { breadcrumbProps } from "../breadcrumb/breadcrumb-props";
import { stepsProps } from "../steps/steps-props";
import { tableOfContentsProps } from "../table-of-contents/table-of-contents-props";
import { tabsProps } from "../tabs/tabs-props";
import { asEntry, definePlaygrounds } from "./define";

export const navigationPlaygrounds = definePlaygrounds({
  "tabs-demo": {
    tag: "Tabs",
    component: asEntry(Tabs),
    rows: tabsProps,
    baseProps: { defaultValue: "overview" },
    fixture: (
      <>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">Overview panel.</Tabs.Content>
        <Tabs.Content value="activity">Recent activity shows here.</Tabs.Content>
        <Tabs.Content value="settings">Settings panel.</Tabs.Content>
      </>
    ),
  },
  "steps-demo": {
    tag: "Steps",
    component: asEntry(Steps),
    rows: stepsProps,
    fixture: (
      <Steps.List>
        <Steps.Item>
          <Steps.Indicator />
          <Steps.Title>Account</Steps.Title>
        </Steps.Item>
        <Steps.Item>
          <Steps.Indicator />
          <Steps.Title>Shipping</Steps.Title>
        </Steps.Item>
        <Steps.Item>
          <Steps.Indicator />
          <Steps.Title>Payment</Steps.Title>
        </Steps.Item>
      </Steps.List>
    ),
  },
  "breadcrumb-demo": {
    tag: "Breadcrumb",
    component: asEntry(Breadcrumb),
    rows: breadcrumbProps,
    fixture: (
      <>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Components</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link isCurrent>Breadcrumb</Breadcrumb.Link>
        </Breadcrumb.Item>
      </>
    ),
  },
  /* The entries point at this page's own section headings, so the highlight
     follows the real page as you scroll it. */
  "table-of-contents-demo": {
    tag: "TableOfContents",
    component: asEntry(TableOfContents),
    rows: tableOfContentsProps,
    baseProps: {
      items: [
        { id: "import", title: "Import" },
        { id: "usage", title: "Usage" },
        { id: "props", title: "Props" },
        { id: "keyboard", title: "Keyboard" },
      ],
    },
  },
});

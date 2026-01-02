// src/theme/Theme.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AstralisProvider, useTheme } from "./provider";
import { Button } from "../components";

const ThemeDemo = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="astralis-p-6 astralis-space-y-6">
      <div className="astralis-p-4 astralis-bg-white dark:astralis-bg-gray-800 astralis-rounded-lg astralis-shadow-md astralis-border astralis-border-gray-200 dark:astralis-border-gray-700">
        <h2 className="astralis-text-xl astralis-font-bold astralis-text-gray-900 dark:astralis-text-white astralis-mb-4">
          Theme Controls
        </h2>

        <div className="astralis-flex astralis-gap-4 astralis-mb-6 astralis-flex-wrap">
          <Button
            variant={theme === "light" ? "primary" : "outline"}
            onClick={() => setTheme("light")}
            size="sm"
          >
            Light Theme
          </Button>
          <Button
            variant={theme === "dark" ? "primary" : "outline"}
            onClick={() => setTheme("dark")}
            size="sm"
          >
            Dark Theme
          </Button>
          <Button
            variant={theme === "system" ? "primary" : "outline"}
            onClick={() => setTheme("system")}
            size="sm"
          >
            System Theme
          </Button>
        </div>

        <div className="astralis-p-4 astralis-bg-gray-100 dark:astralis-bg-gray-700 astralis-rounded">
          <p className="astralis-text-gray-800 dark:astralis-text-gray-200">
            Current Theme: <strong>{theme}</strong>
            <br />
            Resolved Theme: <strong>{resolvedTheme}</strong>
          </p>
        </div>
      </div>

      <div className="astralis-p-4 astralis-bg-white dark:astralis-bg-gray-800 astralis-rounded-lg astralis-shadow-md astralis-border astralis-border-gray-200 dark:astralis-border-gray-700">
        <h2 className="astralis-text-xl astralis-font-bold astralis-text-gray-900 dark:astralis-text-white astralis-mb-4">
          Component Showcase
        </h2>

        <div className="astralis-space-y-4">
          <div className="astralis-flex astralis-gap-4 astralis-flex-wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <div className="astralis-flex astralis-gap-4 astralis-flex-wrap">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div className="astralis-flex astralis-gap-4 astralis-flex-wrap">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </div>
      </div>

      <div className="astralis-p-4 astralis-bg-white dark:astralis-bg-gray-800 astralis-rounded-lg astralis-shadow-md astralis-border astralis-border-gray-200 dark:astralis-border-gray-700">
        <h2 className="astralis-text-xl astralis-font-bold astralis-text-gray-900 dark:astralis-text-white astralis-mb-4">
          Design Tokens Preview
        </h2>

        <div className="astralis-grid astralis-grid-cols-2 astralis-md:astralis-grid-cols-4 astralis-gap-4">
          <div className="astralis-p-3 astralis-rounded astralis-bg-primary-500">
            <p className="astralis-text-white astralis-text-sm">Primary</p>
          </div>
          <div className="astralis-p-3 astralis-rounded astralis-bg-secondary-300">
            <p className="astralis-text-secondary-900 astralis-text-sm">
              Secondary
            </p>
          </div>
          <div className="astralis-p-3 astralis-rounded astralis-bg-success-500">
            <p className="astralis-text-white astralis-text-sm">Success</p>
          </div>
          <div className="astralis-p-3 astralis-rounded astralis-bg-error-500">
            <p className="astralis-text-white astralis-text-sm">Error</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof ThemeDemo> = {
  title: "Theme/Theme Demo",
  component: ThemeDemo,
  decorators: [
    (Story) => (
      <AstralisProvider>
        <Story />
      </AstralisProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Interactive theme demo to test light and dark mode functionality.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeDemo>;

export const Default: Story = {};

export const ForcedLight: Story = {
  decorators: [
    (Story) => (
      <AstralisProvider defaultTheme="light">
        <Story />
      </AstralisProvider>
    ),
  ],
};

export const ForcedDark: Story = {
  decorators: [
    (Story) => (
      <AstralisProvider defaultTheme="dark">
        <Story />
      </AstralisProvider>
    ),
  ],
};

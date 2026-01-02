import type { Meta, StoryObj } from "@storybook/react-vite";
import Image from "./image";
import { AstralisProvider } from "../../../theme";

const meta: Meta<typeof Image> = {
  title: "Components/Data Display/Image",
  component: Image,
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: { type: "text" },
      description: "The URL or path to the primary image file.",
    },
    alt: {
      control: { type: "text" },
      description: "Alternative text for accessibility.",
    },
    className: {
      control: { type: "text" },
      description: "Custom CSS classes for additional styling.",
    },
    width: {
      control: { type: "text" },
      description: "Width of the image (number for pixels or string for CSS units).",
    },
    height: {
      control: { type: "text" },
      description: "Height of the image (number for pixels or string for CSS units).",
    },
    objectFit: {
      control: { type: "select" },
      options: ["contain", "cover", "fill", "none", "scale-down"],
      description: "How the image fits within its container (CSS object-fit).",
    },
    loading: {
      control: { type: "select" },
      options: ["eager", "lazy"],
      description: "Loading behavior for the image (eager or lazy).",
    },
    srcset: {
      control: { type: "text" },
      description: "Responsive image sources for different resolutions or sizes.",
    },
    sizes: {
      control: { type: "text" },
      description: "Expected display sizes for srcset (CSS units).",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder type (blur, empty, or custom URL).",
    },
    rounded: {
      control: { type: "select" },
      options: ["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"],
      description: "Rounded corners for the image (Tailwind rounded classes).",
    },
    onLoad: {
      action: "loaded",
      description: "Callback when the image finishes loading.",
    },
    onError: {
      action: "error",
      description: "Callback when the image fails to load.",
    },
    ariaLabel: {
      control: { type: "text" },
      description: "Additional accessibility label for screen readers.",
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An optimized image component with support for responsive images, lazy loading, placeholders, rounded corners, and customizable styling.",
      },
    },
  },
  decorators: [
    (Story) => (
      <AstralisProvider>
        <div className="astralis-w-full astralis-p-6">
          <Story />
        </div>
      </AstralisProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Image>;

// Showcase
export const Showcase: Story = {
  render: () => (
    <div className="astralis-space-y-6">
      <div>
        <p className="astralis-mb-2 astralis-font-semibold astralis-text-lg">Object Fit</p>
        <div className="astralis-flex astralis-flex-wrap astralis-gap-4">
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Object fit contain"
            width={200}
            height={150}
            objectFit="contain"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Object fit cover"
            width={200}
            height={150}
            objectFit="cover"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Object fit fill"
            width={200}
            height={150}
            objectFit="fill"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Object fit none"
            width={200}
            height={150}
            objectFit="none"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Object fit scale-down"
            width={200}
            height={150}
            objectFit="scale-down"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
        </div>
      </div>

      <div>
        <p className="astralis-mb-2 astralis-font-semibold astralis-text-lg">Sizes</p>
        <div className="astralis-flex astralis-flex-wrap astralis-gap-4">
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Small image"
            width={100}
            height={100}
            rounded="lg"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Medium image"
            width={200}
            height={200}
            rounded="lg"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Large image"
            width={300}
            height={300}
            rounded="lg"
            className="astralis-border astralis-border-gray-200"
          />
        </div>
      </div>

      <div>
        <p className="astralis-mb-2 astralis-font-semibold astralis-text-lg">Loading and Placeholder</p>
        <div className="astralis-flex astralis-flex-wrap astralis-gap-4">
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Lazy loaded image"
            width={200}
            height={150}
            loading="lazy"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Eager loaded image"
            width={200}
            height={150}
            loading="eager"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Blur placeholder image"
            width={200}
            height={150}
            placeholder="blur"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Default placeholder image"
            width={200}
            height={150}
            placeholder="empty"
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
        </div>
      </div>

      <div>
        <p className="astralis-mb-2 astralis-font-semibold astralis-text-lg">Rounded Corners</p>
        <div className="astralis-flex astralis-flex-wrap astralis-gap-4">
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="No rounded corners"
            width={200}
            height={150}
            rounded="none"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Small rounded corners"
            width={200}
            height={150}
            rounded="sm"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Medium rounded corners"
            width={200}
            height={150}
            rounded="md"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Large rounded corners"
            width={200}
            height={150}
            rounded="lg"
            className="astralis-border astralis-border-gray-200"
          />
          <Image
            src="https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3"
            alt="Full rounded corners"
            width={200}
            height={150}
            rounded="full"
            className="astralis-border astralis-border-gray-200"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase of different object fit options, sizes, loading behaviors, placeholders, and rounded corners.",
      },
    },
  },
};

// Default Image
export const Default: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Default image",
    width: 300,
    height: 200,
    objectFit: "cover",
    rounded: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Default image with cover fit, lazy loading, and medium rounded corners.",
      },
    },
  },
};

// Responsive Image
export const Responsive: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Responsive image",
    width: "100%",
    height: "auto",
    srcset:
      "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3?auto=format&fit=crop&w=300 300w, https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3?auto=format&fit=crop&w=600 600w",
    sizes: "(max-width: 600px) 100vw, 600px",
    rounded: "lg",
    className: "astralis-border astralis-border-gray-200",
  },
  parameters: {
    docs: {
      description: {
        story: "Responsive image with srcset, sizes, and large rounded corners for adaptive resolution.",
      },
    },
  },
};

// Placeholder Blur
export const PlaceholderBlur: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Image with blur placeholder",
    width: 300,
    height: 200,
    placeholder: "blur",
    rounded: "md",
    className: "astralis-border astralis-border-gray-200",
  },
  parameters: {
    docs: {
      description: {
        story: "Image with a blur placeholder effect while loading.",
      },
    },
  },
};

// Default Placeholder
export const DefaultPlaceholder: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Image with default placeholder",
    width: 300,
    height: 200,
    placeholder: "empty",
    rounded: "md",
    className: "astralis-border astralis-border-gray-200",
  },
  parameters: {
    docs: {
      description: {
        story: "Image with the default SVG placeholder during loading.",
      },
    },
  },
};

// Custom Placeholder
export const CustomPlaceholder: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Image with custom placeholder",
    width: 300,
    height: 200,
    placeholder: "https://via.placeholder.com/50x50",
    rounded: "md",
    className: "astralis-border astralis-border-gray-200",
  },
  parameters: {
    docs: {
      description: {
        story: "Image with a custom placeholder URL (e.g., low-resolution image).",
      },
    },
  },
};

// With Events
export const WithEvents: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Image with event handlers",
    width: 300,
    height: 200,
    onLoad: () => console.log("Image loaded"),
    onError: () => console.log("Image failed to load"),
    rounded: "md",
    className: "astralis-border astralis-border-gray-200",
  },
  parameters: {
    docs: {
      description: {
        story: "Image with onLoad and onError event handlers for load state management.",
      },
    },
  },
};

// Accessible Image
export const Accessible: Story = {
  args: {
    src: "https://images.unsplash.com/flagged/photo-1572491259205-506c425b45c3",
    alt: "Profile picture",
    width: 300,
    height: 200,
    ariaLabel: "Profile picture of a user",
    rounded: "md",
    className: "astralis-border astralis-border-gray-200",
  },
  parameters: {
    docs: {
      description: {
        story: "Image with enhanced accessibility using alt, ariaLabel, and rounded corners.",
      },
    },
  },
};
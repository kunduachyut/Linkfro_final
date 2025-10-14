# UI Components

This directory contains reusable UI components for the Linkfro application.

## Background Paths Component

The `BackgroundPaths` component provides an animated SVG background with floating paths for a dynamic hero section.

### Installation

The component requires the following dependencies which should already be installed in the project:

- `framer-motion`
- `@radix-ui/react-slot`
- `class-variance-authority`

### Usage

```tsx
import { BackgroundPaths } from "@/components/ui/background-paths";

// Basic usage with default content
<BackgroundPaths title="Your Title Here" showDefaultContent />

// Usage with custom children
<BackgroundPaths>
  <div>Your custom content here</div>
</BackgroundPaths>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | "Background Paths" | Title text for default content |
| children | ReactNode | undefined | Custom content to display over the background |
| showDefaultContent | boolean | false | Whether to show the default animated title and button |

### Example

```tsx
import { BackgroundPaths } from "@/components/ui/background-paths";

export function HeroSection() {
  return (
    <BackgroundPaths>
      <div className="relative z-10 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white">Your Custom Content</h1>
        <p className="text-blue-100">Your custom description</p>
      </div>
    </BackgroundPaths>
  );
}
```
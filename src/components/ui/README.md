# UI Components

This directory contains reusable UI components for the Linkfro application.

## New Header Components

### HeaderWithAuth (`header-with-auth.tsx`)

A modern header component that includes:

- Responsive design with mobile menu toggle
- Clerk authentication integration (Login/Sign Up buttons)
- Request Access functionality
- Smooth scrolling navigation
- Sticky header with scroll effects

#### Usage

```tsx
import { HeaderWithAuth } from '@/components/ui/header-with-auth';

export default function Page() {
  return (
    <div>
      <HeaderWithAuth />
      {/* Rest of your page content */}
    </div>
  );
}
```

### Header (`header-2.tsx`)

A clean, minimal header component without authentication:

- Responsive design with mobile menu toggle
- Simple navigation links
- Sign In / Get Started buttons
- Sticky header with scroll effects

#### Usage

```tsx
import { Header } from '@/components/ui/header-2';

export default function Page() {
  return (
    <div>
      <Header />
      {/* Rest of your page content */}
    </div>
  );
}
```

## Dependencies

These components require the following dependencies to be installed:

- `@radix-ui/react-slot`
- `class-variance-authority`
- `lucide-react`

These should already be installed in the project.

## Customization

You can customize the header components by modifying the following:

1. Navigation links in the `links` array
2. Styling through Tailwind CSS classes
3. Logo by replacing the image source
4. Button styles in the authentication sections

## Mobile Support

Both header components include full mobile support with:

- Hamburger menu toggle
- Slide-in mobile navigation
- Properly styled mobile buttons
- Scroll locking when menu is open
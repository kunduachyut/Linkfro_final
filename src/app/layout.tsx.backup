import type { Metadata } from "next";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../app/context/CartContext";
import ToasterWrapper from "../components/ToasterWrapper";
import FloatingAuthPanel from "../components/FloatingAuthPanel";

// Load fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "Marketplace",
  description: "Publish and buy websites",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen w-full antialiased`}
        style={{backgroundColor: 'var(--base-primary)'}}
      >
        <CartProvider>
          <div className="w-full min-h-screen flex flex-col">
          {/* Main content */}
          <main className="w-full">{children}</main>
          </div>
          <FloatingAuthPanel />
        </CartProvider>
        <ToasterWrapper />
      </body>
    </html>
  );
  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        {content}
      </ClerkProvider>
    );
  }

  // If Clerk is not configured (publishable key missing), render app without initializing Clerk.
  // This prevents Clerk JS from attempting to load and timing out in environments where keys are not set.
  return content;
}
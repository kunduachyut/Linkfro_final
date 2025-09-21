// src/utils/types.ts
import { z } from "zod";

export const WebsiteCreateSchema = z.object({
  title: z.string().min(2),
  url: z.string().transform((val) => {
    // If URL doesn't have a protocol, add https:// to it
    if (val && !val.match(/^https?:\/\//)) {
      return `https://${val}`;
    }
    return val;
  }).pipe(z.string().url()),
  description: z.string().min(10),
  priceCents: z.number().int().nonnegative(),
  category: z.string().min(1), // Keep as string since we'll handle comma-separated values
  tags: z.array(z.string()).optional().default([]),
  image: z.string().url().optional(),
  // SEO Metrics
  DA: z.number().optional(),
  PA: z.number().optional(),
  Spam: z.number().optional(),
  OrganicTraffic: z.number().optional(),
  DR: z.number().optional(),
  RD: z.number().int().optional(),
  // New SEO Metrics
  trafficValue: z.number().optional(),
  locationTraffic: z.number().optional(),
  greyNicheAccepted: z.boolean().optional(),
  specialNotes: z.string().optional(),
  primaryCountry: z.string().optional(),
  primeTrafficCountries: z.string().optional(), // Will be converted to array on server
});


export const AdRequestSchema = z.object({
  websiteId: z.string().min(1),
  message: z.string().min(5),
});
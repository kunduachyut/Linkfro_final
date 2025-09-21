export interface Website {
  _id: string;
  title: string;
  url: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // SEO Metrics
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: number;
  // New SEO Metrics
  trafficValue?: number;
  locationTraffic?: number;
  greyNicheAccepted?: boolean;
  specialNotes?: string;
  // ... other fields
}
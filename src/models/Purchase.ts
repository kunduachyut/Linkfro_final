import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IWebsite } from "./Website";

export interface IPurchase extends Document {
  websiteId: Types.ObjectId | IWebsite;
  buyerId: string;
  amountCents: number;
  paymentLink?: string;
  docLink?: string;
  liveLink?: string;
  status: "pending" | "paid" | "rejected";
  stripeSessionId?: string;
  contentIds: Types.ObjectId[]; // Array of content IDs
  contentSelection?: "content" | "request" | "link" | null; // Store user's content selection
  linkDetails?: { anchorText?: string; targetUrl?: string; blogUrl?: string; paragraph?: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true },
  buyerId: { type: String, required: true },
  amountCents: { type: Number, required: true },
  paymentLink: { type: String, required: false },
  docLink: { type: String, required: false },
  liveLink: { type: String, required: false },
  // include frontend workflow statuses so server-side validation accepts them
  status: { type: String, enum: ["pending", "ongoing", "pendingPayment", "approved", "paid", "rejected"], required: true },
  stripeSessionId: { type: String },
  contentIds: [{ type: Schema.Types.ObjectId, ref: "UserContent" }], // Array of content IDs
  contentSelection: { type: String, enum: ["content", "request", "link"], default: null }, // Store user's content selection
  linkDetails: {
    anchorText: { type: String },
    targetUrl: { type: String },
    blogUrl: { type: String },
    paragraph: { type: String }
  }
}, { timestamps: true });

// Method to add content to purchase
PurchaseSchema.methods.addContent = async function(contentId: Types.ObjectId) {
  // Use toString() for comparison to ensure proper ObjectId comparison
  const contentIdStr = contentId.toString();
  const exists = this.contentIds.some((id: Types.ObjectId) => id.toString() === contentIdStr);
  
  if (!exists) {
    this.contentIds.push(contentId);
    await this.save();
  }
  return this;
};

// Method to remove content from purchase
PurchaseSchema.methods.removeContent = async function(contentId: Types.ObjectId) {
  const contentIdStr = contentId.toString();
  this.contentIds = this.contentIds.filter((id: Types.ObjectId) => id.toString() !== contentIdStr);
  await this.save();
  return this;
};

// Define static methods interface
interface IPurchaseModel extends Model<IPurchase> {
  addContentToPurchase(purchaseId: string, contentId: Types.ObjectId): Promise<IPurchase | null>;
}

// Static method to add content to purchase
PurchaseSchema.statics.addContentToPurchase = async function(purchaseId: string, contentId: Types.ObjectId) {
  const purchase = await this.findById(purchaseId);
  if (purchase) {
    const contentIdStr = contentId.toString();
    const exists = purchase.contentIds.some((id: Types.ObjectId) => id.toString() === contentIdStr);
    
    if (!exists) {
      purchase.contentIds.push(contentId);
      await purchase.save();
    }
    return purchase;
  }
  return null;
};

const Purchase = mongoose.models.Purchase as IPurchaseModel || mongoose.model<IPurchase, IPurchaseModel>("Purchase", PurchaseSchema);

export default Purchase;
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserContent extends Document {
  userId: string;
  websiteId?: string;
  purchaseId?: Types.ObjectId; // Change to ObjectId type
  requirements: string;
  // Either a PDF upload OR a link / linkDetails may be present
  pdf?: {
    data: Buffer;
    contentType: string;
    filename?: string;
    size?: number;
  };
  link?: string;
  linkDetails?: {
    anchorText?: string;
    targetUrl?: string;
    blogUrl?: string;
    paragraph?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserContentSchema = new Schema<IUserContent>(
  {
    userId: { type: String, required: true, index: true },
    websiteId: { type: String },
    purchaseId: { type: Schema.Types.ObjectId, ref: "Purchase" }, // Change to ObjectId type
    requirements: { type: String, required: true },
    pdf: {
      data: { type: Buffer },
      contentType: { type: String },
      filename: { type: String },
      size: { type: Number },
    },
    link: { type: String },
    linkDetails: {
      anchorText: { type: String },
      targetUrl: { type: String },
      blogUrl: { type: String },
      paragraph: { type: String }
    },
  },
  { timestamps: true }
);

// Add index for purchase ID
UserContentSchema.index({ purchaseId: 1 });

export const UserContent: Model<IUserContent> =
  (mongoose.models.UserContent as Model<IUserContent>) ||
  mongoose.model<IUserContent>("UserContent", UserContentSchema);
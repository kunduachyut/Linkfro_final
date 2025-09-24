import mongoose from "mongoose";

export interface IAdminRoleAudit extends mongoose.Document {
  actorUserId?: string; // who performed the action (Clerk userId)
  actorEmail?: string; // who performed the action (email)
  targetEmail: string; // the email that was paused/continued/created/removed
  role?: "websites" | "requests" | "super";
  action: "create" | "delete" | "pause" | "continue" | "update";
  notes?: string;
  createdAt?: Date;
}

const AdminRoleAuditSchema = new mongoose.Schema<IAdminRoleAudit>(
  {
    actorUserId: { type: String },
    actorEmail: { type: String },
    targetEmail: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["websites", "requests", "super"] },
    action: { type: String, enum: ["create", "delete", "pause", "continue", "update"], required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default (mongoose.models.AdminRoleAudit as mongoose.Model<IAdminRoleAudit>) ||
  mongoose.model<IAdminRoleAudit>("AdminRoleAudit", AdminRoleAuditSchema);

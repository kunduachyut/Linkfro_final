import mongoose from "mongoose";

export interface IAdminRole extends mongoose.Document {
  email: string;
  role: "websites" | "requests" | "super";
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminRoleSchema = new mongoose.Schema<IAdminRole>({
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ["websites", "requests", "super"], required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Avoid model overwrite issues in dev with hot reload
export default (mongoose.models.AdminRole as mongoose.Model<IAdminRole>) ||
  mongoose.model<IAdminRole>("AdminRole", AdminRoleSchema);
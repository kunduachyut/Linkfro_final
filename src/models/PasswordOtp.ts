import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPasswordOtp extends Document {
  email: string;
  phone?: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordOtpSchema = new Schema<IPasswordOtp>({
  email: { type: String, required: true, index: true },
  phone: { type: String },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid recompiling model on hot reload
if ((mongoose.models as any).PasswordOtp) {
  try { delete (mongoose.models as any).PasswordOtp; } catch (e) {}
}

const PasswordOtp: Model<IPasswordOtp> = mongoose.models.PasswordOtp as Model<IPasswordOtp> || mongoose.model<IPasswordOtp>('PasswordOtp', passwordOtpSchema);

export default PasswordOtp;

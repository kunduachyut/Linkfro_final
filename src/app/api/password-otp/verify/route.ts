import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PasswordOtp from '@/models/PasswordOtp';

const MONGODB_URI = process.env.MONGODB_URI as string;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, code, newPassword } = body;
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Email, code and newPassword are required' }, { status: 400 });
    }

    // find latest OTP for this email
    const otp = await PasswordOtp.findOne({ email, code }).sort({ createdAt: -1 });
    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    if (otp.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Update the Request document (if exists) with the new password
    if (mongoose.models && (mongoose.models as any).Request) {
      const updated = await (mongoose.models as any).Request.findOneAndUpdate(
        { email },
        { password: newPassword, status: 'approved' },
        { new: true }
      );
      console.log('Updated Request after OTP verify:', updated);
    } else {
      // Fallback: directly query the collection
      const result = await mongoose.connection.db.collection('requests').updateOne(
        { email },
        { $set: { password: newPassword, status: 'approved' } }
      );
  console.log('Updated requests collection result:', result);
    }

    // Optionally remove OTP or mark used
    await PasswordOtp.deleteMany({ email });

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('verify-otp error', err);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}

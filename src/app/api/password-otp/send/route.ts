import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PasswordOtp from '@/models/PasswordOtp';

const MONGODB_URI = process.env.MONGODB_URI as string;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, phone } = body;
    if (!email || !phone) {
      return NextResponse.json({ error: 'Email and phone are required' }, { status: 400 });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    const otpDoc = new PasswordOtp({ email, phone, code, expiresAt });
    await otpDoc.save();

    // TODO: Integrate SMS provider here. For now log the OTP so developers can test.
    console.log(`Password OTP for ${email} -> ${code}`);

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('send-otp error', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

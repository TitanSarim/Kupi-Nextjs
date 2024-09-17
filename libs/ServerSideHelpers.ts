import { db } from "@/db";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Shared SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Generate a random 4-digit verification code
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit code
};

export async function sendVerificationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  });
}

export async function initiateVerification(
  email: string,
  type: "signup" | "reset-password",
  userData?: any
) {
  // Generate a new verification code and expiry time
  const verificationCode = generateVerificationCode();
  const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  if (type === "signup" && userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Upsert user and verification data
    await db.verification.upsert({
      where: { email },
      update: {
        ...userData,
        password: hashedPassword,
        verificationCode,
        verificationExpiry,
      },
      create: {
        ...userData,
        password: hashedPassword,
        verificationCode,
        verificationExpiry,
      },
    });
  } else {
    // Update or create verification data for password reset
    await db.verification.upsert({
      where: { email },
      update: {
        verificationCode,
        verificationExpiry,
      },
      create: {
        email,
        verificationCode,
        verificationExpiry,
      },
    });
  }

  // Send the code via email
  await sendVerificationEmail(email, verificationCode);
}

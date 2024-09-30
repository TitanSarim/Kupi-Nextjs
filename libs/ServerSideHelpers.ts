import { db } from "@/db";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { IncryptedDataType } from "@/types/operator";
const crypto = require("crypto");

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

export const encryptData = (
  data: IncryptedDataType,
  secret: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto.createHash("sha256").update(secret).digest();

      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

      const dataString = JSON.stringify(data);

      let encrypted = cipher.update(dataString, "utf8", "hex");
      encrypted += cipher.final("hex");

      resolve(iv.toString("hex") + ":" + encrypted);
    } catch (error) {
      reject(error);
    }
  });
};

export const decryptData = (
  encryptedData: string,
  secret: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const parts = encryptedData.split(":");
      const iv = Buffer.from(parts[0], "hex");
      const encryptedText = parts[1];

      const key = crypto.createHash("sha256").update(secret).digest();

      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");

      const decryptedData = JSON.parse(decrypted);

      resolve(decryptedData);
    } catch (error) {
      reject(error);
    }
  });
};

export const isExpired = (expiresAt: string): boolean => {
  const expirationDate = new Date(expiresAt);
  const currentDate = new Date();
  return expirationDate < currentDate;
};

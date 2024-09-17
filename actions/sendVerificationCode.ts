"use server";

import { initiateVerification } from "@/libs/ServerSideHelpers";
import { VerificationType } from "../types/auth";

// Send a verification code to the user's email
export async function sendVerificationCode(
  email: string,
  type: VerificationType
) {
  // Use the helper function to send the verification code
  await initiateVerification(email, type);
  return { message: "Verification code sent" };
}

"use server";

import { initiateVerification } from "@/libs/ServerSideHelpers";
import { VerificationType } from "../types/auth";
import { db } from "@/db";

// Send a verification code to the user's email
export async function sendVerificationCode(
  email: string,
  type: VerificationType
): Promise<boolean> {
  const emailExists = await db.users.findFirst({
    where: {
      email: email,
    },
  });

  if (!emailExists) {
    return false;
  }

  await initiateVerification(email, type);
  return true;
}

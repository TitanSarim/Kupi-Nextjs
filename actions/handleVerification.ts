"use server";

import { db } from "@/db";
import { VerificationType, RolesEnum } from "../types/auth";

// Define the response type for the verification handler
type VerificationResponse = {
  status: number;
  message: string;
  type?: VerificationType;
};

// Handle the verification process
export async function handleVerification(
  email: string,
  code: string,
  type: VerificationType
): Promise<VerificationResponse | undefined> {
  // Check if the verification data exists
  const verification = await db.verification.findUnique({ where: { email } });
  if (!verification) {
    return { status: 404, message: "Verification code is incorrect." };
  }

  // Check if the code matches and is not expired
  if (
    verification.verificationCode !== code ||
    verification.verificationExpiry < new Date()
  ) {
    return { status: 400, message: "Invalid or expired verification code." };
  }

  if (type === "signup") {
    // Fetch the role ID based on the role name
    const role = await db.userRoles.findUnique({
      where: {
        roleName: RolesEnum.BusCompanyAdmin,
      },
    });

    if (!role) {
      return { status: 500, message: "Role not found." };
    }

    const operatorsSession = await db.operatorsSessions.findFirst({
      where: {
        email: verification.email,
      },
    });

    if (!operatorsSession) {
      return undefined;
    }

    const operator = await db.operators.findUnique({
      where: {
        id: operatorsSession.operatorId,
      },
    });

    if (!operator) {
      return undefined;
    }
    // Create the user account with the fetched role ID
    await db.users.create({
      data: {
        email: verification.email,
        name: verification.name ?? "",
        surname: verification.surname ?? "",
        password: verification.password ?? "",
        company: operator.name,
        description: verification.description,
        number: verification.number ?? "",
        emailVerified: new Date(),
        operatorsId: operatorsSession.operatorId,
        roleId: role.id,
      },
    });

    // Clean up the verification data
    await db.verification.delete({ where: { email } });

    return { status: 200, message: "Email verified successfully", type };
  } else if (type === "reset-password") {
    return {
      status: 200,
      message: "Code verified. Redirecting to reset password.",
      type,
    };
  }

  // In case nothing matches, return undefined.
  return undefined;
}

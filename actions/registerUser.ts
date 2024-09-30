"use server";

import {
  decryptData,
  initiateVerification,
  isExpired,
} from "@/libs/ServerSideHelpers";
import { db } from "@/db";

// Register a new user
export async function registerUser(
  formData: {
    name: string;
    surname: string;
    email: string;
    password: string;
    company: string;
    description: string;
    number: string;
  },
  token: string
) {
  try {
    const existingUser = await db.users.findUnique({
      where: { email: formData.email },
    });
    if (existingUser) {
      return { error: "Email is already registered." };
    }

    const operator = await db.operators.findFirst({
      where: { name: formData.company },
    });

    if (!operator) {
      return { error: "Operator not found" };
    }
    const secret = process.env.SECURE_AUTH_KEY;
    if (!secret) {
      console.error("SECURE_AUTH_KEY environment variable not set");
      return { success: false };
    }

    const decrypData = await decryptData(token, secret);
    const { email, companay, expiresAt } = decrypData;

    if (isExpired(expiresAt)) {
      console.error("Invite Expired");
      return { success: false };
    }
    const data = {
      name: formData.name,
      surname: formData.surname,
      email: email,
      password: formData.password,
      company: companay,
      description: formData.description,
      number: formData.number,
    };

    // Use the standardized "signup" type
    await initiateVerification(data.email, "signup", data);
    await db.operators.update({
      where: {
        id: operator.id,
      },
      data: {
        status: "REGISTERED",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

"use server";

import { initiateVerification } from "@/libs/ServerSideHelpers";
import { db } from "@/db";

// Register a new user
export async function registerUser(formData: {
  name: string;
  surname: string;
  email: string;
  password: string;
  company: string;
  description: string;
  number: string;
}) {
  try {
    const existingUser = await db.users.findUnique({
      where: { email: formData.email },
    });
    if (existingUser) {
      return { error: "Email is already registered." };
    }

    // Use the standardized "signup" type
    await initiateVerification(formData.email, "signup", formData);

    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

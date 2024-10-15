"use server";

import { signIn } from "@/auth";
import { db } from "@/db";

// Authenticate a user with their email and password
export async function authenticateUser(email: string, password: string) {
  try {
    const user = await db.users.findUnique({
      where: { email: email },
      include: { operator: true },
    });

    if (user?.operator?.status === "SUSPENDED") {
      return { error: "suspended" };
    }
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      return { error: result.error };
    }
    return { success: true };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

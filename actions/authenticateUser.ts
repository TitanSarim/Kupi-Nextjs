"use server";

import { signIn } from "@/auth";


// Authenticate a user with their email and password
export async function authenticateUser(email: string, password: string) {
  try {
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

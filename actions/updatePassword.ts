"use server";

import { db } from "@/db";
import bcrypt from "bcryptjs";

export async function updatePassword(email: string, newPassword: string) {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await db.users.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return { status: 200, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      status: 500,
      message: "An error occurred while updating the password",
    };
  }
}

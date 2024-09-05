"use server";

import { db } from "@/db";
import { Users } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UpdateProfileResponseType } from "../types/user";
import { auth } from "@/auth";


export async function getProfile(): Promise<Users | null> {
  try {

    const session = await auth();

    if(!session || !session.user?.email) {
      return null;
    }

    const getUser = await db.users.findUnique({
      where: { email: session?.user?.email },
    });

    if (!getUser) {
      return null;
    }

    return getUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function updateProfile(formData: {
  id: string;
  name: string;
  surname: string;
  number: string;
  password: string;
}): Promise<UpdateProfileResponseType> {
  try {
    const updateData: Partial<Users> = {
      name: formData.name,
      surname: formData.surname,
      number: formData.number,
    };

    if (formData.password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      updateData.password = hashedPassword;
    }

    await db.users.update({
      where: { id: formData.id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

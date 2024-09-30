"use server";

import { db } from "@/db";
import { Users } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UpdateProfileResponseType } from "../types/user";
import { auth } from "@/auth";
import { getSignedURL, uploadProfileImageToS3 } from "@/libs/s3";
import { revalidatePath } from "next/cache";

export async function getProfile(): Promise<Users | null> {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
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

export async function getProfileImage(): Promise<string | null> {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return null;
    }

    const user = await db.users.findUnique({
      where: { email: session?.user?.email },
    });

    if (!user || !user.image) {
      return null;
    }

    const url = await getSignedURL(user.image?.path);
    if (!url) {
      return null;
    }
    revalidatePath("/app/profile");
    return url;
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

    const response = {
      name: updateData.name,
      surname: updateData.surname,
    };

    revalidatePath("/app/profile");
    return { success: true, user: response };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function updateProfileImage(
  formData: FormData,
  id: string
): Promise<UpdateProfileResponseType | null> {
  try {
    const imageFile = formData.get("imageFiles");

    if (!imageFile) {
      console.error("Please upload files");
      return null;
    }

    const uploadedImage = await uploadProfileImageToS3(imageFile);

    if (!uploadedImage) return { error: "Failed to upload image" };

    await db.users.update({
      where: { id: id },
      data: {
        image: uploadedImage,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

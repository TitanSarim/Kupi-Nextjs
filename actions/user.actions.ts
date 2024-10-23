"use server";

import { db } from "@/db";
import { Users } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UpdateProfileResponseType } from "../types/user";
import { auth } from "@/auth";
import { getSignedURL, uploadProfileImageToS3 } from "@/libs/s3";
import { revalidatePath } from "next/cache";
import {
  FilterProps,
  SortOrderProps,
  UserDataType,
  UsersActionReturn,
  CreateUserFormData,
  UpdateUserFormData,
  DeleteUserResponse,
  BlockUserResponse,
  UserRolesType,
} from "@/types/user";
import { RolesEnum } from "@/types/auth";

export async function getAllUsers(searchParams: {
  name?: string;
  email?: string;
  roleName?: string;
  onlyAdmins?: boolean;
  onlyOperators?: boolean;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<UsersActionReturn | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      name,
      email,
      roleName,
      onlyAdmins,
      onlyOperators,
      sort,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const filter: FilterProps = {};

    // Apply filtering by name or email
    if (name) {
      const nameParts = name.split(" ").filter(Boolean);
      filter.OR = nameParts.flatMap((part) => [
        { name: { contains: part, mode: "insensitive" } },
        { surname: { contains: part, mode: "insensitive" } },
        { email: { contains: part, mode: "insensitive" } },
      ]);
    }

    // Apply filters for specific roles
    if (onlyAdmins) {
      filter.operatorsId = null;
    } else if (onlyOperators) {
      filter.operatorsId = { not: null };
    }

    // Apply filtering based on session role
    if (
      session.role === RolesEnum.BusCompanyAdmin ||
      session.role === RolesEnum.BusCompanyUser
    ) {
      filter.operatorsId = session.operatorId
        ? { equals: session.operatorId }
        : undefined;
    }

    // Handle sorting logic
    const sortOrder: SortOrderProps[] = [];
    if (sort) {
      const [field, order] = sort.split("_");
      if (
        field === "name" ||
        field === "email" ||
        field === "surname" ||
        field === "createdAt"
      ) {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      } else if (field === "roleName") {
        sortOrder.push({
          role: { roleName: order === "asc" ? "asc" : "desc" },
        });
      }
    } else {
      sortOrder.push({ createdAt: "desc" });
    }

    // Pagination settings
    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    // Fetch users with filters, sorting, and pagination
    const userData = await db.users.findMany({
      where: filter,
      orderBy: sortOrder.length > 0 ? sortOrder : undefined,
      skip,
      take,
      include: {
        role: true,
      },
    });

    if (!userData) {
      return null;
    }

    // Fetch operator names for users with an `operatorsId`
    const wrappedUsers: UserDataType[] = await Promise.all(
      userData.map(async (user) => {
        let operatorName = "Unknown";

        if (user.operatorsId) {
          const operator = await db.operators.findUnique({
            where: { id: user.operatorsId },
            select: { name: true },
          });
          operatorName = operator ? operator.name : "Unknown";
        }

        return {
          user: {
            ...user,
          },
          role: user.role
            ? {
                id: user.role.id,
                roleName: user.role.roleName,
                permissions: user.role.permissions,
              }
            : undefined,
          operatorName,
        };
      })
    );

    // Get total count of users for pagination
    const totalCount = await db.users.count({ where: filter });

    return {
      userData: wrappedUsers,
      paginationData: {
        totalCount,
        pageSize: pageSizeNumber,
        pageIndex: pageIndexNumber,
      },
    };
  } catch (error) {
    console.error("Error getting users:", error);
    return null;
  }
}

export async function getAllRoles(): Promise<UserRolesType[]> {
  try {
    const roles = await db.userRoles.findMany({
      select: {
        id: true,
        roleName: true,
        permissions: true,
      },
    });

    return roles.map((role) => ({
      id: role.id,
      roleName: role.roleName,
      permissions: role.permissions,
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export async function getUserById(
  userId: string
): Promise<UserDataType | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const user = await db.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const userData: UserDataType = {
      user: user,
      role: user.role
        ? {
            id: user.role.id,
            roleName: user.role.roleName,
            permissions: user.role.permissions,
          }
        : undefined,
    };

    return userData;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function createUser(
  formData: CreateUserFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if email already exists
    const existingUser = await db.users.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    await db.users.create({
      data: {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: hashedPassword,
        roleId: formData.roleId,
        number: formData.number,
        operatorsId: formData.operatorsId ? formData.operatorsId : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "An error occurred" };
  }
}

export async function updateUser(
  formData: UpdateUserFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const updateData: Partial<Users> = {};
    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.surname !== undefined) updateData.surname = formData.surname;
    if (formData.number !== undefined) updateData.number = formData.number;
    if (formData.email !== undefined) updateData.email = formData.email;
    if (formData.roleId !== undefined) updateData.roleId = formData.roleId;
    if (formData.password !== undefined && formData.password.trim() !== "") {
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
    return { success: false, error: "An error occurred" };
  }
}

export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.users.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "An error occurred" };
  }
}

export async function blockUnblockUser(
  userId: string,
  block: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.users.update({
      where: { id: userId },
      data: {
        isBlocked: block,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user blocked status:", error);
    return { success: false, error: "Failed to update user blocked status." };
  }
}

export async function unblockUser(userId: string): Promise<BlockUserResponse> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.users.update({
      where: { id: userId },
      data: {
        isBlocked: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return { success: false, error: "An error occurred" };
  }
}

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
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const existingUser = await db.users.findUnique({
      where: { email },
    });
    return !!existingUser;
  } catch (error) {
    console.error("Error checking if email exists:", error);
    return false;
  }
};

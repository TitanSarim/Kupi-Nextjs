import { Users, UserRoles } from "@prisma/client";
export type UserResponse = {
  name?: string;
  surname?: string;
};
export type UpdateProfileResponseType =
  | { success: true; user?: UserResponse }
  | { error: string };

export interface userRoles {
  name: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  number: string;
  password: string;
  operatorsId: string | null;
  roleId: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  company: string | null;
  description: string | null;
  role?: userRoles | undefined;
  createdAt: Date;
  updatedAt: Date;
  isBlocked?: boolean;
}

export interface UserRolesType {
  id: string;
  roleName: string;
  permissions: string[];
}

export interface UserDataType {
  user: Users;
  role?: UserRolesType;
  operatorName?: string;
}

export type UserQuery = {
  searchParams: {
    name?: string;
    email?: string;
    roleName?: string;
    onlyAdmins?: boolean;
    onlyOperators?: boolean;
    sort?: string;
    pageIndex?: number;
    pageSize?: number;
  };
};

export type UsersReturn = {
  userData: UserDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export type UsersActionReturn = {
  userData: UserDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export interface FilterProps {
  name?: { contains?: string; mode?: "insensitive" };
  email?: { contains?: string; mode?: "insensitive" };
  role?: {
    roleName?: { equals?: string; mode?: "insensitive" };
  };
  operatorsId?: null | { not: null } | { equals: string };
  OR?: Array<{
    name?: { contains?: string; mode?: "insensitive" };
    email?: { contains?: string; mode?: "insensitive" };
  }>;
  AND?: Array<FilterProps>;
}

export interface SortOrderProps {
  [key: string]: { [key: string]: "asc" | "desc" } | "asc" | "desc";
}

export interface CreateUserFormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  roleId: string;
  number: string;
  operatorsId?: string;
}

export interface UpdateUserFormData {
  id: string;
  name: string;
  surname: string;
  email: string;
  number: string;
  password?: string;
  roleId: string;
  isBlocked?: boolean;
}

export interface DeleteUserResponse {
  success: boolean;
  error?: string;
}

export interface BlockUserResponse {
  success: boolean;
  error?: string;
}

export type UserResponse = {
  name?: string;
  surname?: string;
};
export type UpdateProfileResponseType =
  | { success: true; user?: UserResponse }
  | { error: string };

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
  createdAt: Date;
  updatedAt: Date;
}

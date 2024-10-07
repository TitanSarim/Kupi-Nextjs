import NextAuth from "next-auth";
import { userRoles } from "./user";
import { RolesEnum } from "./auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    role?: string;
    operatorId?: string;
  }

  interface User {
    role?: userRoles;
    operatorId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RolesEnum;
    operatorId?: string;
  }
}

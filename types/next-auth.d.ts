import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    role?: string;
  }

  interface User {
    role?: { name: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { User } from "./types/user";
import { JWT } from "next-auth/jwt";
import { RolesEnum } from "./types/auth";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.users.findUnique({
          where: { email: credentials?.email as string },
          include: {
            role: true,
          },
        });
        if (!user) {
          throw new Error("No user found with the given email");
        }

        const isValidPassword = await bcrypt.compare(
          credentials?.password as string,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Incorrect password");
        }

        const transformedUser = {
          ...user,
          role: user.role ? { name: user.role.roleName } : undefined,
          operatorId: user.operatorsId ? user.operatorsId : undefined,
        };

        return transformedUser as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role?.name as RolesEnum;
        token.operatorId = user.operatorId;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      session.userId = token.id as string;
      session.role = token.role;
      session.operatorId = token.operatorId as string;
      return session;
    },
  },
});

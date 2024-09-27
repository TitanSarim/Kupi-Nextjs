import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { User } from "./types/user";

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
        return user as User;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.userId = token.id as string; // Attach the user ID to the session
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

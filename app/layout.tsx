import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "/global.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import "/public/css/style.css";
import "/public/css/custom.css";
import "/global.css";
import { Toaster } from "react-hot-toast";
import { db } from "@/db";
import Link from "next/link";
import { SignOut } from "@/components/signOut";
import Suspended from "@/components/Suspended";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kupi",
  description: "Online Ticketing Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await auth().catch(() => null)) ?? null;

  const operatorSession = await db.users.findFirst({
    where: {
      id: session?.userId,
    },
    include: {
      operator: true,
    },
  });

  const userSession = await db.users.findFirst({
    where: {
      id: session?.userId,
    },
  });

  const userRole = await db.users.findFirst({
    where: {
      id: session?.userId,
    },
    include: {
      role: true,
    },
  });

  return (
    <SessionProvider session={session}>
      <html lang="en">
        {userSession?.isBlocked ? (
          <body className={inter.className}>
            <div>
              <Suspended />
            </div>
          </body>
        ) : session && userRole?.role?.roleName != session?.role ? (
          <body className={inter.className}>
            <div>
              <p>Your Session has expired, Login again to continue.</p>
              <SignOut />
            </div>
          </body>
        ) : operatorSession?.operator?.status === "SUSPENDED" ? (
          <body className={inter.className}>
            <div>
              <Suspended />
            </div>
          </body>
        ) : (
          <body className={inter.className}>
            <Toaster position="top-right" reverseOrder={true} />
            {children}
          </body>
        )}
      </html>
    </SessionProvider>
  );
}

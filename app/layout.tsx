import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "/global.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import "/public/css/style.css";
import "/public/css/custom.css";
import "/global.css";

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
 

  const session = await auth().catch(() => null) ?? null;

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}


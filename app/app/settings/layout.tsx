import SettingsClient from "@/components/settings/SettingsClient";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full">
      <div className="h-full w-full">
        <div className="bg-page-backgound h-screen w-full">
          <div className="w-full flex flex-col items-center justify-start">
            <div className="relative w-11/12 py-4 mt-4 flex flex-row justify-between">
              <p className="text-lg text-black font-semibold">Kupi Admin</p>
              <SettingsClient />
            </div>
            <div className="relative w-11/12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <div className="bg-page-backgound h-fit w-full">
          <div className="w-full h-fit flex flex-col items-center justify-start">
            <SettingsClient />

            <div className="relative w-11/12 h-full mb-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

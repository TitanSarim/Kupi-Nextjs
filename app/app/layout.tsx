import React from "react";
import SideBar from "@/components/SideBar";
import NavBar from "@/components/NavBar";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";
import { getProfileImage } from "@/actions/user.actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let profileImage = await getProfileImage();
  if (!profileImage) {
    profileImage = "/img/profile/User-dumy.svg";
  }

  return (
    <div className="flex h-full">
      <SideBar />
      <div className="flex flex-col w-full">
        <Toaster />
        <NextTopLoader color="#FFC107" />
        <NavBar profileImage={profileImage} />
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
}

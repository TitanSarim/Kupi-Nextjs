import React from "react";
import SideBar from "@/components/SideBar";
import NavBar from "@/components/NavBar";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";
import { getProfileImage } from "@/actions/user.actions";
import { auth } from "@/auth";
import { getMaintainanceStatus } from "@/actions/settings.action";
import { RolesEnum } from "@/types/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await auth().catch(() => null)) ?? null;
  if (!session) {
    return null;
  }

  let profileImage = await getProfileImage();
  if (!profileImage) {
    profileImage = "/img/profile/User-dumy.svg";
  }

  const maintainance = await getMaintainanceStatus();

  return (
    <div className="flex h-full">
      {maintainance?.value === true &&
      (session.role === RolesEnum.BusCompanyAdmin ||
        session.role === RolesEnum.BusCompanyUser ||
        session.role === RolesEnum.KupiUser) ? (
        <div className="h-full w-full flex items-center text-center justify-start">
          <p className="w-full text-center mt-10 text-black text-2xl">
            Site is undermaintanance{" "}
          </p>
        </div>
      ) : (
        <>
          <SideBar role={session.role} />
          <div className="flex flex-col w-full">
            <Toaster />
            <NextTopLoader color="#FFC107" />
            <NavBar profileImage={profileImage} name={session?.user?.name} />
            <div className="h-full">{children}</div>
          </div>
        </>
      )}
    </div>
  );
}

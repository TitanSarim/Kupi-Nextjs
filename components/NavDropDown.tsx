"use client";
import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";

const NavDropDown = () => {
  const router = useRouter();

  return (
    <>
      <DropdownMenuItem
        onSelect={() => router.push("/app/profile")}
        className="relative flex flex-row items-center justify-start gap-2 mt-3 cursor-pointer"
      >
        <Image
          src="/img/icons/user-icon.png"
          alt="user img"
          width={20}
          height={20}
        />
        <p className="text-gray-700 text-base font-light">My Profile</p>
      </DropdownMenuItem>

      <DropdownMenuItem
        onSelect={() => router.push("/app/settings/admin")}
        className="relative flex flex-row items-center justify-start gap-2 mt-2 cursor-pointer"
      >
        <Image
          src="/img/icons/setting-icon.png"
          alt="user img"
          width={20}
          height={20}
        />
        <p className="text-gray-700 text-base font-light">Settings</p>
      </DropdownMenuItem>
    </>
  );
};

export default NavDropDown;

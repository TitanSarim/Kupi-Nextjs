import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import Link from "next/link";

const NavBar = async () => {
  const session = (await auth().catch(() => null)) ?? null;

  return (
    <div className="relative h-16 w-full bg-white flex justify-end items-center shadow-sm">
      <div className="pr-10">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="/img/icons/Dummy-user.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="px-6 py-4 w-48 relative">
            <div className="w-[200px] flex flex-row items-center justify-start gap-3">
              <Avatar>
                <AvatarImage src="/img/icons/Dummy-user.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-black text-base	font-medium mb-0 capitalize">
                  {session?.user?.name}
                </p>
                <span className=" text-slate-700	 text-sm font-light	capitalize">
                  Admin
                </span>
              </div>
            </div>

            <DropdownMenuSeparator className="mt-3" />

            <Link
              href={"/app/profile"}
              className="relative flex flex-row items-center justify-start gap-2 mt-3"
            >
              <Image
                src="/img/icons/user-icon.png"
                alt="user img"
                width={20}
                height={20}
              />
              <p className="text-gray-700 text-base font-light">My Profile</p>
            </Link>

            <Link
              href={"/app/settings/admin"}
              className="relative flex flex-row items-center justify-start gap-2 mt-2"
            >
              <Image
                src="/img/icons/setting-icon.png"
                alt="user img"
                width={20}
                height={20}
              />
              <p className="text-gray-700 text-base font-light">Settings</p>
            </Link>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="bg-kupi-yellow	w-full rounded-md mt-3 py-2 px-3 relative flex flex-row items-center justify-between">
                <p className="text-black text-base font-normal">Logout</p>
                <Image
                  src="/img/icons/logout-icon.svg"
                  alt="logout"
                  width={20}
                  height={20}
                />
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavBar;

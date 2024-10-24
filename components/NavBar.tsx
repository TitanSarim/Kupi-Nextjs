import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { signOut } from "@/auth";
import NavDropDown from "./NavDropDown";
import { cookies } from "next/headers";
import { RolesEnum } from "@/types/auth";

type NavProps = {
  profileImage: string;
  name?: string | null;
  role?: string | null;
};

const NavBar: React.FC<NavProps> = ({ profileImage, name, role }) => {
  return (
    <div className="sticky top-0 z-10 h-16 w-full bg-white flex justify-end items-center shadow-sm">
      <div className="pr-10">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="border-2 rounded-full">
              <AvatarImage src={profileImage} alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="px-6 py-4 w-52 relative">
            <div className="w-[200px] flex flex-row items-center justify-start gap-3">
              <Avatar className="border-2 rounded-full">
                <AvatarImage src={profileImage} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-black text-base	font-medium mb-0 capitalize">
                  {name}
                </p>
                <span className="text-slate-700 text-sm font-light capitalize">
                  {role === RolesEnum.SuperAdmin
                    ? "Super Admin"
                    : role === RolesEnum.KupiUser
                    ? "Kupi User"
                    : role === RolesEnum.BusCompanyAdmin
                    ? "Operator Admin"
                    : role === RolesEnum.BusCompanyUser
                    ? "Operator User"
                    : "Unknown Role"}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator className="mt-3" />

            <NavDropDown />

            <form
              action={async () => {
                "use server";
                cookies().set({
                  name: "authjs.csrf-token",
                  value: "",
                  expires: new Date("2016-10-05"),
                  path: "/",
                });
                await signOut({ redirectTo: "/" });
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

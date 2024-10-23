"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { UserDataType, UserRolesType, CreateUserFormData } from "@/types/user";
import { Button } from "@/components/ui/button";
import UserTable from "./UserTable";
import AddUserModal from "./AddUserModal";
import { useSession } from "next-auth/react";
import { RolesEnum } from "@/types/auth";
import { OperatorsType } from "@/types/transactions";
import toast from "react-hot-toast";

interface UserListProps {
  userData: UserDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
  roles: UserRolesType[];
  operators?: OperatorsType[];
}

const UserList: React.FC<UserListProps> = ({
  userData,
  paginationData,
  roles,
  operators,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyAdmins, setOnlyAdmins] = useState(false);
  const [onlyOperators, setOnlyOperators] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userDataState, setUserDataState] = useState<UserDataType[]>(userData);
  const session = useSession();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load the selected state from localStorage when the component mounts
  useEffect(() => {
    const savedView = localStorage.getItem("selectedView");
    if (savedView === "admins") {
      setOnlyAdmins(true);
      setOnlyOperators(false);
    } else if (savedView === "operators") {
      setOnlyAdmins(false);
      setOnlyOperators(true);
    }
  }, []);

  // Update the user data state when userData prop changes
  useEffect(() => {
    setUserDataState(userData);
  }, [userData]);

  const updateSearchParams = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("name", searchTerm);
    } else {
      params.delete("name");
    }
    if (onlyAdmins) {
      params.set("onlyAdmins", "true");
      params.delete("onlyOperators");
    } else if (onlyOperators) {
      params.set("onlyOperators", "true");
      params.delete("onlyAdmins");
    } else {
      params.delete("onlyAdmins");
      params.delete("onlyOperators");
    }

    router.push(`?${params.toString()}`, { scroll: false });
    router.refresh();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, onlyAdmins, onlyOperators]);

  // Save the selected view to localStorage
  const handleViewChange = (view: "admins" | "operators") => {
    if (view === "admins") {
      setOnlyAdmins(true);
      setOnlyOperators(false);
      localStorage.setItem("selectedView", "admins");
    } else if (view === "operators") {
      setOnlyAdmins(false);
      setOnlyOperators(true);
      localStorage.setItem("selectedView", "operators");
    }
  };

  const handleAddUser = (newUser: CreateUserFormData) => {
    const newUserData: UserDataType = {
      user: {
        id: Date.now().toString(),
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        number: newUser.number,
        password: newUser.password,
        roleId: newUser.roleId,
        operatorsId: newUser.operatorsId ? newUser.operatorsId : null,
        emailVerified: null,
        company: null,
        description: null,
        isBlocked: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      role: roles.find((r) => r.id === newUser.roleId) || undefined,
    };
    setUserDataState([...userDataState, newUserData]);
    setShowAddUserModal(false);
  };

  return (
    <div className="w-full mt-10 flex items-center justify-center">
      <div className="h-fit w-full bg-white shadow-sm rounded-md px-8 py-8 mb-5">
        <div className="w-full flex items-center justify-between mb-4">
          <h2 className="text-lg text-black font-semibold">Users List</h2>
          {session &&
            (session.data?.role === RolesEnum.SuperAdmin ||
              session.data?.role === RolesEnum.KupiUser) && (
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 border-gray-300 border rounded-lg px-4 py-2">
                  <input
                    type="radio"
                    id="viewOperators"
                    name="userRole"
                    checked={onlyOperators}
                    onChange={() => handleViewChange("operators")}
                    className="h-4 w-4 text-dark-grey"
                  />
                  <label
                    htmlFor="viewOperators"
                    className="ml-3 text-sm font-medium"
                  >
                    View Operators
                  </label>
                </div>
                <div className="flex items-center bg-gray-100 border-gray-300 border rounded-lg px-4 py-2">
                  <input
                    type="radio"
                    id="viewAdmins"
                    name="userRole"
                    checked={onlyAdmins}
                    onChange={() => handleViewChange("admins")}
                    className="h-4 w-4 text-dark-grey"
                  />
                  <label
                    htmlFor="viewAdmins"
                    className="ml-3 text-sm font-medium"
                  >
                    View Admins
                  </label>
                </div>
              </div>
            )}
        </div>

        {session &&
        (session.data?.role === RolesEnum.SuperAdmin ||
          session.data?.role === RolesEnum.BusCompanyAdmin) ? (
          <div className="flex justify-end mb-4">
            <Button
              className="bg-kupi-yellow px-8 py-2 rounded-lg text-dark-grey text-sm"
              onClick={() => setShowAddUserModal(true)}
            >
              Add User
            </Button>
          </div>
        ) : null}

        <div className="w-full mb-5">
          <label
            htmlFor="searchUser"
            className="block text-md font-medium leading-6 text-dark-grey"
          >
            Search User
          </label>
          <div className="mt-2">
            <Input
              type="text"
              id="searchUser"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user by name or email..."
              className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
            />
          </div>
        </div>

        <UserTable
          userData={userDataState}
          paginationData={paginationData}
          roles={roles}
          setUserDataState={setUserDataState}
        />

        {/* Add User Modal */}
        {showAddUserModal && (
          <AddUserModal
            onClose={() => setShowAddUserModal(false)}
            onAddUser={handleAddUser}
            roles={roles}
            operators={operators ? operators : []}
          />
        )}
      </div>
    </div>
  );
};

export default UserList;

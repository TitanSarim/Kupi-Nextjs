import { getAllRoles, getAllUsers } from "@/actions/user.actions";
import UserList from "@/components/users/UserList";
import React from "react";
import { UserQuery } from "@/types/user";

const Users = async ({
  searchParams,
}: {
  searchParams: UserQuery["searchParams"];
}) => {
  const data = await getAllUsers(searchParams);
  const roles = await getAllRoles();

  if (!data) {
    return (
      <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
        <div className="mt-32">
          <p>No Data Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <UserList
          userData={data.userData}
          paginationData={data.paginationData}
          roles={roles}
        />
      </div>
    </div>
  );
};

export default Users;

import { getAllRoles, getAllUsers } from "@/actions/user.actions";
import UserList from "@/components/users/UserList";

import React from "react";
import { UserQuery } from "@/types/user";
import { getAllOperators } from "@/actions/search.action";

const Users = async ({
  searchParams,
}: {
  searchParams: UserQuery["searchParams"];
}) => {
  const data = await getAllUsers(searchParams);
  const roles = await getAllRoles();
  const operators = await getAllOperators();

  if (!data) {
    return (
      <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
        <div className="mt-32">
          <p>No Data Found</p>
        </div>
      </div>
    );
  }
  if (!operators) {
    return null;
  }

  return (
    <div className="bg-page-backgound flex items-start justify-center h-full mb-12 w-full">
      <div className="w-11/12">
        <UserList
          userData={data.userData}
          paginationData={data.paginationData}
          roles={roles}
          operators={operators}
        />
      </div>
    </div>
  );
};

export default Users;

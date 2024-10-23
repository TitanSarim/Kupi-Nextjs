"use client";

import React, { startTransition, useEffect, useState } from "react";
import {
  Column,
  ColumnDef,
  Row,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { UserDataType, UserRolesType, UpdateUserFormData } from "@/types/user";
import EditUserModal from "./EditUserModal";
import TableComponent from "../Table/Table";
import DeleteModal from "../ui/delete-modal";
import toast from "react-hot-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { RolesEnum } from "@/types/auth";
import { useSession } from "next-auth/react";
import { deleteUser, blockUnblockUser } from "@/actions/user.actions";

interface UserTableProps {
  userData: UserDataType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
  roles: UserRolesType[];
  setUserDataState: React.Dispatch<React.SetStateAction<UserDataType[]>>;
}

const UserTable: React.FC<UserTableProps> = ({
  userData,
  paginationData,
  roles,
  setUserDataState,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pagination, setPagination] = useState({
    pageIndex: paginationData.pageIndex,
    pageSize: paginationData.pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedUser, setSelectedUser] = useState<UserDataType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const session = useSession();
  const currentUserId = session.data?.userId;

  const updateUrl = () => {
    const sortingParam = sorting
      .map((sort) => `${sort.id}_${sort.desc ? "desc" : "asc"}`)
      .join(",");
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageIndex", pagination.pageIndex.toString());
    params.set("pageSize", pagination.pageSize.toString());
    if (sortingParam) {
      params.set("sort", sortingParam);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    updateUrl();
  }, [pagination, sorting]);

  const handleEditUser = (user: UserDataType) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: UserDataType) => {
    if (user.user.id === currentUserId) {
      toast.error("You cannot delete yourself.");
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleBlockUnblockUser = (user: UserDataType) => {
    if (user.user.id === currentUserId) {
      toast.error("You cannot block/unblock yourself.");
      return;
    }
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const handleUpdateUser = async (
    updatedUser: UpdateUserFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setUserDataState((prevData) =>
        prevData.map((userData) =>
          userData.user.id === updatedUser.id
            ? {
                ...userData,
                user: { ...userData.user, ...updatedUser },
                role: roles.find((r) => r.id === updatedUser.roleId),
              }
            : userData
        )
      );
      setShowEditModal(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        const response = await deleteUser(selectedUser.user.id);
        if (response.success) {
          setUserDataState((prevData) =>
            prevData.filter(
              (userData) => userData.user.id !== selectedUser.user.id
            )
          );
          startTransition(() => {
            router.refresh();
          });
          setShowDeleteModal(false);
          setSelectedUser(null);
        } else {
          console.error(response.error);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleConfirmBlockUnblock = async () => {
    if (selectedUser) {
      const userId = selectedUser.user.id;
      const isCurrentlyBlocked = selectedUser.user.isBlocked;

      const response = await blockUnblockUser(userId, !isCurrentlyBlocked);
      if (response.success) {
        setUserDataState((prevData) =>
          prevData.map((userData) =>
            userData.user.id === userId
              ? {
                  ...userData,
                  user: { ...userData.user, isBlocked: !isCurrentlyBlocked },
                }
              : userData
          )
        );
        toast.success(
          `User has been successfully ${
            isCurrentlyBlocked ? "unblocked" : "blocked"
          }`
        );
      } else {
        console.error(response.error);
      }
      setShowBlockModal(false);
      setSelectedUser(null);
    }
  };

  const columns: ColumnDef<UserDataType>[] = [
    {
      accessorKey: "user.id",
      header: "#",
      cell: ({ row }) => {
        const userId = row.original.user.id;
        const isFullIdVisible = expandedId === userId;

        return (
          <div className="relative inline-block">
            <button
              className="bg-yellow-300 px-3 p-1 rounded-md"
              onClick={() => setExpandedId(isFullIdVisible ? null : userId)}
            >
              {isFullIdVisible ? userId : userId.slice(0, 5) + "..."}
            </button>
          </div>
        );
      },
    },

    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) =>
        `${row.original.user.name} ${row.original.user.surname}`,
    },
    {
      accessorKey: "user.email",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email Address <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => row.original.user.email,
    },
    ...(session.data?.role === RolesEnum.SuperAdmin ||
    session.data?.role === RolesEnum.KupiUser
      ? [
          {
            accessorKey: "user.operatorName",
            header: ({ column }: { column: Column<UserDataType> }) => (
              <button>
                Operator <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </button>
            ),
            cell: ({ row }: { row: Row<UserDataType> }) => (
              <span>{row.original.operatorName || "Unknown"}</span>
            ),
          },
        ]
      : []),

    {
      accessorKey: "role.roleName",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </button>
      ),
      cell: ({ row }) => row.original.role?.roleName || "N/A",
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        const user = row.original.user;
        const isBlocked = user.isBlocked;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              {session.data?.role !== RolesEnum.KupiUser &&
                session.data?.role !== RolesEnum.BusCompanyUser && (
                  <>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleEditUser(row.original)}
                      >
                        <Image
                          src="/img/edit.svg"
                          alt="Edit Route"
                          width={20}
                          height={20}
                        />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleDeleteUser(row.original)}
                      >
                        <Image
                          src="/img/delete.svg"
                          alt="Edit Route"
                          width={20}
                          height={20}
                        />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => handleBlockUnblockUser(row.original)}
                      >
                        <Image
                          src="/img/block.svg"
                          alt="Edit Route"
                          width={20}
                          height={20}
                        />
                        {isBlocked ? "Unblock" : "Block"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </>
                )}
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: userData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(paginationData.totalCount / pagination.pageSize),
  });

  return (
    <div className="w-full mt-8">
      <TableComponent
        paginationData={paginationData}
        setPagination={setPagination}
        pagination={pagination}
        tableData={table}
      />

      {/* Modals */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onUpdateUser={handleUpdateUser}
          roles={roles}
        />
      )}
      {showDeleteModal && selectedUser && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete ${selectedUser.user.name}?`}
          imageSrc="/img/delete-user.svg"
        />
      )}
      {showBlockModal && selectedUser && (
        <DeleteModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleConfirmBlockUnblock}
          message={`Are you sure you want to ${
            selectedUser.user.isBlocked ? "unblock" : "block"
          } ${selectedUser.user.name}?`}
          imageSrc="/img/blockUser.svg"
        />
      )}
    </div>
  );
};

export default UserTable;

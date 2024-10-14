import { Busses } from "@prisma/client";

export type createFormData = {
  name: string;
  iden: string;
  regNumber: string;
  capacity?: number | null;
  busClass: string;
  location: string;
  driver: string;
  comments: string;
};

export type updateFormData = {
  name: string;
  iden: string;
  regNumber: string;
  capacity?: number | null;
  busClass?: string | undefined;
  location: string;
  driver: string;
  comments: string;
};

export enum BusClass {
  STANDARD = "STANDARD",
  LUXURY = "LUXURY",
}

export type BusQuery = {
  searchParams: {
    sort?: string;
    carrier?: string;
    BusNumber?: string;
    BusRegistration?: string;
    BusClass?: string;
  };
};

export type PaginationData = {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
};

export type BussesReturn = {
  bussData: Busses[];
  paginationData: PaginationData;
};

export type SortOrderProps = {
  [key: string]: { [key: string]: "asc" | "desc" } | "asc" | "desc";
};

export interface FilterProps {
  carrier?: {
    contains?: string;
    mode?: "insensitive";
  };
  busID?: {
    contains?: string;
    mode?: "insensitive";
  };
  busClass?: BusClass;
  registration?: {
    contains?: string;
    mode?: "insensitive";
  };
}

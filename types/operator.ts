import { OperatorsType } from "./transactions";

export type FormData = {
  name: string;
  email: string;
  description?: string;
};

export type UpdateFormData = {
  name: string;
  email?: string;
  description?: string;
  checked: boolean;
};

export type OperatorsQuery = {
  searchParams: {
    name?: string;
    status?: string;
    sort?: string;
  };
};

export enum OperatorStatus {
  INVITED = "INVITED",
  SUSPENDED = "SUSPENDED",
  REGISTERED = "REGISTERED",
}

export type OperatorsData = {
  operators: OperatorsType[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export interface FilterProps {
  status?: {
    contains?: string;
    mode?: "insensitive";
  };
  name?: {
    contains?: string;
    mode?: "insensitive";
  };
}

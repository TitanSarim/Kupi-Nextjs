import { OperatorsSessions, TicketSources } from "@prisma/client";
import { OperatorsType } from "./transactions";
import { Prisma } from "@prisma/client";

export type FormData = {
  name: string;
  email: string;
  description?: string;
};

export type UpdateFormData = {
  name: string;
  email: string;
  description?: string;
};

export type OperatorsQuery = {
  searchParams: {
    name?: string;
    status?: string;
    sort?: string;
    source?: string;
  };
};

export enum OperatorStatus {
  INVITED = "INVITED",
  SUSPENDED = "SUSPENDED",
  REGISTERED = "REGISTERED",
}

export type OperatorsDataReturn = {
  operators: OperatorsType;
  sessionData: OperatorsSessions[];
};

export type OperatorsData = {
  operators: OperatorsDataReturn[];
  paginationData: {
    totalCount: number;
    pageSize: number;
    pageIndex: number;
  };
};

export interface FilterProps {
  status?: OperatorStatus;
  source?: string;
  name?: {
    contains?: string;
    mode?: "insensitive";
  };
  OperatorsSessions?: Prisma.OperatorsSessionsListRelationFilter;
}

export type IncryptedDataType = {
  email: string;
  name: string;
  expiresAt: string;
};

export interface LookupModel {
  STDescription: string[];
  STCarrier: string[];
}

export interface OperatorLookupModel {
  STDescription: string;
  STCarrier: string;
}

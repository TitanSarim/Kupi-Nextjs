export type FormData = {
  name: string;
  email: string;
  description?: string;
};

export enum OperatorStatus {
  INVITED = "INVITED",
  SUSPENDED = "SUSPENDED",
  REGISTERED = "REGISTERED",
}

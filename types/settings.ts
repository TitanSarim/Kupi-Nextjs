import { Operators, OperatorSettings } from "@prisma/client";

export interface SettingsFormData {
  key: string;
  value: string | number; // Adjust based on the possible types for value
}

export interface AdminSettingValue {
  exchangeRate: number;
  commission: number;
  tickets: number;
  bookingAt: number;
  reminder: number;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  operatorsId: string;
}

export interface operatorSettingsFormData {
  numbers: string[];
  emails: string[];
  tickets?: number | null;
  bookingAt: string;
  exchangeRate: number;
  company: string;
  description: string;
  bankName: string;
  accountTitle: string;
  ibanNumber: string;
  swiftNumber: string;
}

export interface operatorSettingsReturn {
  operator?: Operators | null;
  operatorSettings?: OperatorSettings | null;
}

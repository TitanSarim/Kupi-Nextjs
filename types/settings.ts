
export interface SettingsFormData {
    key: string;
    adminSetting: object;
}

export interface AdminSettingValue {
    exchangeRate: number
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
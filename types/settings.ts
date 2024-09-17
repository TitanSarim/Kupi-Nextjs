
export interface SettingsFormData {
    key: string;
    value: string | number; // Adjust based on the possible types for value
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
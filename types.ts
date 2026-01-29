
export type SoftwarePackage = 'Enterprise Suite' | 'Cloud Basic' | 'Security Pro' | 'Data Analytics';

export type SlotStatus = 'active' | 'inactive';

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  total_slots: number;
  available_slots: number;
  status: SlotStatus;
}

export interface Booking {
  id: string;
  company_name: string;
  software_package: SoftwarePackage;
  phone_number: string;
  date: string;
  time_slot: string;
  created_at: string;
}

export interface DashboardStats {
  today_total: number;
  upcoming_total: number;
  available_today: number;
}

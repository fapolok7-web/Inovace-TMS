
import { Booking, TimeSlot, DashboardStats, SoftwarePackage } from './types';

const STORAGE_KEYS = {
  SLOTS: 'training_slots',
  BOOKINGS: 'training_bookings',
  ADMIN: 'training_admin_session'
};

const seedSlots = () => {
  const existing = localStorage.getItem(STORAGE_KEYS.SLOTS);
  if (!existing) {
    const dates = [0, 1, 2, 7].map(offset => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    });

    const defaultTimes = ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'];
    let allInitial: TimeSlot[] = [];

    dates.forEach(date => {
      defaultTimes.forEach((t, i) => {
        allInitial.push({
          id: `seed-${date}-${i}`,
          date: date,
          time: t,
          total_slots: 5,
          available_slots: 5,
          status: 'active'
        });
      });
    });

    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(allInitial));
  }
};

export const api = {
  // --- Public Methods ---

  async getSlotsForDate(date: string): Promise<TimeSlot[]> {
    seedSlots();
    const all: TimeSlot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');
    return all.filter(s => s.date === date && s.status === 'active');
  },

  async createBooking(data: Omit<Booking, 'id' | 'created_at'>): Promise<{ success: boolean; message: string }> {
    const slots: TimeSlot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');
    const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');

    const slotIndex = slots.findIndex(s => s.date === data.date && s.time === data.time_slot);
    
    if (slotIndex === -1 || slots[slotIndex].available_slots <= 0) {
      return { success: false, message: 'This slot has just filled up. Please select another time.' };
    }

    slots[slotIndex].available_slots -= 1;
    
    const newBooking: Booking = {
      ...data,
      id: `bk-${Date.now()}`,
      created_at: new Date().toLocaleString()
    };

    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    return { success: true, message: 'Booking successful!' };
  },

  // --- Admin Methods ---

  async adminLogin(password: string): Promise<boolean> {
    if (password === '123456') {
      localStorage.setItem(STORAGE_KEYS.ADMIN, 'true');
      return true;
    }
    return false;
  },

  async isAdminLoggedIn(): Promise<boolean> {
    return localStorage.getItem(STORAGE_KEYS.ADMIN) === 'true';
  },

  async adminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    const slots: TimeSlot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');

    return {
      today_total: bookings.filter(b => b.date === todayStr).length,
      upcoming_total: bookings.filter(b => b.date >= todayStr).length,
      available_today: slots.filter(s => s.date === todayStr).reduce((acc, s) => acc + s.available_slots, 0)
    };
  },

  async getAllBookings(): Promise<Booking[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  },

  async getAllSlots(): Promise<TimeSlot[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');
  },

  async updateSlot(id: string, updates: Partial<TimeSlot>): Promise<void> {
    const slots: TimeSlot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');
    const idx = slots.findIndex(s => s.id === id);
    if (idx !== -1) {
      if (updates.total_slots !== undefined) {
        const diff = updates.total_slots - slots[idx].total_slots;
        slots[idx].available_slots = Math.max(0, slots[idx].available_slots + diff);
      }
      slots[idx] = { ...slots[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    }
  },

  async createSlot(slot: Omit<TimeSlot, 'id' | 'available_slots'>): Promise<void> {
    const slots: TimeSlot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SLOTS) || '[]');
    const newSlot: TimeSlot = {
      ...slot,
      id: `slot-${Date.now()}`,
      available_slots: slot.total_slots
    };
    slots.push(newSlot);
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  }
};

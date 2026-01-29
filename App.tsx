import React, { useState, useEffect, useMemo } from 'react';
import { api } from './api';
import { Booking, TimeSlot, DashboardStats, SoftwarePackage } from './types';

const SoftwarePackages: SoftwarePackage[] = ['Enterprise Suite', 'Cloud Basic', 'Security Pro', 'Data Analytics'];

// Helper to get local YYYY-MM-DD string
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api.isAdminLoggedIn().then(setIsAdmin);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-2 font-black text-indigo-600 text-xl tracking-tight cursor-pointer" onClick={() => setView('public')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm shadow-indigo-200 shadow-lg">TB</div>
          TRAINBOOK
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button 
            onClick={() => setView('public')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${view === 'public' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Booking
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${view === 'admin' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Admin Panel
          </button>
        </div>
      </nav>

      <main>
        {view === 'public' ? <PublicBookingView /> : (isAdmin ? <AdminDashboardView onLogout={() => setIsAdmin(false)} /> : <AdminLoginView onLogin={() => setIsAdmin(true)} />)}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-12 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-black text-indigo-600 text-lg mb-4">TRAINBOOK</div>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Simplifying enterprise training schedules with smart time-slot management and real-time availability tracking.</p>
          <div className="flex justify-center gap-6 text-slate-300 mb-8">
            <span className="hover:text-indigo-500 cursor-pointer transition-colors px-2">Twitter</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors px-2">LinkedIn</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors px-2">Support</span>
          </div>
          <p className="text-slate-300 text-xs border-t border-slate-100 pt-8">© 2024 TrainBook Enterprise. Built for High-Performance Teams.</p>
        </div>
      </footer>
    </div>
  );
};

// --- PUBLIC VIEW ---

const PublicBookingView = () => {
  const [date, setDate] = useState(getLocalDateString());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ company: '', phone: '', package: SoftwarePackages[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getSlotsForDate(date).then(setSlots);
    setSelectedSlot(null);
  }, [date]);

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedSlot) return;
    
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) { 
      setError('Please enter a valid phone number (at least 10 digits).'); 
      return; 
    }

    setIsSubmitting(true);
    try {
      const res = await api.createBooking({
        company_name: form.company,
        phone_number: form.phone,
        software_package: form.package as SoftwarePackage,
        date: date,
        time_slot: selectedSlot.time
      });

      if (res.success) {
        setSuccess(true);
        setForm({ company: '', phone: '', package: SoftwarePackages[0] });
        api.getSlotsForDate(date).then(setSlots);
        setTimeout(() => { 
          setSuccess(false); 
          setShowModal(false); 
          setSelectedSlot(null); 
        }, 2500);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-white pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-50/50 blur-3xl rounded-full -z-10" />
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Sessions Open Now
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Master Our Software <br />
            <span className="text-indigo-600">On Your Schedule.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Book a 1-on-1 expert-led training session. Select a date, pick a slot, and get your team ready for the next level.
          </p>
          <button 
            onClick={scrollToBooking}
            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            Book Training Slot
          </button>
        </div>
      </section>

      <section id="booking-section" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="grid lg:grid-cols-[380px,1fr] gap-16">
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-32">
              <label className="block text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">1. Choose Your Date</label>
              <input 
                type="date" 
                min={getLocalDateString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-xl font-bold cursor-pointer"
              />
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium">
                  Selected: <span className="font-black underline">{new Date(date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">2. Select Time</h3>
              <span className="text-sm text-slate-400 font-bold">{slots.length} Slots Found</span>
            </div>
            
            {slots.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-slate-400 font-bold text-lg">No sessions available for this date.</p>
                <p className="text-slate-300 text-sm">Please try another date or check back later.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    disabled={slot.available_slots <= 0}
                    onClick={() => { setSelectedSlot(slot); setShowModal(true); setError(null); }}
                    className={`relative p-8 rounded-[2rem] text-left border-2 transition-all group overflow-hidden ${
                      slot.available_slots > 0 
                      ? 'border-white bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-600 cursor-pointer' 
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 px-4 py-2 text-[10px] font-black uppercase rounded-bl-2xl ${slot.available_slots > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                      {slot.available_slots > 0 ? `${slot.available_slots}/${slot.total_slots} Slots Left` : 'Slot Full'}
                    </div>
                    <div className="text-3xl font-black text-slate-900 mb-2">{slot.time}</div>
                    <p className="text-slate-400 text-sm font-bold">Standard Training</p>
                    {slot.available_slots > 0 && (
                      <div className="mt-6 flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        Select Slot
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4 4H3"></path></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative animate-in zoom-in-95 duration-300">
            {success ? (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3">Confirmed!</h3>
                <p className="text-slate-500 text-lg">We've saved your spot for <span className="text-indigo-600 font-bold">{selectedSlot.time}</span>. See you then!</p>
              </div>
            ) : (
              <>
                <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="mb-10">
                  <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-2 block">Confirm Attendance</span>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedSlot.time} <span className="text-slate-400">on</span> {new Date(date).toLocaleDateString()}</h3>
                </div>
                <form onSubmit={handleBooking} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-xl">
                      {error}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                    <input required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold placeholder:text-slate-300" placeholder="e.g. Acme Industries" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Package</label>
                      <select value={form.package} onChange={e => setForm({...form, package: e.target.value as SoftwarePackage})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23cbd5e1%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_1rem_center] bg-no-repeat cursor-pointer">
                        {SoftwarePackages.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold placeholder:text-slate-300" placeholder="+1..." />
                    </div>
                  </div>
                  <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white p-6 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer">
                    {isSubmitting ? 'Confirming...' : 'Confirm My Session'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN VIEWS ---

const AdminLoginView = ({ onLogin }: { onLogin: () => void }) => {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await api.adminLogin(pass);
    if (ok) onLogin();
    else alert('Invalid Admin Password (Hint: 123456)');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-32 px-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-transparent to-transparent">
      <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 mt-8">Admin Center</h2>
        <p className="text-slate-400 mb-10 font-medium">Verify credentials to manage slots and view bookings.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            placeholder="Dashboard Password"
            autoFocus
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-center font-black tracking-widest text-lg"
          />
          <button disabled={loading} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95 cursor-pointer">
            {loading ? 'Authenticating...' : 'Unlock Control Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboardView = ({ onLogout }: { onLogout: () => void }) => {
  const [tab, setTab] = useState<'stats' | 'bookings' | 'slots' | 'reports'>('stats');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: getLocalDateString(), time: '10:00 AM', capacity: 5 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [s, b, sl] = await Promise.all([api.getDashboardStats(), api.getAllBookings(), api.getAllSlots()]);
    setStats(s);
    setBookings(b);
    setSlots(sl);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const logout = () => { api.adminLogout(); onLogout(); };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSlot({ date: newSlot.date, time: newSlot.time, total_slots: newSlot.capacity, status: 'active' });
    setShowAddSlot(false);
    loadAll();
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = !searchQuery || b.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.phone_number.includes(searchQuery);
      const matchesStart = !startDate || b.date >= startDate;
      const matchesEnd = !endDate || b.date <= endDate;
      return matchesSearch && matchesStart && matchesEnd;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [bookings, searchQuery, startDate, endDate]);

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Company', 'Package', 'Phone', 'Booked At'];
    const rows = filteredBookings.map(b => [b.date, b.time_slot, b.company_name, b.software_package, b.phone_number, b.created_at]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-3 shrink-0">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</div>
        {[
          { id: 'stats', label: 'Overview' },
          { id: 'bookings', label: 'Bookings' },
          { id: 'slots', label: 'Time Slots' },
          { id: 'reports', label: 'Reports' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setTab(item.id as any)} 
            className={`flex items-center gap-4 p-4 rounded-2xl font-black transition-all group cursor-pointer ${tab === item.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {item.label}
          </button>
        ))}
        <div className="mt-auto pt-8 border-t border-slate-100">
          <button onClick={logout} className="p-4 w-full rounded-2xl font-black text-rose-500 hover:bg-rose-50 cursor-pointer">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">Loading...</div>
        ) : (
          <div className="animate-in fade-in max-w-7xl mx-auto space-y-12">
            {tab === 'stats' && (
              <div className="space-y-12">
                <header>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance Overview</h1>
                </header>
                <div className="grid sm:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50">
                    <div className="text-5xl font-black mb-2">{stats?.today_total}</div>
                    <div className="text-xs font-black uppercase text-indigo-600">Today's Bookings</div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50">
                    <div className="text-5xl font-black mb-2">{stats?.upcoming_total}</div>
                    <div className="text-xs font-black uppercase text-emerald-600">Upcoming Total</div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50">
                    <div className="text-5xl font-black mb-2">{stats?.available_today}</div>
                    <div className="text-xs font-black uppercase text-slate-900">Available Today</div>
                  </div>
                </div>
              </div>
            )}

            {(tab === 'bookings' || tab === 'reports') && (
              <div className="space-y-10">
                <header className="flex justify-between items-end">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{tab === 'bookings' ? 'Bookings Ledger' : 'Reports'}</h1>
                  {tab === 'reports' && <button onClick={exportCSV} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl cursor-pointer">Export CSV</button>}
                </header>
                <div className="bg-white p-6 rounded-[2rem] shadow-lg flex gap-4">
                  <input type="text" placeholder="Search..." className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  <input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Appointment</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Organization</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Training Focus</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="px-8 py-6"><div className="font-black">{b.date}</div><div className="text-xs text-indigo-600 font-black">{b.time_slot}</div></td>
                          <td className="px-8 py-6 font-bold">{b.company_name}</td>
                          <td className="px-8 py-6"><span className="text-[10px] font-black uppercase px-3 py-1 bg-white border rounded-full">{b.software_package}</span></td>
                          <td className="px-8 py-6 text-right font-mono text-sm text-slate-400">{b.phone_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'slots' && (
              <div className="space-y-12">
                <header className="flex justify-between items-center">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Capacity Control</h1>
                  <button onClick={() => setShowAddSlot(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-[2rem] font-black shadow-xl cursor-pointer">New Slot</button>
                </header>

                {showAddSlot && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95">
                      <h3 className="text-2xl font-black mb-6">Create New Slot</h3>
                      <form onSubmit={handleCreateSlot} className="space-y-4">
                        <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                        <input type="text" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" placeholder="e.g. 10:00 AM" required />
                        <input type="number" min="1" value={newSlot.capacity} onChange={e => setNewSlot({...newSlot, capacity: parseInt(e.target.value) || 1})} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                        <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setShowAddSlot(false)} className="flex-1 p-4 font-black text-slate-400 cursor-pointer">Cancel</button>
                          <button type="submit" className="flex-1 bg-indigo-600 text-white p-4 rounded-xl font-black cursor-pointer">Create</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="grid gap-6">
                  {slots.sort((a,b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time)).map(slot => (
                    <div key={slot.id} className={`bg-white p-8 rounded-[2rem] shadow-lg border-2 transition-all flex flex-col md:flex-row items-center justify-between group ${slot.status === 'active' ? 'border-transparent' : 'opacity-60'}`}>
                      <div className="flex flex-col md:flex-row gap-8 items-center w-full md:w-auto">
                        <div className="text-center md:text-left">
                          <div className="text-2xl font-black text-slate-900">{slot.time}</div>
                          <div className="text-sm font-bold text-slate-400">{slot.date}</div>
                        </div>
                        <div className="flex gap-4">
                           <div className="text-center bg-slate-50 px-6 py-3 rounded-2xl">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</div>
                             <input type="number" className="w-16 bg-transparent text-center font-black text-xl text-slate-900 outline-none" value={slot.total_slots} onChange={async (e) => { 
                                  const val = parseInt(e.target.value) || 0;
                                  await api.updateSlot(slot.id, { total_slots: val });
                                  loadAll();
                                }} />
                           </div>
                           <div className="text-center bg-indigo-50 px-6 py-3 rounded-2xl">
                             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Left</div>
                             <div className="font-black text-xl text-indigo-600">{slot.available_slots}</div>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-6 md:mt-0">
                        <button onClick={async () => { await api.updateSlot(slot.id, { status: slot.status === 'active' ? 'inactive' : 'active' }); loadAll(); }} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase cursor-pointer ${slot.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {slot.status === 'active' ? 'Live' : 'Off'}
                        </button>
                        <button onClick={async () => { if(confirm('Delete?')) { const existing = JSON.parse(localStorage.getItem('training_slots') || '[]'); const filtered = existing.filter((s:any) => s.id !== slot.id); localStorage.setItem('training_slots', JSON.stringify(filtered)); loadAll(); } }} className="p-3 text-slate-300 hover:text-rose-500 cursor-pointer">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { configApi, type WeeklySchedule, isDayEnabled } from '../../api/config';
import { addDays, subDays, addMonths, subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Lock, AlertCircle } from 'lucide-react';
import YearView from '../../components/admin/calendar/YearView';
import MonthView from '../../components/admin/calendar/MonthView';
import CalendarContainer from '../../components/admin/calendar/CalendarContainer';
import BookingDetailPanel from '../../components/admin/calendar/BookingDetailPanel';
import CreateBlockModal from '../../components/admin/calendar/CreateBlockModal';
import CreateManualBookingModal from '../../components/admin/calendar/CreateManualBookingModal';
import type { CalendarEvent, CalendarBookingEvent, BookingStatus } from '../../types/domain';

type CalendarView = 'year' | 'month' | 'day';

export default function AdminTurnosPage() {
  const [view, setView] = useState<CalendarView>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Modal states
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState('09:00');

  // Detail panel
  const [selectedBooking, setSelectedBooking] = useState<CalendarBookingEvent | null>(null);

  // Load events for the current view range
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      let from: string;
      let to: string;

      if (view === 'day') {
        from = format(currentDate, 'yyyy-MM-dd');
        to = from;
      } else if (view === 'month') {
        from = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        to = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      } else {
        // Year view - load entire year
        const yearStart = new Date(currentDate.getFullYear(), 0, 1);
        const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
        from = format(yearStart, 'yyyy-MM-dd');
        to = format(yearEnd, 'yyyy-MM-dd');
      }

      const data = await adminApi.calendar.getEvents(from, to, false);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  // Load schedule configuration on mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setScheduleLoading(true);
        const scheduleData = await configApi.getSchedule();
        setSchedule(scheduleData);
      } catch (error) {
        console.error('Error loading schedule:', error);
        toast.error('Error al cargar configuración de horarios');
      } finally {
        setScheduleLoading(false);
      }
    };
    loadSchedule();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Navigation handlers
  const handlePrev = () => {
    if (view === 'year') setCurrentDate((d) => subMonths(d, 12));
    else if (view === 'month') setCurrentDate((d) => subMonths(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  };

  const handleNext = () => {
    if (view === 'year') setCurrentDate((d) => addMonths(d, 12));
    else if (view === 'month') setCurrentDate((d) => addMonths(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Slot click - open booking modal with pre-filled time
  const handleSlotClick = (time: string) => {
    setSelectedSlotTime(time);
    setIsBookingModalOpen(true);
  };

  // Booking click - open detail panel
  const handleBookingClick = (event: CalendarBookingEvent) => {
    setSelectedBooking(event);
  };

  // Reschedule via drag & drop
  const handleReschedule = async (bookingId: number, newStartAt: string) => {
    await adminApi.bookings.reschedule(bookingId, newStartAt);
    await loadEvents();
  };

  // Cancel block
  const handleBlockCancel = async (id: number) => {
    await adminApi.blocks.cancel(id);
    await loadEvents();
  };

  // Create block
  const handleCreateBlock = async (block: { startAt: string; endAt: string; reason: string }) => {
    await adminApi.blocks.create(block);
    await loadEvents();
    toast.success('Horario bloqueado');
  };

  // Status change from panel
  const handleStatusChange = async (id: number, status: BookingStatus) => {
    await adminApi.bookings.updateStatus(id, status);
    await loadEvents();
    setSelectedBooking(null);
  };

  // Customer update from panel
  const handleCustomerUpdate = async (
    id: number,
    customer: { name: string; email: string; whatsapp: string; comments: string | null }
  ) => {
    await adminApi.bookings.updateCustomer(id, customer);
    await loadEvents();
  };

  // Navigate to reschedule (close panel, user can drag)
  const handleRescheduleFromPanel = (_id: number) => {
    setSelectedBooking(null);
    toast.info('Arrastra el turno a un nuevo horario');
  };

  // Get title based on view
  const getTitle = () => {
    if (view === 'year') return format(currentDate, 'yyyy');
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: es });
    return format(currentDate, "EEEE d 'de' MMMM", { locale: es });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-50">
        {/* View Selector */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {(['year', 'month', 'day'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                view === v
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v === 'year' ? 'Año' : v === 'month' ? 'Mes' : 'Dia'}
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hoy
          </button>

          <h2 className="font-serif text-xl font-bold text-primary min-w-[240px] text-center capitalize">
            {getTitle()}
          </h2>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {view === 'day' && (
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2.5 rounded-full font-bold shadow-soft hover:shadow-lg hover:bg-gray-700 transition-all text-sm"
            >
              <Lock size={16} />
              Bloquear
            </button>
          )}
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:shadow-lg transition-all text-sm"
          >
            <Plus size={16} />
            Nuevo Turno
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="min-h-[500px]">
        {loading || scheduleLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
              <p>Cargando agenda...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'year' && (
              <YearView
                currentDate={currentDate}
                onMonthSelect={(d) => {
                  setCurrentDate(d);
                  setView('month');
                }}
              />
            )}
            {view === 'month' && schedule && (
              <MonthView
                currentDate={currentDate}
                events={events}
                schedule={schedule}
                onDaySelect={(d) => {
                  setCurrentDate(d);
                  setView('day');
                }}
              />
            )}
            {view === 'day' && schedule && (
              <>
                {!isDayEnabled(currentDate, schedule) ? (
                  <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <AlertCircle size={48} className="mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Día No Habilitado</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        Este día está configurado como cerrado en los horarios de atención.
                        Puedes cambiar la configuración en la sección de Configuración.
                      </p>
                    </div>
                  </div>
                ) : (
                  <CalendarContainer
                    currentDate={currentDate}
                    events={events}
                    schedule={schedule}
                    onBookingClick={handleBookingClick}
                    onSlotClick={handleSlotClick}
                    onBlockCancel={handleBlockCancel}
                    onReschedule={handleReschedule}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Detail Panel */}
      {selectedBooking && (
        <BookingDetailPanel
          event={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          onReschedule={handleRescheduleFromPanel}
          onCustomerUpdate={handleCustomerUpdate}
        />
      )}

      {/* Create Block Modal */}
      <CreateBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSubmit={handleCreateBlock}
        initialDate={currentDate}
        initialTime={selectedSlotTime}
        schedule={schedule}
      />

      {/* Create Manual Booking Modal */}
      <CreateManualBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={loadEvents}
        initialDate={currentDate}
        initialTime={selectedSlotTime}
        schedule={schedule}
      />
    </div>
  );
}

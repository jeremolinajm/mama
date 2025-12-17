import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { turnosApi } from '../../api/turnos'; // Para crear el turno
import { serviciosApi } from '../../api/servicios'; // Para listar servicios
import { addMonths, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import YearView from '../../components/admin/calendar/YearView';
import MonthView from '../../components/admin/calendar/MonthView';
import CalendarContainer from '../../components/admin/calendar/CalendarContainer';
import Modal from '../../components/admin/Modal';
import DateTimePicker from '../../components/booking/DateTimePicker';
import type { Booking, Service, CreateBookingRequest } from '../../types/domain';

type CalendarView = 'year' | 'month' | 'day';

export default function AdminTurnosPage() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS PARA MODAL DE NUEVO TURNO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  // Datos Cliente Manual
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [isBlock, setIsBlock] = useState(false); // Checkbox para "Bloquear Horario"

  useEffect(() => {
    loadBookings();
    loadServices();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await adminApi.bookings.getAll();
      setBookings(data.filter(b => b.status !== 'CANCELLED'));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadServices = async () => {
    try {
      const data = await serviciosApi.getAll();
      setServices(data.filter(s => s.isActive));
    } catch (err) { console.error(err); }
  };

  const handlePrev = () => {
    if (view === 'year') setCurrentDate(d => subMonths(d, 12));
    if (view === 'month') setCurrentDate(d => subMonths(d, 1));
    if (view === 'day') setCurrentDate(d => subMonths(d, 1)); // Fix: Day prev
  };

  const handleNext = () => {
    if (view === 'year') setCurrentDate(d => addMonths(d, 12));
    if (view === 'month') setCurrentDate(d => addMonths(d, 1));
    if (view === 'day') setCurrentDate(d => addMonths(d, 1)); // Fix: Day next
  };

  const handleCreateTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !bookingDate || !bookingTime) return;

    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    try {
      const request: CreateBookingRequest = {
        serviceId: service.id,
        customerName: isBlock ? "BLOQUEO AGENDA" : manualName,
        customerEmail: isBlock ? "admin@interno.com" : "cliente@manual.com", // Dummy email
        customerWhatsapp: isBlock ? "00000000" : manualPhone,
        customerComments: isBlock ? "Horario bloqueado por admin" : "Reserva manual (Teléfono/Presencial)",
        bookingDate,
        bookingTime,
        durationMinutes: service.durationMinutes,
        amount: service.price
      };

      // Usamos la API pública para crear (reutilización de lógica)
      await turnosApi.create(request);

      // Nota: No redirigimos a MercadoPago. Asumimos que es pago en efectivo o bloqueo.
      // El backend lo deja en PENDING. Podríamos agregar un endpoint para pasarlo a CONFIRMED directo,
      // pero para MVP basta con crearlo.

      alert(isBlock ? 'Horario bloqueado con éxito' : 'Turno agendado con éxito');
      setIsModalOpen(false);

      // Reset form
      setManualName('');
      setManualPhone('');
      setIsBlock(false);
      setBookingDate('');
      setBookingTime('');

      loadBookings(); // Recargar calendario
    } catch (error) {
      console.error(error);
      alert('Error al crear el turno. Verificá que el horario esté disponible.');
    }
  };

  const handleReschedule = async (bookingId: number, newDate: string, newTime: string) => {
    await adminApi.bookings.reschedule(bookingId, newDate, newTime);
    loadBookings(); // Reload to show updated position
  };

  const handleSlotClick = (time: string) => {
    // Pre-fill the time and open modal
    setBookingTime(time);
    setBookingDate(format(currentDate, 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const handleBlockDay = async () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const reason = prompt('Motivo del bloqueo (opcional):', 'Día bloqueado - Holiday');

    if (reason === null) return; // User cancelled

    try {
      await adminApi.bookings.blockDay(dateStr, reason || undefined);
      alert('Día bloqueado exitosamente');
      loadBookings(); // Reload calendar
    } catch (error) {
      console.error(error);
      alert('Error al bloquear el día');
    }
  };

  const handleUnblockDay = async () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    if (!confirm('¿Desbloquear este día?')) return;

    try {
      await adminApi.bookings.unblockDay(dateStr);
      alert('Día desbloqueado exitosamente');
      loadBookings(); // Reload calendar
    } catch (error) {
      console.error(error);
      alert('Error al desbloquear el día');
    }
  };

  // Check if current day is blocked
  const isDayBlocked = bookings.some(
    b => b.bookingDate === format(currentDate, 'yyyy-MM-dd') && b.status === 'BLOCKED'
  );

  return (
    <div className="space-y-6">
      {/* HEADER DE CONTROLES (Igual que antes pero con onClick real) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-50">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {(['year', 'month', 'day'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                view === v ? 'bg-white text-accent shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v === 'year' ? 'Año' : v === 'month' ? 'Mes' : 'Día'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">←</button>
          <h2 className="font-serif text-xl font-bold text-primary min-w-[200px] text-center capitalize">
            {view === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">→</button>
        </div>

        <div className="flex gap-2">
          {view === 'day' && (
            <>
              {!isDayBlocked ? (
                <button
                  onClick={handleBlockDay}
                  className="bg-gray-500 text-white px-4 py-2.5 rounded-full font-bold shadow-soft hover:shadow-lg transition-all text-sm"
                >
                  🔒 Bloquear Día
                </button>
              ) : (
                <button
                  onClick={handleUnblockDay}
                  className="bg-orange-500 text-white px-4 py-2.5 rounded-full font-bold shadow-soft hover:shadow-lg transition-all text-sm"
                >
                  🔓 Desbloquear Día
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:shadow-lg transition-all text-sm"
          >
            + Nuevo Turno
          </button>
        </div>
      </div>

      {/* VISTAS CALENDARIO */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Cargando agenda...</div>
        ) : (
          <>
            {view === 'year' && <YearView currentDate={currentDate} onMonthSelect={(d) => { setCurrentDate(d); setView('month'); }} />}
            {view === 'month' && <MonthView currentDate={currentDate} bookings={bookings} onDaySelect={(d) => { setCurrentDate(d); setView('day'); }} />}
            {view === 'day' && (
              <CalendarContainer
                currentDate={currentDate}
                bookings={bookings}
                onSlotClick={handleSlotClick}
                onReschedule={handleReschedule}
              />
            )}
          </>
        )}
      </div>

      {/* MODAL NUEVO TURNO / BLOQUEO */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Agendar Turno Manual"
      >
        <form onSubmit={handleCreateTurno} className="space-y-6">
          
          {/* Selector de Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
            <select 
              className="w-full border rounded-lg p-2"
              value={selectedServiceId || ''}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              required
            >
              <option value="">Seleccionar...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Para bloquear un horario, selecciona cualquier servicio o crea uno llamado "Bloqueo" de 30/60 min.
            </p>
          </div>

          {/* Selector Fecha/Hora (Reusando componente inteligente) */}
          {selectedServiceId && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <DateTimePicker 
                serviceId={selectedServiceId}
                date={bookingDate}
                time={bookingTime}
                onDateChange={setBookingDate}
                onTimeChange={setBookingTime}
              />
            </div>
          )}

          {/* Checkbox Bloqueo */}
          <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <input 
              type="checkbox" 
              id="blockCheck"
              checked={isBlock}
              onChange={(e) => setIsBlock(e.target.checked)}
              className="w-4 h-4 text-accent rounded"
            />
            <label htmlFor="blockCheck" className="text-sm font-medium text-yellow-800 cursor-pointer select-none">
              Es un bloqueo de agenda (No es un cliente real)
            </label>
          </div>

          {/* Datos Cliente (Solo si no es bloqueo) */}
          {!isBlock && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Cliente</label>
                <input 
                  type="text" 
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required={!isBlock}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input 
                  type="text" 
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required={!isBlock}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={!bookingDate || !bookingTime || !selectedServiceId}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50"
            >
              {isBlock ? 'Bloquear Horario' : 'Agendar Turno'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
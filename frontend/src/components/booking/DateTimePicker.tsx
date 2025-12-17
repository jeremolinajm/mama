import { useState, useEffect } from 'react';
import { turnosApi } from '../../api/turnos'; // Importar API

interface DateTimePickerProps {
  serviceId: number; // <--- NUEVO PROP OBLIGATORIO
  date: string; 
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimePicker({
  serviceId,
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const [viewDate, setViewDate] = useState(new Date());
  
  // Estado para los slots dinámicos
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // EFECTO: Cargar horarios cuando cambia la fecha o el servicio
  useEffect(() => {
    const fetchSlots = async () => {
      // Solo buscar si hay fecha seleccionada y servicio
      if (!date || !serviceId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      setErrorSlots(null);
      
      // Limpiamos la selección de hora anterior
      // Esto es crucial para que si cambio de servicio (con mismo día) o de día, se borre la hora vieja
      onTimeChange(''); 

      try {
        const slots = await turnosApi.getAvailability(serviceId, date);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setErrorSlots("No se pudieron cargar los horarios.");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [date, serviceId, onTimeChange]);// Dependencias: si cambia fecha o ID, recargar.

  // ... (Mantener lógica de calendario getDaysInMonth, handlePrevMonth, handleNextMonth igual que antes)
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    const newDate = new Date(viewDate.setMonth(viewDate.getMonth() - 1));
    if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() === today.getFullYear()) return;
    setViewDate(new Date(newDate));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)));
  };

  const handleDayClick = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selected.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    onDateChange(dateString);
    // El useEffect se encargará de cargar los horarios y limpiar la hora seleccionada
  };

  const emptyDays = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* ... (Render del Calendario se mantiene IGUAL que tu versión anterior) ... */}
      <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-accent disabled:opacity-30">
            ←
          </button>
          <h3 className="font-serif text-lg font-bold text-primary capitalize">
            {months[currentMonth]} <span className="text-gray-400 font-sans font-normal">{currentYear}</span>
          </h3>
          <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-accent">
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {daysOfWeek.map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const dateToCheck = new Date(currentYear, currentMonth, day);
            dateToCheck.setHours(0,0,0,0);
            const isToday = dateToCheck.getTime() === today.getTime();
            const isPast = dateToCheck < today;
            const isSelected = date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative
                  ${isSelected ? 'bg-accent text-white shadow-md scale-105 font-bold' : isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-white hover:text-accent'}
                  ${isToday && !isSelected ? 'ring-1 ring-accent text-accent' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- SELECCIÓN DE HORA (DINÁMICA) --- */}
      {date ? (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-gray-700 mb-4 pl-1">
            Horarios disponibles para el <span className="text-accent font-bold">{date.split('-').reverse().join('/')}</span>
          </label>
          
          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : errorSlots ? (
             <div className="text-center py-4 text-red-400 text-sm bg-red-50 rounded-xl border border-red-100">
               {errorSlots}
             </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
              No hay turnos disponibles para esta fecha. Intenta otro día.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onTimeChange(slot)} // El slot viene del backend como "09:00:00" o "09:00"
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    time === slot
                      ? 'bg-primary text-white border-primary shadow-lg transform -translate-y-0.5'
                      : 'bg-white text-gray-600 border-gray-100 hover:border-accent hover:text-accent hover:shadow-sm'
                  }`}
                >
                  {slot.slice(0, 5)} {/* Aseguramos formato HH:mm visualmente */}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">Seleccioná un día en el calendario para ver los horarios.</p>
        </div>
      )}
    </div>
  );
}
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  getDay, 
  isSameDay, 
  isToday 
} from 'date-fns';
import type { Booking } from '../../../types/domain';

interface MonthViewProps {
  currentDate: Date;
  bookings: Booking[];
  onDaySelect: (date: Date) => void;
}

export default function MonthView({ currentDate, bookings, onDaySelect }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden animate-fade-in border border-gray-100">
      {/* Header Semanal */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grilla Días */}
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {/* Espacios vacíos */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-gray-100" />
        ))}

        {days.map((day) => {
          // Filtrar turnos de este día
          const dayBookings = bookings.filter(b => isSameDay(new Date(b.bookingDate + 'T00:00:00'), day));
          const isBlocked = dayBookings.some(b => b.status === 'BLOCKED');
          const nonBlockedBookings = dayBookings.filter(b => b.status !== 'BLOCKED');

          return (
            <div
              key={day.toString()}
              onClick={() => onDaySelect(day)}
              className={`border-b border-r border-gray-100 p-2 transition-all cursor-pointer hover:bg-accent/5 group relative
                ${isToday(day) ? 'bg-accent/5' : ''}
                ${isBlocked ? 'bg-gray-100 diagonal-stripes' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                  ${isToday(day) ? 'bg-accent text-white' : isBlocked ? 'text-gray-500' : 'text-gray-700 group-hover:text-accent'}
                `}>
                  {format(day, 'd')}
                </span>
                {isBlocked ? (
                  <span className="text-[10px] bg-gray-300 px-1.5 py-0.5 rounded text-gray-700 font-bold">
                    🔒 CERRADO
                  </span>
                ) : nonBlockedBookings.length > 0 ? (
                   <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                     {nonBlockedBookings.length} citas
                   </span>
                ) : null}
              </div>

              {/* Lista mini de turnos - solo mostrar si NO está bloqueado */}
              {!isBlocked && (
                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                  {nonBlockedBookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 truncate border-l-2 border-blue-400">
                      {booking.bookingTime.slice(0, 5)} {booking.customerName.split(' ')[0]}
                    </div>
                  ))}
                  {nonBlockedBookings.length > 3 && (
                    <div className="text-[10px] text-gray-400 pl-1">+ {nonBlockedBookings.length - 3} más</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
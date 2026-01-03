import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  isToday
} from 'date-fns';
import { Lock } from 'lucide-react';
import type { CalendarEvent, CalendarBookingEvent, CalendarBlockEvent } from '../../../types/domain';
import { type WeeklySchedule, isDayEnabled, getDayHours } from '../../../api/config';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  schedule: WeeklySchedule;
  onDaySelect: (date: Date) => void;
}

export default function MonthView({ currentDate, events, schedule, onDaySelect }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  // Helper function to check if a day is fully blocked
  const isDayFullyBlocked = (day: Date, blocks: CalendarBlockEvent[]): boolean => {
    if (blocks.length === 0) return false;

    const hours = getDayHours(day, schedule);
    if (!hours) return false;

    // Calculate total working minutes
    const [startH, startM] = hours.startTime.split(':').map(Number);
    const [endH, endM] = hours.endTime.split(':').map(Number);
    const totalWorkMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    // Calculate total blocked minutes
    let totalBlockedMinutes = 0;
    for (const block of blocks) {
      const blockStart = new Date(block.startAt);
      const blockEnd = new Date(block.endAt);

      // Get block start/end as minutes from midnight
      const blockStartMinutes = blockStart.getHours() * 60 + blockStart.getMinutes();
      const blockEndMinutes = blockEnd.getHours() * 60 + blockEnd.getMinutes();

      // Clamp to work hours
      const workStartMinutes = startH * 60 + startM;
      const workEndMinutes = endH * 60 + endM;

      const effectiveStart = Math.max(blockStartMinutes, workStartMinutes);
      const effectiveEnd = Math.min(blockEndMinutes, workEndMinutes);

      if (effectiveEnd > effectiveStart) {
        totalBlockedMinutes += effectiveEnd - effectiveStart;
      }
    }

    // Consider "fully blocked" if 90%+ of the day is blocked
    return totalBlockedMinutes >= totalWorkMinutes * 0.9;
  };

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

      {/* Grilla Dias */}
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {/* Espacios vacios */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-gray-100" />
        ))}

        {days.map((day) => {
          // Check if day is enabled
          const dayEnabled = isDayEnabled(day, schedule);

          // Filter events for this day
          const dayEvents = events.filter(e => {
            const eventDate = new Date(e.startAt);
            return isSameDay(eventDate, day);
          });

          const bookingEvents = dayEvents.filter((e): e is CalendarBookingEvent =>
            e.type === 'BOOKING' && e.status !== 'CANCELLED'
          );
          const blockEvents = dayEvents.filter((e): e is CalendarBlockEvent =>
            e.type === 'BLOCK' && e.status !== 'CANCELLED'
          );

          const fullyBlocked = dayEnabled && isDayFullyBlocked(day, blockEvents);
          const hasPartialBlocks = blockEvents.length > 0 && !fullyBlocked;

          // Disabled day (not in schedule)
          if (!dayEnabled) {
            return (
              <div
                key={day.toString()}
                className="border-b border-r border-gray-100 p-2 bg-gray-100/50 cursor-not-allowed"
              >
                <div className="flex justify-between items-start">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium text-gray-400">
                    {format(day, 'd')}
                  </span>
                  <span className="text-[10px] text-gray-400 italic">Cerrado</span>
                </div>
              </div>
            );
          }

          // Fully blocked day
          if (fullyBlocked) {
            return (
              <div
                key={day.toString()}
                onClick={() => onDaySelect(day)}
                className="border-b border-r border-gray-100 p-2 bg-gray-200/60 cursor-pointer hover:bg-gray-200 transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                    ${isToday(day) ? 'bg-accent text-white' : 'text-gray-600'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="mt-4 flex flex-col items-center justify-center text-gray-500">
                  <Lock size={20} className="mb-1" />
                  <span className="text-xs font-medium">Bloqueado</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={day.toString()}
              onClick={() => onDaySelect(day)}
              className={`border-b border-r border-gray-100 p-2 transition-all cursor-pointer hover:bg-accent/5 group relative
                ${isToday(day) ? 'bg-accent/5' : ''}
                ${hasPartialBlocks ? 'bg-gray-50' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                  ${isToday(day) ? 'bg-accent text-white' : 'text-gray-700 group-hover:text-accent'}
                `}>
                  {format(day, 'd')}
                </span>
                <div className="flex gap-1">
                  {hasPartialBlocks && (
                    <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                      {blockEvents.length} bloq
                    </span>
                  )}
                  {bookingEvents.length > 0 && (
                    <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-600 font-medium">
                      {bookingEvents.length} turnos
                    </span>
                  )}
                </div>
              </div>

              {/* Mini booking list */}
              <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                {bookingEvents.slice(0, 3).map(event => {
                  const startTime = new Date(event.startAt).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  const firstName = event.customerName.split(' ')[0];

                  return (
                    <div
                      key={event.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate border-l-2 ${
                        event.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-400'
                          : 'bg-amber-50 text-amber-600 border-amber-400'
                      }`}
                    >
                      {startTime} {firstName}
                    </div>
                  );
                })}
                {bookingEvents.length > 3 && (
                  <div className="text-[10px] text-gray-400 pl-1">
                    + {bookingEvents.length - 3} mas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

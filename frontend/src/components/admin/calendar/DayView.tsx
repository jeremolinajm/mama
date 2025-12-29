import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import BookingCard from './BookingCard';
import BlockCard from './BlockCard';
import type { CalendarEvent, CalendarBookingEvent, CalendarBlockEvent } from '../../../types/domain';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onBookingClick?: (event: CalendarBookingEvent) => void;
  onSlotClick?: (time: string) => void;
  onBlockCancel?: (id: number) => void;
  onDragStart?: (event: CalendarBookingEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (bookingId: number, newStartAt: string) => void;
  isDragging?: boolean;
  draggingEvent?: CalendarBookingEvent | null;
}

const HOUR_HEIGHT_PX = 66;
const START_HOUR = 9;
const END_HOUR = 20;

export default function DayView({
  currentDate,
  events,
  onBookingClick,
  onSlotClick,
  onBlockCancel,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging = false,
  draggingEvent = null,
}: DayViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate hours array
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  // Filter events for the current day
  const currentDateStr = format(currentDate, 'yyyy-MM-dd');
  const dayEvents = events.filter((e) => {
    const eventDate = new Date(e.startAt);
    return format(eventDate, 'yyyy-MM-dd') === currentDateStr;
  });

  const bookingEvents = dayEvents.filter((e): e is CalendarBookingEvent => e.type === 'BOOKING');
  const blockEvents = dayEvents.filter((e): e is CalendarBlockEvent => e.type === 'BLOCK');

  // Calculate current time indicator position
  const getCurrentTimePosition = (): number | null => {
    const isToday = format(currentDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd');
    if (!isToday) return null;

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    if (hours < START_HOUR || hours > END_HOUR) return null;

    return (hours - START_HOUR) * HOUR_HEIGHT_PX + (minutes / 60) * HOUR_HEIGHT_PX;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Calculate position from ISO datetime
  const isoToPosition = (isoDateTime: string): number => {
    const date = new Date(isoDateTime);
    const h = date.getHours();
    const m = date.getMinutes();
    return (h - START_HOUR) * HOUR_HEIGHT_PX + (m / 60) * HOUR_HEIGHT_PX;
  };

  // Calculate height from start/end
  const getEventHeight = (startAt: string, endAt: string): number => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return (durationMinutes / 60) * HOUR_HEIGHT_PX;
  };

  // Calculate time from Y position (snapped to 30 min)
  const positionToTime = (yPosition: number): string => {
    const totalMinutes = (yPosition / HOUR_HEIGHT_PX) * 60;
    const hours = Math.floor(totalMinutes / 60) + START_HOUR;
    const minutes = Math.round((totalMinutes % 60) / 30) * 30;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Build ISO datetime from time string
  const timeToIso = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date(currentDate);
    date.setHours(h, m, 0, 0);
    // Format with Argentina timezone offset
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'-03:00'");
  };

  // Check collision with existing events
  const hasCollision = (time: string, durationMinutes: number, excludeId?: number): boolean => {
    const newStartPos = (parseInt(time.split(':')[0]) - START_HOUR) * HOUR_HEIGHT_PX +
      (parseInt(time.split(':')[1]) / 60) * HOUR_HEIGHT_PX;
    const newEndPos = newStartPos + (durationMinutes / 60) * HOUR_HEIGHT_PX;

    return dayEvents.some((event) => {
      if (excludeId && event.id === excludeId) return false;
      // Skip cancelled events
      if (event.status === 'CANCELLED') return false;

      const eventStart = isoToPosition(event.startAt);
      const eventEnd = isoToPosition(event.endAt);

      return newStartPos < eventEnd && newEndPos > eventStart;
    });
  };

  // Handle click on empty slot
  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;
    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const yPosition = e.clientY - rect.top;
    const time = positionToTime(yPosition);

    onSlotClick(time);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingEvent || !onDrop) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const yPosition = e.clientY - rect.top;
    const newTime = positionToTime(yPosition);

    // Calculate duration from original event
    const start = new Date(draggingEvent.startAt);
    const end = new Date(draggingEvent.endAt);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Check for collisions
    if (hasCollision(newTime, durationMinutes, draggingEvent.id)) {
      return; // Collision will be handled by parent with toast
    }

    const newStartAt = timeToIso(newTime);
    onDrop(draggingEvent.id, newStartAt);
  };

  const bookingCount = bookingEvents.filter(e => e.status !== 'CANCELLED').length;
  const blockCount = blockEvents.filter(e => e.status !== 'CANCELLED').length;

  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-gray-100 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
        <h3 className="font-serif font-bold text-lg capitalize text-primary">
          {format(currentDate, 'EEEE d, MMMM', { locale: es })}
        </h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            {bookingCount} turnos
          </span>
          {blockCount > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              {blockCount} bloqueos
            </span>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="flex min-h-[900px]">
          {/* Time Column */}
          <div className="w-20 border-r border-gray-200 bg-gray-50/80 flex-shrink-0 sticky left-0 z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[66px] border-b border-gray-200 text-sm font-medium text-gray-600 p-3 text-right"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Events Canvas */}
          <div
            className="flex-1 relative bg-white cursor-pointer"
            onClick={handleSlotClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Hour Grid Lines */}
            {hours.map((hour, index) => (
              <div
                key={`line-${hour}`}
                className={`h-[66px] border-b w-full absolute ${
                  index % 2 === 0 ? 'border-gray-200' : 'border-gray-100'
                }`}
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT_PX}px` }}
              >
                {/* Half-hour markers */}
                <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-100"></div>
              </div>
            ))}

            {/* Current Time Indicator */}
            {currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 shadow-lg"></div>
                  <div className="flex-1 h-0.5 bg-red-500 shadow-sm"></div>
                </div>
                <div className="absolute -top-3 left-4 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                  {format(currentTime, 'HH:mm')}
                </div>
              </div>
            )}

            {/* Block Cards */}
            {blockEvents
              .filter((e) => e.status !== 'CANCELLED')
              .map((event) => {
                const topPx = isoToPosition(event.startAt);
                const heightPx = getEventHeight(event.startAt, event.endAt);

                return (
                  <BlockCard
                    key={`block-${event.id}`}
                    event={event}
                    topPx={topPx}
                    heightPx={heightPx}
                    onCancel={onBlockCancel ? () => onBlockCancel(event.id) : undefined}
                  />
                );
              })}

            {/* Booking Cards */}
            {bookingEvents.map((event) => {
              const topPx = isoToPosition(event.startAt);
              const heightPx = getEventHeight(event.startAt, event.endAt);
              const isBeingDragged = isDragging && draggingEvent?.id === event.id;

              return (
                <BookingCard
                  key={`booking-${event.id}`}
                  event={event}
                  topPx={topPx}
                  heightPx={heightPx}
                  isDragging={isBeingDragged}
                  onClick={() => onBookingClick?.(event)}
                  onDragStart={() => onDragStart?.(event)}
                  onDragEnd={onDragEnd}
                />
              );
            })}

            {/* Drop Zone Indicator when dragging */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/5 border-2 border-dashed border-blue-400 rounded-xl pointer-events-none z-30">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Suelta para cambiar horario
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-50 border-l-4 border-emerald-500 rounded"></div>
          <span className="text-gray-600">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border-l-4 border-amber-500 rounded"></div>
          <span className="text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-500 rounded"></div>
          <span className="text-gray-600">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border-l-4 border-gray-400 rounded diagonal-stripes"></div>
          <span className="text-gray-600">Bloqueado</span>
        </div>
      </div>
    </div>
  );
}

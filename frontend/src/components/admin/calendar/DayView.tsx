import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { DollarSign, MessageCircle } from 'lucide-react';
import type { Booking, BookingStatus, PaymentStatus } from '../../../types/domain';

interface DayViewProps {
  currentDate: Date;
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
  onSlotClick?: (time: string) => void;
  onDragStart?: (booking: Booking) => void;
  onDragEnd?: () => void;
  onDrop?: (bookingId: number, newTime: string) => void;
  isDragging?: boolean;
  draggingBooking?: Booking | null;
}

const HOUR_HEIGHT_PX = 66; // Height of each hour in pixels
const START_HOUR = 8;
const END_HOUR = 20;

export default function DayView({
  currentDate,
  bookings,
  onBookingClick,
  onSlotClick,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging = false,
  draggingBooking = null
}: DayViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Generate hours array
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  // Filter bookings for the current day
  const dayBookings = bookings.filter(b => b.bookingDate === format(currentDate, 'yyyy-MM-dd'));

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

  // Get semantic color classes based on booking status
  const getBookingColorClasses = (status: BookingStatus, paymentStatus: PaymentStatus): string => {
    if (status === 'BLOCKED') {
      return 'bg-gray-100 border-l-gray-400 diagonal-stripes cursor-not-allowed';
    }

    if (status === 'CONFIRMED' || paymentStatus === 'PAID') {
      return 'bg-emerald-50 border-l-emerald-500 hover:bg-emerald-100';
    }

    if (status === 'PENDING' || paymentStatus === 'PENDING') {
      return 'bg-amber-50 border-l-amber-500 hover:bg-amber-100';
    }

    if (status === 'CANCELLED') {
      return 'bg-red-50 border-l-red-400 hover:bg-red-100 opacity-60';
    }

    return 'bg-blue-50 border-l-blue-500 hover:bg-blue-100';
  };

  // Calculate position from time
  const timeToPosition = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return (h - START_HOUR) * HOUR_HEIGHT_PX + (m / 60) * HOUR_HEIGHT_PX;
  };

  // Calculate time from Y position
  const positionToTime = (yPosition: number): string => {
    const totalMinutes = (yPosition / HOUR_HEIGHT_PX) * 60;
    const hours = Math.floor(totalMinutes / 60) + START_HOUR;
    const minutes = Math.round((totalMinutes % 60) / 30) * 30; // Snap to 30-minute intervals

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Check if a time slot has a collision with existing bookings
  const hasCollision = (time: string, duration: number, excludeId?: number): boolean => {
    const newStart = timeToPosition(time);
    const newEnd = newStart + (duration / 60) * HOUR_HEIGHT_PX;

    return dayBookings.some(booking => {
      if (excludeId && booking.id === excludeId) return false;

      const bookingStart = timeToPosition(booking.bookingTime);
      const bookingEnd = bookingStart + (booking.durationMinutes / 60) * HOUR_HEIGHT_PX;

      // Check for overlap
      return newStart < bookingEnd && newEnd > bookingStart;
    });
  };

  // Handle click on empty slot
  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;
    if (e.target !== e.currentTarget) return; // Only trigger on background clicks

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
    if (!draggingBooking || !onDrop) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const yPosition = e.clientY - rect.top;
    const newTime = positionToTime(yPosition);

    // Check for collisions
    if (hasCollision(newTime, draggingBooking.durationMinutes, draggingBooking.id)) {
      alert('No se puede mover aquí - conflicto con otra reserva');
      return;
    }

    onDrop(draggingBooking.id, newTime);
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-gray-100 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
        <h3 className="font-serif font-bold text-lg capitalize text-primary">
          {format(currentDate, 'EEEE d, MMMM', { locale: es })}
        </h3>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
          {dayBookings.length} turnos agendados
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="flex min-h-[900px]">
          {/* Time Column */}
          <div className="w-20 border-r border-gray-200 bg-gray-50/80 flex-shrink-0 sticky left-0 z-10">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-[66px] border-b border-gray-200 text-sm font-medium text-gray-600 p-3 text-right"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Bookings Canvas */}
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

            {/* Booking Cards */}
            {dayBookings.map(booking => {
              const topPx = timeToPosition(booking.bookingTime);
              const heightPx = (booking.durationMinutes / 60) * HOUR_HEIGHT_PX;
              const isBeingDragged = isDragging && draggingBooking?.id === booking.id;
              const isBlocked = booking.status === 'BLOCKED';

              return (
                <div
                  key={booking.id}
                  draggable={!isBlocked}
                  onDragStart={(e) => {
                    if (isBlocked) return;
                    e.dataTransfer.effectAllowed = 'move';
                    onDragStart?.(booking);
                  }}
                  onDragEnd={() => {
                    if (isBlocked) return;
                    onDragEnd?.();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isBlocked) {
                      onBookingClick?.(booking);
                    }
                  }}
                  className={`
                    absolute left-3 right-3 rounded-xl border-l-4 p-3
                    transition-all duration-200 shadow-md
                    ${!isBlocked ? 'cursor-move hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed'}
                    ${getBookingColorClasses(booking.status, booking.paymentStatus)}
                    ${isBeingDragged ? 'opacity-50 scale-95' : 'opacity-100'}
                  `}
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    minHeight: '50px'
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {isBlocked ? '🔒 ' : ''}{booking.customerName}
                      </p>
                      {!isBlocked && (
                        <p className="text-xs text-gray-600 truncate">
                          {booking.bookingTime.slice(0, 5)} - {booking.serviceName}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons - Only for non-blocked bookings */}
                    {!isBlocked && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {booking.paymentStatus === 'PENDING' && (
                          <div
                            className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-sm"
                            title="Pago pendiente"
                          >
                            <DollarSign size={14} className="text-white" />
                          </div>
                        )}

                        {booking.customerWhatsApp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove non-numeric characters
                              const phone = booking.customerWhatsApp.replace(/\D/g, '');
                              window.open(`https://wa.me/${phone}`, '_blank');
                            }}
                            className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-sm"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle size={14} className="text-white" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  {heightPx > 60 && (
                    <div className="mt-2">
                      <span className={`
                        text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                        ${booking.status === 'CONFIRMED' ? 'bg-emerald-200 text-emerald-800' : ''}
                        ${booking.status === 'PENDING' ? 'bg-amber-200 text-amber-800' : ''}
                        ${booking.status === 'CANCELLED' ? 'bg-red-200 text-red-800' : ''}
                        ${booking.status === 'BLOCKED' ? 'bg-gray-300 text-gray-700' : ''}
                      `}>
                        {booking.status === 'BLOCKED' ? 'BLOQUEADO' : booking.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Drop Zone Indicator when dragging */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/5 border-2 border-dashed border-blue-400 rounded-xl pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Suelta para cambiar horario
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-50 border-l-4 border-emerald-500 rounded"></div>
          <span className="text-gray-600">Confirmado/Pagado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border-l-4 border-amber-500 rounded"></div>
          <span className="text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border-l-4 border-gray-400 rounded diagonal-stripes"></div>
          <span className="text-gray-600">Bloqueado</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { toast } from 'sonner';
import DayView from './DayView';
import type { Booking } from '../../../types/domain';

interface CalendarContainerProps {
  currentDate: Date;
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
  onSlotClick?: (time: string) => void;
  onReschedule?: (bookingId: number, newDate: string, newTime: string) => Promise<void>;
}

/**
 * CalendarContainer - Wrapper component that manages drag-and-drop state
 * and orchestrates interactions between the calendar and backend API.
 *
 * Features:
 * - Manages drag-and-drop state
 * - Handles booking rescheduling with API integration
 * - Provides visual feedback during drag operations
 * - Shows toast notifications for user actions
 */
export default function CalendarContainer({
  currentDate,
  bookings,
  onBookingClick,
  onSlotClick,
  onReschedule
}: CalendarContainerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggingBooking, setDraggingBooking] = useState<Booking | null>(null);

  /**
   * Handle drag start - set dragging state
   */
  const handleDragStart = (booking: Booking) => {
    setIsDragging(true);
    setDraggingBooking(booking);
  };

  /**
   * Handle drag end - clear dragging state
   */
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggingBooking(null);
  };

  /**
   * Handle drop - reschedule booking to new time
   */
  const handleDrop = async (bookingId: number, newTime: string) => {
    if (!draggingBooking) return;

    const newDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
      // Clear drag state immediately for better UX
      setIsDragging(false);
      setDraggingBooking(null);

      // Show loading toast
      const loadingToast = toast.loading('Reagendando turno...');

      // Call the reschedule handler (which should update backend)
      if (onReschedule) {
        await onReschedule(bookingId, newDate, newTime);
      } else {
        // Mock API call for demonstration
        await mockUpdateBookingTime(bookingId, newDate, newTime);
      }

      // Success feedback
      toast.success('Turno reagendado exitosamente', {
        id: loadingToast,
        description: `Nuevo horario: ${newTime}`,
        duration: 3000
      });

      console.log(`[Calendar] Booking ${bookingId} rescheduled to ${newDate} ${newTime}`);

    } catch (error) {
      console.error('[Calendar] Error rescheduling booking:', error);

      // Error feedback
      toast.error('Error al reagendar el turno', {
        description: 'Por favor intenta nuevamente',
        duration: 4000
      });

      // Revert optimistic update (in a real app, you'd reload data)
      // For now, the parent component should handle data refresh
    }
  };

  /**
   * Handle click on empty time slot - trigger new appointment modal
   */
  const handleSlotClick = (time: string) => {
    console.log(`[Calendar] Empty slot clicked at ${time}`);

    if (onSlotClick) {
      onSlotClick(time);
    } else {
      // Show notification if no handler is provided
      toast.info(`Crear nueva cita a las ${time}`, {
        description: 'Implementa onSlotClick para abrir el modal de nueva cita',
        duration: 3000
      });
    }
  };

  /**
   * Handle booking card click - open booking details modal
   */
  const handleBookingClick = (booking: Booking) => {
    // Don't trigger click during drag
    if (isDragging) return;

    console.log(`[Calendar] Booking clicked:`, booking);

    if (onBookingClick) {
      onBookingClick(booking);
    } else {
      // Show notification if no handler is provided
      toast.info(`Ver detalles: ${booking.customerName}`, {
        description: `Servicio: ${booking.serviceName}`,
        duration: 3000
      });
    }
  };

  return (
    <div className="relative">
      <DayView
        currentDate={currentDate}
        bookings={bookings}
        onBookingClick={handleBookingClick}
        onSlotClick={handleSlotClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        isDragging={isDragging}
        draggingBooking={draggingBooking}
      />

      {/* Keyboard Shortcuts Help (Optional) */}
      {isDragging && (
        <div className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-50">
          <p className="text-xs text-gray-600">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-[10px] mr-1">ESC</kbd>
            Cancelar
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Mock API function for updating booking time
 * In production, replace this with actual API call
 */
async function mockUpdateBookingTime(
  bookingId: number,
  date: string,
  time: string
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate occasional errors for testing
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }

  console.log(`[Mock API] Updated booking ${bookingId} to ${date} ${time}`);

  // In production, replace with:
  // await adminApi.bookings.updateTime(bookingId, { date, time });
}

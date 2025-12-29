import { useState } from 'react';
import { toast } from 'sonner';
import DayView from './DayView';
import type { CalendarEvent, CalendarBookingEvent } from '../../../types/domain';

interface CalendarContainerProps {
  currentDate: Date;
  events: CalendarEvent[];
  onBookingClick?: (event: CalendarBookingEvent) => void;
  onSlotClick?: (time: string) => void;
  onBlockCancel?: (id: number) => Promise<void>;
  onReschedule?: (bookingId: number, newStartAt: string) => Promise<void>;
}

/**
 * CalendarContainer - Wrapper component that manages drag-and-drop state
 * and orchestrates interactions between the calendar and backend API.
 */
export default function CalendarContainer({
  currentDate,
  events,
  onBookingClick,
  onSlotClick,
  onBlockCancel,
  onReschedule,
}: CalendarContainerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggingEvent, setDraggingEvent] = useState<CalendarBookingEvent | null>(null);

  const handleDragStart = (event: CalendarBookingEvent) => {
    setIsDragging(true);
    setDraggingEvent(event);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggingEvent(null);
  };

  const handleDrop = async (bookingId: number, newStartAt: string) => {
    if (!draggingEvent) return;

    try {
      setIsDragging(false);
      setDraggingEvent(null);

      const loadingToast = toast.loading('Reagendando turno...');

      if (onReschedule) {
        await onReschedule(bookingId, newStartAt);
      }

      toast.success('Turno reagendado exitosamente', {
        id: loadingToast,
        duration: 3000,
      });
    } catch (error: unknown) {
      console.error('[Calendar] Error rescheduling:', error);

      // Check if it's a 409 conflict
      if (error instanceof Error && error.message.includes('409')) {
        toast.error('El horario esta ocupado', {
          description: 'Selecciona otro horario disponible',
          duration: 4000,
        });
      } else {
        toast.error('Error al reagendar el turno', {
          description: 'Por favor intenta nuevamente',
          duration: 4000,
        });
      }
    }
  };

  const handleSlotClick = (time: string) => {
    if (onSlotClick) {
      onSlotClick(time);
    }
  };

  const handleBookingClick = (event: CalendarBookingEvent) => {
    if (isDragging) return;

    if (onBookingClick) {
      onBookingClick(event);
    }
  };

  const handleBlockCancel = async (id: number) => {
    if (!onBlockCancel) return;

    const confirmed = window.confirm('¿Cancelar este bloqueo?');
    if (!confirmed) return;

    try {
      const loadingToast = toast.loading('Cancelando bloqueo...');
      await onBlockCancel(id);
      toast.success('Bloqueo cancelado', { id: loadingToast });
    } catch (error) {
      console.error('[Calendar] Error canceling block:', error);
      toast.error('Error al cancelar el bloqueo');
    }
  };

  return (
    <div className="relative">
      <DayView
        currentDate={currentDate}
        events={events}
        onBookingClick={handleBookingClick}
        onSlotClick={handleSlotClick}
        onBlockCancel={handleBlockCancel}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        isDragging={isDragging}
        draggingEvent={draggingEvent}
      />

      {/* Keyboard Shortcuts Help */}
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

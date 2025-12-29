import { DollarSign } from 'lucide-react';
import type { CalendarBookingEvent, PaymentStatus, BookingStatus } from '../../../types/domain';

interface BookingCardProps {
  event: CalendarBookingEvent;
  topPx: number;
  heightPx: number;
  isDragging?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const getStatusColorClasses = (status: BookingStatus, paymentStatus: PaymentStatus): string => {
  if (status === 'CONFIRMED' || paymentStatus === 'PAID') {
    return 'bg-emerald-50 border-l-emerald-500 hover:bg-emerald-100';
  }
  if (status === 'PENDING' || paymentStatus === 'PENDING') {
    return 'bg-amber-50 border-l-amber-500 hover:bg-amber-100';
  }
  if (status === 'CANCELLED') {
    return 'bg-red-50 border-l-red-400 hover:bg-red-100 opacity-60';
  }
  if (status === 'COMPLETED') {
    return 'bg-blue-50 border-l-blue-500 hover:bg-blue-100';
  }
  return 'bg-gray-50 border-l-gray-500 hover:bg-gray-100';
};

const getStatusLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Completado',
  };
  return labels[status] || status;
};

const getStatusBadgeClasses = (status: BookingStatus): string => {
  const classes: Record<BookingStatus, string> = {
    PENDING: 'bg-amber-200 text-amber-800',
    CONFIRMED: 'bg-emerald-200 text-emerald-800',
    CANCELLED: 'bg-red-200 text-red-800',
    COMPLETED: 'bg-blue-200 text-blue-800',
  };
  return classes[status] || 'bg-gray-200 text-gray-800';
};

export default function BookingCard({
  event,
  topPx,
  heightPx,
  isDragging = false,
  onClick,
  onDragStart,
  onDragEnd,
}: BookingCardProps) {
  const startTime = new Date(event.startAt).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const endTime = new Date(event.endAt).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const isCancelled = event.status === 'CANCELLED';

  return (
    <div
      draggable={!isCancelled}
      onDragStart={(e) => {
        if (isCancelled) return;
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.();
      }}
      onDragEnd={() => {
        if (isCancelled) return;
        onDragEnd?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`
        absolute left-3 right-3 rounded-xl border-l-4 p-3
        transition-all duration-200 shadow-md z-10
        ${!isCancelled ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01]' : 'cursor-default'}
        ${getStatusColorClasses(event.status, event.paymentStatus)}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
      `}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        minHeight: '50px',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            {event.customerName}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {startTime} - {endTime} · {event.serviceName}
          </p>
        </div>

        {/* Payment Badge */}
        {event.paymentStatus === 'PENDING' && (
          <div
            className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-sm flex-shrink-0"
            title="Pago pendiente"
          >
            <DollarSign size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Status Badge - Only if tall enough */}
      {heightPx > 60 && (
        <div className="mt-1">
          <span
            className={`
              text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
              ${getStatusBadgeClasses(event.status)}
            `}
          >
            {getStatusLabel(event.status)}
          </span>
        </div>
      )}
    </div>
  );
}

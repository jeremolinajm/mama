import { X } from 'lucide-react';
import type { CalendarBlockEvent } from '../../../types/domain';

interface BlockCardProps {
  event: CalendarBlockEvent;
  topPx: number;
  heightPx: number;
  onCancel?: () => void;
}

export default function BlockCard({
  event,
  topPx,
  heightPx,
  onCancel,
}: BlockCardProps) {
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

  return (
    <div
      className={`
        absolute left-3 right-3 rounded-xl border-l-4 p-3
        bg-gray-100 border-l-gray-400 diagonal-stripes
        cursor-default shadow-md z-10
      `}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        minHeight: '50px',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-700 truncate flex items-center gap-1">
            <span>Bloqueado</span>
          </p>
          <p className="text-xs text-gray-500 truncate">
            {startTime} - {endTime}
          </p>
          {event.reason && heightPx > 60 && (
            <p className="text-xs text-gray-600 mt-1 truncate italic">
              {event.reason}
            </p>
          )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-sm transition-colors flex-shrink-0"
            title="Cancelar bloqueo"
          >
            <X size={14} className="text-white" />
          </button>
        )}
      </div>

      {/* Status Badge */}
      {heightPx > 60 && (
        <div className="mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-gray-300 text-gray-700">
            Bloqueado
          </span>
        </div>
      )}
    </div>
  );
}

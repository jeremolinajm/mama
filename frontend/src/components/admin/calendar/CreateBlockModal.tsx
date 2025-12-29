import { useState } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { format, addMinutes, parseISO, setHours, setMinutes } from 'date-fns';

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (block: { startAt: string; endAt: string; reason: string }) => Promise<void>;
  initialDate?: Date;
  initialTime?: string;
}

const SLOT_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hora', minutes: 60 },
  { label: '2 horas', minutes: 120 },
  { label: '4 horas', minutes: 240 },
  { label: 'Todo el dia', minutes: 660 }, // 11 hours (09:00-20:00)
];

export default function CreateBlockModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate = new Date(),
  initialTime = '09:00',
}: CreateBlockModalProps) {
  const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(initialTime);
  const [duration, setDuration] = useState(60);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Generate time slots (09:00 - 20:00 every 30 min)
  const timeSlots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 20) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Build ISO datetime strings
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = setMinutes(setHours(parseISO(date), hours), minutes);
      const endDate = addMinutes(startDate, duration);

      // Format as ISO with timezone offset (Argentina: -03:00)
      const startAt = format(startDate, "yyyy-MM-dd'T'HH:mm:ss'-03:00'");
      const endAt = format(endDate, "yyyy-MM-dd'T'HH:mm:ss'-03:00'");

      await onSubmit({
        startAt,
        endAt,
        reason: reason || 'Bloqueado',
      });

      // Reset and close
      setReason('');
      setDuration(60);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('409')) {
        setError('El horario seleccionado ya esta ocupado');
      } else {
        setError('Error al crear el bloqueo');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-serif font-bold text-lg text-primary">Bloquear Horario</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Clock size={16} />
              Hora de inicio
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
              required
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duracion
            </label>
            <div className="flex flex-wrap gap-2">
              {SLOT_OPTIONS.map((option) => (
                <button
                  key={option.minutes}
                  type="button"
                  onClick={() => setDuration(option.minutes)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${duration === option.minutes
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={16} />
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Almuerzo, Reunion, Feriado..."
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Bloqueando...' : 'Bloquear Horario'}
          </button>
        </form>
      </div>
    </div>
  );
}

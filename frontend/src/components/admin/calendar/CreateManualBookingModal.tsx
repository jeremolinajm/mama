import { useState, useEffect, useMemo } from 'react';
import { X, User, Phone, Mail, FileText, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { serviciosApi } from '../../../api/servicios';
import { turnosApi } from '../../../api/turnos';
import { type WeeklySchedule, getDayHours, isDayEnabled } from '../../../api/config';
import type { Service, CreateBookingRequest } from '../../../types/domain';

interface CreateManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date;
  initialTime?: string;
  schedule?: WeeklySchedule | null;
}

export default function CreateManualBookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate = new Date(),
  initialTime = '09:00',
  schedule = null,
}: CreateManualBookingModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [time, setTime] = useState(initialTime);

  // Get day hours from schedule for the selected date
  const selectedDate = useMemo(() => {
    try {
      return parseISO(date);
    } catch {
      return new Date();
    }
  }, [date]);

  const dayHours = useMemo(() => {
    if (!schedule) return { startTime: '09:00', endTime: '19:00' };
    return getDayHours(selectedDate, schedule) || { startTime: '09:00', endTime: '19:00' };
  }, [selectedDate, schedule]);

  const selectedDayEnabled = useMemo(() => {
    if (!schedule) return true;
    return isDayEnabled(selectedDate, schedule);
  }, [selectedDate, schedule]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerComments, setCustomerComments] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadServices();
      // Reset form with initial values
      setDate(format(initialDate, 'yyyy-MM-dd'));
      setTime(initialTime);
    }
  }, [isOpen, initialDate, initialTime]);

  const loadServices = async () => {
    try {
      const data = await serviciosApi.getAll();
      setServices(data.filter((s) => s.isActive));
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Generate time slots dynamically based on schedule
  const startHour = parseInt(dayHours.startTime.split(':')[0]);
  const endHour = parseInt(dayHours.endTime.split(':')[0]);
  const timeSlots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < endHour) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setError('');
    setSubmitting(true);

    try {
      const request: CreateBookingRequest = {
        serviceId: selectedService.id,
        customerName,
        customerEmail: customerEmail || 'manual@reserva.local',
        customerWhatsapp: customerPhone,
        customerComments: customerComments || null,
        bookingDate: date,
        bookingTime: time,
        durationMinutes: selectedService.durationMinutes,
        amount: selectedService.offerPrice || selectedService.price,
      };

      await turnosApi.create(request);

      // Reset form
      setSelectedServiceId(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerComments('');

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('409')) {
        setError('El horario seleccionado ya esta ocupado');
      } else {
        setError('Error al crear el turno. Verifica que el horario este disponible.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <h2 className="font-serif font-bold text-lg text-primary">Nuevo Turno Manual</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Service Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText size={16} />
              Servicio
            </label>
            {loading ? (
              <div className="text-gray-500 text-sm">Cargando servicios...</div>
            ) : (
              <select
                value={selectedServiceId || ''}
                onChange={(e) => setSelectedServiceId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
                required
              >
                <option value="">Seleccionar servicio...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min - ${s.offerPrice || s.price})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar size={16} />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock size={16} />
                Hora
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
                required
                disabled={!selectedDayEnabled}
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day not enabled warning */}
          {!selectedDayEnabled && (
            <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl text-sm">
              El día seleccionado no está habilitado en la configuración de horarios.
            </div>
          )}

          {/* Service Info */}
          {selectedService && (
            <div className="bg-accent/5 rounded-xl p-3 text-sm">
              <p className="font-medium text-accent">
                {selectedService.name}
              </p>
              <p className="text-gray-600">
                Duracion: {selectedService.durationMinutes} min ·
                Precio: ${selectedService.offerPrice || selectedService.price}
              </p>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <User size={16} />
              Datos del Cliente
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone size={14} />
                WhatsApp *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej: 1123456789"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={14} />
                Email (opcional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios (opcional)
              </label>
              <textarea
                value={customerComments}
                onChange={(e) => setCustomerComments(e.target.value)}
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-accent focus:border-accent resize-none"
              />
            </div>
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
            disabled={submitting || !selectedServiceId || !selectedDayEnabled}
            className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creando...' : 'Crear Turno'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            El turno se creara como PENDIENTE. Podras confirmarlo desde el panel.
          </p>
        </form>
      </div>
    </div>
  );
}

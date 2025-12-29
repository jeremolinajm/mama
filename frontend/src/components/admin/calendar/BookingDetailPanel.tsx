import { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  ChevronRight,
  Check,
  Edit2,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { adminApi } from '../../../api/admin';
import { toast } from 'sonner';
import type {
  CalendarBookingEvent,
  BookingStatus,
  BookingHistoryEntry,
  HistoryEventType,
} from '../../../types/domain';

interface BookingDetailPanelProps {
  event: CalendarBookingEvent;
  onClose: () => void;
  onStatusChange: (id: number, status: BookingStatus) => Promise<void>;
  onReschedule: (id: number) => void;
  onCustomerUpdate: (id: number, customer: {
    name: string;
    email: string;
    whatsapp: string;
    comments: string | null;
  }) => Promise<void>;
}

const statusOptions: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  { value: 'CONFIRMED', label: 'Confirmado', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'COMPLETED', label: 'Completado', color: 'bg-blue-100 text-blue-800' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

const getEventTypeLabel = (type: HistoryEventType): string => {
  const labels: Record<HistoryEventType, string> = {
    CREATED: 'Creado',
    STATUS_CHANGED: 'Estado cambiado',
    RESCHEDULED: 'Reprogramado',
    CUSTOMER_UPDATED: 'Cliente actualizado',
    PAYMENT_UPDATED: 'Pago actualizado',
  };
  return labels[type] || type;
};

export default function BookingDetailPanel({
  event,
  onClose,
  onStatusChange,
  onReschedule,
  onCustomerUpdate,
}: BookingDetailPanelProps) {
  const [history, setHistory] = useState<BookingHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: event.customerName,
    email: '',
    whatsapp: '',
    comments: '' as string | null,
  });
  const [saving, setSaving] = useState(false);

  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);

  useEffect(() => {
    loadHistory();
  }, [event.id]);

  const loadHistory = async () => {
    try {
      const data = await adminApi.bookings.getHistory(event.id);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCopyWhatsApp = () => {
    // This would need the full booking data - for now we'll show a placeholder
    navigator.clipboard.writeText('WhatsApp copiado');
    toast.success('WhatsApp copiado al portapapeles');
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${event.customerName}, te confirmo tu turno para ${event.serviceName} ` +
      `el ${format(startDate, "EEEE d 'de' MMMM", { locale: es })} a las ${format(startDate, 'HH:mm')}. ` +
      `Te esperamos! - Flavia Dermobeauty`
    );
    // This would need the actual phone number from full booking data
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `Turno confirmado
Servicio: ${event.serviceName}
Fecha: ${format(startDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })} a las ${format(startDate, 'HH:mm')}
Cliente: ${event.customerName}`;
    navigator.clipboard.writeText(summary);
    toast.success('Resumen copiado al portapapeles');
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (newStatus === event.status) return;
    try {
      await onStatusChange(event.id, newStatus);
      toast.success(`Estado cambiado a ${statusOptions.find(s => s.value === newStatus)?.label}`);
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleSaveCustomer = async () => {
    setSaving(true);
    try {
      await onCustomerUpdate(event.id, customerForm);
      setIsEditingCustomer(false);
      toast.success('Cliente actualizado');
    } catch {
      toast.error('Error al actualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="font-serif font-bold text-lg text-primary">Detalle del Turno</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Service & Time */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{event.serviceName}</p>
              <p className="text-sm text-gray-500">#{event.bookingNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 capitalize">
                {format(startDate, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Clock size={14} />
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={16} />
              Cliente
            </h3>
            <button
              onClick={() => setIsEditingCustomer(!isEditingCustomer)}
              className="text-accent hover:text-accent-dark text-sm flex items-center gap-1"
            >
              <Edit2 size={14} />
              Editar
            </button>
          </div>

          {isEditingCustomer ? (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
              />
              <input
                type="tel"
                placeholder="WhatsApp"
                value={customerForm.whatsapp}
                onChange={(e) => setCustomerForm({ ...customerForm, whatsapp: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm"
              />
              <textarea
                placeholder="Comentarios"
                value={customerForm.comments || ''}
                onChange={(e) => setCustomerForm({ ...customerForm, comments: e.target.value || null })}
                className="w-full border rounded-lg p-2 text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCustomer}
                  disabled={saving}
                  className="flex-1 bg-accent text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => setIsEditingCustomer(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-900">{event.customerName}</p>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Estado</h3>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`
                  px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${event.status === option.value
                    ? `${option.color} ring-2 ring-offset-2 ring-gray-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {event.status === option.value && <Check size={14} className="inline mr-1" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <DollarSign size={16} />
            Pago
          </h3>
          <div className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
            ${event.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : ''}
            ${event.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
            ${event.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {event.paymentStatus === 'PAID' && 'Pagado'}
            {event.paymentStatus === 'PENDING' && 'Pendiente'}
            {event.paymentStatus === 'FAILED' && 'Fallido'}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Acciones Rapidas</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onReschedule(event.id)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Calendar size={16} />
              Reprogramar
            </button>
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Copy size={16} />
              Copiar Tel
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <FileText size={16} />
              Copiar Info
            </button>
          </div>
        </div>

        {/* History */}
        <div className="space-y-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-gray-900 font-bold"
          >
            <span className="flex items-center gap-2">
              <History size={16} />
              Historial
            </span>
            <ChevronRight
              size={16}
              className={`transition-transform ${showHistory ? 'rotate-90' : ''}`}
            />
          </button>

          {showHistory && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto">
              {loadingHistory ? (
                <p className="text-sm text-gray-500 text-center">Cargando...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">Sin historial</p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">
                        {getEventTypeLabel(entry.eventType)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {format(new Date(entry.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                        {' · '}
                        {entry.actor === 'ADMIN' ? 'Admin' : entry.actor === 'SYSTEM' ? 'Sistema' : 'Cliente'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

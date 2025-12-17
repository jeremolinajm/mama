import { useState, useEffect } from 'react';
import { turnosApi } from '../../api/turnos';
import { serviciosApi } from '../../api/servicios'; // Importamos api de servicios
import DateTimePicker from './DateTimePicker';
import CustomerForm from './CustomerForm';
import type { CreateBookingRequest, Service } from '../../types/domain';
import { resolveImageUrl } from '../../utils/imageUtils';

interface TurnoFlowProps {
  service?: Service | null; // Ahora es opcional
}

export default function TurnoFlow({ service: initialService }: TurnoFlowProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || null);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  
  // Si no hay servicio inicial, empezamos en paso 0 (Selección), si hay, en paso 1 (Fecha)
  const [step, setStep] = useState(initialService ? 1 : 0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerComments, setCustomerComments] = useState('');

  // Cargar servicios si no viene uno pre-seleccionado
  useEffect(() => {
    if (!initialService) {
      const fetchServices = async () => {
        try {
          const data = await serviciosApi.getAll();
          setServicesList(data.filter(s => s.isActive));
        } catch (err) {
          console.error(err);
          setError('No se pudieron cargar los servicios.');
        }
      };
      fetchServices();
    }
  }, [initialService]);

  const handleSelectService = (s: Service) => {
    setSelectedService(s);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && bookingDate && bookingTime) {
      setStep(2);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setError(null);
    setLoading(true);

    try {
      const bookingRequest: CreateBookingRequest = {
        serviceId: selectedService.id,
        customerName,
        customerEmail,
        customerWhatsapp,
        customerComments: customerComments || null,
        bookingDate,
        bookingTime,
        durationMinutes: selectedService.durationMinutes, 
        amount: selectedService.price, 
      };

      const booking = await turnosApi.create(bookingRequest);
      const paymentPreference = await turnosApi.createPaymentPreference(booking.id);
      window.location.href = paymentPreference.initPoint;
      
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la reserva';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
      
      {/* COLUMNA IZQUIERDA: Resumen (Solo aparece si ya elegimos servicio) */}
      {selectedService && (
        <div className="lg:col-span-4 lg:sticky lg:top-24 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-50 overflow-hidden">
             {/* Botón cambiar servicio si estamos en el flujo genérico */}
             {!initialService && step > 0 && (
              <button 
                onClick={() => { setStep(0); setSelectedService(null); }}
                className="text-xs text-accent font-bold uppercase tracking-wider mb-4 hover:underline"
              >
                ← Cambiar Servicio
              </button>
            )}

            <div className="relative h-48 -mx-6 -mt-6 mb-6">
              <img
                src={resolveImageUrl(selectedService.imageUrl) || '/placeholder-service.jpg'}
                alt={selectedService.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300/F9F7F5/E5989B?text=Servicio')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                 <span className="text-white font-bold text-lg">${selectedService.price}</span>
              </div>
            </div>
            
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">{selectedService.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="bg-gray-100 px-2 py-1 rounded-md">⏱ {selectedService.durationMinutes} min</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {selectedService.shortDescription || selectedService.description}
            </p>
          </div>
        </div>
      )}

      {/* COLUMNA DERECHA: Wizard */}
      <div className={`${selectedService ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
        <div className="bg-white rounded-3xl shadow-soft p-8 border border-gray-50">
          
          {/* PASO 0: SELECCIÓN DE SERVICIO */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h1 className="font-serif text-3xl font-bold text-primary mb-2 text-center">Reservar Turno</h1>
              <p className="text-gray-500 text-center mb-8">Seleccioná el tratamiento que deseas realizar.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {servicesList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectService(s)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-accent hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                      <img src={resolveImageUrl(s.imageUrl) || ''} alt="" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-primary group-hover:text-accent transition-colors">{s.name}</h3>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span>${s.price}</span>
                        <span>•</span>
                        <span>{s.durationMinutes} min</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASOS 1 y 2 (Igual que antes) */}
          {step > 0 && (
            <>
              {/* Indicador de Pasos */}
              <div className="flex items-center justify-between mb-8 text-sm font-medium">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-accent' : 'text-gray-300'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-accent bg-accent text-white' : 'border-gray-200'}`}>1</span>
                  <span>Fecha</span>
                </div>
                <div className={`h-px bg-gray-200 flex-1 mx-4`}></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-accent' : 'text-gray-300'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-accent bg-accent text-white' : 'border-gray-200'}`}>2</span>
                  <span>Datos</span>
                </div>
              </div>

              <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
                {step === 1 && (
                  <div className="animate-fade-in">
                    <h3 className="font-serif text-xl font-bold text-primary mb-6">Agenda tu cita</h3>
                    <DateTimePicker
                      serviceId={selectedService!.id}
                      date={bookingDate}
                      time={bookingTime}
                      onDateChange={setBookingDate}
                      onTimeChange={setBookingTime}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in">
                    <h3 className="font-serif text-xl font-bold text-primary mb-6">Tus datos</h3>
                    <CustomerForm
                      name={customerName}
                      email={customerEmail}
                      whatsapp={customerWhatsapp}
                      comments={customerComments}
                      onNameChange={setCustomerName}
                      onEmailChange={setCustomerEmail}
                      onWhatsappChange={setCustomerWhatsapp}
                      onCommentsChange={setCustomerComments}
                    />
                  </div>
                )}

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-500 text-sm border border-red-100">{error}</div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    type="button"
                    onClick={() => step === 1 ? (initialService ? null : setStep(0)) : setStep(1)}
                    className={`px-6 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 transition-colors ${step === 1 && initialService ? 'hidden' : ''}`}
                  >
                    Volver
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || (step === 1 && (!bookingDate || !bookingTime))}
                    className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-accent transition-all shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : step === 1 ? 'Continuar' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
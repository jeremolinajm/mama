import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { serviciosApi } from '../api/servicios';
import TurnoFlow from '../components/booking/TurnoFlow';
import type { Service } from '../types/domain';

export default function ReservarTurnoPage() {
  const { serviceSlug } = useParams<{ serviceSlug?: string }>(); // Opcional ahora
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(!!serviceSlug); // Solo carga si hay slug

  useEffect(() => {
    if (serviceSlug) {
      const loadService = async () => {
        try {
          setLoading(true);
          const services = await serviciosApi.getAll();
          const foundService = services.find((s) => s.slug === serviceSlug);
          if (foundService) setService(foundService);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadService();
    }
  }, [serviceSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-accent font-serif text-xl">Cargando agenda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Pasamos el servicio (puede ser null si es reserva genérica) */}
        <TurnoFlow service={service} />
      </div>
    </div>
  );
}
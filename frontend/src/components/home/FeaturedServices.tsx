import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviciosApi } from '../../api/servicios';
import type { Service } from '../../types/domain';

export default function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviciosApi.getFeatured();
        setServices(data.slice(0, 3));
      } catch (error) {
        console.error('Error loading featured services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) return null; // O un esqueleto de carga simple
  if (services.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl font-bold text-primary mb-4">
            Tratamientos Destacados
          </h2>
          <p className="text-gray-500">
            Procedimientos no invasivos seleccionados específicamente para las necesidades de tu piel.
          </p>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative bg-background rounded-3xl overflow-hidden hover:shadow-soft transition-all duration-300 flex flex-col"
            >
              {/* Imagen */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.imageUrl || 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                  {service.durationMinutes} min
                </div>
              </div>

              {/* Contenido */}
              <div className="p-8 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="font-sans text-2xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {service.shortDescription || service.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-sans font-bold text-xl text-primary">
                    ${service.price}
                  </span>
                  
                  <Link
                    to={`/servicios/${service.slug}/reservar`}
                    className="text-sm font-semibold text-primary border-b-2 border-accent/30 hover:border-accent transition-colors pb-0.5"
                  >
                    Agendar Cita
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/servicios"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
          >
            Ver todos los tratamientos
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
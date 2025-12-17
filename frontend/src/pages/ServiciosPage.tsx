import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviciosApi } from '../api/servicios';
import { categoriasApi } from '../api/categorias';
import type { Service, Category } from '../types/domain';
import { CategoryType } from '../types/domain';

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, categoriesData] = await Promise.all([
          serviciosApi.getAll(),
          categoriasApi.getByType(CategoryType.SERVICE),
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err) {
        setError('No pudimos cargar los servicios. Por favor intentá nuevamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredServices = selectedFilter === 'All'
    ? services
    : services.filter((s) => s.categoryName === selectedFilter);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-accent font-serif text-xl">Cargando experiencias...</div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400 bg-background">{error}</div>;

  return (
    <div className="min-h-screen bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-5xl font-bold text-primary mb-6">
            Menú de Tratamientos
          </h1>
          <p className="text-gray-500 text-lg font-sans leading-relaxed">
            Protocolos exclusivos diseñados para la salud y belleza de tu piel.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button
            onClick={() => setSelectedFilter('All')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedFilter === 'All'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-500 hover:text-accent border border-gray-100'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.name)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedFilter === cat.name
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-500 hover:text-accent border border-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid de Servicios */}
        <div className="grid gap-6 max-w-5xl mx-auto">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-soft transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch"
            >
              {/* Imagen */}
              <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-auto rounded-2xl overflow-hidden relative">
                <img
                  src={service.imageUrl || '/placeholder-service.jpg'}
                  alt={service.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/F9F7F5/E5989B?text=Servicio')}
                />
              </div>

              {/* Info */}
              <div className="flex-1 py-2 md:py-4 flex flex-col text-center md:text-left">
                <div className="mb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className="font-sans text-2xl font-bold text-primary group-hover:text-accent transition-colors">
                      {service.name}
                    </h3>
                    <span className="text-xl font-bold text-primary font-sans">
                      ${service.price}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1 bg-background px-3 py-1 rounded-full">
                      ⏱ {service.durationMinutes} min
                    </span>
                    {service.categoryName && (
                      <span className="bg-background px-3 py-1 rounded-full uppercase text-xs font-bold tracking-wider">
                        {service.categoryName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 md:pt-0">
                  <Link
                    to={`/servicios/${service.slug}/reservar`}
                    className="inline-block w-full md:w-auto bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-primary transition-colors duration-300 text-center shadow-lg shadow-accent/20"
                  >
                    Agendar Cita
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
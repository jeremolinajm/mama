import { Link } from 'react-router-dom';
import type { Service } from '../../types/domain';
import { resolveImageUrl } from '../../utils/imageUtils';

/**
 * Service card component
 * Displays service info with link to booking
 */

interface ServicioCardProps {
  service: Service;
}

export default function ServicioCard({ service }: ServicioCardProps) {
  const imageUrl = resolveImageUrl(service.imageUrl) || '/placeholder-service.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={imageUrl}
        alt={service.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-service.jpg';
        }}
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {service.shortDescription || service.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">${service.price}</span>
            <span className="text-gray-500 text-sm ml-2">· {service.durationMinutes} min</span>
          </div>
        </div>
        <Link
          to={`/servicios/${service.slug}/reservar`}
          className="mt-4 block w-full bg-primary text-white text-center py-2 rounded-lg hover:bg-primary-dark transition"
        >
          Reservar Turno
        </Link>
      </div>
    </div>
  );
}

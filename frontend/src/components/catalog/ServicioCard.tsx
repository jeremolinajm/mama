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
      <div className="relative">
        {service.isOffer && service.offerPrice && (
          <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-sm tracking-wider">
            OFERTA
          </span>
        )}
        <img
          src={imageUrl}
          alt={service.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-service.jpg';
          }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {service.shortDescription || service.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2 flex-wrap">
            {service.isOffer && service.offerPrice ? (
              <>
                <span className="text-2xl font-bold text-accent">${service.offerPrice}</span>
                <span className="text-base text-gray-400 line-through">${service.price}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">${service.price}</span>
            )}
            <span className="text-gray-500 text-sm">· {service.durationMinutes} min</span>
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

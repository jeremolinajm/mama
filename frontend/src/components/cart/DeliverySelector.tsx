import { DeliveryType } from '../../types/domain';

/**
 * Delivery type selector
 * Radio buttons for PICKUP or HOME_DELIVERY with address fields
 */

interface DeliverySelectorProps {
  deliveryType: string;
  onDeliveryTypeChange: (type: string) => void;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  onAddressChange: (field: string, value: string) => void;
  deliveryCost: number;
}

export default function DeliverySelector({
  deliveryType,
  onDeliveryTypeChange,
  address,
  city,
  province,
  postalCode,
  onAddressChange,
  deliveryCost,
}: DeliverySelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Tipo de Entrega</h3>

      {/* Pickup Option */}
      <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="deliveryType"
          value={DeliveryType.PICKUP}
          checked={deliveryType === DeliveryType.PICKUP}
          onChange={(e) => onDeliveryTypeChange(e.target.value)}
          className="mt-1"
        />
        <div className="flex-grow">
          <div className="font-semibold text-gray-800">Retiro en local</div>
          <div className="text-sm text-gray-600 mt-1">
            Retirá tu pedido personalmente. Gratis.
          </div>
        </div>
      </label>

      {/* Home Delivery Option */}
      <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="deliveryType"
          value={DeliveryType.HOME_DELIVERY}
          checked={deliveryType === DeliveryType.HOME_DELIVERY}
          onChange={(e) => onDeliveryTypeChange(e.target.value)}
          className="mt-1"
        />
        <div className="flex-grow">
          <div className="font-semibold text-gray-800">Envío a domicilio</div>
          <div className="text-sm text-gray-600 mt-1">
            Recibí tu pedido en tu casa. Costo: ${deliveryCost}
          </div>
        </div>
      </label>

      {/* Address Fields (shown only for HOME_DELIVERY) */}
      {deliveryType === DeliveryType.HOME_DELIVERY && (
        <div className="pl-8 space-y-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => onAddressChange('address', e.target.value)}
              placeholder="Calle y número"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => onAddressChange('city', e.target.value)}
                placeholder="Ciudad"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincia *
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => onAddressChange('province', e.target.value)}
                placeholder="Provincia"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal *
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => onAddressChange('postalCode', e.target.value)}
              placeholder="Código postal"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}

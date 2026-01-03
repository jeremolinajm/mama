import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { pedidosApi } from '../api/pedidos';
import { DeliveryType } from '../types/domain';
import type { CreateOrderRequest } from '../types/domain';
import { resolveImageUrl } from '../utils/imageUtils';

export default function CarritoPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    comments: ''
  });

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('PICKUP');

  const total = subtotal; // El envío se define manualmente después del pago

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validación básica manual
    if (deliveryType === 'HOME_DELIVERY' && (!formData.address || !formData.city)) {
      alert("Por favor completa la dirección de envío");
      return;
    }

    setLoading(true);

    try {
      // 1. Preparar Payload
      const orderRequest: CreateOrderRequest = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerWhatsapp: formData.whatsapp,
        customerComments: formData.comments || null,
        deliveryType: deliveryType,
        deliveryAddress: deliveryType === 'HOME_DELIVERY' ? formData.address : null,
        deliveryCity: deliveryType === 'HOME_DELIVERY' ? formData.city : null,
        deliveryProvince: deliveryType === 'HOME_DELIVERY' ? formData.province : null,
        deliveryPostalCode: deliveryType === 'HOME_DELIVERY' ? formData.postalCode : null,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      // 2. Crear Orden en Backend
      const order = await pedidosApi.create(orderRequest);

      // 3. Crear Preferencia de Pago MP
      const preference = await pedidosApi.createPaymentPreference(order.id);

      // 4. Limpiar y Redirigir
      clearCart();
      window.location.href = preference.initPoint;

    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar tu pedido. Intenta nuevamente.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl text-center max-w-md shadow-soft">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-primary mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">Descubrí nuestros productos y empezá a cuidar tu piel hoy.</p>
          <Link to="/productos" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-accent transition-colors">
            Ir a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-4xl font-bold text-primary mb-12 text-center">Finalizar Compra</h1>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: ITEMS */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-6">Tu Pedido</h3>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={resolveImageUrl(item.product.imageUrl) || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100')}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-sans font-medium text-primary">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.product.isOffer && item.product.offerPrice ? (
                          <>
                            <span className="text-accent font-medium">${item.product.offerPrice}</span>
                            <span className="line-through ml-1">${item.product.price}</span>
                          </>
                        ) : (
                          <span>${item.product.price}</span>
                        )}
                        {' '}x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-500 hover:text-primary"
                        >-</button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-3 py-1 text-gray-500 hover:text-primary disabled:opacity-30"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-300 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: DATOS + CHECKOUT */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-soft space-y-6">
              <h3 className="font-serif text-xl font-bold mb-4">Datos de Contacto</h3>
              
              <div className="space-y-4">
                <input
                  type="text" name="name" placeholder="Nombre completo" required
                  value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email" name="email" placeholder="Email" required
                    value={formData.email} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                  <input
                    type="tel" name="whatsapp" placeholder="WhatsApp (Ej: 1155556666)" required
                    value={formData.whatsapp} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>

              {/* TIPO ENTREGA */}
              <div className="pt-4">
                <h4 className="font-medium text-primary mb-3">Método de Entrega</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('PICKUP')}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      deliveryType === 'PICKUP' ? 'border-accent bg-accent/5 text-accent' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    Retiro en Local
                    <span className="block text-xs font-normal mt-1">Gratis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('HOME_DELIVERY')}
                    className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      deliveryType === 'HOME_DELIVERY' ? 'border-accent bg-accent/5 text-accent' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    Envío a Domicilio
                    <span className="block text-xs font-normal mt-1">A coordinar</span>
                  </button>
                </div>
                {deliveryType === 'HOME_DELIVERY' && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                    El costo del envío se coordina por WhatsApp según tu ubicación.
                  </p>
                )}
              </div>

              {/* DIRECCIÓN (Condicional) */}
              {deliveryType === 'HOME_DELIVERY' && (
                <div className="space-y-4 animate-fade-in">
                  <input
                    type="text" name="address" placeholder="Calle y altura"
                    value={formData.address} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text" name="city" placeholder="Ciudad"
                      value={formData.city} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <input
                      type="text" name="postalCode" placeholder="CP"
                      value={formData.postalCode} onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>
              )}

              {/* RESUMEN FINAL */}
              <div className="border-t border-gray-100 pt-6 mt-6 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                {deliveryType === 'HOME_DELIVERY' && (
                  <div className="flex justify-between text-gray-500">
                    <span>Envío</span>
                    <span className="text-amber-600 font-medium">A definir</span>
                  </div>
                )}
                {deliveryType === 'PICKUP' && (
                  <div className="flex justify-between text-gray-500">
                    <span>Envío</span>
                    <span className="text-green-600 font-medium">Gratis (retiro)</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-primary pt-2">
                  <span>Total</span>
                  <span>${total}{deliveryType === 'HOME_DELIVERY' && <span className="text-sm font-normal text-gray-400"> + envío</span>}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-2">
                Serás redirigido a Mercado Pago para completar el pago de forma segura.
              </p>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
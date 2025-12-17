import { useCart } from '../../context/CartContext';
import type { CartItem } from '../../types/domain';

/**
 * Cart item component
 * Displays product in cart with quantity controls and remove button
 */

interface CartItemProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.product.id);
  };

  const subtotal = item.product.price * item.quantity;

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={item.product.imageUrl || '/placeholder-product.jpg'}
          alt={item.product.name}
          className="w-full h-full object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          ${item.product.price} c/u
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Stock disponible: {item.product.stock}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="w-12 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        <button
          onClick={handleRemove}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-center w-24">
        <span className="font-bold text-primary">${subtotal}</span>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types/domain';
import { resolveImageUrl } from '../../utils/imageUtils';

interface ProductoCardProps {
  product: Product;
}

export default function ProductoCard({ product }: ProductoCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  
  // Buscamos si este producto ya está en el carrito
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const hasStock = product.stock > 0;

  // Lógica de botones
  const handleAdd = () => {
    if (hasStock) addItem(product, 1);
  };

  const handleIncrement = () => {
    if (quantityInCart < product.stock) {
      updateQuantity(product.id, quantityInCart + 1);
    }
  };

  const handleDecrement = () => {
    if (quantityInCart === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantityInCart - 1);
    }
  };

  return (
    <div className={`group bg-white rounded-3xl p-4 transition-all duration-300 hover:shadow-soft border border-transparent hover:border-gray-50 flex flex-col h-full ${!hasStock ? 'opacity-70' : ''}`}>
      
      {/* 1. IMAGEN */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
        {product.isOffer && hasStock && (
          <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-sm tracking-wider">
            OFERTA
          </span>
        )}

        {!hasStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
              SIN STOCK
            </span>
          </div>
        )}

        <img
          src={resolveImageUrl(product.imageUrl) || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400/F9F7F5/E5989B?text=Producto')}
        />
      </div>

      {/* 2. INFO */}
      <div className="flex-grow flex flex-col">
        <div className="mb-3">
          <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
            {product.categoryName}
          </p>
          <h3 className="font-sans font-bold text-lg text-primary leading-tight group-hover:text-accent transition-colors line-clamp-2" title={product.name}>
            <Link to={`/productos/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        {/* 3. PRECIO Y ACCIÓN (Sticky Bottom) */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            {product.isOffer && product.offerPrice ? (
              <>
                <span className="font-sans font-bold text-xl text-accent">
                  ${product.offerPrice}
                </span>
                <span className="font-sans text-sm text-gray-400 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="font-sans font-bold text-xl text-primary">
                ${product.price}
              </span>
            )}
          </div>

          {/* ZONA DE ACCIÓN: Aquí ocurre la magia */}
          {quantityInCart > 0 ? (
            // ESTADO: EN CARRITO (Contador)
            <div className="flex items-center bg-primary text-white rounded-full px-1 py-1 h-10 shadow-md animate-fade-in">
              <button 
                onClick={handleDecrement}
                className="w-8 h-full flex items-center justify-center hover:text-accent transition-colors active:scale-90"
              >
                −
              </button>
              <span className="font-bold text-sm w-4 text-center select-none">
                {quantityInCart}
              </span>
              <button 
                onClick={handleIncrement}
                disabled={quantityInCart >= product.stock}
                className={`w-8 h-full flex items-center justify-center transition-colors active:scale-90 ${quantityInCart >= product.stock ? 'opacity-50 cursor-not-allowed' : 'hover:text-accent'}`}
              >
                +
              </button>
            </div>
          ) : (
            // ESTADO: NO AGREGADO (Botón simple)
            <button
              onClick={handleAdd}
              disabled={!hasStock}
              className={`h-10 px-5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 ${
                hasStock 
                  ? 'bg-white text-primary border border-gray-200 hover:border-accent hover:bg-accent hover:text-white' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-transparent'
              }`}
            >
              AGREGAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
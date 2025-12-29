import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productosApi } from '../api/productos';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/domain';
import { resolveImageUrl } from '../utils/imageUtils';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // Asumiendo que agregas getBySlug a tu API client
        // Si no tienes getBySlug, usa getAll y find (menos performante pero funciona para MVP)
        const allProducts = await productosApi.getAll(); 
        const found = allProducts.find(p => p.slug === slug);
        setProduct(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent">Cargando...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>;

  const handleAddToCart = () => {
    addItem(product, quantity);
    // Feedback visual o toast aquí
  };

  return (
    <div className="min-h-screen bg-background py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link to="/productos" className="text-sm text-gray-500 hover:text-primary mb-8 inline-block">← Volver a la tienda</Link>
        
        <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-[3rem] shadow-soft">
          {/* Columna Imagen */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50">
            <img
              src={resolveImageUrl(product.imageUrl) || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isOffer && (
              <span className="absolute top-6 left-6 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                OFERTA
              </span>
            )}
          </div>

          {/* Columna Info */}
          <div className="flex flex-col justify-center">
            <span className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{product.categoryName}</span>
            <h1 className="font-serif text-4xl font-bold text-primary mb-4">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-6">
              {product.isOffer && product.offerPrice ? (
                <>
                  <span className="text-3xl font-bold text-accent">${product.offerPrice}</span>
                  <span className="text-xl text-gray-400 line-through">${product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-light text-primary">${product.price}</span>
              )}
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8 font-sans">
              {product.description}
            </p>

            {/* Controles de Stock y Add */}
            <div className="border-t border-gray-100 pt-8 mt-auto">
              {product.stock > 0 ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-gray-200 rounded-full px-4 h-12 w-max">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-gray-500 hover:text-primary text-xl px-2"
                    >-</button>
                    <span className="mx-4 font-medium w-4 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="text-gray-500 hover:text-primary text-xl px-2"
                    >+</button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary text-white h-12 rounded-full font-bold hover:bg-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Agregar al Carrito
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-500 py-3 px-6 rounded-full text-center font-medium">
                  Sin Stock Momentáneamente
                </div>
              )}
              
              <div className="mt-6 flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  ✓ Envío a todo el país
                </span>
                <span className="flex items-center gap-2">
                  ✓ Compra protegida
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../../api/productos';
import ProductoCard from '../catalog/ProductoCard';
import type { Product } from '../../types/domain';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productosApi.getFeatured();
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-medium tracking-wider text-sm uppercase">Shop Online</span>
          <h2 className="font-serif text-4xl font-bold text-primary mt-2 mb-4">
            Cuidado Profesional en Casa
          </h2>
          <p className="text-gray-500 font-sans">
            Fórmulas seleccionadas para extender los resultados del consultorio.
          </p>
        </div>

        {/* Grid usando el Componente Inteligente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductoCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/productos"
            className="inline-block border-b border-primary pb-1 text-primary hover:text-accent hover:border-accent transition-colors font-medium"
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
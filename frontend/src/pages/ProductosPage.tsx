import { useEffect, useState } from 'react';
import { productosApi } from '../api/productos';
import { categoriasApi } from '../api/categorias';
import ProductoCard from '../components/catalog/ProductoCard'; 
import type { Product, Category } from '../types/domain';
import { CategoryType } from '../types/domain';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productosApi.getAll(),
          categoriasApi.getByType(CategoryType.PRODUCT),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = selectedFilter === 'All'
    ? products
    : products.filter((p) => p.categoryName === selectedFilter);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-accent font-serif">Cargando tienda...</div></div>;

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-bold text-primary mb-4">Tienda Online</h1>
          <p className="text-gray-500">Productos profesionales para continuar tu rutina en casa.</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedFilter('All')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedFilter === 'All' 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-white text-gray-500 border border-gray-200 hover:border-accent hover:text-accent'
            }`}
          >
            Todo
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.name)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFilter === cat.name 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-accent hover:text-accent'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        {filteredProducts.length === 0 ? (
           <div className="text-center py-20 text-gray-400">No hay productos en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductoCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
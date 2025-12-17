import { useEffect, useState } from 'react';
import { adminApi, type PageResponse } from '../../api/admin';
import Modal from '../../components/admin/Modal';
import ProductForm from '../../components/admin/ProductForm';
import type { Product } from '../../types/domain';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const pageData: PageResponse<Product> = await adminApi.products.getAll(currentPage, pageSize);
      setProducts(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await adminApi.products.toggleFeatured(id);
      loadProducts();
      toast.success('Estado destacado actualizado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}" permanentemente?`)) return; // TODO: Custom Confirm Dialog

    try {
      await adminApi.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error al eliminar producto');
    }
  };

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        await adminApi.products.update(editingProduct.id, data);
        toast.success('Producto actualizado');
      } else {
        await adminApi.products.create(data);
        toast.success('Producto creado exitosamente');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
      throw err;
    }
  };

  const openCreate = () => { setEditingProduct(null); setIsModalOpen(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setIsModalOpen(true); };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando catálogo...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona el inventario de tu tienda.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Pagination Header */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-medium text-gray-700">{products.length}</span> de{' '}
            <span className="font-medium text-gray-700">{totalElements}</span> productos
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={product.imageUrl || '/placeholder.jpg'} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=IMG')}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                      <div className="flex gap-2 mt-1">
                        {product.isOffer && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">OFERTA</span>}
                        {product.isTrending && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">TREND</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  {product.categoryName}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-gray-900">${product.price}</span>
                </td>
                <td className="px-6 py-4">
                  {product.stock <= 5 ? (
                    <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
                      <AlertCircle size={14} />
                      <span>{product.stock} (Bajo)</span>
                    </div>
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">{product.stock} unid.</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleFeatured(product.id)}
                      className={`p-2 rounded-lg transition-colors ${product.isFeatured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title="Destacar"
                    >
                      <Star size={18} fill={product.isFeatured ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => openEdit(product)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No hay productos registrados.</div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página <span className="font-medium text-gray-700">{currentPage + 1}</span> de{' '}
              <span className="font-medium text-gray-700">{totalPages}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
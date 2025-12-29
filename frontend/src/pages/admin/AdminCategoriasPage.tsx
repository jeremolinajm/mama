import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { Category } from '../../types/domain';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Loader2, X } from 'lucide-react';

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SERVICE' | 'PRODUCT'>('SERVICE');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SERVICE' as 'SERVICE' | 'PRODUCT',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        type: category.type as 'SERVICE' | 'PRODUCT',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        type: activeTab,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', type: 'SERVICE' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await adminApi.categories.update(editingCategory.id, formData);
        toast.success('Categoría actualizada');
      } else {
        await adminApi.categories.create(formData);
        toast.success('Categoría creada');
      }
      handleCloseModal();
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await adminApi.categories.delete(id);
      toast.success('Categoría eliminada');
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar. Puede que tenga productos/servicios asociados.');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando categorías...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Categorías</h1>
          <p className="text-gray-500 text-sm mt-1">Organiza tus productos y servicios por categorías.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md"
        >
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('SERVICE')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'SERVICE'
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Servicios
        </button>
        <button
          onClick={() => setActiveTab('PRODUCT')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'PRODUCT'
              ? 'bg-pink-100 text-pink-700 border border-pink-200'
              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Productos
        </button>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Tag size={24} />
            </div>
            <p className="text-gray-500 font-medium">No hay categorías de {activeTab === 'SERVICE' ? 'servicios' : 'productos'}</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-primary font-bold text-sm hover:underline"
            >
              Crear la primera categoría
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredCategories.map((category) => (
              <li key={category.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${activeTab === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600'}`}>
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'SERVICE' | 'PRODUCT' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={!!editingCategory}
                >
                  <option value="SERVICE">Servicio</option>
                  <option value="PRODUCT">Producto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ej: Tratamientos Faciales"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={3}
                  placeholder="Descripción opcional..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 font-bold transition-all shadow-md"
                >
                  {saving ? 'Guardando...' : editingCategory ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { categoriasApi } from '../../api/categorias';
import { CategoryType } from '../../types/domain';
import type { Service, Category } from '../../types/domain';
import ImageUploader from './ImageUploader';

/**
 * Service form for create/edit
 */

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: Partial<Service>) => Promise<void>;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    shortDescription: service?.shortDescription || '',
    price: service?.price || 0,
    offerPrice: service?.offerPrice || null as number | null,
    isOffer: service?.isOffer || false,
    durationMinutes: service?.durationMinutes || 60,
    categoryId: service?.categoryId || null as number | null,
    isFeatured: service?.isFeatured || false,
    isActive: service?.isActive ?? true,
    imageUrl: service?.imageUrl || '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoriasApi.getByType(CategoryType.SERVICE);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Servicio *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción Corta
        </label>
        <input
          type="text"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">Máximo 100 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción Completa *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => { 
              const val = parseFloat(e.target.value);
              setFormData({ ...formData, price: isNaN(val) ? 0 : val })}
            }
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración (min) *
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFormData({ ...formData, durationMinutes: isNaN(val) ? 0 : val })
            }}
            min="15"
            step="15"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          value={formData.categoryId || ''}
          onChange={(e) =>
            setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })
          }
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Sin categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <ImageUploader
          currentImageUrl={formData.imageUrl}
          onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
        />
      </div>

      {/* Toggles / Checkboxes */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
          />
          <span className="text-sm text-gray-700 font-medium">Destacado</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isOffer}
            onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
            className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
          />
          <span className="text-sm text-gray-700 font-medium">En oferta</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 font-medium">Servicio Activo</span>
        </label>
      </div>

      {/* Precio de Oferta (condicional) */}
      {formData.isOffer && (
        <div className="animate-fade-in">
          <label className="block text-sm font-bold text-gray-700 mb-1">Precio de Oferta</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.offerPrice || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFormData({ ...formData, offerPrice: isNaN(val) ? null : val });
              }}
              min="0"
              step="0.01"
              placeholder="Precio con descuento"
              className="w-full px-4 py-2 pl-8 border border-orange-200 bg-orange-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <p className="text-xs text-orange-600 mt-1">Este precio se mostrará como oferta en lugar del precio normal</p>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

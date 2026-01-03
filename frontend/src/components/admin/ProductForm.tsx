import { useState, useEffect } from 'react';
import { categoriasApi } from '../../api/categorias';
import { CategoryType } from '../../types/domain';
import type { Product, Category } from '../../types/domain';
import ImageUploader from './ImageUploader';
import { toast } from 'sonner'; // Importamos toast para feedback profesional

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para errores de validación local
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    price: product?.price || 0,
    offerPrice: product?.offerPrice || null as number | null,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || null as number | null,
    isFeatured: product?.isFeatured || false,
    isOffer: product?.isOffer || false,
    isTrending: product?.isTrending || false,
    isActive: product?.isActive ?? true,
    imageUrl: product?.imageUrl || '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoriasApi.getByType(CategoryType.PRODUCT);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
        toast.error('Error al cargar las categorías');
      }
    };
    loadCategories();
  }, []);

  // Función de validación robusta
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!formData.categoryId) newErrors.categoryId = 'Debes seleccionar una categoría';
    
    // Si queremos ser estrictos con la imagen:
    // if (!formData.imageUrl) newErrors.imageUrl = 'La imagen es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validar antes de enviar
    if (!validate()) {
      toast.error('Faltan datos obligatorios', {
        description: 'Por favor revisa los campos marcados en rojo.'
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch {
      // El error global ya se maneja en la página padre, pero aquí liberamos el loading
    } finally {
      setLoading(false);
    }
  };

  // Helper para clases de inputs
  const getInputClass = (field: string) => `
    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all
    ${errors[field] 
      ? 'border-red-500 focus:ring-red-200 bg-red-50' 
      : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      
      {/* Nombre */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: '' }); // Limpiar error al escribir
          }}
          className={getInputClass('name')}
          placeholder="Ej: Serum Vitamina C"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
      </div>

      {/* Descripción Corta */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Descripción Corta
        </label>
        <input
          type="text"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          maxLength={100}
          placeholder="Breve resumen para la tarjeta..."
        />
      </div>

      {/* Descripción Completa */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Descripción Completa <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          rows={4}
          className={getInputClass('description')}
          placeholder="Detalles, beneficios y modo de uso..."
        />
        {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Precio */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Precio <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                if (errors.price) setErrors({ ...errors, price: '' });
              }}
              min="0"
              step="0.01"
              className={`${getInputClass('price')} pl-8`}
            />
          </div>
          {errors.price && <p className="text-xs text-red-500 mt-1 font-medium">{errors.price}</p>}
        </div>

        {/* Precio de Oferta */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Precio Oferta</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.offerPrice || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                const offerPrice = isNaN(val) || val <= 0 ? null : val;
                setFormData({
                  ...formData,
                  offerPrice,
                  isOffer: offerPrice !== null && offerPrice > 0
                });
              }}
              min="0"
              step="0.01"
              placeholder="Opcional"
              className="w-full px-4 py-2 pl-8 border border-orange-200 bg-orange-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
          <p className="text-xs text-orange-600 mt-1">Si se establece, aparecerá el badge de oferta</p>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFormData({ ...formData, stock: isNaN(val) ? 0 : val });
            }}
            min="0"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Categoría - AQUÍ ESTABA EL PROBLEMA */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.categoryId || ''}
          onChange={(e) => {
            setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null });
            if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
          }}
          className={getInputClass('categoryId')}
        >
          <option value="">-- Seleccionar Categoría --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
            ⚠ {errors.categoryId}
          </p>
        )}
      </div>

      {/* Imagen */}
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
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 font-medium">Producto Activo</span>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors text-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 font-bold transition-all shadow-md active:scale-95"
        >
          {loading ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}
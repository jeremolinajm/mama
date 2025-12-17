import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import Modal from '../../components/admin/Modal';
import ServiceForm from '../../components/admin/ServiceForm';
import type { Service } from '../../types/domain';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function AdminServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await adminApi.services.getAll();
      setServices(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await adminApi.services.toggleFeatured(id);
      loadServices();
      toast.success('Visibilidad actualizada');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar el servicio "${name}"?`)) return;

    try {
      await adminApi.services.delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Servicio eliminado');
    } catch {
      toast.error('Error al eliminar servicio');
    }
  };

  const handleSubmit = async (data: Partial<Service>) => {
    try {
      if (editingService) {
        await adminApi.services.update(editingService.id, data);
        toast.success('Servicio actualizado');
      } else {
        await adminApi.services.create(data);
        toast.success('Servicio creado');
      }
      setIsModalOpen(false);
      loadServices();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
      throw err;
    }
  };

  const openCreate = () => { setEditingService(null); setIsModalOpen(true); };
  const openEdit = (s: Service) => { setEditingService(s); setIsModalOpen(true); };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando servicios...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Servicios</h1>
          <p className="text-gray-500 text-sm mt-1">Configura los tratamientos disponibles para reserva.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} /> Nuevo Servicio
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Servicio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Duración</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
                      {service.imageUrl ? (
                         <img src={service.imageUrl} className="w-full h-full object-cover rounded-lg" alt="" />
                      ) : (
                         <Sparkles size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{service.name}</p>
                      {service.isActive ? (
                        <span className="text-[10px] text-green-600 font-bold">● Activo</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">● Pausado</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  {service.categoryName || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-gray-900">${service.price}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 w-max px-3 py-1 rounded-full border border-gray-100">
                    <Clock size={14} className="text-gray-400" />
                    <span>{service.durationMinutes} min</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleFeatured(service.id)}
                      className={`p-2 rounded-lg transition-colors ${service.isFeatured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title="Destacar en Home"
                    >
                      <Star size={18} fill={service.isFeatured ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => openEdit(service)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id, service.name)}
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
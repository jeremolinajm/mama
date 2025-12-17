import { useEffect, useState } from 'react';
import { adminApi, type PageResponse } from '../../api/admin';
import { OrderStatus } from '../../types/domain';
import type { Order } from '../../types/domain';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const pageData: PageResponse<Order> = await adminApi.orders.getAll(currentPage, pageSize);
      setOrders(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: OrderStatus) => {
    const promise = adminApi.orders.updateStatus(id, newStatus)
      .then(() => loadOrders());

    toast.promise(promise, {
      loading: 'Actualizando estado...',
      success: 'Estado actualizado correctamente',
      error: 'Error al actualizar estado'
    });
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  // Helper de estilos
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DELIVERED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando pedidos...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">Supervisa compras y envíos en tiempo real.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
        {['ALL', 'PENDING', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              filterStatus === status
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Pagination Header */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-medium text-gray-700">{orders.length}</span> de{' '}
            <span className="font-medium text-gray-700">{totalElements}</span> pedidos
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Entrega</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <>
                  <tr 
                    key={order.id} 
                    className={`group transition-colors ${expandedOrderId === order.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">#{order.orderNumber.split('-')[1]}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full text-gray-400 group-hover:bg-white group-hover:text-primary transition-colors">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{order.customerInfo.name}</p>
                          <p className="text-xs text-gray-500">{order.customerInfo.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.deliveryInfo.deliveryType === 'HOME_DELIVERY' 
                          ? <Truck size={14} className="text-blue-500" />
                          : <Package size={14} className="text-orange-500" />
                        }
                        <span className="text-sm text-gray-700 font-medium">
                          {order.deliveryInfo.deliveryType === 'HOME_DELIVERY' ? 'Envío' : 'Retiro'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">${order.total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border appearance-none cursor-pointer outline-none transition-all ${getStatusStyle(order.status)}`}
                        disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                      >
                        <option value="PENDING">PENDIENTE</option>
                        <option value="PAID">PAGADO</option>
                        <option value="PREPARING">PREPARANDO</option>
                        <option value="READY">LISTO</option>
                        <option value="DELIVERED">ENTREGADO</option>
                        <option value="CANCELLED">CANCELADO</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Detalle Expandible */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={18} /> Detalle del Pedido
                          </h4>
                          
                          <div className="grid md:grid-cols-2 gap-8">
                            <ul className="space-y-3">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                                  <div className="flex gap-3">
                                    <span className="font-bold text-gray-900">{item.quantity}x</span>
                                    <span className="text-gray-600">{item.productName}</span>
                                  </div>
                                  <span className="font-medium text-gray-900">${item.subtotal}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                              <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>${order.subtotal}</span>
                              </div>
                              <div className="flex justify-between text-gray-500">
                                <span>Envío</span>
                                <span>${order.deliveryCost}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>${order.total}</span>
                              </div>
                              
                              {order.deliveryInfo.deliveryType === 'HOME_DELIVERY' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                                  <p className="font-bold uppercase mb-1">Dirección de Entrega:</p>
                                  <p>{order.deliveryInfo.deliveryAddress}</p>
                                  <p>{order.deliveryInfo.deliveryCity}, {order.deliveryInfo.deliveryProvince}</p>
                                  <p>CP: {order.deliveryInfo.deliveryPostalCode}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search size={24} />
            </div>
            <p className="text-gray-500 font-medium">No hay pedidos en esta categoría</p>
          </div>
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
    </div>
  );
}
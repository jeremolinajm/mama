import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

// 1. Definimos la interfaz para las props del componente interno
interface StatCardProps {
  title: string;
  value: number | string; // Puede ser número o '-' cuando carga
  icon: React.ReactNode;
  link: string;
  colorClass: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    bookingsToday: 0,
    pendingOrders: 0,
    activeProducts: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Usamos size grande para obtener todos los items en el conteo
      const [services, productsPage, bookings, ordersPage] = await Promise.all([
        adminApi.services.getAll(),
        adminApi.products.getAll(0, 1000),
        adminApi.bookings.getAll(),
        adminApi.orders.getAll(0, 1000),
      ]);

      // Extract content arrays from paginated responses
      const products = productsPage.content;
      const orders = ordersPage.content;

      // Calculamos turnos de HOY (en local time para simplificar visualización)
      const todayStr = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(
        (b) => b.bookingDate === todayStr && b.status !== 'CANCELLED'
      );

      setStats({
        totalServices: services.filter((s) => s.isActive).length,
        activeProducts: products.filter((p) => p.isActive).length,
        bookingsToday: todayBookings.length,
        pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Usamos la interfaz aquí en lugar de 'any'
  const StatCard = ({ title, value, icon, link, colorClass }: StatCardProps) => (
    <Link 
      to={link}
      className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-soft transition-all duration-300 group border border-gray-50 flex items-center justify-between"
    >
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-4xl font-serif font-bold text-primary group-hover:text-accent transition-colors">
          {loading ? '-' : value}
        </h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClass}`}>
        {icon}
      </div>
    </Link>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            Hola, <span className="text-accent">{'mamá'}</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Aquí tienes el resumen de tu negocio hoy.
          </p>
        </div>
        <div className="text-sm font-medium text-gray-400 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Turnos Hoy" 
          value={stats.bookingsToday} 
          icon="📅" 
          link="/admin/turnos"
          colorClass="bg-blue-50 text-blue-500"
        />
        <StatCard 
          title="Pedidos Pendientes" 
          value={stats.pendingOrders} 
          icon="📦" 
          link="/admin/pedidos"
          colorClass="bg-orange-50 text-orange-500"
        />
        <StatCard 
          title="Productos Activos" 
          value={stats.activeProducts} 
          icon="🧴" 
          link="/admin/productos"
          colorClass="bg-pink-50 text-pink-500"
        />
        <StatCard 
          title="Servicios" 
          value={stats.totalServices} 
          icon="💆‍♀️" 
          link="/admin/servicios"
          colorClass="bg-purple-50 text-purple-500"
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Panel Izquierdo */}
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50">
          <h3 className="font-serif text-xl font-bold text-primary mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/servicios" className="p-4 rounded-2xl bg-gray-50 hover:bg-accent/10 hover:text-accent transition text-center group">
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">✨</span>
              <span className="font-medium text-sm">Nuevo Servicio</span>
            </Link>
            <Link to="/admin/productos" className="p-4 rounded-2xl bg-gray-50 hover:bg-accent/10 hover:text-accent transition text-center group">
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">📦</span>
              <span className="font-medium text-sm">Cargar Stock</span>
            </Link>
            <Link to="/admin/config" className="p-4 rounded-2xl bg-gray-50 hover:bg-accent/10 hover:text-accent transition text-center group">
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">⏰</span>
              <span className="font-medium text-sm">Editar Horarios</span>
            </Link>
            <div className="p-4 rounded-2xl bg-gray-50 text-gray-300 text-center cursor-not-allowed">
              <span className="text-2xl block mb-2">📊</span>
              <span className="font-medium text-sm">Reportes (Pronto)</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="bg-primary p-8 rounded-3xl shadow-soft text-white relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10">
             <h3 className="font-serif text-2xl font-bold mb-2">Estado del Sistema</h3>
             <p className="text-white/70 text-sm mb-6">Tu plataforma está funcionando correctamente.</p>
             
             <div className="space-y-3">
               <div className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                 <span>Base de datos conectada</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                 <span>Pagos habilitados (Mercado Pago)</span>
               </div>
             </div>
           </div>

           {/* Decoración */}
           <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute top-10 right-10 w-20 h-20 bg-accent/20 rounded-full blur-xl"></div>
        </div>

      </div>
    </div>
  );
}
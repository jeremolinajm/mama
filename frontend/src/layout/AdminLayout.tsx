import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ShoppingBag, 
  Sparkles, 
  Package, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  User
} from 'lucide-react';

// Tipado para los items del menú
interface LinkItemProps {
  to: string;
  icon: React.ElementType; 
  label: string;
  onClick?: () => void;
}

const LinkItem = ({ to, icon: Icon, label, onClick }: LinkItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon 
        size={18} 
        className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} 
        strokeWidth={2}
      />
      <span>{label}</span>
    </Link>
  );
};

// 1. COMPONENTE EXTRAÍDO (SOLUCIÓN AL ERROR ESLINT)
const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
  // Movemos el hook aquí dentro para que tenga acceso al contexto
  const { logout, username } = useAuth(); 

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-lg font-serif font-bold italic">
          F
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-primary leading-none">
            Flavia<span className="text-accent">.</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <LinkItem to="/admin" icon={LayoutDashboard} label="Resumen" onClick={onItemClick} />
        <LinkItem to="/admin/turnos" icon={CalendarDays} label="Agenda" onClick={onItemClick} />
        <LinkItem to="/admin/pedidos" icon={ShoppingBag} label="Pedidos" onClick={onItemClick} />
        
        <div className="pt-6 pb-2 px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catálogo</p>
        </div>
        <LinkItem to="/admin/servicios" icon={Sparkles} label="Servicios" onClick={onItemClick} />
        <LinkItem to="/admin/productos" icon={Package} label="Productos" onClick={onItemClick} />
        
        <div className="pt-6 pb-2 px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sistema</p>
        </div>
        <LinkItem to="/admin/config" icon={Settings} label="Configuración" onClick={onItemClick} />
      </nav>

      {/* Footer Usuario */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-gray-100">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
            <User size={16} />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-semibold text-xs text-gray-700 truncate">{username || 'Administrador'}</p>
            <p className="text-[10px] text-gray-400">Sesión activa</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. COMPONENTE PRINCIPAL LIMPIO
export default function AdminLayout() {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-lg font-serif font-bold italic text-sm">F</div>
            <span className="font-serif font-bold text-primary">Flavia.</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Area de Contenido Scrollable */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
           <Outlet />
        </div>
      </main>
      
      <Toaster position="top-right" richColors closeButton theme="light" />
    </div>
  );
}
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estilos para los links: Detecta automáticamente si estás en esa página
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors duration-300 ${
      isActive ? 'text-accent' : 'text-primary hover:text-accent'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGOTIPO */}
          <Link to="/" className="flex items-center gap-2 group z-50">
            {/* Isotipo Decorativo */}
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-tr-xl rounded-bl-xl group-hover:bg-accent transition-colors duration-300 shadow-sm">
              <span className="font-serif italic font-bold text-lg">F</span>
            </div>
            {/* Texto del Logo */}
            <span className="font-serif text-2xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-300">
              Flavia<span className="text-accent">.</span>
            </span>
          </Link>

          {/* 2. MENÚ DE ESCRITORIO (Centrado) */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClasses}>Inicio</NavLink>
            <NavLink to="/servicios" className={navLinkClasses}>Servicios</NavLink>
            <NavLink to="/productos" className={navLinkClasses}>Productos</NavLink>
            <NavLink to="/flavia" className={navLinkClasses}>Sobre Flavia</NavLink>
          </div>

          {/* 3. ACCIONES (Derecha) */}
          <div className="hidden md:flex items-center gap-6">
            {/* Carrito de Compras */}
            <Link 
              to="/carrito" 
              className="relative group p-2 text-primary hover:text-accent transition-colors"
              aria-label="Ver carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Separador vertical */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* Botón CTA (Call to Action) */}
            <Link
              to="/reservar"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-soft hover:shadow-lg hover:bg-accent hover:-translate-y-0.5 transition-all duration-300"
            >
              Reservar Turno
            </Link>
          </div>

          {/* 4. BOTÓN HAMBURGUESA (Móvil) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary hover:text-accent focus:outline-none z-50"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 5. MENÚ MÓVIL (Desplegable) */}
      {/* Fondo oscuro para el resto de la pantalla */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Panel del menú */}
      <div 
        className={`fixed top-[80px] left-0 w-full bg-white border-b border-gray-100 shadow-xl z-40 transform transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-6 space-y-4">
          <NavLink 
            to="/" 
            className={({isActive}) => `text-lg font-medium ${isActive ? 'text-accent' : 'text-primary'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/servicios" 
            className={({isActive}) => `text-lg font-medium ${isActive ? 'text-accent' : 'text-primary'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Servicios
          </NavLink>
          <NavLink 
            to="/productos" 
            className={({isActive}) => `text-lg font-medium ${isActive ? 'text-accent' : 'text-primary'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Productos
          </NavLink>
          <NavLink 
            to="/flavia" 
            className={({isActive}) => `text-lg font-medium ${isActive ? 'text-accent' : 'text-primary'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sobre Flavia
          </NavLink>
          
          <div className="border-t border-gray-100 pt-4 mt-2">
            <Link 
              to="/carrito" 
              className="flex items-center justify-between text-primary py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="font-medium">Tu Carrito</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{itemCount} items</span>
                <div className="bg-accent/10 p-2 rounded-full text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                </div>
              </div>
            </Link>
          </div>

          <Link
            to="/reservar"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-2 w-full bg-primary text-white text-center py-3.5 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
          >
            Reservar Turno Ahora
          </Link>
        </div>
      </div>
    </nav>
  );
}
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

// Footer Component (Definido aquí mismo para simplificar, luego puedes moverlo)
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="font-serif text-xl font-bold text-accent mb-2">Flavia Dermobeauty</h3>
          <p className="text-gray-500 text-sm">Realzando tu belleza natural con ciencia y dedicación.</p>
        </div>
        <div className="flex gap-6 text-sm text-primary-light">
          <a href="#" className="hover:text-accent transition">Instagram</a>
          <a href="#" className="hover:text-accent transition">WhatsApp</a>
          <a href="#" className="hover:text-accent transition">Ubicación</a>
        </div>
      </div>
      <div className="border-t border-gray-100 mt-8 pt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Flavia Dermobeauty. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-primary">
      {/* Navbar fija */}
      <Navbar />
      
      {/* Contenido Dinámico */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      
      {/* Footer Unificado */}
      <Footer />
    </div>
  );
}
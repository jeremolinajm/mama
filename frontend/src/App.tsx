import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts
import MainLayout from './layout/MainLayout';
import AdminLayout from './layout/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ServiciosPage from './pages/ServiciosPage';
import ProductosPage from './pages/ProductosPage';
import FlaviaPage from './pages/FlaviaPage';
import CarritoPage from './pages/CarritoPage';
import ReservarTurnoPage from './pages/ReservarTurnoPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminServiciosPage from './pages/admin/AdminServiciosPage';
import AdminProductosPage from './pages/admin/AdminProductosPage';
import AdminTurnosPage from './pages/admin/AdminTurnosPage';
import AdminPedidosPage from './pages/admin/AdminPedidosPage';
import AdminConfigPage from './pages/admin/AdminConfigPage';
import AdminCategoriasPage from './pages/admin/AdminCategoriasPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

/**
 * Main App component with routing
 * Wrapped with CartProvider and AuthProvider
 */

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/servicios" element={<ServiciosPage />} />
              <Route path="/servicios/:serviceSlug/reservar" element={<ReservarTurnoPage />} />
              <Route path='/reservar' element={<ReservarTurnoPage />} />
              <Route path="/reserva/exitosa" element={<PaymentSuccessPage />} />
              <Route path="/reserva/fallida" element={<PaymentFailurePage />} />
              <Route path="/reserva/pendiente" element={<PaymentSuccessPage />} /> 
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/productos/:slug" element={<ProductDetailPage />} />
              <Route path="/flavia" element={<FlaviaPage />} />
              <Route path="/carrito" element={<CarritoPage />} />
              <Route path="/pedido/exitoso" element={<PaymentSuccessPage />} />
              <Route path="/pedido/fallido" element={<PaymentFailurePage />} />
            </Route>

            {/* Admin login (no layout) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="servicios" element={<AdminServiciosPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="turnos" element={<AdminTurnosPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
              <Route path="categorias" element={<AdminCategoriasPage />} />
              <Route path="config" element={<AdminConfigPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

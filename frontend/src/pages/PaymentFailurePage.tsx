import { Link } from 'react-router-dom';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded-[2rem] shadow-soft max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">😕</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-primary mb-2">Hubo un problema</h1>
        <p className="text-gray-500 mb-8">
          No pudimos procesar tu pago. Por favor intenta nuevamente o contáctanos.
        </p>
        <Link to="/reservar" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors">
          Intentar Nuevamente
        </Link>
      </div>
    </div>
  );
}
import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-soft max-w-lg w-full text-center border border-gray-50">
        
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl font-bold text-primary mb-2">¡Reserva Confirmada!</h1>
        <p className="text-gray-500 mb-6">
          Tu pago se acreditó correctamente. Te enviamos los detalles a tu email.
        </p>

        {paymentId && (
          <div className="bg-gray-50 py-2 px-4 rounded-lg inline-block mb-8">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">ID de Pago:</span>
            <span className="ml-2 text-sm font-mono text-gray-600">#{paymentId}</span>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            to="/"
            className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-accent transition-colors shadow-lg"
          >
            Volver al Inicio
          </Link>
          <Link 
            to="/productos"
            className="block w-full bg-white text-primary border border-gray-200 py-3 rounded-xl font-medium hover:border-accent hover:text-accent transition-colors"
          >
            Ver Productos
          </Link>
        </div>

      </div>
    </div>
  );
}
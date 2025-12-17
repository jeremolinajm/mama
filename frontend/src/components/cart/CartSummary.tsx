/**
 * Cart summary component
 * Shows subtotal, delivery cost, and total
 */

interface CartSummaryProps {
  subtotal: number;
  deliveryCost: number;
}

export default function CartSummary({ subtotal, deliveryCost }: CartSummaryProps) {
  const total = subtotal + deliveryCost;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Resumen del Pedido</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span>${subtotal}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Envío:</span>
          <span>{deliveryCost === 0 ? 'Gratis' : `$${deliveryCost}`}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg font-bold text-primary">
          <span>Total:</span>
          <span>${total}</span>
        </div>
      </div>
    </div>
  );
}

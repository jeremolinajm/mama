import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '../types/domain';

/**
 * Shopping cart context with reducer pattern
 * Persists to localStorage
 */

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'flavia_cart';

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.payload.product.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { items: newItems };
      } else {
        // Add new item
        return {
          items: [
            ...state.items,
            {
              product: action.payload.product,
              quantity: action.payload.quantity,
            },
          ],
        };
      }
    }

    case 'REMOVE_ITEM': {
      return {
        items: state.items.filter((item) => item.product.id !== action.payload.productId),
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return {
          items: state.items.filter((item) => item.product.id !== action.payload.productId),
        };
      }

      const newItems = state.items.map((item) =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { items: newItems };
    }

    case 'CLEAR_CART': {
      return { items: [] };
    }

    case 'LOAD_CART': {
      return { items: action.payload };
    }

    default:
      return state;
  }
}

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart) as CartItem[];
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Computed values
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = state.items.reduce(
    (total, item) => {
      const effectivePrice = item.product.isOffer && item.product.offerPrice
        ? item.product.offerPrice
        : item.product.price;
      return total + effectivePrice * item.quantity;
    },
    0
  );

  // Actions
  const addItem = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      console.warn('Quantity must be positive');
      return;
    }
    if (quantity > product.stock) {
      console.warn('Quantity exceeds available stock');
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value: CartContextValue = {
    items: state.items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use cart context
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

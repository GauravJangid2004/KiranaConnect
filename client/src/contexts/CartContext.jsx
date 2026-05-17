import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);   // { product, quantity }

  const addToCart = useCallback((product, quantity) => {
    setItems(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) {
        return prev.map(i =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQty = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product._id !== productId));
    } else {
      setItems(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
    }
  }, []);

  const removeItem  = useCallback((productId) =>
    setItems(prev => prev.filter(i => i.product._id !== productId)), []);

  const clearCart   = useCallback(() => setItems([]), []);

  /**
   * useMemo — Cart totals ONLY recompute when `items` array reference changes.
   * Without useMemo, this runs on every parent render even when cart hasn't changed.
   * Verify in React DevTools Profiler: highlight updates, watch this component's
   * render count vs parent — they should diverge when other state changes.
   */
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;
    const breakdown = items.map(({ product, quantity }) => {
      // Tiered pricing: find the best applicable slab for the current quantity
      const tier = product.tiers
        ?.filter(t => quantity >= t.minQty)
        .sort((a, b) => b.minQty - a.minQty)[0];
      const unitPrice = tier ? tier.pricePerUnit : product.basePrice;
      const lineTotal = unitPrice * quantity;
      subtotal   += lineTotal;
      totalItems += quantity;
      return { productId: product._id, unitPrice, lineTotal, hasTier: !!tier };
    });
    return { subtotal, totalItems, itemCount: items.length, breakdown };
  }, [items]);          // ← dependency array: only re-runs when items change

  return (
    <CartContext.Provider value={{ items, totals, addToCart, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

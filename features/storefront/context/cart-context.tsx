"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { type StorefrontProduct } from "../types";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  primaryImageUrl: string | null;
  stockQuantity: number;
  quantity: number;
}

interface CartState {
  storeId: string;
  items: CartItem[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: StorefrontProduct, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  storeId,
}: {
  children: React.ReactNode;
  storeId: string;
}) {
  const [cartState, setCartState] = useState<CartState>(() => ({
    storeId,
    items: [],
  }));

  const [isMounted, setIsMounted] = useState(false);

  const cartStorageKey = `ce_cart_${storeId}`;

  // Restore cart on mount to avoid hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(cartStorageKey) || localStorage.getItem("igotthrift_cart");
        if (stored) {
          const parsed = JSON.parse(stored) as CartState;
          if (parsed.storeId === storeId) {
            setCartState(parsed);
          } else {
            const newState = { storeId, items: [] };
            setCartState(newState);
            localStorage.setItem(cartStorageKey, JSON.stringify(newState));
          }
        } else {
          const newState = { storeId, items: [] };
          setCartState(newState);
          localStorage.setItem(cartStorageKey, JSON.stringify(newState));
        }
      } catch (e) {
        console.error("Failed to restore cart from localStorage:", e);
      } finally {
        setIsMounted(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [storeId, cartStorageKey]);

  // Save changes helper
  const saveCart = (items: CartItem[]) => {
    const newState = { storeId, items };
    setCartState(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem(cartStorageKey, JSON.stringify(newState));
    }
  };

  const addItem = (product: StorefrontProduct, quantity: number) => {
    const existingIndex = cartState.items.findIndex((item) => item.id === product.id);
    const currentQty = existingIndex > -1 ? cartState.items[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stockQuantity) {
      toast.error(`Cannot add more items. Only ${product.stockQuantity} left in stock.`);
      return;
    }

    const updatedItems = [...cartState.items];
    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity = newQty;
    } else {
      updatedItems.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        primaryImageUrl: product.primaryImageUrl,
        stockQuantity: product.stockQuantity,
        quantity,
      });
    }

    saveCart(updatedItems);
  };

  const removeItem = (productId: string) => {
    const updatedItems = cartState.items.filter((item) => item.id !== productId);
    saveCart(updatedItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const itemIndex = cartState.items.findIndex((item) => item.id === productId);
    if (itemIndex === -1) return;

    const item = cartState.items[itemIndex];
    if (quantity < 1) return;
    if (quantity > item.stockQuantity) {
      toast.error(`Only ${item.stockQuantity} items in stock.`);
      return;
    }

    const updatedItems = [...cartState.items];
    updatedItems[itemIndex].quantity = quantity;
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Memoize computed values to optimize performance
  const itemCount = useMemo(() => {
    if (!isMounted) return 0;
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  }, [cartState.items, isMounted]);

  const subtotal = useMemo(() => {
    if (!isMounted) return 0;
    return cartState.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartState.items, isMounted]);

  return (
    <CartContext.Provider
      value={{
        items: isMounted ? cartState.items : [],
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "lingofam-cart";
const CART_EVENT = "lingofam-cart-change";

const SERVER_ITEMS: string[] = [];

let cache: string[] | null = null;

function readItems(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function writeItems(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

function getServerItems() {
  return SERVER_ITEMS;
}

function subscribe(onStoreChange: () => void) {
  const onStorage = () => {
    cache = null;
    onStoreChange();
  };

  window.addEventListener(CART_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CART_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

type CartContextValue = {
  items: string[];
  count: number;
  has: (key: string) => boolean;
  add: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, getServerItems);

  const add = useCallback((key: string) => {
    const current = readItems();
    if (current.includes(key)) return;
    writeItems([...current, key]);
  }, []);

  const remove = useCallback((key: string) => {
    writeItems(readItems().filter((item) => item !== key));
  }, []);

  const clear = useCallback(() => writeItems([]), []);

  const has = useCallback((key: string) => items.includes(key), [items]);

  const value = useMemo(
    () => ({ items, count: items.length, has, add, remove, clear }),
    [items, has, add, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

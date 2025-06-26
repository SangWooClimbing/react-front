import { create } from 'zustand';
import { StoreItem, CartItem } from '../types'; // Ensure CartItem is exported from types

interface CartState {
  items: CartItem[];
  addItem: (item: StoreItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  isItemInCart: (itemId: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item, quantity = 1) => set(state => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      // If item allows multiple stock and current quantity + new quantity <= stock
      const newQuantity = existingItem.quantity + quantity;
      if (item.stock === undefined || item.stock === 1 || (item.stock && newQuantity <= item.stock)) {
         return {
            items: state.items.map(i =>
            i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
        };
      } else if (item.stock && existingItem.quantity < item.stock) { // Can add up to stock
        return {
            items: state.items.map(i =>
            i.id === item.id ? { ...i, quantity: item.stock! } : i
            ),
        };
      }
      return state; // Do nothing if stock limit reached
    }
    // If new item, check stock before adding
    if (item.stock === undefined || item.stock === 1 || (item.stock && quantity <= item.stock)) {
        return { items: [...state.items, { ...item, quantity }] };
    } else if (item.stock && item.stock > 0 && quantity > item.stock) { // Adding more than stock allows, add up to stock
        return { items: [...state.items, { ...item, quantity: item.stock }] };
    }
    return state; // Do nothing if stock is 0 or trying to add more than stock
  }),
  removeItem: (itemId) => set(state => ({
    items: state.items.filter(item => item.id !== itemId),
  })),
  updateQuantity: (itemId, quantity) => set(state => {
    const itemToUpdate = state.items.find(i => i.id === itemId);
    if (!itemToUpdate) return state;

    let newQuantity = Math.max(0, quantity);
    if (itemToUpdate.stock !== undefined && newQuantity > itemToUpdate.stock) {
        newQuantity = itemToUpdate.stock; // Cap at available stock
    }

    if (newQuantity === 0) {
        return { items: state.items.filter(item => item.id !== itemId) };
    }
    return {
        items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
    };
  }),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
  getItemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
  isItemInCart: (itemId: string) => get().items.some(item => item.id === itemId),
}));

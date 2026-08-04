import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, CartItem } from '@/lib/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          // Stok tavanı: sepete stoktan fazlası eklenemesin.
          // Eskiden sınır yoktu; ürün listesinden tekrar tekrar eklenerek
          // stoktan fazla sipariş oluşturulabiliyordu.
          const stockLimit =
            typeof product.stock === 'number' && product.stock > 0 ? product.stock : Infinity

          const existing = state.items.find((i) => i.product.id === product.id)

          if (existing) {
            const nextQuantity = Math.min(existing.quantity + quantity, stockLimit)
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, product, quantity: nextQuantity }
                  : i
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity: Math.min(quantity, stockLimit) }],
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.product.id !== productId) return i
            const stockLimit =
              typeof i.product.stock === 'number' && i.product.stock > 0
                ? i.product.stock
                : Infinity
            return { ...i, quantity: Math.min(quantity, stockLimit) }
          }),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      totalAmount: () => {
        // İndirimli fiyat varsa o kullanılır. Eskiden burası her zaman `price`
        // okuduğu için sepet satırları indirimli fiyatı gösterirken ara toplam
        // indirimsiz hesaplanıyor ve iki rakam tutmuyordu.
        return get().items.reduce((sum, item) => {
          const unitPrice =
            typeof item.product.salePrice === 'number' && item.product.salePrice > 0
              ? item.product.salePrice
              : item.product.price
          return sum + unitPrice * item.quantity
        }, 0)
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'bayirlioglu-cart',
      // createJSONStorage, localStorage'a yalnızca tarayıcı ortamında erişir;
      // SSR sırasında window.localStorage undefined hatası vermez.
      storage: createJSONStorage(() => localStorage),
    }
  )
)

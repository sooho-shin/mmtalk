import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    optionNo: number;
    productNo: number;
    productName: string;
    optionName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (optionNo: number) => void;
    updateQuantity: (optionNo: number, quantity: number) => void;
    clearCart: () => void;
    getTotalCount: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            // 장바구니에 아이템 추가
            addItem: (item) => {
                const { items } = get();
                const existingItem = items.find(i => i.optionNo === item.optionNo);

                if (existingItem) {
                    // 이미 있으면 수량 증가
                    set({
                        items: items.map(i =>
                            i.optionNo === item.optionNo
                                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                                : i
                        )
                    });
                } else {
                    // 새로 추가
                    set({
                        items: [...items, { ...item, quantity: item.quantity || 1 }]
                    });
                }
            },

            // 장바구니에서 아이템 제거
            removeItem: (optionNo) => {
                set({
                    items: get().items.filter(i => i.optionNo !== optionNo)
                });
            },

            // 수량 변경
            updateQuantity: (optionNo, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map(i =>
                        i.optionNo === optionNo ? { ...i, quantity } : i
                    )
                });
            },

            // 장바구니 비우기
            clearCart: () => {
                set({ items: [] });
            },

            // 총 상품 개수
            getTotalCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            // 총 금액
            getTotalPrice: () => {
                return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            },
        }),
        {
            name: 'mmtalk-cart', // localStorage 키
        }
    )
);

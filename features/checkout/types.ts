import { type CartItem } from "../storefront/context/cart-context";

export interface CheckoutDetails {
  name: string;
  phone: string;
  address: string;
}

export interface OrderRecord {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  cartSnapshot: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

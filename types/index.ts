export interface Product {
  id: string; // Changed to string to match Stripe product ID
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image: string;
  position: string;
  currency: string;
  active: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderData {
  name: string;
  apartment: string;
  email: string;
}

import { useState } from 'react';
import { Product, CartItem, OrderData } from '../../types';

export const useVendingMachine = (initialProducts: Product[] = [], refetchProducts?: () => void) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'products' | 'payment'>('products');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({ name: '', apartment: '', email: '' });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string>('');

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prevCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevCart; // No change if at max stock
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + change;
          return newQty > 0 && newQty <= item.stock ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };


  const handlePaymentSuccess = async () => {
    // Set processing state to show loading screen
    setPaymentStatus('processing');
    
    // Add a satisfying 3-second delay before showing success
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Show success after the delay
    setPaymentStatus('success');
    setCart([]);

    // Update stock in background (non-blocking)
    const updateStockInBackground = async () => {
      try {
        const stockUpdatePromises = cart.map(async (item) => {
          const response = await fetch('/api/update-stock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: item.stripeProductId,
              quantityPurchased: item.quantity
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            return { success: false, item: item.name, error: errorData.error };
          }

          const data = await response.json();
          return { success: true, item: item.name, newStock: data.newStock };
        });

        const stockUpdateResults = await Promise.all(stockUpdatePromises);
        
        // Log any failed stock updates
        const failedUpdates = stockUpdateResults.filter(result => !result.success);
        if (failedUpdates.length > 0) {
        }
      } catch (stockError) {
      }
    };

    // Send confirmation email using delivery form data (no need to fetch from Stripe metadata)
    const sendEmailInBackground = async () => {
      try {
        const emailResponse = await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData,
            cart,
            totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          }),
        });

        if (!emailResponse.ok) {
        }
      } catch (emailError) {
      }
    };

    // Run background tasks
    updateStockInBackground();
    sendEmailInBackground();

    // Update local products state immediately for better UX
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.stripeProductId === product.stripeProductId);
      if (cartItem) {
        return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
      }
      return product;
    });
    setProducts(updatedProducts);

    // Refresh products from Stripe after a delay
    if (refetchProducts) {
      setTimeout(() => {
        refetchProducts();
      }, 2000); // Longer delay to ensure background tasks complete
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentStatus('error');
  };

  const handleRetryPayment = () => {
    setPaymentStatus('idle');
    setPaymentError('');
    setView('products');
    setShowCustomerModal(true);
  };

  const handleReturnToProducts = () => {
    setPaymentStatus('idle');
    setOrderData({ name: '', apartment: '', email: '' });
    setView('products');
  };

  return {
    // State
    products,
    cart,
    view,
    orderData,
    paymentStatus,
    paymentError,
    showCustomerModal,
    
    // Actions
    setProducts,
    setCart,
    setView,
    setOrderData,
    setPaymentStatus,
    setPaymentError,
    setShowCustomerModal,
    
    // Functions
    addToCart,
    updateQuantity,
    removeFromCart,
    handlePaymentSuccess,
    handlePaymentError,
    handleRetryPayment,
    handleReturnToProducts,
  };
};

"use client";

import React from 'react';

// Components
import ProductGrid from './components/ProductGrid';
import Basket from './components/Cart';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentError from './components/PaymentError';
import CustomerInfoModal from './components/CustomerInfoModal';

// Data & Hooks
import { useVendingMachine } from './hooks/useVendingMachine';
import { useProducts } from './hooks/useProducts';

const VendingMachine = () => {
  const { products, loading: productsLoading, error: productsError, refetchProducts } = useProducts();
  
  const {
    cart,
    view,
    orderData,
    paymentStatus,
    paymentError,
    showCustomerModal,
    setView,
    setOrderData,
    setShowCustomerModal,
    addToCart,
    updateQuantity,
    removeFromCart,
    handlePaymentSuccess,
    handlePaymentError,
    handleRetryPayment,
    handleReturnToProducts,
  } = useVendingMachine(products, refetchProducts);

  if (paymentStatus === 'success') {
    return <PaymentSuccess orderData={orderData} onReturnToProducts={handleReturnToProducts} />;
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Processing your payment...</p>
          <p className="text-gray-300 mt-2">Please wait while we confirm your order</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching products
  if (productsLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <img 
              src="/hero.png" 
              alt="Snack Vending Machine" 
              className="w-full h-auto max-h-[320px] sm:max-h-[400px] md:max-h-[500px] object-contain rounded-2xl sm:rounded-3xl mb-3 sm:mb-4"
            />
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-white">
              {/* Mobile: Vertical Stack */}
              <div className="flex flex-col items-center space-y-3 sm:hidden">
                <span className="text-lg font-semibold">Select your code</span>
                <div className="flex items-center space-x-4 text-center">
                  <div className="text-xs">
                    <span className="font-semibold">Shop:</span> 24/7
                  </div>
                  <div className="w-px h-4 bg-white/30"></div>
                  <div className="text-xs">
                    <span className="font-semibold">Delivery:</span> Mon-Fri 5-10:30PM, Sat-Sun All Day
                  </div>
                </div>
              </div>
              
              {/* Desktop: Horizontal Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="text-left">
                  <span className="text-xl md:text-2xl font-semibold">Select your code</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <span className="font-semibold">Shop:</span> 24/7
                  </div>
                  <div className="w-px h-8 bg-white/30"></div>
                  <div className="text-sm">
                    <span className="font-semibold">Delivery:</span> Mon-Fri 5-10:30PM, Sat-Sun All Day
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-8 shadow-2xl border-4 sm:border-8 border-gray-700">
            <div className="bg-gradient-to-b from-blue-50/5 to-transparent rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 border-2 sm:border-4 border-gray-600 backdrop-blur-sm">
              <div className="flex items-center justify-center py-20">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-xl">Loading products...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if products failed to load
  if (productsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Failed to Load Products</h2>
          <p className="text-gray-300 mb-6">{productsError}</p>
          <button
            onClick={refetchProducts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/20 pointer-events-none"></div>
      
      <div className={`max-w-7xl mx-auto relative transition-all duration-300 ${cart.length > 0 ? 'lg:ml-80' : ''}`}>
        <div className="mb-4 sm:mb-6 md:mb-8">
        <img 
  src="/hero.png" 
  alt="Snack Vending Machine" 
  className="w-full h-auto max-h-[320px] sm:max-h-[400px] md:max-h-[500px] object-contain rounded-2xl sm:rounded-3xl mb-3 sm:mb-4"
/>
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-white">
            {/* Mobile: Vertical Stack */}
            <div className="flex flex-col items-center space-y-3 sm:hidden">
              <span className="text-lg font-semibold">Select your code</span>
              <div className="flex items-center space-x-4 text-center">
                <div className="text-xs">
                  <span className="font-semibold">Shop:</span> 24/7
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="text-xs">
                  <span className="font-semibold">Delivery:</span> Mon-Fri 5-10:30PM, Sat-Sun All Day
                </div>
              </div>
            </div>
            
            {/* Desktop: Horizontal Layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="text-left">
                <span className="text-xl md:text-2xl font-semibold">Select your code</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  <span className="font-semibold">Shop:</span> 24/7
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-sm">
                  <span className="font-semibold">Delivery:</span> Mon-Fri 5-10:30PM, Sat-Sun All Day
                </div>
              </div>
            </div>
          </div>
        </div>

        {view === 'products' && (
          <>
            <Basket
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onProceedToCheckout={() => setShowCustomerModal(true)}
            />
            <ProductGrid 
              products={products} 
              onAddToCart={addToCart}
              cart={cart}
            />
          </>
        )}

        {view === 'payment' && (
          paymentStatus === 'error' ? (
            <PaymentError
              error={paymentError}
              onRetry={handleRetryPayment}
            />
          ) : (
            <PaymentForm
              cart={cart}
              orderData={orderData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onBack={() => setView('products')}
            />
          )
        )}

        <CustomerInfoModal
          isOpen={showCustomerModal}
          orderData={orderData}
          onOrderDataChange={setOrderData}
          onClose={() => setShowCustomerModal(false)}
          onConfirm={() => {
            setShowCustomerModal(false);
            setView('payment');
          }}
          isProcessing={false}
        />
      </div>
    </div>
  );
};

export default VendingMachine;
"use client";

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartItem, OrderData } from '../../types';

// Initialize Stripe with production keys
const getStripePromise = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return null;
  }
  return loadStripe(publishableKey);
};

const stripePromise = getStripePromise();

interface PaymentFormProps {
  cart: CartItem[];
  orderData: OrderData;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
}

function PaymentFormInner({ cart, orderData, onPaymentSuccess, onPaymentError, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || isProcessing || !isPaymentElementReady) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required'
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      } else {
        onPaymentError('Payment was not completed. Please try again.');
      }
    } catch (err) {
      
      // Handle specific Stripe fetch errors
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        onPaymentError('Network error. Please check your connection and try again.');
      } else {
        onPaymentError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 p-4 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white text-center">Complete Payment</h2>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          <div className="space-y-4 max-w-2xl mx-auto w-full">
            {/* Payment Form */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <PaymentElement 
                onChange={(event) => {
                  setIsPaymentElementReady(event.complete);
                }}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800/90 rounded-xl p-4 shadow-lg">
              <h3 className="text-white font-semibold mb-3 text-base">Order Summary</h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-gray-300 py-1">
                    <span className="flex-1 truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-600 mt-3 pt-3 flex justify-between items-center text-white font-bold text-base">
                <span>TOTAL:</span>
                <span className="text-green-400">${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky Bottom */}
        <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 p-4 sticky bottom-0">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={onBack}
              disabled={isProcessing}
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-gray-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!stripe || isProcessing || !isPaymentElementReady}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm">Processing Payment...</span>
                </div>
              ) : !isPaymentElementReady ? (
                'Complete Payment Info'
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Add global error handler for Stripe fetch errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
        // Suppress Stripe fetch errors that don't affect user experience
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cart: props.cart,
            orderData: props.orderData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (!data.clientSecret) {
          throw new Error('No client secret received');
        }
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      } catch (error) {
        props.onPaymentError(error instanceof Error ? error.message : 'Failed to initialize payment');
        setIsLoading(false);
      }
    };

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      props.onPaymentError('Payment system not configured');
      setIsLoading(false);
      return;
    }

    if (!clientSecret) {
      initializePayment();
    }
  }, [props.cart, props.orderData, props.onPaymentError, clientSecret]);

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-6 text-center w-full max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-4">Payment System Error</h2>
            <p className="text-red-400 text-sm">Payment system not configured. Please check environment variables.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-6 text-center w-full max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-4">Setting up payment</h2>
            <p className="text-gray-300 text-sm">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl p-6 text-center w-full max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-4">Payment Error</h2>
            <p className="text-red-400 text-sm">Error initializing payment. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}
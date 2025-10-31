"use client";

import React from 'react';
import { CheckCircle, Home, ArrowLeft } from 'lucide-react';
import { OrderData } from '../../types';

interface PaymentSuccessProps {
  orderData: OrderData;
  onReturnToProducts: () => void;
}

export default function PaymentSuccess({ orderData, onReturnToProducts }: PaymentSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 text-center max-w-lg w-full border border-gray-700">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        
        <h2 className="text-3xl font-bold text-white mb-6">Order Confirmed!</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 bg-gray-800 rounded-lg p-4 border border-gray-600">
            <Home className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <p className="text-sm text-gray-400">Deliver to:</p>
              <p className="text-lg font-semibold text-white">Apt {orderData.apartment}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700 mb-6">
          <p className="text-gray-300 text-lg mb-4 text-center">
            Thanks for your purchase, your order should arrive within 5-15min of purchase.
          </p>
          <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700">
            <p className="text-amber-300 font-semibold text-center">
              ⚠️ WARNING: If you placed your order outside of business hours, your order will arrive as soon as the store opens.
            </p>
          </div>
        </div>
        
        <button
          onClick={onReturnToProducts}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Make Another Order
        </button>
      </div>
    </div>
  );
}


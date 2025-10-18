"use client";

import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
}

export default function PaymentError({ error, onRetry }: PaymentErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl p-12 text-center max-w-md border border-gray-700">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Payment Error</h2>
        <div className="bg-red-900/30 rounded-2xl p-6 mb-6 border border-red-700">
          <p className="text-red-300 text-lg font-medium mb-2">{error}</p>
          <p className="text-gray-300 text-sm">
            Don't worry, your payment was not processed. Please try again.
          </p>
        </div>
        
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}

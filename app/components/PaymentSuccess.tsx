"use client";

import React from 'react';
import { CheckCircle, Clock, Home, ArrowLeft } from 'lucide-react';
import { OrderData } from '../../types';

interface PaymentSuccessProps {
  orderData: OrderData;
  onReturnToProducts: () => void;
}

export default function PaymentSuccess({ orderData, onReturnToProducts }: PaymentSuccessProps) {
  // Check if order was placed outside business delivery hours
  const isOutsideBusinessHours = () => {
    const now = new Date();
    const texasTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    const day = texasTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = texasTime.getHours();
    const minute = texasTime.getMinutes();
    const time = hour * 60 + minute;

    // Saturday & Sunday: All day delivery available
    if (day === 0 || day === 6) return false;

    // Monday - Friday: 5:00 PM to 10:30 PM Texas time
    const start = 17 * 60;       // 17:00 (5:00 PM)
    const end = 22 * 60 + 30;    // 22:30 (10:30 PM)
    return time < start || time > end;
  };

  const outsideHours = isOutsideBusinessHours();
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
          
          <div className="flex items-center justify-center gap-3 bg-blue-900/30 rounded-lg p-4 border border-blue-700">
            <Clock className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <p className="text-sm text-blue-300">Estimated time:</p>
              <p className="text-lg font-semibold text-blue-200">
                {outsideHours ? 'Next business day' : '5-15 minutes'}
              </p>
            </div>
          </div>
        </div>
        
        {outsideHours && (
          <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-700 mb-6">
            <div className="text-left">
              <p className="text-sm text-amber-300 font-semibold mb-2">⚠️ Order placed outside delivery hours</p>
              <p className="text-xs text-amber-200 mb-2">
                <span className="font-semibold">Delivery Hours:</span> Mon-Fri 5:00 PM - 10:30 PM, Sat-Sun All Day
              </p>
              <p className="text-xs text-amber-200">
                Your order will be delivered as soon as possible when the store opens.
              </p>
            </div>
          </div>
        )}
        
        <p className="text-gray-300 text-lg mb-8">
          {outsideHours 
            ? 'We\'ll notify you when your order is ready for delivery. Thank you for your purchase!'
            : 'We\'ll notify you when your order is ready. Thank you for your purchase!'
          }
        </p>
        
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


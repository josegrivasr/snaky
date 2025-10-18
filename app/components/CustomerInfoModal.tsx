"use client";

import React, { useState } from 'react';
import { OrderData } from '../../types';

interface CustomerInfoModalProps {
  isOpen: boolean;
  orderData: OrderData;
  onOrderDataChange: (data: OrderData) => void;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export default function CustomerInfoModal({ 
  isOpen, 
  orderData, 
  onOrderDataChange, 
  onClose, 
  onConfirm, 
  isProcessing 
}: CustomerInfoModalProps) {
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    onOrderDataChange({ ...orderData, email });
    
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const isFormValid = () => {
    return orderData.name.trim() !== '' && 
           orderData.apartment.trim() !== '' && 
           orderData.email.trim() !== '' && 
           validateEmail(orderData.email) &&
           !emailError;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-none sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2 sm:mb-3">Delivery Information</h2>
          <p className="text-gray-600 text-sm sm:text-base">Please provide your details for delivery</p>
        </div>
        
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={orderData.name}
              onChange={(e) => onOrderDataChange({ ...orderData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50/50"
              placeholder="Enter your full name"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">Apartment Number</label>
            <input
              type="text"
              value={orderData.apartment}
              onChange={(e) => onOrderDataChange({ ...orderData, apartment: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-gray-50/50"
              placeholder="e.g., 301, 4B, etc."
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={orderData.email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 border rounded-2xl text-gray-900 focus:outline-none transition-all duration-200 bg-gray-50/50 ${
                emailError ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="your.email@example.com"
              disabled={isProcessing}
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {emailError}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 border border-gray-200"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isFormValid() || isProcessing}
            className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

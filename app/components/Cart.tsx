"use client";

import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';

interface BasketProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, change: number) => void;
  onRemoveFromCart: (id: string) => void;
  onProceedToCheckout: () => void;
}

export default function Basket({ cart, onUpdateQuantity, onRemoveFromCart, onProceedToCheckout }: BasketProps) {
  const getTotalPrice = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  }, [cart]);

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile Basket at Top */}
      <div className="lg:hidden mb-4">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-2xl border-2 border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              BASKET ({cart.length})
            </h3>
            <span className="text-lg font-black text-emerald-400 font-mono">${getTotalPrice}</span>
          </div>
          
          {/* Scrollable Basket Items */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {cart.map(item => (
              <div key={item.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3 border border-slate-600">
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm">
                  {item.image.startsWith('http') ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <span 
                    className={`text-lg ${item.image.startsWith('http') ? 'hidden' : 'block'}`}
                  >
                    {item.image}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-100 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-emerald-300 font-mono">${item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-sm w-6 text-center text-slate-100">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => onRemoveFromCart(item.id)}
                  className="bg-slate-600 text-slate-300 p-1.5 rounded-lg hover:bg-slate-500 active:bg-slate-700 transition-all duration-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={onProceedToCheckout}
            className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-bold text-base hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            💳 PAY NOW
          </button>
        </div>
      </div>

      {/* Desktop Basket Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r-4 border-slate-600 shadow-2xl z-40 flex flex-col hidden lg:flex">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 border-b-4 border-slate-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            BASKET
          </h3>
          <span className="bg-white text-emerald-600 px-3 py-1 rounded-full font-bold text-sm shadow-lg">
            {cart.length}
          </span>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-800 to-slate-900">
        {cart.map(item => (
          <div key={item.id} className="bg-slate-700/50 rounded-xl p-3 border border-slate-600 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
                {item.image.startsWith('http') ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <span 
                  className={`text-xl ${item.image.startsWith('http') ? 'hidden' : 'block'}`}
                >
                  {item.image}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-100 text-sm truncate">{item.name}</p>
                <p className="text-xs text-emerald-300 font-mono">${item.price} each</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-sm w-8 text-center text-slate-100 bg-slate-600 rounded px-2 py-1">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">Subtotal</p>
                <p className="text-sm font-bold text-emerald-400 font-mono">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => onRemoveFromCart(item.id)}
              className="w-full mt-2 bg-slate-600 text-slate-300 py-2 rounded-lg text-xs hover:bg-slate-500 active:bg-slate-700 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Footer with Total and Pay Button */}
      <div className="bg-slate-900 border-t-4 border-slate-600 p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-slate-100">TOTAL:</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">${getTotalPrice}</span>
        </div>
        <button
          onClick={onProceedToCheckout}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          💳 PAY NOW
        </button>
      </div>
    </div>
    </>
  );
}

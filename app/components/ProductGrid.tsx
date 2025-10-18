"use client";

import React from 'react';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cart?: any[]; // Add cart to check quantities
}

export default function ProductGrid({ products, onAddToCart, cart = [] }: ProductGridProps) {
  // Create a map for O(1) cart lookups instead of O(n) for each product
  const cartMap = React.useMemo(() => {
    const map = new Map();
    cart.forEach(item => map.set(item.id, item.quantity));
    return map;
  }, [cart]);

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-8 shadow-2xl border-4 sm:border-8 border-gray-700">
      <div className="bg-gradient-to-b from-blue-50/5 to-transparent rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 border-2 sm:border-4 border-gray-600 backdrop-blur-sm">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {products.map(product => {
            const quantityInCart = cartMap.get(product.id) || 0;
            const availableStock = product.stock - quantityInCart;
            const isOutOfStock = product.stock === 0;
            const isMaxInCart = quantityInCart >= product.stock;
            
            return (
              <div
                key={product.id}
                className={`relative bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transform transition hover:scale-105 hover:shadow-2xl border-2 flex flex-col ${
                  isOutOfStock 
                    ? 'border-red-400 opacity-75' 
                    : quantityInCart > 0 
                    ? product.stock > 10
                      ? 'border-emerald-400 shadow-emerald-400/50 shadow-2xl ring-2 ring-emerald-400/30'
                      : product.stock > 5
                      ? 'border-amber-400 shadow-amber-400/50 shadow-2xl ring-2 ring-amber-400/30'
                      : 'border-orange-400 shadow-orange-400/50 shadow-2xl ring-2 ring-orange-400/30'
                    : 'border-slate-600'
                }`}
                style={{ minHeight: '280px', maxHeight: '320px' }}
              >
                {/* Position Badge */}
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-slate-900/95 text-emerald-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono font-bold text-xs sm:text-sm border border-emerald-400 z-20 shadow-lg">
                  {product.position}
                </div>
                
                {/* Image Section - Flexible */}
                <div className={`p-2 sm:p-3 flex items-center justify-center flex-1 ${
                  quantityInCart > 0 
                    ? product.stock > 10
                      ? 'bg-emerald-50'
                      : product.stock > 5
                      ? 'bg-amber-50'
                      : 'bg-orange-50'
                    : 'bg-white'
                }`}>
                  {product.image.startsWith('http') ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '120px' }}
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`text-4xl sm:text-5xl md:text-6xl ${product.image.startsWith('http') ? 'hidden' : 'block'}`}
                  >
                    {product.image}
                  </div>
                </div>
                
                {/* Info Section - Fixed Bottom */}
                <div className="p-2 sm:p-3 text-center flex flex-col justify-end">
                  {/* Product Title */}
                  <h3 className="text-slate-100 font-bold text-sm sm:text-base mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {/* Price and Stock Row */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-emerald-400 font-black text-sm sm:text-base font-mono">
                      ${product.price}
                    </div>
                    <div className={`px-1.5 py-0.5 rounded-full font-bold text-xs ${
                      product.stock > 10 ? 'bg-emerald-500 text-white' : 
                      product.stock > 5 ? 'bg-amber-500 text-white' : 
                      product.stock > 0 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {product.stock} in stock
                    </div>
                  </div>

                  {/* Cart quantity indicator */}
                  {quantityInCart > 0 && (
                    <div className="text-center text-emerald-300 text-xs mb-2">
                      In basket: {quantityInCart}
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock || isMaxInCart}
                    className={`select-btn w-full py-2 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg ${
                      isOutOfStock
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : isMaxInCart
                        ? 'bg-amber-600 text-white cursor-not-allowed hover:bg-amber-700'
                        : product.stock > 10
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transform hover:scale-105 hover:shadow-xl'
                        : product.stock > 5
                        ? 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transform hover:scale-105 hover:shadow-xl'
                        : 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transform hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {isOutOfStock 
                      ? 'SOLD OUT' 
                      : isMaxInCart 
                      ? 'MAX IN BASKET' 
                      : 'SELECT'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}

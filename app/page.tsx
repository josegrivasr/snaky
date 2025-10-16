"use client";

import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, CheckCircle } from 'lucide-react';

const VendingMachine = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Doritos', price: 2.50, stock: 15, image: '🌮', position: 'A1' },
    { id: 2, name: 'Cheetos', price: 2.50, stock: 14, image: '🧀', position: 'A2' },
    { id: 3, name: 'Pringles', price: 3.50, stock: 8, image: '🥫', position: 'A3' },
    { id: 4, name: 'Lays', price: 2.25, stock: 20, image: '🥔', position: 'A4' },
    { id: 5, name: 'Ruffles', price: 2.50, stock: 12, image: '🍟', position: 'A5' },
    { id: 6, name: 'Kit Kat', price: 1.75, stock: 12, image: '🍫', position: 'B1' },
    { id: 7, name: 'Snickers', price: 1.75, stock: 16, image: '🥜', position: 'B2' },
    { id: 8, name: 'M&Ms', price: 1.50, stock: 25, image: '🍬', position: 'B3' },
    { id: 9, name: 'Twix', price: 1.75, stock: 18, image: '🍪', position: 'B4' },
    { id: 10, name: 'Milky Way', price: 1.50, stock: 15, image: '🌌', position: 'B5' },
    { id: 11, name: 'Oreo', price: 2.25, stock: 18, image: '🍪', position: 'C1' },
    { id: 12, name: 'Chips Ahoy', price: 2.50, stock: 14, image: '🍪', position: 'C2' },
    { id: 13, name: 'Pop Tarts', price: 2.00, stock: 10, image: '🧇', position: 'C3' },
    { id: 14, name: 'Granola Bar', price: 2.25, stock: 16, image: '🥜', position: 'C4' },
    { id: 15, name: 'Trail Mix', price: 3.00, stock: 11, image: '🥜', position: 'C5' },
    { id: 16, name: 'Coca-Cola', price: 2.00, stock: 20, image: '🥤', position: 'D1' },
    { id: 17, name: 'Pepsi', price: 2.00, stock: 18, image: '🥤', position: 'D2' },
    { id: 18, name: 'Sprite', price: 2.00, stock: 15, image: '🥤', position: 'D3' },
    { id: 19, name: 'Fanta', price: 2.00, stock: 14, image: '🧃', position: 'D4' },
    { id: 20, name: 'Dr Pepper', price: 2.00, stock: 12, image: '🥤', position: 'D5' },
    { id: 21, name: 'Red Bull', price: 3.50, stock: 10, image: '🔋', position: 'E1' },
    { id: 22, name: 'Monster', price: 3.50, stock: 12, image: '⚡', position: 'E2' },
    { id: 23, name: 'Gatorade', price: 2.75, stock: 16, image: '🧃', position: 'E3' },
    { id: 24, name: 'Powerade', price: 2.75, stock: 14, image: '💧', position: 'E4' },
    { id: 25, name: 'V8 Energy', price: 3.25, stock: 8, image: '🍅', position: 'E5' },
    { id: 26, name: 'Coca-Cola 2L', price: 4.50, stock: 6, image: '🥤', position: 'F1' },
    { id: 27, name: 'Pepsi 2L', price: 4.50, stock: 5, image: '🥤', position: 'F2' },
    { id: 28, name: 'Sprite 2L', price: 4.50, stock: 4, image: '🥤', position: 'F3' },
    { id: 29, name: 'Fanta 2L', price: 4.50, stock: 6, image: '🧃', position: 'F4' },
    { id: 30, name: 'Mountain Dew 2L', price: 4.50, stock: 5, image: '🥤', position: 'F5' },
  ]);

  interface CartItem {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string;
    position: string;
    quantity: number;
  }

  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState('products');
  const [orderData, setOrderData] = useState({ name: '', apartment: '', notification: 'email' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const addToCart = (product: typeof products[0]) => {
    if (product.stock === 0) return;
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        return newQty > 0 && newQty <= item.stock ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const processOrder = () => {
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      return cartItem ? { ...product, stock: product.stock - cartItem.quantity } : product;
    });
    setProducts(updatedProducts);
    
    setShowSuccess(true);
    setCart([]);
    setOrderData({ name: '', apartment: '', notification: 'email' });
    
    setTimeout(() => {
      setShowSuccess(false);
      setView('products');
    }, 3000);
  };

  const updateStock = (id: number, newStock: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: parseInt(newStock) || 0 } : p));
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md animate-bounce">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Pedido Confirmado!</h2>
          <p className="text-gray-600 text-lg">
            Te notificaremos cuando tu orden esté lista. ¡Gracias por tu compra!
          </p>
        </div>
      </div>
    );
  }

  if (adminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 sm:w-10 sm:h-10" />
              Panel de Administración
            </h1>
            <button
              onClick={() => setAdminMode(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Salir
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="text-5xl sm:text-6xl text-center mb-4">{product.image}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">{product.name}</h3>
                <p className="text-center text-gray-600 mb-4">Posición: {product.position}</p>
                <div className="flex items-center justify-center gap-4">
                  <label className="text-gray-700 font-semibold">Stock:</label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateStock(product.id, e.target.value)}
                    className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold"
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 border-2 sm:border-4 border-gray-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg tracking-wider">
            🎰 SNACK VENDING
          </h1>
          <p className="text-white text-sm sm:text-base md:text-xl font-bold">Selecciona tu código | Disponible 24/7</p>
          <button
            onClick={() => setAdminMode(true)}
            className="mt-2 text-white text-xs opacity-30 hover:opacity-100"
          >
            ⚙️
          </button>
        </div>

        {view === 'products' ? (
          <>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-8 shadow-2xl border-4 sm:border-8 border-gray-700">
              <div className="bg-gradient-to-b from-blue-50/5 to-transparent rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 border-2 sm:border-4 border-gray-600 backdrop-blur-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transform transition hover:scale-105 hover:shadow-2xl relative border-2 border-gray-600"
                    >
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black text-green-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-mono font-bold text-xs border border-green-400 z-10">
                        {product.position}
                      </div>
                      
                      <div className="p-2 sm:p-3 md:p-4 text-center">
                        <div className="bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-1 sm:mb-2 backdrop-blur-sm">
                          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 sm:mb-2">{product.image}</div>
                        </div>
                        
                        <h3 className="text-xs sm:text-sm font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-base sm:text-xl md:text-2xl font-black text-green-400 mb-1 sm:mb-2 font-mono">${product.price}</p>
                        
                        <div className="mb-1 sm:mb-2">
                          <div className={`inline-block ${product.stock > 10 ? 'bg-green-500' : product.stock > 5 ? 'bg-yellow-500' : 'bg-red-500'} text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold text-xs shadow-lg`}>
                            {product.stock}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className={`w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition shadow-lg ${
                            product.stock === 0
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 transform hover:scale-105'
                          }`}
                        >
                          {product.stock === 0 ? 'AGOTADO' : 'ELEGIR'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 md:mt-6 bg-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border-2 sm:border-4 border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-green-400 font-mono">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm">LISTO PARA VENDER</span>
                  </div>
                  <div className="hidden sm:block text-xs text-gray-500">|</div>
                  <div className="text-xs sm:text-sm text-gray-400">💳 PAGO RÁPIDO</div>
                </div>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 left-4 sm:left-auto bg-gray-900 border-2 sm:border-4 border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 max-w-md z-50">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    Tu Pedido
                  </h3>
                  <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
                    {cart.length}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-800 p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-gray-700">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">{item.image}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white text-xs sm:text-sm truncate">{item.name}</p>
                          <p className="text-xs text-green-400">${item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="bg-red-500 text-white p-1 rounded-md sm:rounded-lg hover:bg-red-600"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-bold text-sm sm:text-lg w-6 sm:w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-green-500 text-white p-1 rounded-md sm:rounded-lg hover:bg-green-600"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="bg-gray-600 text-white p-1 rounded-md sm:rounded-lg hover:bg-gray-500 ml-1 sm:ml-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="text-base sm:text-lg md:text-xl font-bold text-white">Total:</span>
                    <span className="text-2xl sm:text-2xl md:text-3xl font-black text-green-400 font-mono">${getTotalPrice()}</span>
                  </div>
                  <button
                    onClick={() => setView('checkout')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:from-green-400 hover:to-green-500 transition shadow-lg"
                  >
                    💳 PAGAR AHORA
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Información de Entrega</h2>
            
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-base sm:text-lg">Nombre Completo</label>
                <input
                  type="text"
                  value={orderData.name}
                  onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl text-base sm:text-lg text-gray-900 focus:border-red-500 focus:outline-none"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-base sm:text-lg">Número de Apartamento</label>
                <input
                  type="text"
                  value={orderData.apartment}
                  onChange={(e) => setOrderData({ ...orderData, apartment: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl text-base sm:text-lg text-gray-900 focus:border-red-500 focus:outline-none"
                  placeholder="Ej: 301"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-base sm:text-lg">Notificarme por:</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="email"
                      checked={orderData.notification === 'email'}
                      onChange={(e) => setOrderData({ ...orderData, notification: e.target.value })}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <span className="text-base sm:text-lg text-gray-900">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="sms"
                      checked={orderData.notification === 'sms'}
                      onChange={(e) => setOrderData({ ...orderData, notification: e.target.value })}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <span className="text-base sm:text-lg text-gray-900">Mensaje de texto</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-gray-800">Resumen del Pedido</h3>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm sm:text-base text-gray-900">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-200 mt-3 sm:mt-4 pt-3 sm:pt-4 flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                <span>TOTAL:</span>
                <span className="text-red-600">${getTotalPrice()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setView('products')}
                className="flex-1 bg-gray-500 text-white py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-600 transition"
              >
                VOLVER
              </button>
              <button
                onClick={processOrder}
                disabled={!orderData.name || !orderData.apartment}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-green-700 transition disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                CONFIRMAR PEDIDO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendingMachine;
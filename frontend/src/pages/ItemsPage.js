import React, { useState, useEffect } from 'react';
import { getItems, createOrder } from '../services/api';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getItems();
        setItems(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items. Please try again later.');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // If item already in cart, increase quantity
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { 
              ...cartItem, 
              quantity: cartItem.quantity + 1 > item.stock ? item.stock : cartItem.quantity + 1
            } 
          : cartItem
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    const item = items.find(item => item.id === itemId);
    
    if (quantity > item.stock) {
      quantity = item.stock;
    }
    
    if (quantity < 1) {
      // Remove from cart if quantity is less than 1
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(cartItem => 
      cartItem.id === itemId 
        ? { ...cartItem, quantity } 
        : cartItem
    ));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      setProcessingOrder(true);
      // Format order items as expected by the API - backend expects a direct array
      const orderItems = cart.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,  // Include unit_price from the item
        discount_amount: 0  // Default discount
      }));
      
      // Call the API to create an order with the array directly
      const orderResponse = await createOrder(orderItems);
      
      // Show success message and clear the cart
      setOrderStatus({
        success: true,
        message: `Order placed successfully! Order ID: ${orderResponse.id}`,
        orderId: orderResponse.id
      });
      setCart([]);
    } catch (err) {
      setOrderStatus({
        success: false,
        message: 'Failed to place order. Please try again.'
      });
      console.error('Checkout error:', err);
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Items</h1>
      
      {orderStatus && (
        <div className={`mb-6 p-4 rounded-md ${orderStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p>{orderStatus.message}</p>
          {orderStatus.success && (
            <button 
              onClick={() => setOrderStatus(null)}
              className="mt-2 text-sm underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{item.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                <span className={`text-sm font-medium ${item.stock > 5 ? 'text-green-700' : item.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                  {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <button
                onClick={() => addToCart(item)}
                disabled={item.stock === 0 || (cart.find(cartItem => cartItem.id === item.id)?.quantity || 0) >= item.stock}
                className={`w-full mt-4 py-2 px-4 rounded-md font-medium text-white 
                  ${item.stock === 0 || (cart.find(cartItem => cartItem.id === item.id)?.quantity || 0) >= item.stock
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {item.stock === 0 
                  ? 'Out of Stock' 
                  : (cart.find(cartItem => cartItem.id === item.id)?.quantity || 0) >= item.stock
                    ? 'Max Stock Reached'
                    : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {cart.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded-l-md"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= items.find(i => i.id === item.id).stock}
                    className={`px-2 py-1 rounded-r-md ${item.quantity >= items.find(i => i.id === item.id).stock ? 'bg-gray-300' : 'bg-gray-200'}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-4 flex justify-between font-bold">
              <span>Total:</span>
              <span>${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={processingOrder}
              className={`mt-4 w-full py-2 px-4 ${processingOrder ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-medium rounded-md`}
            >
              {processingOrder ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPage; 
import React, { useState, useEffect } from 'react';
import { getOrders, createOrder } from '../services/api';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading orders...</div>
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
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div>
              <p className="text-yellow-700">No orders found. Start shopping to place your first order!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500">Placed on: {formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Total: ${order.final_amount.toFixed(2)}</div>
                  {order.discount_amount > 0 && (
                    <div className="text-green-600 text-sm">Saved: ${order.discount_amount.toFixed(2)}</div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">Item ID: {item.item_id}</div>
                        <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div>${(item.unit_price * item.quantity).toFixed(2)}</div>
                        {item.discount_amount > 0 && (
                          <div className="text-green-600 text-sm">-${item.discount_amount.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-2 border-t flex justify-between">
                <div>
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="ml-2">${order.total_amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Discount:</span>
                  <span className="ml-2 text-green-600">-${order.discount_amount.toFixed(2)}</span>
                </div>
                <div className="font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="ml-2">${order.final_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage; 
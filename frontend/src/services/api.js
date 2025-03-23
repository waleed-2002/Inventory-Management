import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Items API
export const getItems = async () => {
  try {
    const response = await api.get('/items');
    return response.data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

export const getItem = async (itemId) => {
  try {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error);
    throw error;
  }
};

// Orders API
export const createOrder = async (orderItems) => {
  try {
    const response = await api.post('/orders/', orderItems);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Offers API
export const getOffers = async () => {
  try {
    const response = await api.get('/offers');
    return response.data;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

// Admin Items Management API
export const createItem = async (item) => {
  try {
    const response = await api.post('/items-management', item);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

export const updateItem = async (itemId, item) => {
  try {
    const response = await api.post(`/items-management/${itemId}`, item);
    return response.data;
  } catch (error) {
    console.error(`Error updating item ${itemId}:`, error);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await api.delete(`/items-management/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error);
    throw error;
  }
};

// Admin Offers Management API
export const createOffer = async (offer) => {
  try {
    const response = await api.post('/offers-management', offer);
    return response.data;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const updateOffer = async (offerId, offer) => {
  try {
    const response = await api.post(`/offers-management/${offerId}`, offer);
    return response.data;
  } catch (error) {
    console.error(`Error updating offer ${offerId}:`, error);
    throw error;
  }
};

export const deleteOffer = async (offerId) => {
  try {
    const response = await api.delete(`/offers-management/${offerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting offer ${offerId}:`, error);
    throw error;
  }
}; 
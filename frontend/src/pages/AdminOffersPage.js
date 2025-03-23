import React, { useState, useEffect } from 'react';
import { getOffers, createOffer, updateOffer, deleteOffer, getItems } from '../services/api';

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offer_type: 'percentage',
    discount_value: '',
    min_quantity: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [offersData, itemsData] = await Promise.all([
          getOffers(),
          getItems()
        ]);
        
        setOffers(offersData);
        setItems(itemsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleCategorySelection = (category) => {
    const categoryItems = items
      .filter(item => item.category === category)
      .map(item => item.id);
    
    const allSelected = categoryItems.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      // If all category items are selected, unselect them
      setSelectedItems(selectedItems.filter(id => !categoryItems.includes(id)));
    } else {
      // Otherwise, add all unselected items
      const newSelectedItems = [...selectedItems];
      categoryItems.forEach(id => {
        if (!newSelectedItems.includes(id)) {
          newSelectedItems.push(id);
        }
      });
      setSelectedItems(newSelectedItems);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      if (selectedItems.length === 0) {
        setError('Please select at least one applicable item.');
        return;
      }
      
      const newOffer = {
        name: formData.name,
        description: formData.description,
        offer_type: formData.offer_type,
        discount_value: parseFloat(formData.discount_value),
        min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
        applicable_items: selectedItems,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active
      };
      
      await createOffer(newOffer);
      setIsAddModalOpen(false);
      resetForm();
      fetchOffers();
    } catch (err) {
      setError('Failed to add offer. Please try again.');
    }
  };

  const handleEditOffer = async (e) => {
    e.preventDefault();
    try {
      if (selectedItems.length === 0) {
        setError('Please select at least one applicable item.');
        return;
      }
      
      const updatedOffer = {
        name: formData.name,
        description: formData.description,
        offer_type: formData.offer_type,
        discount_value: parseFloat(formData.discount_value),
        min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
        applicable_items: selectedItems,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active
      };
      
      await updateOffer(currentOffer.id, updatedOffer);
      setIsEditModalOpen(false);
      resetForm();
      fetchOffers();
    } catch (err) {
      setError('Failed to update offer. Please try again.');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteOffer(id);
        fetchOffers();
      } catch (err) {
        setError('Failed to delete offer. Please try again.');
      }
    }
  };

  const fetchOffers = async () => {
    try {
      const data = await getOffers();
      setOffers(data);
    } catch (err) {
      setError('Failed to fetch offers. Please try again.');
    }
  };

  const openEditModal = (offer) => {
    setCurrentOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      offer_type: offer.offer_type,
      discount_value: offer.discount_value.toString(),
      min_quantity: offer.min_quantity ? offer.min_quantity.toString() : '',
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().split('T')[0] : '',
      end_date: offer.end_date ? new Date(offer.end_date).toISOString().split('T')[0] : '',
      is_active: offer.is_active
    });
    setSelectedItems(offer.applicable_items);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      offer_type: 'percentage',
      discount_value: '',
      min_quantity: '',
      start_date: '',
      end_date: '',
      is_active: true
    });
    setSelectedItems([]);
    setCurrentOffer(null);
  };

  const formatOfferDetails = (offer) => {
    switch (offer.offer_type) {
      case 'percentage':
        return `${offer.discount_value}% off`;
      case 'fixed':
        return `$${offer.discount_value.toFixed(2)} off`;
      case 'buy_x_get_y':
        return `Buy ${offer.min_quantity}, Get discount`;
      default:
        return 'Special offer';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Group items by category for selection
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading offers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Offers</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
        >
          Add New Offer
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="space-y-6">
        {offers.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div>
                <p className="text-yellow-700">No offers found. Create your first offer using the "Add New Offer" button.</p>
              </div>
            </div>
          </div>
        ) : (
          offers.map(offer => (
            <div key={offer.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{offer.name}</h2>
                  <p className="text-gray-600 mt-1">{offer.description}</p>
                </div>
                <div className="flex items-start">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    offer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    {formatOfferDetails(offer)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Applicable Items</h3>
                  <p className="text-gray-700">
                    {offer.applicable_items.length} item(s) selected
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="text-gray-700">{formatDate(offer.start_date)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                    <p className="text-gray-700">{formatDate(offer.end_date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
                <button
                  onClick={() => openEditModal(offer)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Add Offer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-900">Add New Offer</h3>
            </div>
            
            <form onSubmit={handleAddOffer} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Offer Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="offer_type">
                      Offer Type
                    </label>
                    <select
                      id="offer_type"
                      name="offer_type"
                      value={formData.offer_type}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount_value">
                      {formData.offer_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                    </label>
                    <input
                      type="number"
                      step={formData.offer_type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      id="discount_value"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="min_quantity">
                      Minimum Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      id="min_quantity"
                      name="min_quantity"
                      value={formData.min_quantity}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">
                        Start Date (Optional)
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_date">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700 text-sm font-bold">Active</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-700 text-sm font-bold mb-2">Applicable Items</h3>
                  
                  <div className="max-h-96 overflow-y-auto border rounded p-4">
                    {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                      <div key={category} className="mb-4">
                        <div className="flex items-center mb-2">
                          <button
                            type="button"
                            onClick={() => handleCategorySelection(category)}
                            className="text-blue-600 text-sm font-medium hover:underline"
                          >
                            {categoryItems.every(item => selectedItems.includes(item.id)) ? 'Deselect All' : 'Select All'}
                          </button>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {category}
                          </span>
                        </div>
                        
                        <div className="ml-4 space-y-2">
                          {categoryItems.map(item => (
                            <div key={item.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`item-${item.id}`}
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemSelection(item.id)}
                                className="mr-2"
                              />
                              <label htmlFor={`item-${item.id}`} className="text-sm">
                                {item.name} - ${item.price.toFixed(2)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    {selectedItems.length} items selected
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Offer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-900">Edit Offer</h3>
            </div>
            
            <form onSubmit={handleEditOffer} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                      Offer Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-offer_type">
                      Offer Type
                    </label>
                    <select
                      id="edit-offer_type"
                      name="offer_type"
                      value={formData.offer_type}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-discount_value">
                      {formData.offer_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                    </label>
                    <input
                      type="number"
                      step={formData.offer_type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      id="edit-discount_value"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-min_quantity">
                      Minimum Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      id="edit-min_quantity"
                      name="min_quantity"
                      value={formData.min_quantity}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-start_date">
                        Start Date (Optional)
                      </label>
                      <input
                        type="date"
                        id="edit-start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-end_date">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        id="edit-end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700 text-sm font-bold">Active</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-700 text-sm font-bold mb-2">Applicable Items</h3>
                  
                  <div className="max-h-96 overflow-y-auto border rounded p-4">
                    {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                      <div key={category} className="mb-4">
                        <div className="flex items-center mb-2">
                          <button
                            type="button"
                            onClick={() => handleCategorySelection(category)}
                            className="text-blue-600 text-sm font-medium hover:underline"
                          >
                            {categoryItems.every(item => selectedItems.includes(item.id)) ? 'Deselect All' : 'Select All'}
                          </button>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {category}
                          </span>
                        </div>
                        
                        <div className="ml-4 space-y-2">
                          {categoryItems.map(item => (
                            <div key={item.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`edit-item-${item.id}`}
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemSelection(item.id)}
                                className="mr-2"
                              />
                              <label htmlFor={`edit-item-${item.id}`} className="text-sm">
                                {item.name} - ${item.price.toFixed(2)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    {selectedItems.length} items selected
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersPage; 
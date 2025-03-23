import React, { useState, useEffect } from 'react';
import { getOffers } from '../services/api';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getOffers();
        setOffers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch offers. Please try again later.');
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

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
    if (!dateString) return 'No expiration';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-semibold text-gray-600">Loading offers...</div>
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
      <h1 className="text-2xl font-bold mb-6">Current Offers</h1>
      
      {offers.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div>
              <p className="text-yellow-700">No active offers at the moment. Check back later!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold text-gray-800">{offer.name}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {formatOfferDetails(offer)}
                  </span>
                </div>
                
                <p className="mt-2 text-gray-600">{offer.description}</p>
                
                {offer.min_quantity && (
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum quantity: {offer.min_quantity}
                  </p>
                )}
                
                {offer.end_date && (
                  <div className="mt-4 bg-yellow-50 px-3 py-2 rounded-md">
                    <p className="text-sm text-yellow-700">
                      <span className="font-medium">Valid until:</span> {formatDate(offer.end_date)}
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    This offer will be automatically applied at checkout when conditions are met.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div>
            <p className="text-blue-700">
              <span className="font-medium">How offers work:</span> Offers are automatically applied to your order during checkout when conditions are met. You'll always get the best available discount!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage; 
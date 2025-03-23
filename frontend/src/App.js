import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Pages
import ItemsPage from './pages/ItemsPage';
import OrderPage from './pages/OrderPage';
import OffersPage from './pages/OffersPage';
import AdminItemsPage from './pages/AdminItemsPage';
import AdminOffersPage from './pages/AdminOffersPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <div>
                  <Link to="/" className="flex items-center py-4">
                    <span className="font-semibold text-gray-700 text-lg">Inventory Management</span>
                  </Link>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <Link to="/" className="py-4 px-2 text-blue-500 border-b-2 border-blue-500 font-semibold">Items</Link>
                  <Link to="/orders" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">Orders</Link>
                  <Link to="/offers" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">Offers</Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin/items" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">Manage Items</Link>
                      <Link to="/admin/offers" className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300">Manage Offers</Link>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => setIsAdmin(!isAdmin)} 
                  className={`px-4 py-2 rounded ${isAdmin ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                >
                  {isAdmin ? 'Exit Admin Mode' : 'Admin Mode'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<ItemsPage />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/offers" element={<OffersPage />} />
            {isAdmin && (
              <>
                <Route path="/admin/items" element={<AdminItemsPage />} />
                <Route path="/admin/offers" element={<AdminOffersPage />} />
              </>
            )}
          </Routes>
        </div>

        <footer className="bg-white py-4 shadow-inner">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-center text-gray-500">© 2025 Inventory Management System</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

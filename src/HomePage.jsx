// In: /src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { FaPlus, FaSortDown } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// Use your backend's URL
const API_BASE_URL = 'http://localhost:5011/api';

const HomePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  // Fetch all sales orders when the page loads
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/salesorder`);
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- Navigation Handlers ---

  // 1. Navigate to the blank Sales Order page (Screen 1) [cite: 121]
  const handleAddNew = () => {
    navigate('/salesorder');
  };

  // 2. Navigate to an existing order to edit it [cite: 123]
  const handleRowClick = (id) => {
    navigate(`/salesorder/${id}`);
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading orders...</p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* --- 1 & 2. HEADER AND "ADD NEW" BUTTON --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Home</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150"
        >
          <FaPlus className="mr-2" />
          Add New
        </button>
      </div>

      {/* --- 3. ORDERS GRID --- */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {/* I have defined 7 columns as requested  */}
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Invoice No.
              </th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Invoice Date
              </th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Customer Name
              </th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Reference
              </th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Total Excl
              </th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Total Tax
              </th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FaSortDown className="inline mr-1" />Total Incl
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                onDoubleClick={() => handleRowClick(order.id)} // [cite: 123]
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.invoiceNo}</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(order.invoiceDate).toLocaleDateString()}
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{order.customerName}</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{order.referenceNo}</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-700 text-right">{order.totalExcl.toFixed(2)}</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-700 text-right">{order.totalTax.toFixed(2)}</td>
                <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">{order.totalIncl.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;
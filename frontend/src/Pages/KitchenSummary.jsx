import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const KitchenSummary = () => {
  const { state: data } = useLocation();
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>No data submitted. Please fill the form first.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Form
        </button>
      </div>
    );
  }

  const totalCost = data.quantity * data.price;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-50 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">Kitchen Order Summary</h2>

      <div className="space-y-3 text-lg text-gray-800">
        <p><strong>🍽 Food Name:</strong> {data.foodName}</p>
        <p><strong>🧾 Food Type:</strong> {data.foodType}</p>
        <p><strong>🔢 Quantity:</strong> {data.quantity}</p>
        <p><strong>💰 Price per Unit:</strong> Rs. {data.price}</p>
        <p><strong>📅 Date:</strong> {data.date}</p>
      </div>

      <div className="mt-6 text-xl font-bold text-green-700 border-t pt-4">
        ✅ Total Cost: Rs. {totalCost.toFixed(2)}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Add Another Item
      </button>
    </div>
  );
};

export default KitchenSummary;

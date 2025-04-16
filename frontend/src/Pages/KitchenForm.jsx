import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const KitchenForm = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    foodType: '',
    quantity: '',
    price: '',
    date: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
    };

    try {
      // Save to MongoDB
      await axios.post('http://localhost:5000/api/kitchen', {
        ...dataToSend,
        totalCost: dataToSend.quantity * dataToSend.price, // also store in DB
      });

      // Navigate to summary page with data
      navigate('/kitchen-summary', { state: dataToSend });
    } catch (error) {
      console.error(error);
      alert('Failed to save item');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Kitchen Management</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Food Name</label>
          <input
            type="text"
            name="foodName"
            placeholder="Eg: Chicken Curry"
            value={formData.foodName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Food Type</label>
          <select
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Select Type --</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="beverage">Beverage</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            placeholder="Eg: 3"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Price per Unit (Rs)</label>
          <input
            type="number"
            name="price"
            placeholder="Eg: 250"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default KitchenForm;
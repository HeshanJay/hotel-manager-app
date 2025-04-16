import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const KitchenSummary = () => {
  const { state: data } = useLocation();
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>No order data submitted. Please fill the form first.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Order Form
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-50 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
        Kitchen Order Summary
      </h2>
      <div className="space-y-3 text-lg text-gray-800">
        <p><strong>Order ID:</strong> {data.orderId}</p>
        <p><strong>Item Category:</strong> {data.itemCategory}</p>
        <p><strong>Item Type:</strong> {data.itemType}</p>

        {data.itemNames && data.itemNames.length > 0 && (
          <div>
            <strong>Items Ordered:</strong>
            <ul className="list-disc list-inside mt-1">
              {data.itemNames.map((itm, idx) => (
                <li key={idx}>
                  {itm.name} — {itm.quantity} {data.unit} @ Rs. {itm.price} each
                </li>
              ))}
            </ul>
          </div>
        )}

        <p><strong>Order Date:</strong> {data.orderDate}</p>
        <p><strong>Expected Delivery Date:</strong> {data.expectedDeliveryDate}</p>
        <p><strong>Supplier Name:</strong> {data.supplierName}</p>
        <p><strong>Supplier Contact:</strong> {data.supplierContact}</p>
        <p><strong>Payment Status:</strong> {data.paymentStatus}</p>
        <p><strong>Ordered By:</strong> {data.orderedBy}</p>
        {data.remarks && <p><strong>Remarks:</strong> {data.remarks}</p>}
      </div>

      <div className="mt-6 text-xl font-bold text-green-700 border-t pt-4">
        Total Cost: Rs. {data.totalCost.toFixed(2)}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Add Another Order
      </button>
    </div>
  );
};

export default KitchenSummary;

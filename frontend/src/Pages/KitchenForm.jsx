import React, { useState, useEffect } from "react";

const KitchenForm = () => {
  const today = new Date().toISOString().split("T")[0];

  const itemOptionsMapping = {
    Food: {
      Vegetables: [
        "Tomato", "Onion", "Potato", "Carrot", "Cabbage",
        "Spinach", "Broccoli", "Pepper", "Garlic", "Ginger",
        "Eggplant", "Lettuce", "Peas", "Corn", "Beans",
      ],
      Fruits: [
        "Apple", "Banana", "Orange", "Mango", "Grapes",
        "Pineapple", "Strawberry", "Watermelon", "Papaya", "Kiwi",
      ],
      Meat: ["Chicken", "Beef", "Pork", "Lamb", "Turkey"],
    },
    Beverage: {
      Water: ["Water"],
      "Soft Drinks": [
        "Coke", "Pepsi", "Sprite", "Fanta", "7Up",
        "Mountain Dew", "Dr Pepper", "RC Cola", "Mirinda", "Schweppes",
      ],
    },
    Equipment: {
      "Large Appliances": [
        "Oven", "Refrigerator", "Freezer", "Dishwasher", "Warming Drawer",
      ],
      "Small Appliances": [
        "Microwave", "Blender", "Toaster", "Coffee Machine", "Mixer",
        "Food Processor", "Steamer", "Panini Press",
      ],
      Cookware: ["Pot", "Pan", "Skillet", "Fryer", "Steamer"],
      "Utensils & Tools": [
        "Knife Set", "Cutting Board", "Spatula", "Tongs", "Ladle", "Whisk",
      ],
      "Storage & Service": ["Dish Cart", "Storage Container", "Shelving Unit"],
    },
  };

  const itemTypeOptions = {
    Food: ["Vegetables", "Fruits", "Meat"],
    Beverage: ["Water", "Soft Drinks"],
    Equipment: [
      "Large Appliances",
      "Small Appliances",
      "Cookware",
      "Utensils & Tools",
      "Storage & Service",
    ],
  };

  const [formData, setFormData] = useState({
    orderId: "",
    itemCategory: "",
    itemType: "",
    itemNames: [], // { name, quantity, price }
    orderDate: "",
    expectedDeliveryDate: "",
    supplierName: "",
    supplierContact: "",
    paymentStatus: "",
    orderedBy: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Auto-generate Order ID once
  useEffect(() => {
    setFormData((p) => ({ ...p, orderId: "ORD-" + Date.now() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "itemCategory") {
      setFormData((prev) => ({
        ...prev,
        itemCategory: value,
        itemType: "",
        itemNames: [],
      }));
    } else if (name === "itemType") {
      setFormData((prev) => ({ ...prev, itemType: value, itemNames: [] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = (e) => {
    const newItem = e.target.value;
    setErrors((prev) => ({ ...prev, itemNames: "" }));
    if (!newItem) return;
    if (formData.itemNames.some((i) => i.name === newItem)) {
      setErrors((prev) => ({ ...prev, itemNames: `${newItem} is already selected.` }));
    } else if (formData.itemNames.length >= 10) {
      setErrors((prev) => ({ ...prev, itemNames: "Cannot select above 10 items." }));
    } else {
      setFormData((prev) => ({
        ...prev,
        itemNames: [...prev.itemNames, { name: newItem, quantity: "", price: "" }],
      }));
    }
    e.target.value = "";
  };

  const handleSupplierContactBlur = () => {
    const c = formData.supplierContact.trim();
    if (/^[0-9]+$/.test(c)) {
      if (!/^[0-9]{10}$/.test(c)) {
        setErrors((prev) => ({ ...prev, supplierContact: "Enter the valid contact number" }));
      }
    } else {
      if (!/^\S+@\S+\.\S+$/.test(c)) {
        setErrors((prev) => ({ ...prev, supplierContact: "Enter the valid email" }));
      }
    }
  };

  const validateForm = () => {
    const newErr = {};

    // Required fields
    [
      "itemCategory",
      "itemType",
      "orderDate",
      "expectedDeliveryDate",
      "supplierName",
      "supplierContact",
      "paymentStatus",
      "orderedBy",
    ].forEach((f) => {
      if (!formData[f]) newErr[f] = "This field is required.";
    });

    // Minimum items
    if (formData.itemType !== "Water" && formData.itemNames.length < 5) {
      newErr.itemNames = "Minimum 5 items should be selected.";
    }

    // Negative value check
    if (
      formData.itemNames.some(
        (itm) => Number(itm.quantity) < 0 || Number(itm.price) < 0
      )
    ) {
      newErr.itemNames = "negative values are not valid";
    }

    // Date in past
    if (formData.orderDate && formData.orderDate < today) {
      newErr.orderDate = "Order date cannot be in the past.";
    }
    if (
      formData.expectedDeliveryDate &&
      formData.expectedDeliveryDate < today
    ) {
      newErr.expectedDeliveryDate = "Delivery date cannot be in the past.";
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalCost = formData.itemNames.reduce(
      (sum, { quantity, price }) =>
        sum + Number(quantity) * Number(price),
      0
    );
    setSummaryData({ ...formData, totalCost });
    setShowModal(true);
  };

  const grandTotal = formData.itemNames.reduce(
    (sum, { quantity, price }) => sum + Number(quantity) * Number(price),
    0
  );

  const renderItemNamesField = () => {
    if (!formData.itemCategory || !formData.itemType) return null;
    const options =
      itemOptionsMapping[formData.itemCategory]?.[formData.itemType] || [];

    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Item Name
        </label>
        <select
          id="itemNameSelect"
          defaultValue=""
          onChange={handleAddItem}
          className={`w-full p-3 rounded-md border ${
            errors.itemNames ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">-- Select an Item --</option>
          {options.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        {errors.itemNames && (
          <p className="mt-1 text-sm text-red-600">{errors.itemNames}</p>
        )}

        <div className="mt-4 space-y-3">
          {formData.itemNames.map((itm, idx) => {
            const q = Number(itm.quantity) || 0;
            const p = Number(itm.price) || 0;
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-700">{itm.name}</span>
                <input
                  id={`itemQty-${itm.name}`}
                  type="number"
                  placeholder="Qty"
                  className="w-24 p-2 rounded-md border border-gray-300"
                  value={itm.quantity}
                  onChange={(e) => {
                    const arr = [...formData.itemNames];
                    arr[idx].quantity = e.target.value;
                    setFormData({ ...formData, itemNames: arr });
                  }}
                />
                <input
                  id={`itemPrice-${itm.name}`}
                  type="number"
                  placeholder="Price"
                  className="w-24 p-2 rounded-md border border-gray-300"
                  value={itm.price}
                  onChange={(e) => {
                    const arr = [...formData.itemNames];
                    arr[idx].price = e.target.value;
                    setFormData({ ...formData, itemNames: arr });
                  }}
                />
                <span className="ml-2 text-sm font-medium">
                  Total: Rs. {(q * p).toFixed(2)}
                </span>
                <button
                  id={`itemDelete-${itm.name}`}
                  type="button"
                  className="text-red-600 font-bold text-lg"
                  onClick={() => {
                    const arr = formData.itemNames.filter((_, i) => i !== idx);
                    setFormData({ ...formData, itemNames: arr });
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
          {!!formData.itemNames.length && (
            <div id="itemsGrandTotal" className="text-lg font-semibold mt-4">
              Grand Total: Rs. {grandTotal.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ml-64 pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 bg-gray-50">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center">
          Kitchen Supplies Ordering System
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-xl shadow-lg"
        >
          {/* Order ID */}
          <div>
            <label
              htmlFor="orderId"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Order ID
            </label>
            <input
              id="orderId"
              name="orderId"
              type="text"
              value={formData.orderId}
              readOnly
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Item Category */}
          <div>
            <label
              htmlFor="itemCategory"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Item Category
            </label>
            <select
              id="itemCategory"
              name="itemCategory"
              value={formData.itemCategory}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.itemCategory ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Select Item Category --</option>
              <option value="Food">Food</option>
              <option value="Beverage">Beverage</option>
              <option value="Equipment">Equipment</option>
            </select>
            {errors.itemCategory && (
              <p className="mt-1 text-sm text-red-600">
                {errors.itemCategory}
              </p>
            )}
          </div>

          {/* Item Type */}
          {formData.itemCategory && (
            <div>
              <label
                htmlFor="itemType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Item Type
              </label>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${
                  errors.itemType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Select Item Type --</option>
                {itemTypeOptions[formData.itemCategory].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.itemType && (
                <p className="mt-1 text-sm text-red-600">{errors.itemType}</p>
              )}
            </div>
          )}

          {/* Items + Qty/Price */}
          {renderItemNamesField()}

          {/* Order Date */}
          <div>
            <label
              htmlFor="orderDate"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Order Date
            </label>
            <input
              id="orderDate"
              name="orderDate"
              type="date"
              value={formData.orderDate}
              onChange={handleChange}
              min={today}
              className={`w-full p-3 rounded-md border ${
                errors.orderDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.orderDate && (
              <p className="mt-1 text-sm text-red-600">{errors.orderDate}</p>
            )}
          </div>

          {/* Expected Delivery Date */}
          <div>
            <label
              htmlFor="expectedDeliveryDate"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Expected Delivery Date
            </label>
            <input
              id="expectedDeliveryDate"
              name="expectedDeliveryDate"
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
              min={today}
              className={`w-full p-3 rounded-md border ${
                errors.expectedDeliveryDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.expectedDeliveryDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.expectedDeliveryDate}
              </p>
            )}
          </div>

          {/* Supplier Name */}
          <div>
            <label
              htmlFor="supplierName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Supplier Name
            </label>
            <input
              id="supplierName"
              name="supplierName"
              type="text"
              value={formData.supplierName}
              onChange={handleChange}
              placeholder="E.g., ABC Suppliers"
              className={`w-full p-3 rounded-md border ${
                errors.supplierName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.supplierName && (
              <p className="mt-1 text-sm text-red-600">{errors.supplierName}</p>
            )}
          </div>
          {/* Supplier Contact */}
          <div>
            <label
              htmlFor="supplierContact"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Supplier Contact
            </label>
            <input
              id="supplierContact"
              name="supplierContact"
              type="text"
              value={formData.supplierContact}
              onChange={handleChange}
              onBlur={handleSupplierContactBlur}
              placeholder="E.g., 9876543210 or email@example.com"
              className={`w-full p-3 rounded-md border ${
                errors.supplierContact ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.supplierContact && (
              <p className="mt-1 text-sm text-red-600">
                {errors.supplierContact}
              </p>
            )}
          </div>

          {/* Payment Status */}
          <div>
            <label
              htmlFor="paymentStatus"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Payment Status
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className={`w-full p-3 rounded-md border ${
                errors.paymentStatus ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Select Payment Status --</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
            {errors.paymentStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentStatus}</p>
            )}
          </div>

          {/* Ordered By */}
          <div>
            <label
              htmlFor="orderedBy"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Ordered By
            </label>
            <input
              id="orderedBy"
              name="orderedBy"
              type="text"
              value={formData.orderedBy}
              onChange={handleChange}
              placeholder="E.g., John Doe"
              className={`w-full p-3 rounded-md border ${
                errors.orderedBy ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.orderedBy && (
              <p className="mt-1 text-sm text-red-600">{errors.orderedBy}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows="4"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300"
              placeholder="Any special instructions or remarks..."
            />
          </div>

          <button
            id="submitOrder"
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700"
          >
            Submit Order
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
{showModal && summaryData && (
  <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
      <div className="text-center p-6 border-b border-gray-200">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-gray-800 mt-4">Order Confirmed!</h3>
        <p id="orderSuccess" className="text-green-600 font-semibold mt-2">
          Your order has been placed
        </p>
      </div>

      <div className="overflow-y-auto p-6 flex-1" style={{ maxHeight: "70vh" }}>
        <p><strong>Order ID:</strong> {summaryData.orderId}</p>
        <p><strong>Category:</strong> {summaryData.itemCategory}</p>
        <p><strong>Type:</strong> {summaryData.itemType}</p>

        {/* ← Items and Grand Total immediately under Type */}
        <div className="mt-4">
          <strong>Items:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-1 max-h-32 overflow-y-auto">
            {summaryData.itemNames.map((itm, i) => (
              <li key={i}>
                <strong>{itm.name}</strong> — Qty: {itm.quantity}, Price: Rs. {itm.price}
              </li>
            ))}
          </ul>
          <p className="mt-2"><strong>Grand Total:</strong> Rs. {summaryData.totalCost.toFixed(2)}</p>
        </div>

        {/* then the rest of the fields */}
        <p className="mt-4"><strong>Order Date:</strong> {summaryData.orderDate}</p>
        <p><strong>Expected Delivery:</strong> {summaryData.expectedDeliveryDate}</p>
        <p><strong>Supplier Name:</strong> {summaryData.supplierName}</p>
        <p><strong>Supplier Contact:</strong> {summaryData.supplierContact}</p>
        <p><strong>Payment Status:</strong> {summaryData.paymentStatus}</p>
        <p><strong>Ordered By:</strong> {summaryData.orderedBy}</p>
        {summaryData.remarks && (
          <p><strong>Remarks:</strong> {summaryData.remarks}</p>
        )}
      </div>

      <div className="p-6 text-center">
        <button
          onClick={() => { setShowModal(false); window.location.reload(); }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl"
        >
          Close Summary
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default KitchenForm;

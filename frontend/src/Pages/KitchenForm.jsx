import React, { useState, useEffect } from "react";
import axios from "axios";

const KitchenForm = () => {
  const today = new Date().toISOString().split("T")[0];

  const itemOptionsMapping = {
    Food: {
      Vegetables: [
        "Tomato",
        "Onion",
        "Potato",
        "Carrot",
        "Cabbage",
        "Spinach",
        "Broccoli",
        "Pepper",
        "Garlic",
        "Ginger",
        "Eggplant",
        "Lettuce",
        "Peas",
        "Corn",
        "Beans",
      ],
      Fruits: [
        "Apple",
        "Banana",
        "Orange",
        "Mango",
        "Grapes",
        "Pineapple",
        "Strawberry",
        "Watermelon",
        "Papaya",
        "Kiwi",
      ],
      Meat: ["Chicken", "Beef", "Pork", "Lamb", "Turkey"],
    },
    Beverage: {
      Water: ["Water"],
      "Soft Drinks": [
        "Coke",
        "Pepsi",
        "Sprite",
        "Fanta",
        "7Up",
        "Mountain Dew",
        "Dr Pepper",
        "RC Cola",
        "Mirinda",
        "Schweppes",
      ],
    },
    Equipment: {
      "Large Appliances": [
        "Oven",
        "Refrigerator",
        "Freezer",
        "Dishwasher",
        "Warming Drawer",
      ],
      "Small Appliances": [
        "Microwave",
        "Blender",
        "Toaster",
        "Coffee Machine",
        "Mixer",
        "Food Processor",
        "Steamer",
        "Panini Press",
      ],
      Cookware: ["Pot", "Pan", "Skillet", "Fryer", "Steamer"],
      "Utensils & Tools": [
        "Knife Set",
        "Cutting Board",
        "Spatula",
        "Tongs",
        "Ladle",
        "Whisk",
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
    itemNames: [],
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
    setErrors((p) => ({ ...p, [name]: "" }));
    if (name === "itemCategory") {
      setFormData((p) => ({
        ...p,
        itemCategory: value,
        itemType: "",
        itemNames: [],
      }));
    } else if (name === "itemType") {
      setFormData((p) => ({ ...p, itemType: value, itemNames: [] }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleAddItem = (e) => {
    const newItem = e.target.value;
    setErrors((p) => ({ ...p, itemNames: "" }));
    if (!newItem) return;
    if (formData.itemNames.some((i) => i.name === newItem)) {
      setErrors((p) => ({
        ...p,
        itemNames: `${newItem} is already selected.`,
      }));
    } else if (formData.itemNames.length >= 10) {
      setErrors((p) => ({ ...p, itemNames: "Cannot select above 10 items." }));
    } else {
      setFormData((p) => ({
        ...p,
        itemNames: [...p.itemNames, { name: newItem, quantity: "", price: "" }],
      }));
    }
    e.target.value = "";
  };

  const handleItemNamesBlur = () => {
    if (formData.itemType === "Water") {
      setErrors((p) => ({ ...p, itemNames: "" }));
      return;
    }
    if (formData.itemNames.length < 5) {
      setErrors((p) => ({
        ...p,
        itemNames: "Minimum 5 items should be selected.",
      }));
    } else {
      setErrors((p) => ({ ...p, itemNames: "" }));
    }
  };

  const handleSupplierContactBlur = () => {
    const c = formData.supplierContact.trim();
    if (/^[0-9]+$/.test(c)) {
      const validPhone = /^[0-9]{10}$/.test(c);
      setErrors((p) => ({
        ...p,
        supplierContact: validPhone ? "" : "Enter the valid contact number",
      }));
    } else {
      const validEmail = /^\S+@\S+\.\S+$/.test(c);
      setErrors((p) => ({
        ...p,
        supplierContact: validEmail ? "" : "Enter the valid email",
      }));
    }
  };

  const validateForm = () => {
    const newErr = {};
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

    // Items count/values
    if (formData.itemType !== "Water") {
      if (formData.itemNames.length < 5) {
        newErr.itemNames = "Minimum 5 items should be selected.";
      } else {
        formData.itemNames.forEach(({ name, quantity, price }) => {
          if (quantity === "" || Number(quantity) < 0) {
            newErr.itemNames = `Quantity must be non-negative for ${name}.`;
          }
          if (price === "" || Number(price) < 0) {
            newErr.itemNames = `Price must be non-negative for ${name}.`;
          }
        });
      }
    }

    // Date validations
    if (formData.orderDate && formData.orderDate < today) {
      newErr.orderDate = "Order date cannot be in the past.";
    }
    if (
      formData.expectedDeliveryDate &&
      formData.expectedDeliveryDate < today
    ) {
      newErr.expectedDeliveryDate = "Delivery date cannot be in the past.";
    }

    // Contact format
    const c = formData.supplierContact.trim();
    if (formData.supplierContact) {
      if (/^[0-9]+$/.test(c)) {
        if (!/^[0-9]{10}$/.test(c)) {
          newErr.supplierContact = "Enter the valid contact number";
        }
      } else {
        if (!/^\S+@\S+\.\S+$/.test(c)) {
          newErr.supplierContact = "Enter the valid email";
        }
      }
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalCost = formData.itemNames.reduce(
      (sum, { quantity, price }) => sum + Number(quantity) * Number(price),
      0
    );

    try {
      await axios.post("http://localhost:5000/api/kitchen", {
        ...formData,
        itemDetails: formData.itemNames,
        totalCost,
      });

      setSummaryData({ ...formData, totalCost });
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

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
          onChange={handleAddItem}
          onBlur={handleItemNamesBlur}
          defaultValue=""
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
          {formData.itemNames.map((itm, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-28 text-sm text-gray-700">{itm.name}</span>

              <input
                type="number"
                min="0"
                placeholder="Qty"
                className={`w-24 p-2 rounded-md border ${
                  Number(itm.quantity) < 0
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={itm.quantity}
                onChange={(e) => {
                  const arr = [...formData.itemNames];
                  arr[idx].quantity = e.target.value;
                  setFormData({ ...formData, itemNames: arr });
                }}
              />
              {itm.quantity !== "" && Number(itm.quantity) < 0 && (
                <span className="text-sm text-red-600 whitespace-nowrap">
                  Quantity must be non-negative.
                </span>
              )}

              <input
                type="number"
                min="0"
                placeholder="Price"
                className={`w-24 p-2 rounded-md border ${
                  Number(itm.price) < 0 ? "border-red-500" : "border-gray-300"
                }`}
                value={itm.price}
                onChange={(e) => {
                  const arr = [...formData.itemNames];
                  arr[idx].price = e.target.value;
                  setFormData({ ...formData, itemNames: arr });
                }}
              />
              {itm.price !== "" && Number(itm.price) < 0 && (
                <span className="text-sm text-red-600 whitespace-nowrap">
                  Price must be non-negative.
                </span>
              )}

              <button
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
          ))}
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order ID
            </label>
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              readOnly
              className="w-full p-3 rounded-md border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Item Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Category
            </label>
            <select
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
              <p className="mt-1 text-sm text-red-600">{errors.itemCategory}</p>
            )}
          </div>

          {/* Item Type */}
          {formData.itemCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Type
              </label>
              <select
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order Date
            </label>
            <input
              type="date"
              name="orderDate"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected Delivery Date
            </label>
            <input
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
              min={today}
              className={`w-full p-3 rounded-md border ${
                errors.expectedDeliveryDate
                  ? "border-red-500"
                  : "border-gray-300"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier Name
            </label>
            <input
              type="text"
              name="supplierName"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier Contact
            </label>
            <input
              type="text"
              name="supplierContact"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Status
            </label>
            <select
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
              <p className="mt-1 text-sm text-red-600">
                {errors.paymentStatus}
              </p>
            )}
          </div>

          {/* Ordered By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ordered By
            </label>
            <input
              type="text"
              name="orderedBy"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              rows="4"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300"
              placeholder="Any special instructions or remarks..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700"
          >
            Submit Order
          </button>
        </form>
      </div>

      {showModal && summaryData && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4
                 max-h-[80vh] flex flex-col"
          >
            {/* HEADER with bottom border */}
            <div className="text-center p-6 flex-shrink-0 border-b border-gray-200">
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
              <h3 className="text-2xl font-bold text-gray-800 mt-4">
                Order Confirmed!
              </h3>
              <p className="text-green-600 font-semibold mt-2">
                Your order has been placed
              </p>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="px-6 overflow-y-auto flex-1 space-y-3">
              <p>
                <span className="font-semibold">Order ID:</span>{" "}
                {summaryData.orderId}
              </p>
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {summaryData.itemCategory}
              </p>
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {summaryData.itemType}
              </p>

              <div>
                <span className="font-semibold">Items:</span>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  {summaryData.itemNames.map((itm, i) => (
                    <li key={i}>
                      <span className="font-semibold">{itm.name}</span> — Qty:{" "}
                      {itm.quantity}, Price: Rs. {itm.price}
                    </li>
                  ))}
                </ul>
              </div>

              <p>
                <span className="font-semibold">Total Cost:</span> Rs.{" "}
                {summaryData.totalCost.toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">Order Date:</span>{" "}
                {summaryData.orderDate}
              </p>
              <p>
                <span className="font-semibold">Expected Delivery:</span>{" "}
                {summaryData.expectedDeliveryDate}
              </p>
              <p>
                <span className="font-semibold">Supplier:</span>{" "}
                {summaryData.supplierName}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {summaryData.supplierContact}
              </p>
              <p>
                <span className="font-semibold">Payment Status:</span>{" "}
                {summaryData.paymentStatus}
              </p>
              <p>
                <span className="font-semibold">Ordered By:</span>{" "}
                {summaryData.orderedBy}
              </p>
              {summaryData.remarks && (
                <p>
                  <span className="font-semibold">Remarks:</span>{" "}
                  {summaryData.remarks}
                </p>
              )}
            </div>

            {/* FOOTER BUTTON (fixed) */}
            <div className="p-6 flex-shrink-0 text-center">
              <button
                onClick={() => {
                  setShowModal(false);
                  window.location.reload();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700
                     text-white font-semibold py-3 px-6 rounded-xl
                     transition-all duration-300 transform hover:scale-[1.02]"
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

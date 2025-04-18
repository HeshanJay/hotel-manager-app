import React, { useState, useEffect } from "react";
import axios from "axios";

const KitchenForm = () => {
  // Today’s date (YYYY-MM-DD) for date validations.
  const today = new Date().toISOString().split("T")[0];

  // Predefined options for item names based on category and type.
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

  // Options for the Item Type dropdown.
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
    itemDetails: [],
    orderDate: "",
    expectedDeliveryDate: "",
    supplierName: "",
    supplierContact: "",
    paymentStatus: "",
    orderedBy: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  // Auto-generate Order ID on mount
  useEffect(() => {
    setFormData((prev) => ({ ...prev, orderId: "ORD-" + Date.now() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "itemCategory") {
      setFormData((prev) => ({
        ...prev,
        itemCategory: value,
        itemType: "",
        itemDetails: [],
      }));
    } else if (name === "itemType") {
      setFormData((prev) => ({ ...prev, itemType: value, itemDetails: [] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = (e) => {
    const newItem = e.target.value;
    setErrors((prev) => ({ ...prev, itemDetails: "" }));
    if (!newItem) return;
    if (formData.itemDetails.some((i) => i.name === newItem)) {
      setErrors((prev) => ({
        ...prev,
        itemDetails: `${newItem} is already selected.`,
      }));
    } else if (formData.itemDetails.length >= 10) {
      setErrors((prev) => ({
        ...prev,
        itemDetails: "Cannot select above 10 items.",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        itemDetails: [
          ...prev.itemDetails,
          { name: newItem, quantity: "", price: "" },
        ],
      }));
    }
    e.target.value = "";
  };

  const handleitemDetailsBlur = () => {
    if (formData.itemDetails.length < 5) {
      setErrors((prev) => ({
        ...prev,
        itemDetails: "Minimum 5 items should be selected.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, itemDetails: "" }));
    }
  };

  const handleSupplierContactBlur = () => {
    const c = formData.supplierContact.trim();
    const validPhone = /^[0-9]{10}$/.test(c);
    const validEmail = /^\S+@\S+\.\S+$/.test(c);
    setErrors((prev) => ({
      ...prev,
      supplierContact:
        !validPhone && !validEmail
          ? "Enter a valid 10‑digit phone or email."
          : "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const {
      orderId,
      itemCategory,
      itemType,
      itemDetails,
      orderDate,
      expectedDeliveryDate,
      supplierName,
      supplierContact,
      paymentStatus,
      orderedBy,
    } = formData;

    if (!orderId) newErrors.orderId = "Order ID is required.";
    if (!itemCategory) newErrors.itemCategory = "Item category is required.";
    if (!itemType) newErrors.itemType = "Item type is required.";
    if (!itemDetails || itemDetails.length === 0) {
      newErrors.itemDetails = "At least one item must be selected.";
    }

    // Validate item count based on category and type
    const count = itemDetails.length;
    if (itemCategory === "Food") {
      const min = itemType === "Vegetables" || itemType === "Fruits" ? 4 : 3;
      if (count < min || count > 10) {
        newErrors.itemDetails = `For ${itemType}, select between ${min} and 10 items.`;
      }
    } else if (itemCategory === "Beverage" && itemType === "Soft Drinks") {
      if (count < 3 || count > 10) {
        newErrors.itemDetails =
          "For Soft Drinks, select between 3 and 10 items.";
      }
    } else if (itemCategory === "Equipment") {
      if (count < 2 || count > 10) {
        newErrors.itemDetails = "For Equipment, select between 2 and 10 items.";
      }
    }

    // Validate each item
    for (const item of itemDetails) {
      if (!item.name || item.quantity === "" || item.price === "") {
        newErrors.itemDetails = "Each item must have name, quantity and price.";
        break;
      }
      if (item.quantity < 0 || item.price < 0) {
        newErrors.itemDetails = "Quantity and price must be non-negative.";
        break;
      }
    }

    if (!orderDate) newErrors.orderDate = "Order date is required.";
    if (!expectedDeliveryDate)
      newErrors.expectedDeliveryDate = "Delivery date is required.";
    if (!supplierName) newErrors.supplierName = "Supplier name is required.";
    if (!supplierContact) {
      newErrors.supplierContact = "Supplier contact is required.";
    } else {
      const validPhone = /^[0-9]{10}$/.test(supplierContact.trim());
      const validEmail = /^\S+@\S+\.\S+$/.test(supplierContact.trim());
      if (!validPhone && !validEmail) {
        newErrors.supplierContact = "Enter a valid 10-digit phone or email.";
      }
    }
    if (!paymentStatus) newErrors.paymentStatus = "Payment status is required.";
    if (!orderedBy) newErrors.orderedBy = "Ordered by is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalCost = formData.itemDetails.reduce(
      (sum, { quantity, price }) => sum + Number(quantity) * Number(price),
      0
    );

    try {
      await axios.post("http://localhost:5000/api/kitchen", {
        ...formData,
        totalCost,
      });
      alert("Order submitted successfully!");
      // Optional: reset the form if you like:
      // setFormData({
      //   orderId: 'ORD-' + Date.now(),
      //   itemCategory: '',
      //   itemType: '',
      //   itemDetails: [],
      //   orderDate: '',
      //   expectedDeliveryDate: '',
      //   supplierName: '',
      //   supplierContact: '',
      //   paymentStatus: '',
      //   orderedBy: '',
      //   remarks: '',
      // });
    } catch {
      setErrors((prev) => ({ ...prev, submit: "Failed to save order." }));
    }
  };

  const renderitemDetailsField = () => {
    if (!formData.itemCategory || !formData.itemType) return null;
    const options =
      itemOptionsMapping[formData.itemCategory]?.[formData.itemType] || [];

    return (
      <div>
        <label className="block mb-1 font-semibold text-gray-700">
          Item Name
        </label>
        <select
          onChange={handleAddItem}
          onBlur={handleitemDetailsBlur}
          defaultValue=""
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">-- Select an Item --</option>
          {options.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <div className="mt-4 space-y-2">
          {formData.itemDetails.map((itm, idx) => (
            <div key={itm.name} className="flex items-center gap-3">
              <span className="w-28">{itm.name}</span>
              <input
                type="number"
                min="0"
                placeholder="Qty"
                className="w-24 px-2 py-1 border rounded"
                value={itm.quantity}
                onChange={(e) => {
                  const arr = [...formData.itemDetails];
                  arr[idx].quantity = e.target.value;
                  setFormData({ ...formData, itemDetails: arr });
                }}
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                className="w-24 px-2 py-1 border rounded"
                value={itm.price}
                onChange={(e) => {
                  const arr = [...formData.itemDetails];
                  arr[idx].price = e.target.value;
                  setFormData({ ...formData, itemDetails: arr });
                }}
              />
              <button
                type="button"
                className="text-red-600 font-bold"
                onClick={() => {
                  const arr = formData.itemDetails.filter((_, i) => i !== idx);
                  setFormData({ ...formData, itemDetails: arr });
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 font-semibold">
          Total Cost: Rs.{" "}
          {formData.itemDetails
            .reduce(
              (sum, { quantity, price }) =>
                sum + Number(quantity) * Number(price),
              0
            )
            .toFixed(2)}
        </div>

        {errors.itemDetails && (
          <p className="text-red-600 text-sm mt-1">{errors.itemDetails}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Kitchen Ordering System
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Order ID */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Order ID
          </label>
          <input
            type="text"
            name="orderId"
            value={formData.orderId}
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />
        </div>

        {/* Item Category */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Item Category
          </label>
          <select
            name="itemCategory"
            value={formData.itemCategory}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Select Item Category --</option>
            <option value="Food">Food</option>
            <option value="Beverage">Beverage</option>
            <option value="Equipment">Equipment</option>
          </select>
        </div>

        {/* Item Type */}
        {formData.itemCategory && (
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Item Type
            </label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">-- Select Item Type --</option>
              {itemTypeOptions[formData.itemCategory].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Items + Qty/Price + Total */}
        {renderitemDetailsField()}

        {/* Order Date */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Order Date
          </label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
            min={today}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.orderDate && (
            <p className="text-red-600 text-sm mt-1">{errors.orderDate}</p>
          )}
        </div>

        {/* Expected Delivery Date */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Expected Delivery Date
          </label>
          <input
            type="date"
            name="expectedDeliveryDate"
            value={formData.expectedDeliveryDate}
            onChange={handleChange}
            required
            min={today}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.expectedDeliveryDate && (
            <p className="text-red-600 text-sm mt-1">
              {errors.expectedDeliveryDate}
            </p>
          )}
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Supplier Name
          </label>
          <input
            type="text"
            name="supplierName"
            placeholder="E.g., ABC Suppliers"
            value={formData.supplierName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Supplier Contact */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Supplier Contact
          </label>
          <input
            type="text"
            name="supplierContact"
            placeholder="E.g., 9876543210 or email@example.com"
            value={formData.supplierContact}
            onChange={handleChange}
            onBlur={handleSupplierContactBlur}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.supplierContact && (
            <p className="text-red-600 text-sm mt-1">
              {errors.supplierContact}
            </p>
          )}
        </div>

        {/* Payment Status */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Payment Status
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Select Payment Status --</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        {/* Ordered By */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Ordered By
          </label>
          <input
            type="text"
            name="orderedBy"
            placeholder="E.g., John Doe"
            value={formData.orderedBy}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Remarks
          </label>
          <textarea
            name="remarks"
            placeholder="Any special instructions or remarks..."
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {errors.submit && (
          <p className="text-red-600 text-sm">{errors.submit}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default KitchenForm;
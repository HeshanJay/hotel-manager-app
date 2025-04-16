import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const KitchenForm = () => {
  // Today’s date (YYYY-MM-DD) for date validations.
  const today = new Date().toISOString().split("T")[0];

  // Predefined options for item names based on category and type.
  const itemOptionsMapping = {
    Food: {
      Vegetables: [
        "Tomato", "Onion", "Potato", "Carrot", "Cabbage",
        "Spinach", "Broccoli", "Pepper", "Garlic", "Ginger",
        "Eggplant", "Lettuce", "Peas", "Corn", "Beans"
      ],
      Fruits: [
        "Apple", "Banana", "Orange", "Mango", "Grapes",
        "Pineapple", "Strawberry", "Watermelon", "Papaya", "Kiwi"
      ],
      Meat: [
        "Chicken", "Beef", "Pork", "Lamb", "Turkey"
      ]
    },
    Beverage: {
      // For Soft Drinks; if Water is selected, no item names field.
      "Soft Drinks": [
        "Coke", "Pepsi", "Sprite", "Fanta", "7Up",
        "Mountain Dew", "Dr Pepper", "RC Cola", "Mirinda", "Schweppes"
      ]
    },
    Equipment: {
      Equipment: [
        "Oven", "Microwave", "Refrigerator", "Dishwasher", "Freezer",
        "Grill", "Stove", "Fryer", "Blender", "Toaster",
        "Coffee Machine", "Steamer", "Food Processor", "Cutting Board", "Knife Set",
        "Mixer", "Deep Fryer", "Sous Vide", "Panini Press", "Warming Drawer"
      ]
    }
  };

  // Price mapping based on selected Item Type.
  const priceMapping = {
    Food: {
      Vegetables: 300,
      Fruits: 200,
      Meat: 500,
    },
    Beverage: {
      Water: 90,
      "Soft Drinks": 100,
    },
    // Equipment: user enters price manually.
  };

  // Unit mapping: for Food and Beverage, unit is auto‑assigned.
  const unitMapping = {
    Food: "kg",
    Beverage: "bottles",
    Equipment: "units"
  };

  // Options for the Item Type dropdown.
  const itemTypeOptions = {
    Food: ["Vegetables", "Fruits", "Meat"],
    Beverage: ["Water", "Soft Drinks"],
    Equipment: ["Oven", "Microwave", "Refrigerator", "Dishwasher"],
  };

  // Form state.
  const [formData, setFormData] = useState({
    orderId: '',                // auto‑generated Order ID
    itemCategory: '',           // Food, Beverage, Equipment
    itemType: '',               // depends on category
    itemNames: [],              // array of selected item names (chips)
    quantity: '',
    unit: '',                   // auto‑set for Food/Beverage; not shown for Equipment
    price: '',                  // auto‑filled for Food/Beverage, editable for Equipment
    orderDate: '',
    expectedDeliveryDate: '',
    supplierName: '',
    supplierContact: '',
    paymentStatus: '',          // Paid, Pending, Partial
    orderedBy: '',
    remarks: '',
  });

  // Inline error messages.
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Generate Order ID on component mount.
  useEffect(() => {
    const generatedOrderId = 'ORD-' + Date.now();
    setFormData(prev => ({ ...prev, orderId: generatedOrderId }));
  }, []);

  // When itemCategory changes, reset dependent fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear error for this field.
    setErrors(prev => ({ ...prev, [name]: "" }));
    if (name === 'itemCategory') {
      setFormData(prev => ({
        ...prev,
        itemCategory: value,
        itemType: '',
        itemNames: [],
        unit: value === "Equipment" ? unitMapping.Equipment : '',
      }));
    } else if (name === 'itemType') {
      let defaultPrice = '';
      if (formData.itemCategory && priceMapping[formData.itemCategory]) {
        defaultPrice = priceMapping[formData.itemCategory][value] || '';
      }
      const autoUnit = formData.itemCategory === "Food"
        ? unitMapping.Food
        : (formData.itemCategory === "Beverage" ? unitMapping.Beverage : "");
      setFormData(prev => ({
        ...prev,
        itemType: value,
        price: defaultPrice,
        unit: autoUnit,
        itemNames: [] // reset selected items when type changes.
      }));
    } else if (name === "orderDate" || name === "expectedDeliveryDate") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle addition of an item (as chips).
  const handleAddItem = (e) => {
    const newItem = e.target.value;
    // Clear previous error.
    setErrors(prev => ({ ...prev, itemNames: "" }));
    if (!newItem) return;
    if (formData.itemNames.includes(newItem)) {
      setErrors(prev => ({ ...prev, itemNames: `${newItem} is already selected.` }));
    } else if (formData.itemNames.length >= 10) {
      setErrors(prev => ({ ...prev, itemNames: "Cannot select above 10 items." }));
    } else {
      setFormData(prev => ({
        ...prev,
        itemNames: [...prev.itemNames, newItem],
      }));
      setErrors(prev => ({ ...prev, itemNames: "" }));
    }
    e.target.value = "";
  };

  // Remove an item chip.
  const handleRemoveItem = (item) => {
    setFormData(prev => ({
      ...prev,
      itemNames: prev.itemNames.filter(i => i !== item)
    }));
  };

  // On blur of the item names field, check required count for Food (Vegetables/Fruits).
  const handleItemNamesBlur = () => {
    if (
      formData.itemCategory === "Food" &&
      (formData.itemType === "Vegetables" || formData.itemType === "Fruits") &&
      formData.itemNames.length < 4
    ) {
      setErrors(prev => ({ ...prev, itemNames: "Select more than 4 items." }));
    }
  };

  // Validate quantity on blur.
  const handleQuantityBlur = () => {
    const qty = Number(formData.quantity);
    if ((formData.itemCategory === "Food" || formData.itemCategory === "Beverage") && qty < 50) {
      setErrors(prev => ({ ...prev, quantity: "Quantity should be over than 50." }));
    } else if (formData.itemCategory === "Equipment" && qty < 2) {
      setErrors(prev => ({ ...prev, quantity: "For Equipment, you must order at least 2 items." }));
    } else {
      setErrors(prev => ({ ...prev, quantity: "" }));
    }
  };

  // Validate Supplier Contact on blur (10-digit phone OR valid email).
  const handleSupplierContactBlur = () => {
    const contact = formData.supplierContact.trim();
    const validPhone = /^[0-9]{10}$/.test(contact);
    const validEmail = /^\S+@\S+\.\S+$/.test(contact);
    if (!validPhone && !validEmail) {
      setErrors(prev => ({ ...prev, supplierContact: "Enter a valid 10-digit phone number or a valid email address." }));
    } else {
      setErrors(prev => ({ ...prev, supplierContact: "" }));
    }
  };

  // Validate the entire form; if error(s) exist, focus the first error field.
  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    const count = formData.itemNames.length;
    if (formData.itemCategory === "Food") {
      if (formData.itemType === "Vegetables" || formData.itemType === "Fruits") {
        if (count < 4) {
          newErrors.itemNames = "Select more than 4 items.";
          valid = false;
        }
      } else { // Meat
        if (count < 3) {
          newErrors.itemNames = "Select minimum 3 items.";
          valid = false;
        }
      }
      if (count > 10) {
        newErrors.itemNames = "Cannot select above 10 items.";
        valid = false;
      }
    }
    if (formData.itemCategory === "Beverage" && formData.itemType === "Soft Drinks") {
      if (count < 3) {
        newErrors.itemNames = "Select minimum 3 items.";
        valid = false;
      }
      if (count > 10) {
        newErrors.itemNames = "Cannot select above 10 items.";
        valid = false;
      }
    }
    if (formData.itemCategory === "Equipment") {
      if (count < 2) {
        newErrors.itemNames = "Select minimum 2 equipment items.";
        valid = false;
      }
      if (count > 10) {
        newErrors.itemNames = "Cannot select above 10 items.";
        valid = false;
      }
    }

    const qty = Number(formData.quantity);
    if (formData.itemCategory === "Food") {
      if (qty < 50) {
        newErrors.quantity = "For Food items, the minimum quantity must be 50 kg.";
        valid = false;
      }
    } else if (formData.itemCategory === "Beverage") {
      if (qty < 50) {
        newErrors.quantity = "For Beverages, the minimum quantity must be 50 bottles.";
        valid = false;
      }
    } else if (formData.itemCategory === "Equipment") {
      if (qty < 2) {
        newErrors.quantity = "For Equipment, you must order at least 2 items.";
        valid = false;
      }
    }

    if (formData.orderDate < today) {
      newErrors.orderDate = "Order Date cannot be in the past.";
      valid = false;
    }
    if (formData.expectedDeliveryDate < today) {
      newErrors.expectedDeliveryDate = "Expected Delivery Date cannot be in the past.";
      valid = false;
    }

    // Validate supplier contact.
    const contact = formData.supplierContact.trim();
    const validPhone = /^[0-9]{10}$/.test(contact);
    const validEmail = /^\S+@\S+\.\S+$/.test(contact);
    if (!validPhone && !validEmail) {
      newErrors.supplierContact = "Enter a valid 10-digit phone number or a valid email address.";
      valid = false;
    }

    setErrors(newErrors);

    // If there are errors, focus on the first field with an error.
    if (!valid) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.focus();
      }
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const quantity = Number(formData.quantity);
    const price = Number(formData.price);
    // Total cost calculation: quantity * price.
    const totalCost = quantity * price;

    const dataToSend = {
      ...formData,
      quantity,
      price,
      totalCost,
    };

    try {
      await axios.post('http://localhost:5000/api/kitchen', dataToSend);
      navigate('/kitchen-summary', { state: dataToSend });
    } catch (error) {
      console.error(error);
      setErrors(prev => ({ ...prev, submit: "Failed to save order." }));
    }
  };

  // Render the multi-select item names field.
  const renderItemNamesField = () => {
    // For Beverage and Water, do not show item names field.
    if (formData.itemCategory === "Beverage" && formData.itemType === "Water") return null;
    let options = [];
    if (formData.itemCategory === "Food") {
      options = itemOptionsMapping.Food[formData.itemType] || [];
    } else if (formData.itemCategory === "Beverage") {
      options = itemOptionsMapping.Beverage["Soft Drinks"] || [];
    } else if (formData.itemCategory === "Equipment") {
      options = itemOptionsMapping.Equipment.Equipment || [];
    }
    return (
      <div>
        <label className="block mb-1 font-semibold text-gray-700">
          Item Name <small>
            {formData.itemCategory === "Equipment"
              ? "(Select 2 to 10 items)"
              : "(Select 3/4 to 10 items)"}
          </small>
        </label>
        <select
          onChange={handleAddItem}
          onBlur={handleItemNamesBlur}
          defaultValue=""
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">-- Select an Item --</option>
          {options.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.itemNames.map(item => (
            <div key={item} className="flex items-center bg-blue-100 px-2 py-1 rounded">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item)}
                className="ml-1 text-red-600 font-bold"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Kitchen Ordering System</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Order ID */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Order ID</label>
          <input
            type="text"
            name="orderId"
            value={formData.orderId}
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />
        </div>

        {/* 2. Item Category */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Item Category</label>
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

        {/* 3. Item Type */}
        {formData.itemCategory && (
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Item Type</label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">-- Select Item Type --</option>
              {itemTypeOptions[formData.itemCategory].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Item Name (custom multi-select with chips) */}
        {formData.itemCategory && formData.itemType && !(formData.itemCategory === "Beverage" && formData.itemType === "Water") && (
          <div>
            {renderItemNamesField()}
            {errors.itemNames && <p className="text-red-600 text-sm mt-1">{errors.itemNames}</p>}
          </div>
        )}

        {/* 5. Quantity */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Quantity {formData.itemCategory === "Food" && "(in kg, min 50)"}
            {formData.itemCategory === "Beverage" && "(in bottles, min 50)"}
            {formData.itemCategory === "Equipment" && "(min 2)"}
          </label>
          <input
            type="number"
            name="quantity"
            placeholder="Enter quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            onBlur={handleQuantityBlur}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
          {formData.itemCategory !== "Equipment" && formData.itemCategory && (
            <p className="text-sm text-gray-600 mt-1">Unit: {unitMapping[formData.itemCategory]}</p>
          )}
        </div>

        {/* 6. Price per Unit */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Price per Unit (Rs)</label>
          <input
            type="number"
            name="price"
            placeholder="Enter price per unit"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* 7. Order Date */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Order Date</label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
            min={today}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.orderDate && <p className="text-red-600 text-sm mt-1">{errors.orderDate}</p>}
        </div>

        {/* 8. Expected Delivery Date */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Expected Delivery Date</label>
          <input
            type="date"
            name="expectedDeliveryDate"
            value={formData.expectedDeliveryDate}
            onChange={handleChange}
            required
            min={today}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.expectedDeliveryDate && <p className="text-red-600 text-sm mt-1">{errors.expectedDeliveryDate}</p>}
        </div>

        {/* 9. Supplier Name */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Supplier Name</label>
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

        {/* 10. Supplier Contact */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Supplier Contact</label>
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
          {errors.supplierContact && <p className="text-red-600 text-sm mt-1">{errors.supplierContact}</p>}
        </div>

        {/* 11. Payment Status */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Payment Status</label>
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

        {/* 12. Ordered By */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Ordered By</label>
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

        {/* 13. Remarks */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Remarks</label>
          <textarea
            name="remarks"
            placeholder="Any special instructions or remarks..."
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          ></textarea>
        </div>

        {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

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

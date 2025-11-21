import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, User, DollarSign, FileText, Link, Hash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createInvoice, invoicesAction } from "../store/Slices/invoices";
import { toast } from "react-toastify";

export function CreateInvoice({ onClose }) {
  const dispatch = useDispatch();
  const { email } = useSelector((state) => state.ladger);
  const { creating, error, message } = useSelector((state) => state.invoices);

  
  const getFirstNameFromEmail = (email) => {
    if (!email) return "";
    return email.split('@')[0].split('.')[0]; 
  };

  const [formData, setFormData] = useState({
    module: "outr_invoice_fetch",
    name: getFirstNameFromEmail(email), 
    email: email, 
    quantity: "1", 
    value: "70", 
    from_url: "", 
    to_url: "", 
    anchor_url: "", 
  });

  
  const calculateTotalAmount = (quantity) => {
    const unitPrice = 70; 
    return (unitPrice * parseInt(quantity) || 0).toString();
  };

  
  const handleQuantityChange = (newQuantity) => {
    const quantity = newQuantity === "" ? "1" : newQuantity;
    const totalAmount = calculateTotalAmount(quantity);
    
    setFormData({
      ...formData,
      quantity: quantity,
      value: totalAmount
    });
  };

  
  const handleAmountChange = (newAmount) => {
    setFormData({
      ...formData,
      value: newAmount
    });
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(invoicesAction.clearAllMessages());
      onClose && onClose();
    }

    if (error) {
      toast.error(error);
      dispatch(invoicesAction.clearAllErrors());
    }
  }, [message, error, dispatch, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warn("Please enter client name");
      return;
    }
    if (!formData.value || formData.value === "0") {
      toast.warn("Please enter a valid amount");
      return;
    }
    if (!formData.email) {
      toast.warn("Email is required");
      return;
    }
    dispatch(createInvoice(formData));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-yellow-600" />
              <h2 className="text-3xl font-bold text-gray-900">Create New Invoice</h2>
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-2 bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Client Name</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
                placeholder="Enter client name"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed
                "
              />
            </div>

            {/* Quantity (Default 1) */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <span>Quantity</span>
                </div>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
                placeholder="1"
                min="1"
                required
              />
              
            </div>

            {/* Value (Amount) - Auto-calculated */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Amount</span>
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="
                    w-full bg-gray-100 border border-gray-300
                    rounded-xl px-4 pl-10 py-3
                    text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-yellow-400
                  "
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
            </div>

            {/* From URL */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>From URL</span>
                </div>
              </label>
              <input
                type="url"
                name="from_url"
                value={formData.from_url}
                onChange={(e) =>
                  setFormData({ ...formData, from_url: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
                placeholder="https://example.com/from-page"
              />
            </div>

            {/* To URL */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>To URL</span>
                </div>
              </label>
              <input
                type="url"
                name="to_url"
                value={formData.to_url}
                onChange={(e) =>
                  setFormData({ ...formData, to_url: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
                placeholder="https://example.com/to-page"
              />
            </div>

            {/* Anchor URL */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>Anchor URL</span>
                </div>
              </label>
              <input
                type="url"
                name="anchor_url"
                value={formData.anchor_url}
                onChange={(e) =>
                  setFormData({ ...formData, anchor_url: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
                placeholder="https://example.com#anchor"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  flex-1 py-3 rounded-xl text-lg font-semibold
                  bg-gray-300 text-gray-700 
                  hover:bg-gray-400 transition
                "
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="
                  flex-1 py-3 rounded-xl text-lg font-semibold
                  bg-yellow-600 text-white 
                  hover:bg-yellow-700 shadow-lg transition
                "
                disabled={creating}
              >
                {creating ? "Creating Invoice..." : "Create Invoice"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
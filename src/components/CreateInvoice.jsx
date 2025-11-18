import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, User, DollarSign, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createInvoice, invoicesAction } from "../store/Slices/invoices";
import { toast } from "react-toastify";

export function CreateInvoice({ onClose }) {
  const dispatch = useDispatch();
  const { email } = useSelector((state) => state.ladger);
  const { creating, error, message } = useSelector((state) => state.invoices);

  const [formData, setFormData] = useState({
    module: "outr_invoice_fetch",
    name: "",
    amount_c: "",
    status_c: "DRAFT",
    date_entered: new Date().toISOString().split('T')[0],
    due_date: "",
    description: "",
    email: email,
  });

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
    if (!formData.amount_c || formData.amount_c === "0") {
      toast.warn("Please enter a valid amount");
      return;
    }
    dispatch(createInvoice(formData));
  };

  return (
    // ✅ MODAL STYLING HATAO, REGULAR PAGE STYLING LAGAO
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
            {/* Client Name */}
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

            {/* Amount */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Amount</span>
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <input
                  type="number"
                  name="amount_c"
                  value={formData.amount_c}
                  onChange={(e) =>
                    setFormData({ ...formData, amount_c: e.target.value })
                  }
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

            {/* Status */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Status
              </label>
              <select
                name="status_c"
                value={formData.status_c}
                onChange={(e) =>
                  setFormData({ ...formData, status_c: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300 
                  rounded-xl px-4 py-3 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </div>
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                "
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-yellow-400
                  resize-none
                "
                placeholder="Enter invoice description"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Email
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
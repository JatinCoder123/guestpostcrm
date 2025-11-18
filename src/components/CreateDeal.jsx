import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction } from "../store/Slices/deals";
import { websiteListForDeal } from "../assets/assets";
import { toast } from "react-toastify";

export default function CreateDeal({ onClose }) {
  const dispatch = useDispatch();
  const { email } = useSelector((state) => state.ladger);
  const { creating, error, message } = useSelector((state) => state.deals);

  const [formData, setFormData] = useState({
    module: "outr_deal_fetch",
    dealamount: "",
    website_c: websiteListForDeal[0],
    email: email,
  });

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(dealsAction.clearAllMessages());
      onClose && onClose();
    }

    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors());
    }
  }, [message, error, dispatch, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.dealamount.trim() || formData.dealamount === "0") {
      toast.warn("Please enter a valid amount");
      return;
    }
    dispatch(createDeal(formData));
  };

  return (
    <div className="w-full flex justify-center py-10 px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          w-full max-w-xl bg-white rounded-3xl p-10 shadow-xl 
          border border-gray-200
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Deal</h2>

          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={28} />
            </button>
          )}
        </div>

        {/* Form */}
        <form className="space-y-7" onSubmit={handleSubmit}>
          {/* Deal Amount */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Deal Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                $
              </span>

              <input
                type="number"
                name="dealamount"
                value={formData.dealamount}
                onChange={(e) =>
                  setFormData({ ...formData, dealamount: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 pl-10 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
                placeholder="10,000"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Website
            </label>

            <select
              name="website_c"
              value={formData.website_c}
              onChange={(e) =>
                setFormData({ ...formData, website_c: e.target.value })
              }
              className="
                w-full bg-gray-100 border border-gray-300 
                rounded-xl px-4 py-3 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
            >
              {websiteListForDeal.map((site, i) => (
                <option key={i} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
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

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="
              w-full py-4 rounded-xl text-lg font-semibold
              bg-blue-600 text-white 
              hover:bg-blue-700 shadow-lg transition
            "
          >
            {creating ? "Creating deal..." : "Create Deal"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

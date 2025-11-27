import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

// import your actions when ready
// import { createOffer, updateOffer } from "../store/Slices/offers";

export default function CreateOffer({ onClose, editData }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    client_offer_c: "",
    our_offer_c: "",
    description: "",
  });

  // Prefill values in edit mode
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        amount: editData.amount || "",
        client_offer_c: editData.client_offer_c || "",
        our_offer_c: editData.our_offer_c || "",
        description: editData.description || "",
      });
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warn("Client name is required");
      return;
    }

    if (!formData.amount.trim()) {
      toast.warn("Offer amount is required");
      return;
    }

    if (editData) {
      console.log("Updating Offer:", formData);
      // dispatch(updateOffer({ id: editData.id, ...formData }));
      toast.success("Offer updated successfully!");
    } else {
      console.log("Creating Offer:", formData);
      // dispatch(createOffer(formData));
      toast.success("Offer created successfully!");
    }

    onClose && onClose();
  };

  return (
    <div className="w-full flex justify-center py-10 px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="
          w-full max-w-xl bg-white rounded-3xl p-10 shadow-xl 
          border border-gray-200
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {editData ? "Edit Offer" : "Create New Offer"}
          </h2>

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
          {/* Client Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Client Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="
                w-full bg-gray-100 border border-gray-300 
                rounded-xl px-4 py-3 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
              placeholder="Enter client name"
            />
          </div>

          {/* Offer Amount */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Offer Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                $
              </span>

              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="
                  w-full bg-gray-100 border border-gray-300
                  rounded-xl px-4 pl-10 py-3
                  text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
                placeholder="1000"
              />
            </div>
          </div>

          {/* Client Offer */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Client Offer
            </label>

            <input
              type="number"
              value={formData.client_offer_c}
              onChange={(e) =>
                setFormData({ ...formData, client_offer_c: e.target.value })
              }
              className="
                w-full bg-gray-100 border border-gray-300 
                rounded-xl px-4 py-3 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
              placeholder="Enter client offer"
            />
          </div>

          {/* Our Offer */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Our Offer
            </label>

            <input
              type="number"
              value={formData.our_offer_c}
              onChange={(e) =>
                setFormData({ ...formData, our_offer_c: e.target.value })
              }
              className="
                w-full bg-gray-100 border border-gray-300 
                rounded-xl px-4 py-3 text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
              placeholder="Enter your offer"
            />
          </div>

          {/* Description */}
         

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
            {editData ? "Update Offer" : "Create Offer"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

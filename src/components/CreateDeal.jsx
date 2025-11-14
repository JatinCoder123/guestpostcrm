import React, { useEffect, useState } from "react";
import { frameData, motion } from "framer-motion";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createDeal, dealsAction } from "../store/Slices/deals";
import { websiteListForDeal } from "../assets/assets";
import { toast } from "react-toastify";

export default function CreateDeal({ onClose }) {
  const { email } = useSelector((state) => state.ladger);

  const { creating, error, message } = useSelector((state) => state.deals);
  const [formData, setFormData] = useState({
    module: "outr_deal_fetch",
    dealamount: "",
    website_c: websiteListForDeal[0],
    email: email,
  });
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(dealsAction.clearAllMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(dealsAction.clearAllErrors());
    }
  }, [dispatch, creating, error, message]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.dealamount.trim() || formData.dealamount == 0) {
      toast.warn("Please Enter Some Amount");
      return;
    }
    dispatch(createDeal(formData));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <motion.div
        className="relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white cursor-pointer hover:text-gray-200 transition"
        >
          <X className="w-8 h-8" />
        </button>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-8 text-center"
        >
          Create New Deal
        </motion.h2>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-white text-sm font-semibold mb-2">
              Deal Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg">
                $
              </span>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="number"
                name="dealamount"
                value={formData.dealamount}
                onChange={handleChange}
                required
                className="w-full bg-white/20 border border-white/30 rounded-xl px-4 pl-8 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="10,000"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-white text-sm font-semibold mb-2">
              Website
            </label>

            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="website_c"
              value={formData.website_c}
              onChange={handleChange}
              required
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
            >
              {websiteListForDeal.map((site, idx) => (
                <option key={idx} value={site} className="text-black">
                  {site}
                </option>
              ))}
            </motion.select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-white text-sm font-semibold mb-2">
              Email
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-white text-purple-600 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {creating ? "Creating deal.." : "Create Deal"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

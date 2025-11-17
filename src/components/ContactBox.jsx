import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function ContactBox({ onClose }) {
  const [activeTab, setActiveTab] = useState("contact");
  const [isFlipped, setIsFlipped] = useState(false);
  const { contactInfo, accountInfo } = useSelector((state) => state.viewEmail);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      {/* Tab Selector */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("contact")}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
            activeTab === "contact"
              ? "bg-white text-purple-900 shadow-lg"
              : "bg-white/10 text-white backdrop-blur-sm"
          }`}
        >
          <User className="inline-block mr-2 w-5 h-5" />
          Contact
        </motion.button>
        {accountInfo && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("account")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === "account"
                ? "bg-white text-purple-900 shadow-lg"
                : "bg-white/10 text-white backdrop-blur-sm"
            }`}
          >
            <Building2 className="inline-block mr-2 w-5 h-5" />
            Account
          </motion.button>
        )}
        <button
          onClick={onClose}
          className="text-white cursor-pointer hover:text-gray-200 transition"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Card Container */}
      <motion.div layout className="relative" style={{ perspective: 1000 }}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Front Card */}
          <div style={{ backfaceVisibility: "hidden" }}>
            <motion.div
              layout
              className="bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl" />

              <div className="relative p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "contact" ? (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Avatar */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                      >
                        <User className="w-12 h-12 text-white" />
                      </motion.div>

                      {/* Name */}
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-center text-gray-800 mb-2"
                      >
                        {contactInfo ? contactInfo.first_name : ""}{" "}
                        {contactInfo ? contactInfo.last_name : ""}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-purple-600 font-medium mb-8"
                      >
                        Personal Contact
                      </motion.p>

                      {/* Contact Details */}
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Phone
                            </p>
                            <p className="text-gray-800 font-semibold">
                              {contactInfo ? contactInfo.phone_mobile : ""}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-gray-500 font-medium">
                              Email
                            </p>
                            <p className="text-gray-800 font-semibold truncate">
                              {contactInfo ? contactInfo.email1 : ""}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="account"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Company Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                      >
                        <Building2 className="w-12 h-12 text-white" />
                      </motion.div>

                      {/* Company Name */}
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-center text-gray-800 mb-2"
                      >
                        {accountInfo.name}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-indigo-600 font-medium mb-8"
                      >
                        Business Account
                      </motion.p>

                      {/* Account Details */}
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Business Phone
                            </p>
                            <p className="text-gray-800 font-semibold">
                              {accountInfo.phone_office}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-gray-500 font-medium">
                              Billing Email
                            </p>
                            <p className="text-gray-800 font-semibold truncate">
                              {accountInfo.email1}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Billing Address
                            </p>
                            <p className="text-gray-800 font-semibold text-sm leading-relaxed">
                              {accountInfo.billing_address_street}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

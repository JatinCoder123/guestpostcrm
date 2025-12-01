import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
} from "lucide-react";
import { useSelector } from "react-redux";

// Framer motion variants for stagger animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

export default function Contactpage() {
  const { contactInfo, accountInfo } = useSelector(
    (state) => state.viewEmail
  );

  return (
    <div className="w-full min-h-screen from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      {/* Hero Section with Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full backdrop-blur-xl bg-gradient-to-br from-purple-400/30 to-blue-400/30 border border-white/50 flex items-center justify-center shadow-xl">
                <User size={60} className="text-purple-600" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white"
              />
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                {contactInfo?.full_name || "No Name"}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mt-2"
              >
                Personal Contact • {contactInfo?.customer_type || "Standard"}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Contact Information - 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInfo icon={<User />} label="Name" value={contactInfo?.full_name} />
              <GlassInfo icon={<User />} label="Stage" value={contactInfo?.stage} />
              <GlassInfo icon={<Phone />} label="Phone" value={contactInfo?.phone_mobile} />
              <GlassInfo icon={<Mail />} label="Email" value={contactInfo?.email1} />
              <GlassInfo icon={<MapPin />} label="Date Entered" value={contactInfo?.date_entered} />
              <GlassInfo icon={<User />} label="Customer Type" value={contactInfo?.customer_type} />
            </div>
          </div>

          {/* Addresses Section */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              Addresses
            </h2>
            
            <div className="space-y-4">
              <GlassInfo icon={<MapPin />} label="Primary Address" value={contactInfo?.billing_address_street} fullWidth />
              <GlassInfo icon={<MapPin />} label="Secondary Address" value={contactInfo?.alt_address_street} fullWidth />
            </div>
          </div>
        </motion.div>

        {/* Account Details - 1 column */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              Account
            </h2>
            
            <div className="space-y-4">
              <GlassInfo icon={<Building2 />} label="Company" value={accountInfo?.company} fullWidth />
              <GlassInfo icon={<CreditCard />} label="Account ID" value={accountInfo?.accountId} fullWidth />
              <GlassInfo icon={<Phone />} label="Phone" value={accountInfo?.phone_office} fullWidth />
              <GlassInfo icon={<Building2 />} label="Website" value={accountInfo?.website} fullWidth />
            </div>
          </div>

          {/* Account Addresses */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Addresses</h3>
            <div className="space-y-4">
              <GlassInfo icon={<MapPin />} label="Billing" value={accountInfo?.billing_address_street} fullWidth />
              <GlassInfo icon={<MapPin />} label="Shipping" value={accountInfo?.shipping_address_street} fullWidth />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Glassmorphic Info Box
function GlassInfo({ icon, label, value, fullWidth = false }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        backdrop-blur-md bg-white/30 border border-white/60 
        p-4 rounded-2xl flex items-center gap-4
        shadow-lg hover:shadow-xl cursor-pointer
        ${fullWidth ? 'col-span-full' : ''}
      `}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="
          w-12 h-12 flex items-center justify-center rounded-xl
          bg-gradient-to-br from-purple-400/20 to-blue-400/20
          backdrop-blur-sm border border-white/40
          text-purple-600
        "
      >
        {icon}
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wider text-gray-600 font-bold">
          {label}
        </p>
        <p className="text-sm md:text-base font-semibold text-gray-800 mt-1 truncate">
          {value || "N/A"}
        </p>
      </div>
    </motion.div>
  );
}
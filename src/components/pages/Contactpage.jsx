import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
  X,
  ChartSpline,
  Target,
  DollarSign,
  Clock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { editContact, viewEmailAction } from "../../store/Slices/viewEmail";
import { toast } from "react-toastify";

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
  const { contactInfo, accountInfo,dealInfo,message,error,loading} = useSelector(
    (state) => state.viewEmail
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    contact: contactInfo || {},
    account: accountInfo || {},
    deal: dealInfo || {}
  });
const dispatch = useDispatch();
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSave = () => {
    dispatch(editContact(formData))
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  useEffect(() => {
   if(message){
    toast.success(message);
    dispatch(viewEmailAction.clearAllMessage())
   }
   if(error){
    toast.success(error);
    dispatch(viewEmailAction.clearAllErrors())
   }
  }, [message, error, dispatch]);


  useEffect(() => {
  console.log('formData:', formData);
}, []);

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
            <div className="editbtn cursor-pointer" onClick={handleEditClick}>
                <img width="48" height="48" src="https://img.icons8.com/fluency/48/create-new.png" alt="create-new"/>
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
              <GlassInfo icon={<ChartSpline />} label="Status" value={contactInfo?.status} />
              <GlassInfo icon={<Target />} label="Last Activity" value={contactInfo?.date_modified} />
              <GlassInfo icon={<DollarSign />} label="Deal Amount" value={formData?.deal?.[0]?.dealamount || "N/A"} />
              <GlassInfo icon={<Clock />} label="Deal Date" value={formData?.deal?.[0]?.date_entered || "N/A"} />
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

      {/* Edit Modal */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="backdrop-blur-xl bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Edit Contact & Account</h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} className="text-purple-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.contact.first_name || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.contact.last_name || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Stage</label>
                    <input
                      type="text"
                      name="stage"
                      value={formData.contact.stage || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone_mobile"
                      value={formData.contact.phone_mobile || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email1"
                      value={formData.contact.email1 || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Date Entered</label>
                    <input
                      type="date"
                      name="date_entered"
                      value={formData.contact.date_entered || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Customer Type</label>
                    <input
                      type="text"
                      name="customer_type"
                      value={formData.contact.customer_type || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Addresses */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Contact Addresses
                </h3>
                <div className="space-y-4">
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Primary Address</label>
                    <textarea
                      name="billing_address_street"
                      value={formData.contact.billing_address_street || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Secondary Address</label>
                    <textarea
                      name="alt_address_street"
                      value={formData.contact.alt_address_street || ''}
                      onChange={(e) => handleChange(e, 'contact')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-pink-600" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.account.company || ''}
                      onChange={(e) => handleChange(e, 'account')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Account ID</label>
                    <input
                      type="text"
                      name="accountId"
                      value={formData.account.accountId || ''}
                      onChange={(e) => handleChange(e, 'account')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone_office"
                      value={formData.account.phone_office || ''}
                      onChange={(e) => handleChange(e, 'account')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.account.website || ''}
                      onChange={(e) => handleChange(e, 'account')}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Addresses */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Account Addresses
                </h3>
                <div className="space-y-4">
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Billing Address</label>
                    <textarea
                      name="billing_address_street"
                      value={formData.account.billing_address_street || ''}
                      onChange={(e) => handleChange(e, 'account')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Shipping Address</label>
                    <textarea
                      name="shipping_address_street"
                      value={formData.account.shipping_address_street || ''}
                      onChange={(e) => handleChange(e, 'account')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 font-semibold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
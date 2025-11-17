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

export default function Contactpage() {
  const { contactInfo, accountInfo } = useSelector(
    (state) => state.viewEmail
  );

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl border"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <User size={24} /> Contact Information
        </h2>

        {/* Contact Details */}
        <div className="space-y-4">
          <InfoRow icon={<User />} label="Name" value={contactInfo?.first_name} />
          <InfoRow icon={<User />} label="Stage" value={contactInfo?.stage} />
          <InfoRow icon={<User />} label="Phone" value={contactInfo?.phone_mobile} />
          <InfoRow icon={<Mail />} label="Email" value={contactInfo?.email1} />
          <InfoRow icon={<MapPin />} label="Primary Address" value={contactInfo?.billing_address_street} />
          <InfoRow icon={<MapPin />} label="Secondary Address" value={contactInfo?.alt_address_street} />
          <InfoRow icon={<MapPin />} label="date_entered" value={contactInfo?.date_entered} />
           <InfoRow icon={<MapPin />} label="Customer_type" value={contactInfo?.customer_type} />
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Account Details */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <Building2 size={24} /> Account Details
        </h2>

        <div className="space-y-4">
          <InfoRow icon={<Building2 />} label="Company" value={accountInfo?.company} />
          <InfoRow icon={<Building2 />} label="Primary Address" value={accountInfo?.billing_address_street} />
          <InfoRow icon={<Building2 />} label="Billing Address" value={accountInfo?.billing_address_street} />
          <InfoRow icon={<Building2 />} label="Shipping Address" value={accountInfo?.shipping_address_street} />
          <InfoRow icon={<Building2 />} label="Phone" value={accountInfo?.phone_office} />
          <InfoRow icon={<Building2 />} label="website" value={accountInfo?.website} />
          <InfoRow
            icon={<CreditCard />}
            label="Account ID"
            value={accountInfo?.accountId}
          />
        </div>
      </motion.div>
    </div>
  );
}

// Reusable Info Row Component
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
      <div className="text-gray-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

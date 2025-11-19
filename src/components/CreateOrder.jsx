import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

export default function CreateOrder({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order_type: "",
    order_status: "",
    order_id: "",
    client_email: "",
    website: "",
    website_c: "",
    order_date: "",
    complete_date: "",
    our_link: "",
    their_links: "",
    anchor_text_c: "",
    invoice_link_c: "",
    doc_link_c: "",
    our_price_c: "",
    abc_c: "",
    spam_score_c: "",
    total_amount_c: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order Submitted:", formData);
  };

  return (
    <div className="w-full flex justify-center py-10 px-4 bg-gray-50">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full  bg-white rounded-3xl shadow-xl border border-gray-200 p-10 space-y-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Create New Order
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* SECTION 1 — Basic Details */}
        <Section title="Basic Details">
          <Input
            label="Order Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <Input
            label="Order Type"
            name="order_type"
            value={formData.order_type}
            onChange={handleChange}
          />
          <Input
            label="Order Status"
            name="order_status"
            value={formData.order_status}
            onChange={handleChange}
          />
          <Input
            label="Order ID"
            name="order_id"
            value={formData.order_id}
            onChange={handleChange}
          />
        </Section>

        {/* SECTION 2 — Client & Website */}
        <Section title="Client & Website">
          <Input
            label="Client Email"
            name="client_email"
            value={formData.client_email}
            onChange={handleChange}
          />
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
          <Input
            label="Website (Custom)"
            name="website_c"
            value={formData.website_c}
            onChange={handleChange}
          />
          <Input
            label="Order Date"
            type="date"
            name="order_date"
            value={formData.order_date}
            onChange={handleChange}
          />
          <Input
            label="Complete Date"
            type="date"
            name="complete_date"
            value={formData.complete_date}
            onChange={handleChange}
          />
        </Section>

        {/* SECTION 3 — Links */}
        <Section title="Links">
          <Input
            label="Our Link"
            name="our_link"
            value={formData.our_link}
            onChange={handleChange}
          />
          <Input
            label="Their Links"
            name="their_links"
            value={formData.their_links}
            onChange={handleChange}
          />
          <Input
            label="Anchor Text"
            name="anchor_text_c"
            value={formData.anchor_text_c}
            onChange={handleChange}
          />
          <Input
            label="Invoice Link"
            name="invoice_link_c"
            value={formData.invoice_link_c}
            onChange={handleChange}
          />
          <Input
            label="Document Link"
            name="doc_link_c"
            value={formData.doc_link_c}
            onChange={handleChange}
          />
        </Section>

        {/* SECTION 4 — Pricing & Controls */}
        <Section title="Pricing & Score">
          <Input
            label="Our Price"
            name="our_price_c"
            value={formData.our_price_c}
            onChange={handleChange}
          />
          <Input
            label="ABC Score"
            name="abc_c"
            value={formData.abc_c}
            onChange={handleChange}
          />
          <Input
            label="Spam Score"
            name="spam_score_c"
            value={formData.spam_score_c}
            onChange={handleChange}
          />
          <Input
            label="Total Amount"
            name="total_amount_c"
            value={formData.total_amount_c}
            onChange={handleChange}
          />
        </Section>

        {/* SUBMIT BUTTON */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full py-4 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
        >
          Create Order
        </motion.button>
      </motion.form>
    </div>
  );
}

/* ------------------ Reusable Components ------------------ */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full bg-gray-100 border border-gray-300 rounded-xl 
          px-4 py-3 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-400
        "
        placeholder={label}
      />
    </div>
  );
}

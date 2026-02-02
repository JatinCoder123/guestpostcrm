import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

const TABS = [
  { key: "description", label: "Manual Prompt" },
  { key: "role_prompt", label: "Role Prompt" },
  { key: "output_prompt", label: "Output Prompt" },
  { key: "overwrite_prompt", label: "Overwrite Prompt" },
];

export default function EditModal({ item, onClose, handleUpdate }) {
  const [activeTab, setActiveTab] = useState("description");

  const [form, setForm] = useState({
    id: "",
    name: "",
    motive: "",
    type: "",
    description: "",
    role_prompt: "",
    output_prompt: "",
    overwrite_prompt: "",
  });

  // Fill state when modal opens
  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        name: item.name || "",
        motive: item.motive || "",
        type: item.type || "",
        description: item.description || "",
        role_prompt: item.role_prompt || "",
        output_prompt: item.output_prompt || "",
        overwrite_prompt: item.overwrite_prompt || "",
      });
    }
  }, [item]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    handleUpdate({ ...item, ...form });
    toast.success("Updated successfully!");
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="bg-white rounded-2xl p-6 w-full max-w-[800px] shadow-xl relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <X />
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Item</h2>

            {/* Top Fields */}
            <div className="flex gap-4 mb-6">
              <Input label="Name" value={form.name} />
              <Input label="Motive" value={form.motive} />
              <Input label="Type" value={form.type} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b mb-4 bg-gray-200 rounded-xl p-1">

              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative z-10 w-1/2 py-2 text-sm font-medium   transition-colors duration-300 cursor-pointer
        ${activeTab === tab.key ? "text-purple-600 bg-white rounded-xl" : "text-gray-600 bg-gray-200 rounded-xl"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>


            {/* Single Textarea */}
            <div className="mb-6">
              <textarea
                value={form[activeTab]}
                onChange={(e) => updateField(activeTab, e.target.value)}
                className="w-full h-56 p-3 border rounded-xl bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${TABS.find(t => t.key === activeTab)?.label}`}
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              Save Changes
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Input = ({ label, value }) => (
  <div className="flex-1">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      value={value}
      disabled
      className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
    />
  </div>
);

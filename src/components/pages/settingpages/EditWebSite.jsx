import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

export default function EditWebSite({ item, onClose, handleUpdate, ...props }) {
  // Local form state
  const [form, setForm] = useState({
    id: "",
    name: "",
    website_type: "",
    description: "",
  });

  // Fill state when modal opens
  useEffect(() => {
    if (item) {
      setForm({
        id: item.id,
        name: item.name || "",
        website_type: item.website_type || "",
        description: item.description || "",
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

    const updated = { ...item, ...form };
    if (item.type == "new") {
      props.handleCreate(updated);
      toast.success("Created successfully!");
      onClose();
    } else {
      handleUpdate(updated);
      toast.success("Updated successfully!");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            key="modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-200"
            >
              <X />
            </button>

            <h2 className="text-2xl font-semibold mb-4">Edit Item</h2>

            <div className="space-y-4">
              {/* NAME */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                />
              </div>

              {/* WEBSITE TYPE (Select Input) */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Website Budget
                </label>
                <select
                  value={form.website_type}
                  onChange={(e) => updateField("website_type", e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="very low">Very Low</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="w-full mt-1 p-2 border rounded-lg bg-blue-50"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full mt-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
              >
                {item.type == "new" ? "Create Website" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

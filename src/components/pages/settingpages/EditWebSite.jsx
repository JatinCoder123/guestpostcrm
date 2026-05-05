import { AnimatePresence, motion as Motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

export default function EditWebSite({ item, onClose, handleUpdate, ...props }) {
  // Local form state
  const [form, setForm] = useState({
    id: "",
    website_name: "",
    slug: "",
    maxAmount: "",
    minAmount: "",
  });

  // Fill state when modal opens
  useEffect(() => {
    if (item) {
      setForm({
        id: item.id || "",
        website_name: item.website_name || item.name || item.website || "",
        slug: item.slug || "",
        maxAmount: item.maxAmount ?? item.amount ?? "",
        minAmount: item.minAmount ?? item.minimum_price ?? "",
      });
    }
  }, [item]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.website_name.trim()) {
      toast.error("Website name cannot be empty");
      return;
    }

    const updated = { ...item, ...form };
    if (item.type == "new") {
      props.handleCreate(updated);
      onClose();
    } else {
      handleUpdate(updated);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <Motion.div
          key="modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Motion.div
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

            <h2 className="text-2xl font-semibold mb-4">
              {item.type == "new" ? "Create Website" : "Edit Website"}
            </h2>

            <div className="space-y-4">
              {/* WEBSITE NAME */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Website Name
                </label>
                <input
                  value={form.website_name}
                  onChange={(e) => updateField("website_name", e.target.value)}
                  placeholder="https://sugarai.com/blog"
                  className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                />
              </div>

              {/* SLUG */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="sugar"
                  className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MAX AMOUNT */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Max Amount
                  </label>
                  <input
                    value={form.maxAmount}
                    type="number"
                    min="0"
                    onChange={(e) => updateField("maxAmount", e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                  />
                </div>

                {/* MIN AMOUNT */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Min Amount
                  </label>
                  <input
                    value={form.minAmount}
                    type="number"
                    min="0"
                    onChange={(e) => updateField("minAmount", e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={props.saving}
                className="w-full mt-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {props.saving
                  ? "Saving..."
                  : item.type == "new"
                    ? "Create Website"
                    : "Save Changes"}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

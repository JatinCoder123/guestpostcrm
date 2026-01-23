import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

export default function EditModal({ item, onClose, handleUpdate }) {
  // Local form state
  const [form, setForm] = useState({
    id: "",
    name: "",
    motive: "",
    type: "",
    description: "",
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
    handleUpdate(updated);
    toast.success("Updated successfully!");
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50  flex items-center justify-center z-50"
        >
          <motion.div
            key="modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl  p-4 w-full max-w-[700px] shadow-xl relative"
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
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* NAME */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <input
                      value={form.name}
                      disabled
                      className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* MOTIVE */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Motive
                    </label>
                    <input
                      value={form.motive}
                      disabled
                      className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* TYPE */}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Type
                    </label>
                    <input
                      value={form.type}
                      disabled
                      className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className=" h-[300px] ">
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={10}
                    className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full mt-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

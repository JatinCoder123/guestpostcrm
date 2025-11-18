export default function EditModal({ item, onClose }) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <m.div
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

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input
                defaultValue={item.name}
                className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Motive
              </label>
              <input
                defaultValue={item.motive}
                className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <input
                defaultValue={item.type}
                className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                defaultValue={item.description}
                rows={4}
                className="w-full mt-1 p-2 border rounded-lg bg-gray-50"
              />
            </div>

            {/* Save Button */}
            <button className="w-full mt-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition">
              Save Changes
            </button>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}

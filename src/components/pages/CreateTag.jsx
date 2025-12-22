import { useState } from "react";
import { Save } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createTag } from "../../store/Slices/tag";

const CreateTag = ({ onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const { creating, error: reduxError } = useSelector((state) => state.tag);
  
  const [tagName, setTagName] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      setLocalError("Please enter a tag name");
      return;
    }

    setLocalError("");
    
    try {
      await dispatch(createTag(tagName));
      
      
      if (onSubmit) {
        onSubmit(tagName);
      }
      
    } catch (err) {
      setLocalError(err.message || "Failed to create tag");
    }
  };

  const handleCancel = () => {
    setTagName("");
    setLocalError("");
    onCancel();
  };

  const error = reduxError || localError;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Tag Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag Name *
        </label>
        <input
          type="text"
          value={tagName}
          onChange={(e) => {
            setTagName(e.target.value);
            setLocalError("");
          }}
          placeholder="Enter tag name"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
          }`}
          required
          autoFocus
          disabled={creating}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={creating}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={creating || !tagName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {creating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Create Tag</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateTag;
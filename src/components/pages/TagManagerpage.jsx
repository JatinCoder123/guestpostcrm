import {
  Calendar,
  User,
  FileText,
  Shield,
  TagIcon,
  Trash2,
  MoreVertical,
  Plus,
  X,
  CheckCircle,
  Type,
  TypeIcon,
  User2,
  ActivityIcon,
  Edit,
  CircleCheckIcon,
  Clipboard,
  Clapperboard,
  Calendar1,
  Tag,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination";
import { getTags, tagActions } from "../../store/Slices/tag";
import CreateTag from "./CreateTag";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function TagManagerpage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tags, count, creating, createSuccess, error } = useSelector(
    (state) => state.tag,
  );

  const [selectedTag, setSelectedTag] = useState("hot"); // For dropdown selection
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdTagName, setCreatedTagName] = useState("");

  // Fetch tags on component mount or when selectedTag changes
  useEffect(() => {
    dispatch(getTags());
  }, [dispatch, selectedTag]);

  useEffect(() => {
    if (createSuccess) {
      toast.success("Created tag successfully");
      dispatch(tagActions.resetCreateStatus());
      dispatch(getTags());
    }
    if (error) {
      toast.error("Create Tag failed");
      dispatch(tagActions.resetCreateStatus());
    }
  }, [createSuccess, error]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      const datePart = dateString.split(" ")[0];
      return datePart || dateString;
    }
  };

  const handleConfirmDelete = (id, firstName) => {};

  const handleCreateTagSuccess = (tagName) => {
    setCreatedTagName(tagName);

    setShowCreateForm(false);

    dispatch(getTags());

    dispatch(tagActions.resetCreateStatus());
  };

  const handleClosePopup = () => {
    if (!creating) {
      dispatch(tagActions.resetCreateStatus());
      setShowCreateForm(false);
    }
  };

  return (
    <>
      {/* Main Container with blur effect */}
      <div
        className={`${showCreateForm ? "filter blur-sm pointer-events-none" : ""} transition-all duration-300`}
      >
        {/* Tag Manager Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header with Create Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-green-100 hover:bg-green-200 ring-2 ring-green-300 transition shadow-sm "
              >
                <ArrowLeft className="w-5 h-5 text-green-700" />
              </button>
              <TagIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl text-gray-900">Tag Manager</h2>
              <a
                href="https://www.guestpostcrm.com/blog/guestpostcrm-moves-certain-spam-emails-back-to-inbox/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  width="30"
                  height="30"
                  src="https://img.icons8.com/offices/30/info.png"
                  alt="info"
                />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tag</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>CREATED AT</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4" />
                      <span>TAG</span>
                    </div>
                  </th>

                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4" />
                      <span>MEMO NO</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <ActivityIcon className="w-4 h-4" />
                      <span>TYPE</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>DATE MODIFIED</span>
                    </div>
                  </th>
                  {/* <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Clapperboard className="w-4 h-4" />
                      <span>ACTION</span>
                    </div>
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {tags?.length > 0 &&
                  tags.map((tagItem) => (
                    <tr
                      key={tagItem.thread_id || tagItem.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{tagItem.date_entered}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          <TagIcon className="w-4 h-4 text-gray-400" />
                          <span>{tagItem.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <ActivityIcon className="w-4 h-4 text-gray-400" />
                          <span>{tagItem.memo_c || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <ActivityIcon className="w-4 h-4 text-gray-400" />
                          <span>{tagItem.type || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar1 className="w-4 h-4 text-gray-400" />
                          <span>{tagItem.date_modified || "Unknown"}</span>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <button
                          onClick={() => handleConfirmDelete()}
                          disabled={
                            deletingId === (tagItem.thread_id || tagItem.id)
                          }
                          className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-red-200 hover:bg-red-300 cursor-pointer
                        `}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td> */}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {tags?.length > 0 && <Pagination slice={"tag"} fn={getTags} />}

          {(!tags || tags.length === 0) && (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No tags found. Select a tag from dropdown to view data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Tag Form Popup */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClosePopup}
          ></div>

          {/* Popup Card */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <TagIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Tag
                </h2>
              </div>
              <button
                onClick={handleClosePopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={creating}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <CreateTag
              onSubmit={handleCreateTagSuccess}
              onCancel={handleClosePopup}
            />
          </div>
        </div>
      )}
    </>
  );
}

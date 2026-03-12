import SearchComponent from "./SearchComponent";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Calendar,
  User,
  ExternalLink,
  Shield,
  TrendingUp,
  Clock,
  EqualApproximatelyIcon,
  ArrowLeft,
  Edit,
  X,
} from "lucide-react";

import { BacklinkDetailBox } from "../../components/pages/BacklinkDetailBox";
import {
  getBacklinks,
  getBacklinkDetail,
  updateBacklink,
} from "../../store/Slices/backlinks";
import { useNavigate } from "react-router-dom";

export function Allbacklinkspage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, backlinks, error } = useSelector((state) => state.backlinks);

  const [showDetail, setShowDetail] = useState(false);
  const [currentBacklinkId, setCurrentBacklinkId] = useState(null);

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [saving, setSaving] = useState(false);

  /* ---------------- EDIT MODAL STATES ---------------- */

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEditClick = (backlink) => {
    setEditData(backlink);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);

      await dispatch(updateBacklink(editData));

      toast.success("Backlink updated successfully");

      setShowEditModal(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filteredbacklinks = backlinks.filter((item) => {
    const searchValue = topsearch.toLowerCase();
    if (!searchValue) return true;

    const contact = item?.post_author_name_c?.toLowerCase() ?? "";
    const subject = item?.target_url_c?.toLowerCase() ?? "";

    if (selectedCategory === "contact") {
      return contact.includes(searchValue);
    }

    if (selectedCategory === "subject") {
      return subject.includes(searchValue);
    }

    return contact.includes(searchValue);
  });

  const handleSearchChange = (value) => setTopsearch(value);
  const handleCategoryChange = (value) => setSelectedCategory(value);

  useEffect(() => {
    dispatch(getBacklinks());
  }, [dispatch]);

  const handleBacklinkClick = (backlinkId) => {
    setCurrentBacklinkId(backlinkId);
    dispatch(getBacklinkDetail(backlinkId));
    setShowDetail(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "removed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (showDetail && currentBacklinkId) {
    return (
      <BacklinkDetailBox
        onClose={() => setShowDetail(false)}
        backlinkId={currentBacklinkId}
      />
    );
  }
  if (loading && backlinks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 flex justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
      </div>
    );
  }
  return (
    <>
      <SearchComponent
        dropdownOptions={[
          { value: "subject", label: "Target url" },
          { value: "contact", label: "Author" },
        ]}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        searchValue={topsearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search items..."
        showDownload={false}
        className="mb-6"
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ExternalLink className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">ALL BACKLINKS</h2>
          </div>

          <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full">
            {backlinks.length} Backlinks
          </span>
        </div>

        {/* TABLE */}

        <div className="overflow-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-4 text-left">CREATED</th>
                <th className="px-6 py-4 text-left">AUTHOR</th>
                <th className="px-6 py-4 text-left">TARGET URL</th>
                <th className="px-6 py-4 text-left">ANCHOR TEXT</th>
                <th className="px-6 py-4 text-left">EXPIRY</th>
                <th className="px-6 py-4 text-left">LINK TYPE</th>
                <th className="px-6 py-4 text-left">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredbacklinks.map((backlink, index) => (
                <tr
                  key={backlink.id || index}
                  className="border-b hover:bg-green-50"
                >
                  <td className="px-6 py-4">{backlink.date_entered}</td>

                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {backlink.post_author_name_c?.substring(0, 20)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {backlink.post_author_email_c?.substring(0, 20)}
                    </div>
                  </td>

                  <td className="px-6 py-4 max-w-[250px] truncate">
                    <a
                      href={backlink.target_url_c}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {backlink.target_url_c?.substring(0, 40)}...
                    </a>
                  </td>

                  <td className="px-6 py-4">
                    {backlink.anchor_text_c || "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    {formatDate(backlink.expiry_date_c)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        backlink.link_type,
                      )}`}
                    >
                      {backlink.link_type}
                    </span>
                  </td>

                  {/* EDIT BUTTON */}

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditClick(backlink)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {backlinks.length === 0 && !loading && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No backlinks found</p>
          </div>
        )}
      </div>

      {/* ---------------- EDIT POPUP MODAL ---------------- */}

      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative">
            {/* CLOSE */}

            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">Edit Backlink</h2>

            {/* AUTHOR */}

            <input
              type="text"
              name="post_author_name_c"
              value={editData.post_author_name_c || ""}
              onChange={handleEditChange}
              placeholder="Author Name"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* EMAIL */}

            <input
              type="email"
              name="post_author_email_c"
              value={editData.post_author_email_c || ""}
              onChange={handleEditChange}
              placeholder="Author Email"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* TARGET URL */}

            <input
              type="text"
              name="target_url_c"
              value={editData.target_url_c || ""}
              onChange={handleEditChange}
              placeholder="Target URL"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* ANCHOR TEXT */}

            <input
              type="text"
              name="anchor_text_c"
              value={editData.anchor_text_c || ""}
              onChange={handleEditChange}
              placeholder="Anchor Text"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* EXPIRY */}

            <input
              type="date"
              name="expiry_date_c"
              value={editData.expiry_date_c || ""}
              onChange={handleEditChange}
              className="w-full border p-2 mb-4 rounded"
            />

            {/* LINK TYPE */}

            <select
              name="link_type"
              value={editData.link_type || ""}
              onChange={handleEditChange}
              className="w-full border p-2 mb-6 rounded"
            >
              <option value="dofollow">dofollow</option>
              <option value="nofollow">nofollow</option>
            </select>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import SearchComponent from "./SearchComponent";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Calendar,
  User,
  ExternalLink,
  Shield,
  TrendingUp,
  Clock,
  EqualApproximatelyIcon,
  Plus,
} from "lucide-react";
import { BacklinkDetailBox } from "../../components/pages/BacklinkDetailBox";
import { getBacklinks, getBacklinkDetail } from "../../store/Slices/backlinks";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Allbacklinkspage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, backlinks, error } = useSelector((state) => state.backlinks);

  const [showDetail, setShowDetail] = useState(false);
  const [currentBacklinkId, setCurrentBacklinkId] = useState(null);

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("");

  const filteredbacklinks = backlinks
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true;

      // SAFELY HANDLE "from"
      const fromField = item?.post_author_name_c ?? "";
      const contact = fromField.toLowerCase();

      // SAFE subject
      const subject = item?.target_url_c?.toLowerCase() ?? "";

      const date = item?.date_entered?.toLowerCase() ?? "";

      if (selectedCategory === "contect" || selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      if (selectedCategory === "subject") {
        return subject.includes(searchValue);
      }

      return contact.includes(searchValue);
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      const aFrom = a?.from ?? "";
      const bFrom = b?.from ?? "";

      if (selectedSort === "asc") {
        return aFrom.localeCompare(bFrom);
      }
      if (selectedSort === "desc") {
        return bFrom.localeCompare(aFrom);
      }
      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleFilterApply = (filters) => {};

  const handleDownload = () => {
    if (!filtereditems || filtereditems.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["DATE", "WEBSITES"];

    const rows = filtereditems.map((email) => [email.date_entered, email.name]);

    // Convert to CSV string
    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((val) => `"${val}"`).join(",")).join("\n");

    // Create and auto-download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "unreplied-emails.csv";
    a.click();
  };

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Loading backlinks...</p>
      </div>
    );
  }

  if (error && backlinks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center text-red-600">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Backlinks</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => dispatch(getBacklinks())}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
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
        // dropdownPlaceholder="Filter by target url "

        searchValue={topsearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search  items..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 ring-2 ring-green-300 transition shadow-sm"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-green-700" />
            </button>
            <ExternalLink className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-900">ALL BACKLINKS</h2>
            <a href="#" title="Backlinks Information">
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full">
              {backlinks.length} Backlinks
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>CREATED AT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>AUTHOR</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>TARGET URL</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>ANCHOR TEXT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>EXPIRY DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>STATUS</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredbacklinks.map((backlink, index) => (
                <tr
                  key={backlink.id || index}
                  className="border-b border-gray-100 hover:bg-green-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(backlink.date_entered)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      <div className="font-medium">
                        {backlink.post_author_name_c}
                      </div>
                      <div className="text-sm text-gray-500">
                        {backlink.post_author_email_c}
                      </div>
                    </div>
                  </td>
                  <td
                    onClick={() => handleBacklinkClick(backlink.id)}
                    className="px-6 py-4 text-blue-600 hover:text-blue-800"
                  >
                    <div className="flex items-center gap-1">
                      {backlink.target_url_c?.substring(0, 40)}...
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </td>
                  <td
                    onClick={() => handleBacklinkClick(backlink.id)}
                    className="px-6 py-4 text-gray-900 hover:text-green-700"
                  >
                    {backlink.anchor_text_c || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(backlink.expiry_date_c)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(backlink.status_c)}`}
                    >
                      {backlink.status_c?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {backlinks.length === 0 && !loading && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No backlinks found.</p>
          </div>
        )}
      </div>
    </>
  );
}

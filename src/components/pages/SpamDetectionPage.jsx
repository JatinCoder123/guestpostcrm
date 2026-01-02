import {
  Mail,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  BarChart,
  Shield,
  ArrowLeft,
} from "lucide-react";

import SearchComponent from "./SearchComponent";
import { useState } from "react";
import { useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getDetection } from "../../store/Slices/detection";
import { useNavigate } from "react-router-dom";

export function SpamDetectionPage() {
  const { detection, count } = useSelector((state) => state.detection);
  const navigate = useNavigate();

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearchChange = (value) => {
    setTopsearch(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleFilterApply = (filters) => {};

  const handleDownload = () => {
    console.log("download handler");
  };

  return (
    <>
    

      {/* 🔍 Search / Filters */}
      <SearchComponent
        dropdownOptions={[
          { value: "all", label: "Websites" },
        ]}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        searchValue={topsearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search items..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      {/* 🛡 Spam Detection Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">

  {/* 🔙 Back Button */}
       <button
    onClick={() => navigate(-1)}
    className="p-2 rounded-full bg-green-100 hover:bg-green-200 ring-2 ring-green-300 transition shadow-sm"
    title="Go back"
  >
    <ArrowLeft className="w-5 h-5 text-green-700" />
  </button>
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl text-gray-900">SPAM DETECTION</h2>
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
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full">
            {count} Spam Detected
          </span>
        </div>

        {/* 📊 Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
 
            <tbody>
              {detection?.length > 0 &&
                detection.map((spam) => (
                  <tr
                    key={spam.thread_id}
                    className="border-b border-gray-100 hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{spam.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{spam.from}</td>
                    <td className="px-6 py-4 text-gray-900">{spam.subject}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {spam.thread_count}
                    </td> 
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
        {detection?.length > 0 && (
          <Pagination slice={"detection"} fn={getDetection} />
        )}

        {/* Empty State */}
        {detection?.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Spam Found.</p>
          </div>
        )}
      </div>
    </>
  );
}

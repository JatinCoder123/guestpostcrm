import {
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  LeafyGreen,
  BarChart,
  Repeat,
  EqualApproximatelyIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getAllHot } from "../../store/Slices/hotSlice";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import SearchComponent from "./SearchComponent";
import { LoadingChase } from "../Loading";

export function HotPage() {
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const { currentHot } = useContext(PageContext);
  const { hots, loading, error, count } = useSelector((state) => state.hot);
  const dispatch = useDispatch();

  console.log("hots data:", hots);
  useEffect(() => {
    dispatch(getAllHot());
  }, [currentHot]);
  const filteredEmails = []
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true;

      const contact = item.name?.toLowerCase() || "";
      const subject = item.description?.toLowerCase() || "";

      if (selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      if (selectedCategory === "subject") {
        return subject.includes(searchValue);
      }

      return contact.includes(searchValue);
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      if (selectedSort === "asc") {
        return a.name.localeCompare(b.name);
      }
      if (selectedSort === "desc") {
        return b.name.localeCompare(a.name);
      }
      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }
      if (selectedSort === "newest") {
        return new Date(b.date_entered) - new Date(a.date_entered);
      }

      return 0;
    });

  const dropdownOptions = [
    { value: "contect", label: "contact" },
    { value: "subject", label: "subject" },
  ];

  const filterOptions = [
    { value: "asc", label: "A to Z" },
    { value: "desc", label: "Z to A" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  const handleFilterApply = (filters) => {
    console.log("Applied filters from popup:", filters);
  };

  const handleSearchChange = (value) => {
    setTopsearch(value);
    console.log("Searching for:", value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    console.log("Category selected:", value);
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    console.log("Sort selected:", value);
  };

  const handleDownload = () => {
    if (!filteredEmails || filteredEmails.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["Date", "Contact", "Subject", "Count"];

    const rows = filteredEmails.map((email) => [
      email.date_entered,
      email.name,
      email.description,
      email.type,
    ]);

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

  return (
    <>
      <SearchComponent
        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        dropdownPlaceholder="Filter by"
        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search emails..."
        onFilterApply={handleFilterApply}
        filterPlaceholder="Filters"
        showFilter={true}
        archiveOptions={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        transactionTypeOptions={[
          { value: "all", label: "All Emails" },
          { value: "incoming", label: "Incoming" },
          { value: "outgoing", label: "Outgoing" },
        ]}
        currencyOptions={[
          { value: "all", label: "All" },
          { value: "usd", label: "USD" },
          { value: "eur", label: "EUR" },
        ]}
        onDownloadClick={handleDownload}
        showDownload={true}
        className="mb-6"
      />

      {/* Unanswered Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">HOT EMAILS</h2>
            <a
              href="https://www.guestpostcrm.com/blog/unreplied-and-unanswered-emails-in-guestpostcrm/"
              target="_blank"
            >
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Hot
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>DATE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>CONTACT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>DESCRIPTION</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>TYPE</span>
                  </div>
                </th>
              </tr>
            </thead>
            {!loading ? (
              <tbody>
                {hots?.map((email, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{email?.date_entered}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-900">{email?.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {email.description}
                    </td>
                    <td className="px-6 py-4 text-purple-600">{email.type}</td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-center items-center py-10">
                      <LoadingChase />
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        {hots.length === 0 && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Hot Notifications yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

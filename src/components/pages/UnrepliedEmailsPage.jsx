import {
  Mail,
  Calendar,
  User,
  FileText,
  Repeat,
  BarChart2,
  MessageCircleDashed,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useContext } from "react";
import Pagination from "../Pagination";
import {
  getUnrepliedEmail,
  unrepliedAction,
} from "../../store/Slices/unrepliedEmails";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import SearchComponent from "./SearchComponent";
import { ladgerAction } from "../../store/Slices/ladger";
import { extractEmail } from "../../assets/assets";
import TableLoading from "../TableLoading";
import { useThreadContext } from "../../hooks/useThreadContext";
import InfinitePagination from "../InfinitePagination";
import { LoadingChase } from "../Loading";

export function UnrepliedEmailsPage() {
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedView, setSelectedView] = useState("unreplied");

  const [selectedSort, setSelectedSort] = useState("");
  const { count, emails, loading, unread, pageIndex, pageCount } = useSelector(
    (state) => state.unreplied,
  );

  const { setEnteredEmail, setCurrentIndex, setWelcomeHeaderContent, setSearch } =
    useContext(PageContext);
  const { handleMove } = useThreadContext()



  const navigateTo = useNavigate();
  const dispatch = useDispatch();



  const filteredEmails = emails
    .filter((item) => {
      // 🔴 UNREAD FILTER
      if (selectedView === "unread" && item.is_seen != 0) {
        return false;
      }

      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true;

      const contact = item.from?.split("<")[0].trim().toLowerCase();
      const subject = item.subject?.toLowerCase() || "";

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

      if (selectedSort === "asc") {
        return a.from.localeCompare(b.from);
      }

      if (selectedSort === "desc") {
        return b.from.localeCompare(a.from);
      }

      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

  // ------------------------------------------------------------------

  const dropdownOptions = [
    { value: "contect", label: "Contact" },
    { value: "subject", label: "Subject" },
  ];



  const handleFilterApply = (filters) => {
    setSelectedSort(filters.sort || "");
  };

  const handleSearchChange = (value) => setTopsearch(value);

  const handleCategoryChange = (value) => setSelectedCategory(value);
  const handleSortChange = (value) => setSelectedSort(value);
  const handleDownload = () => {
    if (!filteredEmails || filteredEmails.length === 0) {
      toast.error("No data available to download");
      return;
    }

    // Convert Objects → CSV rows
    const headers = ["Date", "Contact", "Subject", "Count"];

    const rows = filteredEmails.map((email) => [
      email.date_entered,
      email.from?.split("<")[0].trim(),
      email.subject,
      email.thread_count,
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
  const handleOnClick = (email, navigate) => {
    const input = extractEmail(email.from);
    localStorage.setItem("email", input);
    setSearch(input);
    setEnteredEmail(input);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Replied");
    navigateTo(navigate);
  };
  const Row = ({ index, style, data }) => {
    // Loader row
    if (index >= data.length) {
      return (
        <div
          style={style}
          className="flex items-center justify-center border-b border-gray-100 px-6"
        >
          <LoadingChase color="gray" />
        </div>
      );
    }
    const email = data[index];

    return (
      <div
        style={style}
        className={`grid grid-cols-5 border-b border-gray-100 hover:bg-purple-50 ${email?.stage == "Order" ? "bg-green-100 hover:bg-green-50" : ""} cursor-pointer`}
      >
        <div
          onClick={() => handleOnClick(email, "/")}
          className="px-6 py-4 flex items-center gap-2 text-gray-600"
        >
          <Calendar className="w-4 h-4 text-gray-400" />
          {email.date_entered}
        </div>

        <div
          className="px-6 py-4 text-gray-900"
          onClick={() => handleOnClick(email, "/contact")}
        >
          {email.from?.split("<")[0]?.trim()}
        </div>

        <div
          onClick={() =>
            handleMove({
              email: extractEmail(email.from),
              threadId: email.thread_id,
            })
          }
          className="px-6 py-4 text-purple-600 truncate max-w-[300px]"
        >
          {email.subject}
        </div>
        <div
          onClick={() =>
            handleMove({
              email: extractEmail(email.from),
              threadId: email.thread_id,
            })
          }
          className="px-6 py-4 text-purple-600 truncate max-w-[300px]"
        >
          {email?.stage || "-"}
        </div>

        <div
          onClick={() => handleOnClick(email, "/")}
          className="px-6 py-4 text-purple-600"
        >
          {email.thread_count}
        </div>
      </div>
    );
  };

  return (
    <>
      <SearchComponent
        dropdownOptions={dropdownOptions}
        onDropdownChange={handleCategoryChange}
        selectedDropdownValue={selectedCategory}
        // dropdownPlaceholder="Filter by Status"
        dropdownPlaceholder="Filter by"
        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search here..."
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

      {/* SECTION */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              UNREPLIED EMAILS
            </h2>
            <a
              href="https://www.guestpostcrm.com/blog/unreplied-and-unanswered-emails-in-guestpostcrm/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/offices/30/info.png"
                alt="info"
              />
            </a>
          </div>

          {/* Counters */}
          <div className="flex justify-center">
            <div className="relative flex bg-gray-200 rounded-xl p-1 w-[260px]">
              {/* Sliding Indicator */}
              <div
                className={`absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)]
        bg-white rounded-xl shadow
        transition-transform duration-300 ease-in-out
        ${selectedView === "unread" ? "translate-x-full" : "translate-x-0"}`}
              />

              {/* All Records */}
              <button
                onClick={() => setSelectedView("unreplied")}
                className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors duration-300
        ${selectedView === "unreplied" ? "text-purple-600" : "text-gray-600"}`}
              >
                {count} Unreplied
              </button>

              {/* Important Records */}
              <button
                onClick={() => setSelectedView("unread")}
                className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors duration-300
        ${selectedView === "unread" ? "text-purple-600" : "text-gray-600"}`}
              >
                {unread} Unread
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="grid grid-cols-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="px-6 py-4 flex items-center gap-2 font-bold">
            <Calendar className="w-4 h-4" />
            CREATED AT
          </div>

          <div className="px-6 py-4 flex items-center gap-2 font-bold">
            <User className="w-4 h-4" />
            CONTACT
          </div>

          <div className="px-6 py-4 flex items-center gap-2 font-bold">
            <FileText className="w-4 h-4" />
            SUBJECT
          </div>
          <div className="px-6 py-4 flex items-center gap-2 font-bold">
            <FileText className="w-4 h-4" />
            STAGE
          </div>

          <div className="px-6 py-4 flex items-center gap-2 font-bold">
            <BarChart2 className="w-4 h-4" />
            COUNT
          </div>
        </div>
        {loading && pageIndex === 1 ? (
          <TableLoading cols={4} />
        ) : (
          <InfinitePagination fn={() => dispatch(
            getUnrepliedEmail({
              page: pageIndex + 1,
              loading: false,
            })
          )} data={emails} pageCount={pageCount} pageIndex={pageIndex} Row={Row} loading={loading} />
        )}



        {filteredEmails.length === 0 && (
          <div className="p-12 text-center">
            <MessageCircleDashed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No matching emails found.</p>
          </div>
        )}
      </div>
    </>
  );
}

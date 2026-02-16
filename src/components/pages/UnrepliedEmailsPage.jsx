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
import useThread from "../../hooks/useThread";
import EmailBox from "../EmailBox";
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

export function UnrepliedEmailsPage() {
  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedView, setSelectedView] = useState("unreplied");

  const [selectedSort, setSelectedSort] = useState("");
  const { count, emails, loading, unread } = useSelector(
    (state) => state.unreplied,
  );

  const { setEnteredEmail, setWelcomeHeaderContent, setSearch } =
    useContext(PageContext);

  const [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
    email,
    setEmail,
  ] = useThread("unreplied");

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  if (showEmail && currentThreadId && email) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowEmails(false)}
          view={false}
          threadId={currentThreadId}
          tempEmail={email}
        />
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ✅ SEARCH + FILTER + SORT LOGIC (ONLY NEW CODE ADDED HERE)
  // ------------------------------------------------------------------
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

  const filterOptions = [
    { value: "asc", label: "A to Z" },
    { value: "desc", label: "Z to A" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>CREATED AT</span>
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
                    <span>SUBJECT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>COUNT</span>
                  </div>
                </th>
              </tr>
            </thead>
            {loading ? (
              <TableLoading cols={4} />
            ) : (
              <tbody>
                {/* 🟣 USING filteredEmails NOW (NOT emails) */}
                {filteredEmails.map((email) => (
                  <tr
                    key={email.thread_id}
                    className={`border-b border-gray-100 cursor-pointer transition-colors
                      ${
                        email.is_seen == 0
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-purple-50"
                      }
                    `}
                  >
                    <td
                      onClick={() => {
                        const input = extractEmail(email.from);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        dispatch(ladgerAction.setTimeline(null));
                        setWelcomeHeaderContent("Unreplied");
                        navigateTo("/");
                      }}
                      className="px-6 py-4"
                    >
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{email.date_entered}</span>
                      </div>
                    </td>

                    <td
                      onClick={() => {
                        const input = extractEmail(email.from);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        dispatch(ladgerAction.setTimeline(null));
                        setWelcomeHeaderContent("Unreplied");
                        navigateTo("/contacts");
                      }}
                      className="px-6 py-4 text-gray-900"
                    >
                      {email.from?.split("<")[0].trim()}
                    </td>

                    <td
                      onClick={() => {
                        setCurrentThreadId(email.thread_id);
                        handleThreadClick(email.from, email.thread_id);
                        setEmail(extractEmail(email.from));
                        if (email.is_seen == 0) {
                          dispatch(
                            unrepliedAction.updateUnread({
                              thread_id: email.thread_id,
                            }),
                          );
                        }
                      }}
                      className="px-6 py-4 text-purple-600"
                    >
                      {email.subject}
                    </td>

                    <td
                      onClick={() => {
                        const input = extractEmail(email.from);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        dispatch(ladgerAction.setTimeline(null));
                        setWelcomeHeaderContent("Unreplied");
                        navigateTo("/");
                      }}
                      className="px-6 py-4 text-purple-600"
                    >
                      {email.thread_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {emails?.length > 0 && (
          <Pagination
            slice={"unreplied"}
            fn={(p) => dispatch(getUnrepliedEmail({ page: p, loading: true }))}
          />
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

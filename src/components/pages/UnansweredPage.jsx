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
import { useSelector } from "react-redux";
import { useState } from "react";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getUnansweredEmails } from "../../store/Slices/unansweredEmails";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import SearchComponent from "./SearchComponent";

export function UnansweredPage() {
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [selectedSort, setSelectedSort] = useState('');
  const { count, emails } = useSelector((state) => state.unanswered);
  const { setWelcomeHeaderContent, setSearch, setEnteredEmail } = useContext(PageContext);
  const navigateTo = useNavigate()
  const [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
    email,
    setEmail,
  ] = useThread("unanswered");



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
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true; // no search → show all

      const contact = item.from.split("<")[0].trim().toLowerCase();
      const subject = item.subject?.toLowerCase() || "";
      const date = item.date_entered?.toLowerCase() || "";

      // 🟢 If category selected
      if (selectedCategory === "contect" || selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      if (selectedCategory === "subject") {
        return subject.includes(searchValue);
      }
      // if (selectedCategory === "date") {
      //   return date.includes(searchValue);
      // }

      // 🟢 Default search → CONTACT
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

      // if (selectedSort === "newest") {
      //   return new Date(b.date_entered) - new Date(a.date_entered);
      // }

      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

   const dropdownOptions = [
    
    { value: 'contect', label: 'contact' },
    { value: 'subject', label: 'subject' },
  ];

  const filterOptions = [
    { value: 'asc', label: 'A to Z' },
    { value: 'desc', label: 'Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
   
  ];

  const handleFilterApply = (filters) => {
    console.log('Applied filters from popup:', filters);
  };

  const handleSearchChange = (value) => {
    setTopsearch(value);
    console.log('Searching for:', value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    console.log('Category selected:', value);
  };

  const handleSortChange = (value) => {
    setSelectedSort(value); 
    console.log('Sort selected:', value);
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
    email.from.split("<")[0].trim(),
    email.subject,
    email.thread_count
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
      dropdownPlaceholder="Filter by contact"
      
      
      onSearchChange={handleSearchChange}
      searchValue={topsearch}
      searchPlaceholder="Search emails..."
      
      
      onFilterApply={handleFilterApply}
      filterPlaceholder="Filters"
      showFilter={true}
      
      
      archiveOptions={[
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]}
      transactionTypeOptions={[
        { value: 'all', label: 'All Emails' },
        { value: 'incoming', label: 'Incoming' },
        { value: 'outgoing', label: 'Outgoing' },
      ]}
      currencyOptions={[
        { value: 'all', label: 'All' },
        { value: 'usd', label: 'USD' },
        { value: 'eur', label: 'EUR' },
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
            <h2 className="text-xl font-semibold text-gray-900">REPLIED EMAILS</h2>
            <a href="https://www.guestpostcrm.com/blog/unreplied-and-unanswered-emails-in-guestpostcrm/" target="_blank">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Replied
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
                    <span>SUBJECT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>COUNT</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map((email, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <td
                    onClick={() => {
                      const input = extractEmail(email.from);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      setWelcomeHeaderContent("Replied");
                      navigateTo("/");
                    }}
                    className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date_entered}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900"
                    onClick={() => {
                      const input = extractEmail(email.from);
                      localStorage.setItem("email", input);
                      setSearch(input);
                      setEnteredEmail(input);
                      setWelcomeHeaderContent("Replied");
                      navigateTo("/contacts");
                    }}>{email.from.split("<")[0].trim()}</td>
                  <td
                    onClick={() => {
                      setCurrentThreadId(email.thread_id);
                      handleThreadClick(email.from, email.thread_id);
                      setEmail(extractEmail(email.from));
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
                      setWelcomeHeaderContent("Replied");
                      navigateTo("/");
                    }}
                    className="px-6 py-4 text-purple-600">
                    {email.thread_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {emails?.length > 0 && (
          <Pagination slice={"unanswered"} fn={getUnansweredEmails} />
        )}
        {filteredEmails.length === 0 && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Replied emails yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

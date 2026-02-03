import {
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  LeafyGreen,
  BarChart,
  Repeat,
  MoveRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getForwardedEmails } from "../../store/Slices/forwardedEmailSlice";
import { useContext, useState } from "react";
import SearchComponent from "./SearchComponent";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useDispatch } from "react-redux";
import TableLoading from "../TableLoading";
export function ForwardedPage() {
  const [topsearch, setTopsearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const { count, emails, loading } = useSelector((state) => state.forwarded);
  const [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
  ] = useThread();

  const { setWelcomeHeaderContent, setSearch, setEnteredEmail } = useContext(PageContext);
  const navigateTo = useNavigate()
  const dispatch = useDispatch()

  const filteredEmails = emails
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true;

      // SAFELY HANDLE "from"
      const fromField = item?.first_name ?? "";
      const contact = fromField.includes("<")
        ? fromField.split("<")[0].trim().toLowerCase()
        : fromField.trim().toLowerCase();

      // SAFE subject
      const subject = item?.subject?.toLowerCase() ?? "";

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



  const dropdownOptions = [

    { value: 'contect', label: 'Contact' },
    { value: 'subject', label: 'Subject' },
  ];

  const filterOptions = [
    { value: 'asc', label: 'A to Z' },
    { value: 'desc', label: 'Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },

  ];

  const handleFilterApply = (filters) => {
  };

  const handleSearchChange = (value) => {
    setTopsearch(value);

  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);

  };

  const handleSortChange = (value) => {
    setSelectedSort(value);

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
      email.first_name.split("<")[0].trim(),
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
        // dropdownPlaceholder="Filter by contact"


        onSearchChange={handleSearchChange}
        searchValue={topsearch}
        searchPlaceholder="Search here..."


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



      {showEmail && currentThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <EmailBox
            onClose={() => setShowEmails(false)}
            view={false}
            threadId={currentThreadId}
          />
        </div>
      )}
      {/* Unanswered Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">ASSIGNED EMAILS</h2>
            <a href="">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Forwarded
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
            {loading ? <TableLoading cols={4} /> : <tbody>
              {filteredEmails.map((email, index) => (
                <tr
                  key={index}

                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <td onClick={() => {
                    const input = extractEmail(email.email_address);
                    localStorage.setItem("email", input);
                    setSearch(input);
                    setEnteredEmail(input);
                    dispatch(ladgerAction.setTimeline(null))
                    setWelcomeHeaderContent("Assigned");
                    navigateTo("/");
                  }} className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date_entered}</span>
                    </div>
                  </td>
                  <td onClick={() => {
                    const input = extractEmail(email.email_address);
                    localStorage.setItem("email", input);
                    setSearch(input);
                    setEnteredEmail(input);
                    dispatch(ladgerAction.setTimeline(null))
                    setWelcomeHeaderContent("Assigned");
                    navigateTo("/contacts");
                  }} className="px-6 py-4 text-gray-900">{email.first_name}</td>
                  <td
                    onClick={() => {
                      setCurrentThreadId(email.thread_id);
                      handleThreadClick(email.from, email.thread_id);
                    }}
                    className="px-6 py-4 text-purple-600"
                  >
                    {email.subject}
                  </td>
                  <td onClick={() => {
                    const input = extractEmail(email.email_address);
                    localStorage.setItem("email", input);
                    setSearch(input);
                    setEnteredEmail(input);
                    dispatch(ladgerAction.setTimeline(null))
                    setWelcomeHeaderContent("Assigned");
                    navigateTo("/");
                  }} className="px-6 py-4 text-purple-600">
                    {email.thread_count}
                  </td>
                </tr>
              ))}
            </tbody>}
          </table>
        </div>
        {filteredEmails.length > 0 && (
          <Pagination slice={"forwarded"} fn={(page) => dispatch(getForwardedEmails({ page: page }))} />
        )}

        {emails.length === 0 && (
          <div className="p-12 text-center">
            <MoveRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Favourite emails yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

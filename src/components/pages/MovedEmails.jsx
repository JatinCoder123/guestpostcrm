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
import { useState } from "react";
import { useSelector } from "react-redux";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getmovedEmails } from "../../store/Slices/movedEmails";

import SearchComponent from "./SearchComponent";


export function MovedPage() {
  const { count, emails } = useSelector((state) => state.moved);


  
    const [topsearch, setTopsearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSort, setSelectedSort] = useState('');



    
  const filteredEmails = emails
  .filter((item) => {
    const searchValue = topsearch.toLowerCase();
    if (!searchValue) return true;

    // SAFELY HANDLE "from"
    const fromField = item?.email ?? "";
    const contact = fromField.toLowerCase();
  
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






    
      const handleSearchChange = (value) => {
        setTopsearch(value);
        
      };
    
      const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        
      };
    
      const handleFilterApply = (filters) => {
       
      };
    
    
      const handleDownload = () => {
        if (!filteredEmails || filteredEmails.length === 0) {
          toast.error("No data available to download");
          return;
        }
    
        // Convert Objects → CSV rows
        const headers = ["DATE", "SENDER","SUBJECT"];
    
        const rows = filteredEmails.map((email) => [
          email.date_entered,
          email.email,
          email.subject
    
    
    
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
    
    
    



  const [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
  ] = useThread();
  if (showEmail && currentThreadId) {
    return (
      <EmailBox
        onClose={() => setShowEmails(false)}
        view={false}
        threadId={currentThreadId}
      />
    );
  }
  return (
    <>

     <SearchComponent
        dropdownOptions={[
  { value: 'contect', label: 'Sender' },
    { value: 'subject', label: 'Subject' },

        ]}
        selectedDropdownValue={selectedCategory}
        onDropdownChange={handleCategoryChange}
        // dropdownPlaceholder="Filter by websites"

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




      {/* Moved Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">MOVED EMAILS</h2>
             <a href="">
         <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info"/>
         </a>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Moved
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
                    <span>SENDER</span>
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
                    <span>THREAD SIZE</span>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date_entered}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{email.email}</td>
                  <td
                    onClick={() => {
                      setCurrentThreadId(email.thread_id);
                      handleThreadClick(email.from, email.thread_id);
                    }}
                    className="px-6 py-4 text-purple-600"
                  >
                    {email.subject}
                  </td>
                  <td className="px-6 py-4 text-purple-600">
                    {email.thread_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {emails?.length > 0 && (
          <Pagination slice={"moved"} fn={getmovedEmails} />
        )}
        {filteredEmails.length === 0 && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Moved emails yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

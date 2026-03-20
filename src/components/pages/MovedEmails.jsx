import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  BarChart,
  EqualApproximatelyIcon,
  Contact,
  Hammer,
} from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import { useSelector } from "react-redux";
import Pagination from "../Pagination";
import { getmovedEmails } from "../../store/Slices/movedEmails";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThreadContext } from "../../hooks/useThreadContext";

export function MovedPage() {
  const navigate = useNavigate(); // 👈 add this
  const { count, emails } = useSelector((state) => state.moved);

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const { handleMove } = useThreadContext();

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



  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
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

          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl text-gray-900">MOVED EMAILS</h2>

          <a href="">
            <img
              width="30"
              height="30"
              src="https://img.icons8.com/offices/30/info.png"
              alt="info"
            />
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
                  <span>CREATED AT</span>
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
                  <Contact className="w-4 h-4" />
                  <span>LABEL NAME</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <EqualApproximatelyIcon className="w-4 h-4" />
                  <span>REASON</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4" />
                  <span>ACTION</span>
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
                    handleMove({
                      email: email.from,
                      threadId: email.thread_id,
                    });
                  }}
                  className="px-6 py-4 text-purple-600"
                >
                  {email.subject}
                </td>
                <td className="px-6 py-4 text-purple-600">
                  {email.label_name}
                </td>
                <td className="px-6 py-4 text-purple-600">
                  {email.reason || "-"}
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
  );
}

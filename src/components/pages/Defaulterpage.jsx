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

import { useDispatch, useSelector } from "react-redux";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getdefaulterEmails } from "../../store/Slices/defaulterEmails";
import { useEffect } from "react";
export function DefaulterPage() {
  const { count, emails } = useSelector((state) => state.defaulter);
  
  const dispatch = useDispatch();
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
      {/* defaulter Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">DEFAULTER EMAILS</h2>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} defaulter
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
                    <span>NAME</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>STATUS</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>STAGE</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email, index) => (
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
                  <td className="px-6 py-4 text-gray-900">{email.first_name}</td>
                  <td
                    onClick={() => {
                      setCurrentThreadId(email.thread_id);
                      handleThreadClick(email.from, email.thread_id);
                    }}
                    className="px-6 py-4 text-purple-600"
                  >
                    {email.status}
                  </td>
                  <td className="px-6 py-4 text-purple-600">
                    {email.stage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {emails?.length > 0 && (
          <Pagination slice={"defaulter"} fn={getdefaulterEmails} />
        )}
        {emails.length === 0 && (
          <div className="p-12 text-center">
            <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No defaulter emails yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

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

import { useSelector } from "react-redux";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getUnrepliedEmail } from "../../store/Slices/unrepliedEmails";
import { getForwardedEmails } from "../../store/Slices/forwardedEmailSlice";
export function ForwardedPage() {
  const { count, emails } = useSelector((state) => state.forwarded);
  const [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
  ] = useThread();
  return (
    <>
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
            <h2 className="text-xl font-semibold text-gray-900">FORWARDED EMAILS</h2>
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
            <tbody>
              {emails.map((email, index) => (
                <tr
                  key={index}
                  onClick={() => {
                      setCurrentThreadId(email.thread_id);
                      handleThreadClick(email.from, email.thread_id);
                    }}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date_entered}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{email.from}</td>
                  <td
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
        {emails.length > 0 && (
          <Pagination slice={"forwarded"} fn={getForwardedEmails} />
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

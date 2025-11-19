import {
  Mail,
  Calendar,
  User,
  FileText,
  Repeat,
  BarChart2,
} from "lucide-react";

import { useSelector } from "react-redux";
import useThread from "../../hooks/useThread";
import EmailBox from "../EmailBox";
import { BarChart } from "recharts";
import Pagination from "../Pagination";
import { getUnrepliedEmail } from "../../store/Slices/unrepliedEmails";
export function UnrepliedEmailsPage() {
  const { count, emails } = useSelector((state) => state.unreplied);
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
      {/* Unreplied Emails Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">UNREPLIED EMAILS</h2>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Unreplied
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
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
                    <BarChart2 className="w-4 h-4" />
                    <span>THREAD SIZE</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    <span>DUPLICATE</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr
                  key={Math.random()}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{email.from}</td>
                  <td
                    onClick={() => {
                      setCurrentThreadId(email.threadId);
                      handleThreadClick(email.from, email.threadId);
                    }}
                    className="px-6 py-4 text-purple-600"
                  >
                    {email.subject}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination slice={"unreplied"} fn={getUnrepliedEmail} />
      </div>
    </>
  );
}

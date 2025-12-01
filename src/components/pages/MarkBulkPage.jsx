import {
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Layers,
  BarChart,
} from "lucide-react";

import { useSelector } from "react-redux";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import Pagination from "../Pagination";
import { getBulkEmails } from "../../store/Slices/markBulkSlice";

export function MarkBulkPage() {
  const { count, emails } = useSelector((state) => state.bulk);

  const [
    handleThreadClick,
    showEmail,
    setShowEmails,
    currentThreadId,
    setCurrentThreadId,
  ] = useThread();

  return (
    <>
      {/* OPEN EMAIL BOX */}
      {showEmail && currentThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <EmailBox
            onClose={() => setShowEmails(false)}
            view={false}
            threadId={currentThreadId}
          />
        </div>
      )}

      {/* MAIN WRAPPER */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">BULK EMAILS</h2>
            <a href="">
              <img width="30" height="30" src="https://img.icons8.com/offices/30/info.png" alt="info" />
            </a>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Bulk
          </span>
        </div>

        {/* TABLE */}
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
              </tr>
            </thead>

            <tbody>
              {emails.map((email, index) => (
                <tr
                  key={email.id}
                  onClick={() => handleThreadClick(email.id)}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  {/* DATE */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{email.date_entered || "—"}</span>
                    </div>
                  </td>

                  {/* SENDER */}
                  <td className="px-6 py-4 text-gray-900">
                    {email.sender || "—"}
                  </td>

                  {/* SUBJECT */}
                  <td className="px-6 py-4 text-purple-600">
                    {email.subject || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {emails.length > 0 && <Pagination slice={"bulk"} fn={getBulkEmails} />}

        {/* EMPTY UI */}
        {emails.length === 0 && (
          <div className="p-12 text-center">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Bulk emails yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

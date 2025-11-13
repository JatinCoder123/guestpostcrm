import { Mail, Calendar, User, FileText, MessageSquare } from "lucide-react";
import { Footer } from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import EmailBox from "../EmailBox";
import useThread from "../../hooks/useThread";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { threadEmailAction } from "../../store/Slices/threadEmail";
export function UnansweredPage() {
  const { count, emails } = useSelector((state) => state.unanswered);
  const {
    message,
    error: sendError,
    loading: sendLoading,
  } = useSelector((state) => state.threadEmail);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [handleThreadClick, showEmail, setShowEmails] = useThread();
  const dispatch = useDispatch();
  useEffect(() => {
    if (sendError) {
      toast.error(sendError);
      dispatch(threadEmailAction.clearAllErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(threadEmailAction.clearAllMessage());
    }
  }, [dispatch, sendError, sendLoading, message]);
  return (
    <div className="p-6">
      {showEmail && currentThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <EmailBox
            onClose={() => setShowEmails(false)}
            view={false}
            threadId={currentThreadId}
          />
        </div>
      )}
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl mb-2">Welcome GuestPostCRM</h1>
        <div className="flex items-center gap-2 text-purple-100">
          <Mail className="w-4 h-4" />
          <span>your.business@email.com</span>
        </div>
      </div>

      {/* Unanswered Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">UNANSWERED EMAILS</h2>
          </div>
          <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            {count} Unanswered
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
                <th className="px-6 py-4 text-left">MAILER SUMMARY</th>
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
                      <span>{email.date_created}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {email.from_email}
                  </td>
                  <td
                    onClick={() => {
                      setCurrentThreadId(email.thread_id);
                      handleThreadClick(email.from_email, email.thread_id);
                    }}
                    className="px-6 py-4 text-purple-600"
                  >
                    {email.subject}
                  </td>
                  <td className="px-6 py-4 text-gray-500">NO Summary Found</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}

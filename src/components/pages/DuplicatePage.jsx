import { Mail, Activity, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  duplicateEmailActions,
  getDuplicateEmails,
} from "../../store/Slices/duplicateEmailSlice";
import { toast } from "react-toastify";
import EmailBox from "../EmailBox";

export const Duplicate = () => {
  const dispatch = useDispatch();

  const [showThread, setShowThread] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [email, setEmail] = useState(null);

  const { duplicateEmail, loading, error } = useSelector(
    (state) => state.duplicateEmails,
  );

  useEffect(() => {
    dispatch(getDuplicateEmails());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(duplicateEmailActions.clearDuplicateEmailErrors());
    }
  }, [error, dispatch]);

  // Thread modal
  if (showThread) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowThread(false)}
          threadId={currentThreadId}
          tempEmail={email}
        />
      </div>
    );
  }

  // Convert object to iterable entries
  const entries = duplicateEmail ? Object.entries(duplicateEmail) : [];

  return (
    <div className="p-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-green-600 py-4 px-8">
          <div className="grid grid-cols-3 text-white text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Mail size={22} /> From Email
            </div>
            <div className="flex items-center gap-2">
              <Activity size={22} /> Subject
            </div>
            <div className="flex items-center gap-2">
              <Hash size={22} /> Thread ID
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Loading */}
          {loading && (
            <p className="text-center py-6 text-lg text-gray-600">
              Loading duplicate emails...
            </p>
          )}

          {/* No Data */}
          {!loading && entries.length === 0 && (
            <p className="text-center py-6 text-lg text-gray-600">
              No duplicate emails found
            </p>
          )}

          {/* Rows */}
          {!loading &&
            entries.map(([threadId, item]) => (
              <div
                key={threadId}
                className="grid grid-cols-3 py-5 border-b last:border-b-0 hover:bg-gray-50 transition"
              >
                {/* From Email */}
                <div className="flex flex-col">
                  <span className="text-blue-600 font-medium">
                    {item.from_email}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.from_name}
                  </span>
                </div>

                {/* Subject */}
                <div className="text-gray-800 font-medium">{item.subject}</div>

                {/* Thread ID */}
                <div>
                  <button
                    onClick={() => {
                      setShowThread(true);
                      setCurrentThreadId(threadId);
                      setEmail(item.from_email);
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border hover:bg-gray-200 transition"
                  >
                    {threadId}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

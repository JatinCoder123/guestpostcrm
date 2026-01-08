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
    (state) => state.duplicateEmails
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
  return (
    <div className="p-8">
      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-green-600 py-4 px-8">
          <div className="grid grid-cols-3 text-white text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Mail size={22} /> Email
            </div>
            <div className="flex items-center gap-2">
              <Activity size={22} /> Duplicate Count
            </div>
            <div className="flex items-center gap-2">
              <Hash size={22} /> Thread IDs
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {loading && (
            <p className="text-center py-4 text-lg">Loading...</p>
          )}

          {!loading && !duplicateEmail && (
            <p className="text-center text-lg py-4">
              No duplicate emails found
            </p>
          )}

          {!loading && duplicateEmail && (
            <div className="grid grid-cols-3 py-5 border-b text-gray-800 hover:bg-gray-50 transition">
              {/* Email */}
              <div className="flex items-center gap-3 text-[16px] text-blue-600 font-medium">
                <Mail size={18} />
                {duplicateEmail.email}
              </div>

              {/* Duplicate Count */}
              <div className="flex items-center gap-3 text-[16px] font-semibold">
                <Activity size={18} className="text-green-600" />
                {duplicateEmail.duplicate_thread_count}
              </div>

              {/* Thread IDs */}
              <div className="flex flex-wrap gap-2">
                {duplicateEmail.thread_ids?.map((threadId, idx) => (
                  <button
                    onClick={() => {
                      setShowThread(true);
                      setCurrentThreadId(threadId);
                      setEmail(duplicateEmail.email);
                    }}
                    key={idx}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border"
                  >
                    {threadId}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

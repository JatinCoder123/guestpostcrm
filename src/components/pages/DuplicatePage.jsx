import { Mail, Activity, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  duplicateEmailActions,
  getDuplicateEmails,
} from "../../store/Slices/duplicateEmailSlice";
import { toast } from "react-toastify";
import { useThreadContext } from "../../hooks/useThreadContext";

export const Duplicate = () => {
  const dispatch = useDispatch();
  const { duplicateEmail, loading, error } = useSelector(
    (state) => state.duplicateEmails,
  );
  const { handleMove } = useThreadContext()
  useEffect(() => {
    dispatch(getDuplicateEmails());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(duplicateEmailActions.clearDuplicateEmailErrors());
    }
  }, [error, dispatch]);

  // Convert object to iterable entries
  const entries = duplicateEmail ? Object.entries(duplicateEmail) : [];

  return (
    <div className="p-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {/* Table Header */}
        <div className="grid grid-cols-2 bg-green-600 text-white text-lg font-semibold px-8 py-4">
          <div className="flex items-center gap-2">
            <Mail size={22} /> DateTime
          </div>
          <div className="flex items-center gap-2">
            <Activity size={22} /> Subject
          </div>
        </div>

        {/* Table Body */}
        <div>
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
                className="grid grid-cols-2 px-8 py-5 border-b last:border-b-0 hover:bg-gray-50 transition"
              >
                {/* Date */}
                <div className="text-blue-600 font-medium">
                  {item.date_entered ? item.date_entered : "-"}
                </div>

                {/* Subject */}
                <button
                  onClick={() => navigate(`/thread/${threadId}`)}
                  className="text-gray-800 font-medium text-left"
                >
                  {item.subject}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

import {
  Calendar,
  User,
  FileText,
  EqualApproximatelyIcon,
  Contact,
  Hammer,
} from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../Pagination";
import { getmovedEmails } from "../../store/Slices/movedEmails";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThreadContext } from "../../hooks/useThreadContext";
import axios from "axios";

export function MovedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { count, emails } = useSelector((state) => state.moved);
  const { crmEndpoint } = useSelector((state) => state.user);

  const [topsearch, setTopsearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [restoringId, setRestoringId] = useState(null);

  const { handleMove } = useThreadContext();

  /* ---------------- RESTORE FUNCTION ---------------- */
  const handleRestore = async (emailItem) => {
    try {
      setRestoringId(emailItem.thread_id);
      const res = await axios.get(
        `${crmEndpoint}&type=restore_email&email=${emailItem.email}&label_id=${emailItem.label_name}&thread_id=${emailItem.thread_id}`,
      );
      if (res?.data) {
        toast.success("Email restored successfully ✅");
        dispatch(getmovedEmails());
      }
    } catch (err) {
      toast.error("Failed to restore email ❌");
    } finally {
      setRestoringId(null);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredEmails = emails
    .filter((item) => {
      const searchValue = topsearch.toLowerCase();
      if (!searchValue) return true;

      const contact = (item?.email ?? "").toLowerCase();
      const subject = item?.subject?.toLowerCase() ?? "";

      if (selectedCategory === "contact") {
        return contact.includes(searchValue);
      }
      if (selectedCategory === "subject") {
        return subject.includes(searchValue);
      }

      return contact.includes(searchValue);
    })
    .sort((a, b) => {
      if (!selectedSort) return 0;

      if (selectedSort === "oldest") {
        return new Date(a.date_entered) - new Date(b.date_entered);
      }

      return 0;
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full">
            <ArrowLeft className="w-5 h-5 text-green-700" />
          </button>

          <h2 className="text-xl text-gray-900">MOVED EMAILS</h2>
        </div>

        <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
          {count} Moved
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <th className="px-6 py-4 text-left">CREATED AT</th>
              <th className="px-6 py-4 text-left">SENDER</th>
              <th className="px-6 py-4 text-left">SUBJECT</th>
              <th className="px-6 py-4 text-left">LABEL</th>
              <th className="px-6 py-4 text-left">REASON</th>
              <th className="px-6 py-4 text-left">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmails.map((email, index) => (
              <tr
                key={index}
                className="border-b hover:bg-purple-50 cursor-pointer"
              >
                <td className="px-6 py-4">{email.date_entered}</td>

                <td className="px-6 py-4">{email.email}</td>

                <td
                  onClick={() =>
                    handleMove({
                      email: email.from,
                      threadId: email.thread_id,
                    })
                  }
                  className="px-6 py-4 text-purple-600"
                >
                  {email.subject}
                </td>

                <td className="px-6 py-4">{email.label_name}</td>

                <td className="px-6 py-4">{email.reason || "-"}</td>

                {/* 🔥 ACTION COLUMN */}
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(email);
                    }}
                    disabled={restoringId === email.thread_id}
                    className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm
                    hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {restoringId === email.thread_id ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Restoring...
                      </>
                    ) : (
                      "Restore"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE */}
      {filteredEmails.length === 0 && (
        <div className="p-12 text-center">
          <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No Moved emails yet.</p>
        </div>
      )}
    </div>
  );
}

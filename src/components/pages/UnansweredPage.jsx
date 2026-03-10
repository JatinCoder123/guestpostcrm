import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  BarChart,
  EqualApproximatelyIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useEffect, useContext, useCallback } from "react";
import { getUnansweredEmails } from "../../store/Slices/unansweredEmails";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import TableLoading from "../TableLoading";
import { useThreadContext } from "../../hooks/useThreadContext";
import { List } from "react-window";
import Pagination from "../Pagination";
import InfinitePagination from "../InfinitePagination";
import { LoadingChase } from "../Loading";

export function UnansweredPage() {
  const { count, emails, loading, pageIndex, pageCount } = useSelector(
    (state) => state.unanswered
  );

  const { setWelcomeHeaderContent, setSearch, setEnteredEmail } =
    useContext(PageContext);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const { handleMove } = useThreadContext();


  const handleOnClick = (email, navigate) => {
    const input = extractEmail(email.from);
    localStorage.setItem("email", input);
    setSearch(input);
    setEnteredEmail(input);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Replied");
    navigateTo(navigate);
  };


  const Row = ({ index, style, data }) => {
    // Loader row
    if (index >= data.length) {
      return (
        <div
          style={style}
          className="flex items-center justify-center border-b border-gray-100 px-6"
        >
          <LoadingChase color="gray" />

        </div>
      );

    }
    const email = data[index];

    return (
      <div
        style={style}
        className="grid grid-cols-4 border-b border-gray-100 hover:bg-purple-50 cursor-pointer"
      >
        <div
          onClick={() => handleOnClick(email, "/")}
          className="px-6 py-4 flex items-center gap-2 text-gray-600"
        >
          <Calendar className="w-4 h-4 text-gray-400" />
          {email.date_entered}
        </div>

        <div
          className="px-6 py-4 text-gray-900"
          onClick={() => handleOnClick(email, "/contact")}
        >
          {email.from?.split("<")[0]?.trim()}
        </div>

        <div
          onClick={() =>
            handleMove({
              email: extractEmail(email.from),
              threadId: email.thread_id,
            })
          }
          className="px-6 py-4 text-purple-600 truncate max-w-[300px]"
        >
          {email.subject}
        </div>

        <div
          onClick={() => handleOnClick(email, "/")}
          className="px-6 py-4 text-purple-600"
        >
          {email.thread_count}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            REPLIED EMAILS
          </h2>

          <a
            href="https://www.guestpostcrm.com/blog/unreplied-and-unanswered-emails-in-guestpostcrm/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              width="30"
              height="30"
              src="https://img.icons8.com/offices/30/info.png"
              alt="info"
            />
          </a>
        </div>

        <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full">
          {count} Replied
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="px-6 py-4 flex items-center gap-2 font-bold">
          <Calendar className="w-4 h-4" />
          CREATED AT
        </div>

        <div className="px-6 py-4 flex items-center gap-2 font-bold">
          <User className="w-4 h-4" />
          CONTACT
        </div>

        <div className="px-6 py-4 flex items-center gap-2 font-bold">
          <FileText className="w-4 h-4" />
          SUBJECT
        </div>

        <div className="px-6 py-4 flex items-center gap-2 font-bold">
          <BarChart className="w-4 h-4" />
          COUNT
        </div>
      </div>

      {/* Virtualized List */}
      {loading && pageIndex === 1 ? (
        <TableLoading cols={4} />
      ) : (
        <InfinitePagination fn={() => dispatch(
          getUnansweredEmails({
            page: pageIndex + 1,
            loading: false,
          })
        )} data={emails} pageCount={pageCount} pageIndex={pageIndex} Row={Row} loading={loading} />
      )}
      {!loading && emails.length === 0 && (
        <div className="p-12 text-center">
          <EqualApproximatelyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No Replied emails yet.</p>
        </div>
      )}
    </div>
  );
}
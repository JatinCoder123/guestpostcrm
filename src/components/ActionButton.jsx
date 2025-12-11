import { Globe, Mail } from "lucide-react";
import Loading, { LoadingChase } from "./Loading";
import UserDropdown from "./UserDropDown";
import MoveToDropdown from "./MoveToDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  favAction,
  favEmail,
  getFavEmailsWithOutLoading,
} from "../store/Slices/favEmailSlice";
import { bulkAction, markingEmail } from "../store/Slices/markBulkSlice";
import {
  forwardEmail,
  getForwardedEmailsWithOutLoading,
} from "../store/Slices/forwardedEmailSlice";
import { forwardedAction } from "../store/Slices/forwardedEmailSlice";
import { toast } from "react-toastify";
import { useContext, useEffect, useState } from "react";
import { addEvent } from "../store/Slices/eventSlice";
import { PageContext } from "../context/pageContext";
import { linkExchange, linkExchangeaction } from "../store/Slices/linkExchange";

const ActionButton = ({
  handleMoveSuccess,
  setShowEmails,
  setShowIP,
  threadId,
}) => {
  const [showUsers, setShowUsers] = useState(false);
  const { enteredEmail } = useContext(PageContext);
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const { email } = useSelector((s) => s.ladger);
  const handleForward = (to) => {
    dispatch(forwardEmail(contactInfo.id, to, threadId));
  };
  const {
    forward,
    error: forwardError,
    message: forwardMessage,
  } = useSelector((s) => s.forwarded);
  const {
    exchanging,
    error: changeError,
    message: changeMessage,
  } = useSelector((s) => s.linkExchange);

  const {
    favourite,
    error: favouriteError,
    message: favouriteMessage,
  } = useSelector((s) => s.fav);

  const {
    marking,
    error: markingError,
    message: markingMessage,
  } = useSelector((s) => s.bulk);
  const dispatch = useDispatch();
  useEffect(() => {
    if (forwardError) {
      toast.error(forwardError);
      dispatch(forwardedAction.clearAllErrors());
    }
    if (forwardMessage) {
      toast.success(forwardMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "forwarded",
        })
      );
      dispatch(forwardedAction.clearAllMessages());
      dispatch(getForwardedEmailsWithOutLoading(enteredEmail));
    }
    if (favouriteError) {
      toast.error(favouriteError);
      dispatch(favAction.clearAllErrors());
    }
    if (favouriteMessage) {
      toast.success(favouriteMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "favourite",
        })
      );
      dispatch(favAction.clearAllMessages());
      dispatch(getFavEmailsWithOutLoading(enteredEmail));
    }
    if (markingError) {
      toast.error(markingError);
      dispatch(bulkAction.clearAllErrors());
    }
    if (markingMessage) {
      toast.success(markingMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "bulk marked",
        })
      );
      dispatch(bulkAction.clearAllMessages());
    }
    if (changeMessage) {
      toast.success(changeMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "link exchange status changed",
        })
      );
      dispatch(linkExchangeaction.clearAllMessages());
    }
    if (changeError) {
      toast.error(changeError);
      dispatch(linkExchangeaction.clearAllErrors());
    }
  }, [
    dispatch,
    forwardError,
    forwardMessage,
    favouriteError,
    favouriteMessage,
    markingError,
    markingMessage,
    changeError,
    changeMessage,
  ]);
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {[
        {
          icon: <Mail className="w-5 h-5" />,
          label: "Email",
          action: () => setShowEmails(true),
        },
        {
          icon: <Globe className="w-5 h-5" />,
          label: "IP",
          action: () => setShowIP(true),
        },
        {
          icon: favourite ? (
            <LoadingChase />
          ) : (
            <img
              src="https://img.icons8.com/color/48/filled-like.png"
              className="w-6 h-6"
              alt="fav"
            />
          ),
          label: "Favourite",
          action: () => dispatch(favEmail(threadId)),
        },
        {
          icon: forward ? (
            <LoadingChase />
          ) : (
            <img
              src="https://img.icons8.com/color/48/redo.png"
              className="w-6 h-6"
              alt="forward"
            />
          ),
          label: "Assign",
          action: () => setShowUsers((p) => !p),
        },
        {
          icon: marking ? (
            <LoadingChase />
          ) : (
            <img
              src="https://img.icons8.com/color/48/bursts.png"
              className="w-6 h-6"
              alt="bulk"
            />
          ),
          label: "Mark Bulk",
          action: () => dispatch(markingEmail(threadId)),
        },
        {
          icon: exchanging ? (
            <LoadingChase />
          ) : (
            <img
              className="w-6 h-6"
              src="https://img.icons8.com/office/40/link.png"
              alt="link"
            />
          ),
          label: "Link Exchange",
          action: () => dispatch(linkExchange(threadId)),
        },
        {
          icon: (
            <img
              src="https://img.icons8.com/color/48/tags--v1.png"
              className="w-6 h-6"
              alt="tag"
            />
          ),
          label: "Mark Tag",
          action: () => {},
        },
      ].map((btn, i) => (
        <div className="relative" key={i}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              btn.action();
            }}
            className=" group flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg active:scale-95 hover:-translate-y-1 transition-all cursor-pointer"
          >
            {btn.icon}
            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg z-20">
              {btn.label}
            </span>
          </button>
          {showUsers && btn.label === "Assign" && (
            <UserDropdown
              forwardHandler={handleForward}
              onClose={() => setShowUsers(false)}
            />
          )}
        </div>
      ))}

      <MoveToDropdown
        currentThreadId={threadId}
        onMoveSuccess={handleMoveSuccess}
      />
    </div>
  );
};

export default ActionButton;

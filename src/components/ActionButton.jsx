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
import { quickActionBtnActions } from "../store/Slices/quickActionBtn";
import { getTags } from "../store/Slices/markTagSlice";
import { applyTag } from "../store/Slices/markTagSlice";

const ActionButton = ({
  handleMoveSuccess,
  setShowEmails,
  setShowIP,
  threadId,
  handleActionBtnClick,
}) => {
  const [showUsers, setShowUsers] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const { enteredEmail } = useContext(PageContext);
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const { sending } = useSelector((state) => state.threadEmail);
  const { email } = useSelector((s) => s.ladger);
  const [clickedActionBtn, setClickedActionBtn] = useState(null)
  const handleForward = (to) => {
    dispatch(forwardEmail(contactInfo.id, to, threadId));
  };
  const {
    forward,
    error: forwardError,
    message: forwardMessage,
  } = useSelector((s) => s.forwarded);
  const {
    buttons,
    error: buttonsError,
    loading: buttonsLoading,
  } = useSelector((s) => s.quickActionBtn);
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

  const { tags, loading: tagLoading } = useSelector((s) => s.markTag);

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
    if (buttonsError) {
      toast.error(buttonsError);
      dispatch(quickActionBtnActions.clearErrors());
    }
    if (!sending) {
      setClickedActionBtn(null)
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
    buttonsError,
    sending
  ]);
  return (
    <div className="mt-4 flex items-center  flex-wrap gap-3">
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
          action: () => {
            setShowTags((p) => !p);
            dispatch(getTags());
          },
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
          {showTags && btn.label === "Mark Tag" && (
            <div className="absolute top-14 right-0 w-60 z-40">
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                {tagLoading ? (
                  <div className="py-6 flex justify-center">
                    <LoadingChase />
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto">
                    {tags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          dispatch(applyTag(tag.name));
                          setShowTags(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b last:border-b-0 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <MoveToDropdown
        currentThreadId={threadId}
        onMoveSuccess={handleMoveSuccess}
      />
      {buttonsLoading ? <LoadingChase size="30" /> : buttons?.map((btn, i) => (
        <div className="relative" key={i}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleActionBtnClick(btn.body);
              setClickedActionBtn(btn.id)
            }}
            disabled={sending}
            className={` group flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md border-gray-200 hover:shadow-lg active:scale-95 hover:-translate-y-1 transition-all cursor-pointer ${sending ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {clickedActionBtn === btn.id && sending ? <LoadingChase size="20" /> : <img src={btn.icon} alt={btn.name} className="w-8 h-8 " />}
            <div dangerouslySetInnerHTML={{ __html: btn.body }} className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg z-20" />

          </button>
        </div>
      ))}

    </div>
  );
};

export default ActionButton;

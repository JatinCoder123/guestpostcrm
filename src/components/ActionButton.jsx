import { Globe, Mail } from "lucide-react";
import Loading, { LoadingChase } from "./Loading";
import UserDropdown from "./UserDropDown";
import MoveToDropdown from "./MoveToDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  favAction,
  favEmail,
  getFavEmails,
} from "../store/Slices/favEmailSlice";
import {
  forwardEmail,
  forwardedAction,
  getForwardedEmails,
} from "../store/Slices/forwardedEmailSlice";
import { toast } from "react-toastify";
import { useContext, useEffect, useState } from "react";
import { addEvent } from "../store/Slices/eventSlice";
import { PageContext } from "../context/pageContext";
import { linkExchange, linkExchangeaction } from "../store/Slices/linkExchange";
import { quickActionBtnActions } from "../store/Slices/quickActionBtn";
import { getTags, applyTag } from "../store/Slices/markTagSlice";
import { SocketContext } from "../context/SocketContext";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { PreviewTemplate } from "./PreviewTemplate";
import { threadEmailAction } from "../store/Slices/threadEmail";
import { MdHome, MdOutlineHome } from "react-icons/md";
import { showConsole } from "../assets/assets";
import { addMarketPlace, deleteMarketPlace, marketplaceActions } from "../store/Slices/Marketplace";

/* 🔹 Separator Component */
const Separator = () => <div className="h-8 w-[1px] bg-gray-500 mx-2" />;

const ActionButton = ({
  handleMoveSuccess,
  setShowEmails,
  setShowIP,
  handleActionBtnClick,
}) => {
  const dispatch = useDispatch();
  const [showUsers, setShowUsers] = useState(false);
  const [isMark, setIsMark] = useState(false);

  const [showTags, setShowTags] = useState(false);
  const [clickedActionBtn, setClickedActionBtn] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  /* 🔥 ADDED: First Reply states */
  const [showFirstReplyBtn, setShowFirstReplyBtn] = useState(false);
  const [reminderId, setReminderId] = useState(null);
  const [frLoading, setFrLoading] = useState(false);

  const { enteredEmail } = useContext(PageContext);
  const { setNotificationCount } = useContext(SocketContext);

  const { contactInfo, count, threadId } = useSelector((s) => s.viewEmail);
  const { sending, message, error } = useSelector((s) => s.threadEmail);
  const { crmEndpoint } = useSelector((s) => s.user);
  const { email } = useSelector((s) => s.ladger);
  const [editorContent, setEditorContent] = useState("");

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
    emails: favEmails,
    favourite,
    error: favouriteError,
    message: favouriteMessage,
  } = useSelector((s) => s.fav);

  const { tags, loading: tagLoading } = useSelector((s) => s.markTag);

  const {
    adding,
    deleteMarketPlaceId,
    deleting,
    items: marketPlaces,
    error: markingError,
    message: markingMessage,
  } = useSelector((s) => s.marketplace);

  const handleForward = (to) => {
    dispatch(forwardEmail(contactInfo.id, to, threadId));
  };

  /* 🔥 ADDED: Check FR button visibility */
  useEffect(() => {
    if (!email) return;

    const fetchFRButtonStatus = async () => {
      try {
        const res = await fetch(`${crmEndpoint}&type=fr_button&email=${email}`);
        const data = await res.json();

        if (data?.reminder_id && data.reminder_id !== false) {
          setReminderId(data.reminder_id);
          setShowFirstReplyBtn(true);
        } else {
          setShowFirstReplyBtn(false);
          setReminderId(null);
        }
      } catch (err) {
        setShowFirstReplyBtn(false);
      }
    };

    fetchFRButtonStatus();
  }, [email]);

  /* 🔥 ADDED: Send first reply handler */
  const handleSendFirstReply = async () => {
    if (!reminderId) return;

    try {
      setFrLoading(true);
      showConsole && console.log(crmEndpoint);
      await fetch(
        `${crmEndpoint}&type=send_reminder&reminder_id=${reminderId}`,
      );
      showConsole && console.log("First rply send button clicked");
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      toast.success("First reply sent successfully");
      setShowFirstReplyBtn(false);
    } catch (err) {
      toast.error("Failed to send first reply");
    } finally {
      setFrLoading(false);
    }
  };
  useEffect(() => {
    if (marketPlaces.length > 0) {
      setIsMark(marketPlaces.find((e) => e.name === email));

    }
  }, [marketPlaces])

  const FavIcon = () => {
    const isFav = favEmails.some((e) => e.email_address === email);

    return (
      <motion.div
        animate={{
          color: isFav ? "#ef4444" : "#9ca3af", // red → gray
        }}
        transition={{
          duration: 0.18,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center"
      >
        <Heart
          size={22}
          strokeWidth={1.8}
          fill={isFav ? "#ef4444" : "transparent"}
        />
      </motion.div>
    );
  };

  /* 🔹 Side Effects (UNCHANGED) */
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
        }),
      );
      dispatch(forwardedAction.clearAllMessages());
      dispatch(getForwardedEmails({ email: enteredEmail, loading: false }));
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
        }),
      );
      dispatch(favAction.clearAllMessages());
      dispatch(getFavEmails({ email: enteredEmail, loading: false }));
    }

    if (markingError) {
      toast.error(markingError);
      dispatch(marketplaceActions.clearErrors());
    }

    if (markingMessage) {
      toast.success(markingMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "Add to market place",
        }),
      );
      dispatch(marketplaceActions.clearMessage());
    }

    if (changeMessage) {
      toast.success(changeMessage);
      dispatch(
        addEvent({
          email,
          thread_id: threadId,
          recent_activity: "link exchange status changed",
        }),
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
      setClickedActionBtn(null);
    }
    if (error) {
      toast.error(error);
      dispatch(threadEmailAction.clearAllErrors());
    }
    if (message) {
      // toast.success(message);
      setShowUpdatePopup(false);
      dispatch(threadEmailAction.clearAllMessage());
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
    sending,
    email,
    threadId,
    enteredEmail,
  ]);

  /* 🔹 Static Buttons (UNCHANGED) */
  const actionButtons = [
    {
      icon: (
        <img
          width="40"
          height="40"
          src="https://img.icons8.com/keek/100/new-post.png"
          alt="new-post"
        />
      ),
      label: "Email",
      action: () => setShowEmails(true),
    },
    {
      icon: (
        <img
          width="30"
          height="30"
          src="https://img.icons8.com/fluency/48/ip-address.png"
          alt="ip-address"
        />
      ),
      label: "IP",
      action: () => setShowIP(true),
    },
    {
      icon: favourite ? <LoadingChase /> : <FavIcon />,
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
      icon: (adding || (deleting && deleteMarketPlaceId == isMark.id))
        ? (
          <LoadingChase />
        ) : (
          isMark ? <MdHome size={25} color="red" /> : <MdOutlineHome size={25} color="red" />
        ),
      label: isMark ? "Remove From MarketPlace" : "Add To MarketPlace",
      action: () => dispatch(isMark ? deleteMarketPlace(isMark.id) : addMarketPlace(email, contactInfo.type == "Brand")),
    },
    {
      icon: exchanging ? (
        <LoadingChase />
      ) : (
        <img
          src="https://img.icons8.com/office/40/link.png"
          className="w-6 h-6"
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
  ];

  return (
    <>
      {showUpdatePopup && (
        <PreviewTemplate
          editorContent={editorContent}
          initialContent={editorContent}
          setEditorContent={setEditorContent}
          onClose={() => setShowUpdatePopup(false)}
          onSubmit={() => {
            handleActionBtnClick(editorContent);
          }}
          loading={sending}
          threadId={threadId}
        />
      )}
      <div className="mt-4 flex items-center flex-wrap gap-2">
        {actionButtons.map((btn, i) => (
          <div key={i} className="flex items-center relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                btn.action();
              }}
              className="group flex items-center justify-center w-12 h-12
            bg-white rounded-xl shadow-md border border-gray-200
            hover:shadow-lg active:scale-95 hover:-translate-y-1 transition-all"
            >
              {btn.icon}
              <span
                className="absolute -bottom-9 left-1/2 -translate-x-1/2
            bg-black text-white text-xs px-2 py-1 rounded opacity-0
            group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg z-20"
              >
                {btn.label}
              </span>
            </button>

            {btn.label === "Email" && (
              <span className="absolute -top-1 right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {count}
              </span>
            )}

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
                    tags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          dispatch(applyTag(tag.name));
                          setShowTags(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold
                      text-gray-700 border-b last:border-b-0
                      hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <Separator />
          </div>
        ))}

        {/* 🔥 SEND FIRST REPLY BUTTON (NEW, SAFE, SAME CSS) */}
        {showFirstReplyBtn && (
          <>
            {/* 🔥 SEND FIRST REPLY BUTTON (LAYOUT-SAFE) */}
            <div
              className={`flex items-center transition-opacity duration-200 ${showFirstReplyBtn
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
                }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendFirstReply();
                }}
                disabled={frLoading}
                className="group flex items-center justify-center
      w-12 h-12
      bg-white rounded-xl shadow-md border border-gray-200
      hover:shadow-lg active:scale-95 hover:-translate-y-1
      transition-all"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {frLoading ? (
                    <LoadingChase size="20" />
                  ) : (
                    <img
                      src="https://img.icons8.com/color/48/reply.png"
                      className="w-6 h-6"
                      alt="first-reply"
                    />
                  )}
                </div>

                <span
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2
        bg-black text-white text-xs px-2 py-1 rounded
        opacity-0 group-hover:opacity-100
        transition-all whitespace-nowrap shadow-lg z-20"
                >
                  Send First Reply
                </span>
              </button>

              <Separator />
            </div>
          </>
        )}

        <MoveToDropdown
          currentThreadId={threadId}
          onMoveSuccess={handleMoveSuccess}
        />
        <Separator />

        {buttonsLoading ? (
          <LoadingChase size="30" />
        ) : (
          buttons?.map((btn, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpdatePopup(true);
                  setEditorContent(btn.body_html);
                  setClickedActionBtn(btn.id);
                }}
                disabled={sending}
                className="group flex items-center justify-center w-12 h-12
              bg-white rounded-xl shadow-md border border-gray-200
              hover:shadow-lg active:scale-95 hover:-translate-y-1 transition-all"
              >
                {clickedActionBtn === btn.id && sending ? (
                  <LoadingChase size="20" />
                ) : (
                  <img src={btn.icon} alt={btn.name} className="w-8 h-8" />
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: btn.body }}
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2
                bg-black text-white text-xs px-2 py-1 rounded opacity-0
                group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg z-20"
                />
              </button>
              {i < buttons.length - 1 && <Separator />}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ActionButton;

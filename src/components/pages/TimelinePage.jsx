import { Mail, RefreshCw, User, Globe, Reply } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadgerEmail, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { getContact, viewEmailAction } from "../../store/Slices/viewEmail";
import ContactBox from "../ContactBox";
import CreateDeal from "../CreateDeal";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LoadingAll, LoadingSpin } from "../Loading";

// ←←← YOUR AVATAR COMPONENT ←←←
import Avatar from "../Avatar";

import {
  daysUntil,
  formatExpiryLabel,
  formatTime,
  getDifference,
  getStageProgress,
} from "../../assets/assets";
import LoadingSkeleton from "../LoadingSkeleton";
import Pagination from "../Pagination";
import MoveToDropdown from "../MoveToDropdown";
import {
  forwardEmail,
  forwardedAction,
} from "../../store/Slices/forwardedEmailSlice";
import { LoadingChase } from "../Loading";
import { favAction, favEmail } from "../../store/Slices/favEmailSlice";
import { bulkAction, markingEmail } from "../../store/Slices/markBulkSlice";
import Ip from "../Ip";
import { getAvatar } from "../../store/Slices/avatarSlice";

export function TimelinePage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showEmail, setShowEmails] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);

  // ←←← STATE TO CONTROL AVATAR VISIBILITY ←←←
  const [showAvatar, setShowAvatar] = useState(false);
  const { contactInfo, accountInfo } = useSelector((state) => state.viewEmail);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  const { threadId } = useSelector((s) => s.viewEmail);
  const {
    forward,
    error: forwardError,
    message: forwardMessage,
  } = useSelector((s) => s.forwarded);
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

  const { ladger, email, duplicate, mailersSummary, loading, error } =
    useSelector((state) => state.ladger);
  const {
    loading: sendLoading,
    contactLoading,
    error: sendError,
    message,
  } = useSelector((state) => state.viewEmail);

  const currentThreadId =
    mailersSummary?.thread_id_c ||
    ladger[1]?.thread_id_c ||
    ladger[0]?.thread_id_c ||
    "";

  /** Disable body scroll when modals open */
  useEffect(() => {
    if (showEmail || showContact || showDeal || showIP || showAvatar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showEmail, showContact, showDeal, showIP, showAvatar]);

  /** Auto Refresh */
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(getLadgerEmail(email));
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch, email]);

  /** Error & Success Toasts */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(viewEmailAction.clearAllMessage());
    }
    if (forwardError) {
      toast.error(forwardError);
      dispatch(forwardedAction.clearAllErrors());
    }
    if (forwardMessage) {
      toast.success(forwardMessage);
      dispatch(forwardedAction.clearAllMessages());
    }
    if (favouriteError) {
      toast.error(favouriteError);
      dispatch(favAction.clearAllErrors());
    }
    if (favouriteMessage) {
      toast.success(favouriteMessage);
      dispatch(favAction.clearAllMessages());
    }
    if (markingError) {
      toast.error(markingError);
      dispatch(bulkAction.clearAllErrors());
    }
    if (markingMessage) {
      toast.success(markingMessage);
      dispatch(bulkAction.clearAllMessages());
    }
  }, [
    dispatch,
    error,
    sendError,
    message,
    forwardError,
    forwardMessage,
    favouriteError,
    favouriteMessage,
    markingError,
    markingMessage,
  ]);

  const handleMoveSuccess = () => {
    dispatch(getLadgerEmail(email));
  };
  const { avatar, loading: avatarLoading } = useSelector(
    (state) => state.avatar
  );

  const stageProgress = getStageProgress(mailersSummary?.stage);
  if (showEmail) {
    return (
      <>
        <EmailBox
          onClose={() => setShowEmails(false)}
          view={true}
          tempEmail={email}
        />
      </>
    );
  }
  if (showContact) {
    return (
      <>
        <ContactBox onClose={() => setShowContact(false)} />
      </>
    );
  }
  if (showDeal) {
    return <CreateDeal onClose={() => setShowDeal(false)} />;
  }
  if (showIP) {
    return <Ip onClose={() => setShowIP(false)} />;
  }

  return (
    <>
      {/* ===================== MAIN PAGE CONTENT ===================== */}
      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {loading && <LoadingSkeleton />}
        {!loading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">
              {/* TOP HEADER */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    {ladger.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        {contactLoading ? (
                          <LoadingAll size="30" color="blue" />
                        ) : (
                          <Link
                            to={"/contacts"}
                            className="text-gray-800 text-lg font-semibold"
                          >
                            {contactInfo?.first_name == ""
                              ? email
                              : contactInfo?.first_name}
                          </Link>
                        )}

                        <img
                          width="50"
                          height="50"
                          src="https://img.icons8.com/bubbles/100/verified-account.png"
                          alt="verified-account"
                        />
                      </div>
                    )}

                    <div className="ml-4 flex items-center gap-4">
                      {/* TYPE */}
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-md">
                        <div className="text-sm">
                          <div className="text-gray-500 text-xs">Type</div>
                          <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                          <div className="text-gray-800 font-medium">
                            {mailersSummary?.type ?? "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="w-px h-10 bg-gray-200"></div>

                      {/* STATUS */}
                      <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                        <div className="text-sm">
                          <div className="text-gray-500 text-xs">Status</div>
                          <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                          <div className="text-gray-800 font-medium">
                            {mailersSummary?.status ?? "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="w-px h-10 bg-gray-200"></div>

                      {/* STAGE */}
                      <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                        <div className="text-sm">
                          <div className="text-gray-500 text-xs">Stage</div>
                          <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                          <div className="text-gray-800 font-medium">
                            {mailersSummary?.stage ?? "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex gap-3 ml-6">
                    <button className="cursor-pointer hover:scale-105">
                      <img
                        width="48"
                        height="48"
                        src="https://img.icons8.com/color/48/whatsapp--v1.png"
                        alt="whatsapp"
                      />
                    </button>
                    <button className="cursor-pointer hover:scale-105">
                      <img
                        width="48"
                        height="48"
                        src="https://img.icons8.com/color/48/apple-phone.png"
                        alt="call"
                      />
                    </button>
                    <button className="cursor-pointer hover:scale-105">
                      <img
                        width="48"
                        height="48"
                        src="https://img.icons8.com/stickers/100/speech-bubble-with-dots.png"
                        alt="sms"
                      />
                    </button>
                  </div>
                </div>

                {/* Refresh & Duplicates */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">
                    {duplicate > 1
                      ? `${duplicate} Duplicates`
                      : `${duplicate} Duplicate`}
                  </span>
                  <button
                    onClick={() => dispatch(getLadgerEmail(email))}
                    className="flex items-center cursor-pointer text-blue-500 border rounded-3xl p-2 border-blue-600"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <div>
                    <img
                      width="36"
                      height="36"
                      src="https://img.icons8.com/pulsar-gradient/48/replay-5.png"
                      alt="replay"
                    />
                  </div>
                </div>
              </div>

              {/* NO RESULTS */}
              {!mailersSummary || Object.keys(mailersSummary).length === 0 ? (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/7486/7486780.png"
                    className="w-20 mx-auto mb-4 opacity-70"
                    alt="no-result"
                  />
                  <h2 className="text-xl font-semibold text-gray-700">
                    No Result Found
                  </h2>
                  <p className="text-gray-500 mt-1">
                    We couldn’t find any summary or recent email activity.
                  </p>
                </div>
              ) : (
                <>
                  {/* TIMELINE TABLE */}
                  <div className="mt-4 p-6 bg-cyan-50 rounded-3xl shadow-xl border border-white/40">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-blue-400 rounded-xl overflow-hidden text-sm">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                              DATE
                            </th>
                            <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                              SUBJECT
                            </th>
                            <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                              MOTIVE
                            </th>
                            <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                              DEAL EXPIRY
                            </th>
                            <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                              DEAL
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-center">
                            <td className="border border-blue-400 px-4 py-3">
                              <div className="font-semibold text-gray-900">
                                {formatTime(mailersSummary?.date_entered)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {getDifference(mailersSummary?.date_entered)}
                              </div>
                            </td>
                            <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                              {mailersSummary?.subject ?? "No Subject"}
                            </td>
                            <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                              {mailersSummary?.motive ?? "N/A"}
                            </td>
                            <td className="border border-blue-400 px-4 py-3">
                              <div
                                className={`font-semibold ${
                                  daysUntil(2) <= 3
                                    ? "text-rose-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {formatExpiryLabel(mailersSummary.deal_expiry)}
                              </div>
                              {mailersSummary?.deal_expiry && (
                                <div className="text-xs text-gray-500 mt-1">
                                  ({formatTime(mailersSummary.deal_expiry)})
                                </div>
                              )}
                            </td>
                            <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                              {mailersSummary?.deal ?? "No Deal"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AI SUMMARY + LATEST MESSAGE */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Summary Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-56 overflow-y-auto">
                      <div className="flex items-center mb-2">
                        <h3 className="text-blue-700 font-semibold">
                          AI Summary
                        </h3>

                        {/* ←←← PLAY BUTTON THAT OPENS AVATAR ←←← */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-200 p-1 ml-2"
                          onClick={() => {
                            dispatch(getAvatar());
                            setShowAvatar(true);
                          }} // ← This triggers the avatar!
                        >
                          <img
                            width="40"
                            height="40"
                            src="https://img.icons8.com/office/40/circled-play.png"
                            alt="Play AI Avatar"
                          />
                        </motion.button>

                        {/* ←←← Quick AI Reply ←←← */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-200 p-1 ml-2"
                          onClick={() => setShowEmails(true)} // ← This triggers the avatar!
                        >
                          <img
                            width="40"
                            height="40"
                            src="https://img.icons8.com/ultraviolet/40/bot.png"
                            alt="bot"
                          />
                        </motion.button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {mailersSummary?.summary ?? "No AI summary available."}
                      </p>
                    </div>

                    {/* Latest Message Card */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 h-56 overflow-y-auto shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-yellow-700 font-semibold">
                          Latest Message
                        </h3>
                        <button
                          className="flex items-center gap-1 text-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 px-3 py-1 rounded-md"
                          onClick={() => setShowEmails(true)}
                        >
                          <Reply className="w-4 h-4" />
                          Reply
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {mailersSummary?.description ??
                          "No recent message found."}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
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
                        label: "Forward",
                        action: () => dispatch(forwardEmail(threadId)),
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
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={btn.action}
                        className="relative group flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg active:scale-95 hover:-translate-y-1 transition-all cursor-pointer"
                      >
                        {btn.icon}
                        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg z-20">
                          {btn.label}
                        </span>
                      </button>
                    ))}
                    <MoveToDropdown
                      currentThreadId={currentThreadId}
                      onMoveSuccess={handleMoveSuccess}
                    />
                  </div>
                </>
              )}
            </div>

            {ladger?.length > 0 && (
              <>
                {/* TIMELINE EVENTS */}
                <div className="py-[2%] px-[30%]">
                  <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600  p-2 rounded-4xl  text-center text-white">
                    TIMELINE
                  </h1>
                  <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300"></div>

                    <div className="space-y-6">
                      {ladger.map((event, index) => (
                        <div
                          key={event.id}
                          className="relative flex items-center gap-4"
                        >
                          {/* Dot */}
                          <div className="relative z-10 w-16 flex-shrink-0 mt-3   flex items-center justify-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                              <img
                                width="100"
                                height="100"
                                src="https://img.icons8.com/bubbles/100/new-post.png"
                                alt="new-post"
                              />
                            </div>

                            <div
                              className="bg-gradient-to-r from-purple-600 to-blue-600 
                                          absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"
                            ></div>
                          </div>

                          {/* Card */}
                          <div
                            className={`flex-1 border-2 rounded-xl  p-4 mt-3 ${
                              index == 0
                                ? "bg-gradient-to-r from-[#FFFF00] to-white"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 justify-between mb-2">
                              <span className="text-gray-700">
                                {event.type_c?.charAt(0).toUpperCase() +
                                  event.type_c?.slice(1)}
                              </span>

                              <span className="text-gray-500 text-sm">
                                {formatTime(event.date_entered)}
                              </span>
                            </div>
                            {/* optionally add event message preview */}
                            {event.subject && (
                              <div className="text-sm text-gray-600">
                                {event.subject}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* END ICON */}
                      {ladger.length > 0 && (
                        <div className="relative flex gap-4">
                          <div className="relative z-10 w-16 flex-shrink-0">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <img
                                src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/image__7_-removebg-preview.png"
                                alt=""
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Pagination slice={"ladger"} fn={getLadgerEmail} />
              </>
            )}
          </>
        )}
      </div>

      {/* ←←← RENDER THE AVATAR WHEN TRIGGERED ←←← */}
      {showAvatar && !avatarLoading && (
        <Avatar setShowAvatar={setShowAvatar} avatarUrl={avatar} />
      )}
      {showAvatar && avatarLoading && (
        <div className="fixed bottom-10 right-10 z-50">
          <LoadingAll type="hourglass" />
        </div>
      )}
    </>
  );
}

export default TimelinePage;

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

import { getAiReply } from "../../store/Slices/aiReply";
import { sendEmailToThread } from "../../store/Slices/threadEmail";

// ←←← YOUR AVATAR COMPONENT ←←←
import Avatar from "../Avatar";

import {
  daysUntil,
  formatExpiryLabel,
  formatTime,
  getDifference,
  images,
} from "../../assets/assets";
import LoadingSkeleton from "../LoadingSkeleton";
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
import TimelineEvent from "../TimelineEvent";
import UserDropdown from "../UserDropDown";
import SocialButtons from "../SocialButtons";

export function TimelinePage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showEmail, setShowEmails] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const {
    contactInfo,
    accountInfo,
    loading: sendLoading,
    contactLoading,
    error: sendError,
    message,
    threadId,
  } = useSelector((state) => state.viewEmail);
  const {
    aiReply,
    loading: aiLoading,
    error: aiError,
  } = useSelector((s) => s.aiReply);
  const [aiReplySentLoading, setAiReplySentLoading] = useState(false);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();

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

  const { ladger, email, mailersSummary, loading, error } = useSelector(
    (state) => state.ladger
  );
  const { emails, loading: unrepliedLoading } = useSelector(
    (state) => state.unreplied
  );

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
  const handleForward = (to) => {
    dispatch(forwardEmail(to, threadId));
  };

  /** Fetch AI Reply on page load */
  useEffect(() => {
    if (emails.length > 0) {
      console.log("🔄 Fetching AI Reply on page load...", emails[0].thread_id);
      dispatch(getAiReply(emails[0].thread_id));
    }
  }, [emails, dispatch]);

  useEffect(() => {
    if (aiError) {
      toast.error(aiError);
    }
  }, [aiError]);

  const handleMoveSuccess = () => {
    dispatch(getLadgerEmail(email));
  };

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

  const handleAiAutoReply = async () => {
    if (!aiReply) {
      toast.error("No AI reply content available");
      return;
    }

    setAiReplySentLoading(true);
    try {
      const replyContent =
        typeof aiReply === "string" ? aiReply : aiReply?.reply_suggestion;

      if (replyContent) {
        await dispatch(sendEmailToThread(emails[0].thread_id, replyContent));
        toast.success("AI reply sent successfully!");
      } else {
        toast.error("No valid reply content found");
      }
    } catch (error) {
      console.error("❌ Error sending AI reply:", error);
      toast.error("Failed to send AI reply");
    } finally {
      setAiReplySentLoading(false);
    }
  };

  return (
    <>
      {/* ===================== MAIN PAGE CONTENT ===================== */}
      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(loading || unrepliedLoading) && <LoadingSkeleton />}
        {!loading && !unrepliedLoading && (
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
                  <SocialButtons />
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

                  {/* AI REPLY + AI SUMMARY + LATEST MESSAGE */}

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-56 overflow-y-auto">
                      <div className="flex items-center mb-2">
                        <h3 className="text-green-700 font-semibold">
                          Quick Reply
                        </h3>
                      </div>


                      {aiReply ? (
                        <div className="mb-3">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {typeof aiReply === "string"
                              ? aiReply
                              : aiReply?.reply_suggestion || aiReply}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No AI reply generated.</p>
                      )}


                      {aiReplySentLoading ? (
                        <div className="flex justify-center mt-3">
                          <LoadingAll size="30" color="blue" type="ping" />
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                          onClick={handleAiAutoReply}
                          disabled={!aiReply}
                        >
                          <img
                            width="20"
                            height="20"
                            src="https://img.icons8.com/ultraviolet/40/bot.png"
                            alt="AI Reply"
                          />
                          <span>Send AI Reply</span>
                        </motion.button>
                      )}
                    </div>


                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-56 overflow-y-auto">
                      <div className="flex items-center mb-2">
                        <h3 className="text-blue-700 font-semibold">
                          AI Summary
                        </h3>


                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-200 p-1 ml-2"
                          onClick={() => {
                            dispatch(getAvatar());
                            setShowAvatar(true);
                          }}
                        >
                          <img
                            width="40"
                            height="40"
                            src="https://img.icons8.com/office/40/circled-play.png"
                            alt="Play AI Avatar"
                          />
                        </motion.button>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {mailersSummary?.summary ?? "No AI summary available."}
                      </p>
                    </div>


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
                        {showUsers && btn.label === "Forward" && (
                          <UserDropdown
                            forwardHandler={handleForward}
                            onClose={() => setShowUsers(false)}
                          />
                        )}
                      </div>
                    ))}
                    {/* 
                    <MoveToDropdown
                      currentThreadId={currentThreadId}
                      onMoveSuccess={handleMoveSuccess}
                    /> */}
                  </div>
                </>
              )}
            </div>

            {ladger?.length > 0 && <TimelineEvent />}
          </>
        )}
      </div>

      {/* ←←← RENDER THE AVATAR WHEN TRIGGERED ←←← */}
      {showAvatar && <Avatar setShowAvatar={setShowAvatar} onPlay={true} />}
    </>
  );
}

export default TimelinePage;

import { Mail, Globe, Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadgerEmail, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { viewEmailAction } from "../../store/Slices/viewEmail";
import ContactBox from "../ContactBox";
import CreateDeal from "../CreateDeal";
import { motion } from "framer-motion";
import { LoadingAll, LoadingSpin } from "../Loading";
import { getAiReply } from "../../store/Slices/aiReply";
import { sendEmailToThread } from "../../store/Slices/threadEmail";
import Avatar from "../Avatar";
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
import MailerSummaryHeader from "../MailerSummaryHeader";
import NoResult from "../NoResult";
import ContactHeader from "../ContactHeader";
import { extractEmail } from "../../assets/assets";

export function TimelinePage() {
  const [showEmail, setShowEmails] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [showAvatar, setShowAvatar] = useState(false);
  const [aiReplySentLoading, setAiReplySentLoading] = useState(false);

  const {
    loading: sendLoading,
    error: sendError,
    message,
    threadId,
  } = useSelector((state) => state.viewEmail);

  const {
    aiReply,
    loading: aiLoading,
    error: aiError,
  } = useSelector((s) => s.aiReply);

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

  // ----------------------------------------------------
  // ✔ ALL HOOKS ABOVE CONDITIONAL RETURNS
  // ----------------------------------------------------

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

  useEffect(() => {
    if (aiError) {
      toast.error(aiError);
    }
  }, [aiError]);

  const handleMoveSuccess = () => {
    dispatch(getLadgerEmail(email));
  };

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

  useEffect(() => {
    if (emails.length > 0) {
      dispatch(getLadgerEmail(extractEmail(emails[currentEmailIndex].from)));
      dispatch(getAiReply(emails[currentEmailIndex].thread_id));
    }
  }, [currentEmailIndex]);

  const handleNext = () => {
    if (currentEmailIndex < emails.length - 1) {
      setCurrentEmailIndex((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentEmailIndex > 0) {
      setCurrentEmailIndex((p) => p - 1);
    }
  };

  // ----------------------------------------------------
  // ✔ CONDITIONAL RETURNS AFTER ALL HOOKS
  // ----------------------------------------------------

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

  if (showThread) {
    return (
      <>
        <EmailBox
          onClose={() => setShowThread(false)}
          threadId={emails[0].thread_id}
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

  // ----------------------------------------------------
  // NORMAL RENDER BELOW
  // ----------------------------------------------------

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(loading || unrepliedLoading) && <LoadingSkeleton />}
        {!loading && !unrepliedLoading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">

              <ContactHeader onNext={handleNext} onPrev={handlePrev} />

              {!mailersSummary || Object.keys(mailersSummary).length === 0 ? (
                <NoResult />
              ) : (
                <>
                  <MailerSummaryHeader />

                  {emails.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* AI SUMMARY */}
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

                        <hr className="my-3 border-gray-300" />

                        <div className="mt-3">
                          {aiReply && (
                            <div className="mb-3 p-3 bg-white border border-green-200 rounded-lg">
                              <h4 className="text-green-700 font-semibold text-sm mb-2">
                                AI Reply:
                              </h4>
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                {typeof aiReply === "string"
                                  ? aiReply
                                  : aiReply?.reply_suggestion || aiReply}
                              </p>
                            </div>
                          )}

                          {aiReplySentLoading ? (
                            <div className="flex justify-center">
                              <LoadingAll size="30" color="blue" type="ping" />
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      </div>

                      {/* Latest Message */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 h-56 overflow-y-auto shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-yellow-700 font-semibold">
                            Latest Message
                          </h3>
                          <button
                            className="flex items-center gap-1 text-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 px-3 py-1 rounded-md"
                            onClick={() => setShowThread(true)}
                          >
                            <Reply className="w-4 h-4" />
                            Reply
                          </button>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {emails.length > 0 &&
                            emails[currentEmailIndex].subject}
                        </p>
                      </div>
                    </div>
                  )}

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

                    <MoveToDropdown
                      currentThreadId={threadId}
                      onMoveSuccess={handleMoveSuccess}
                    />
                  </div>
                </>
              )}
            </div>

            {ladger?.length > 0 && <TimelineEvent />}
          </>
        )}
      </div>

      {showAvatar && <Avatar setShowAvatar={setShowAvatar} onPlay={true} />}
    </>
  );
}

export default TimelinePage;

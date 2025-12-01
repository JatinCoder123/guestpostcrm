import { Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadgerEmail, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { viewEmailAction } from "../../store/Slices/viewEmail";
import ContactBox from "../ContactBox";
import CreateDeal from "../CreateDeal";
import { motion } from "framer-motion";
import { LoadingAll } from "../Loading";
import { getAiReply } from "../../store/Slices/aiReply";
import { sendEmailToThread, threadEmailAction } from "../../store/Slices/threadEmail";
import Avatar from "../Avatar";
import LoadingSkeleton from "../LoadingSkeleton";
import Ip from "../Ip";
import { getAvatar } from "../../store/Slices/avatarSlice";
import TimelineEvent from "../TimelineEvent";
import MailerSummaryHeader from "../MailerSummaryHeader";
import NoResult from "../NoResult";
import ContactHeader from "../ContactHeader";
import { extractEmail } from "../../assets/assets";
import ActionButton from "../ActionButton";
import { addEvent } from "../../store/Slices/eventSlice";

export function TimelinePage() {
  const [showEmail, setShowEmails] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [showAvatar, setShowAvatar] = useState(false);
  const [aiReplySentLoading, setAiReplySentLoading] = useState(false);

  const {
    error: sendError,
    message,
    threadId,
  } = useSelector((state) => state.viewEmail);

  const {
    error: threadError,
    message: threadMessage,
  } = useSelector((state) => state.threadEmail);

  const {
    aiReply,
    error: aiError,
  } = useSelector((s) => s.aiReply);

  const dispatch = useDispatch();



  const { ladger, email, mailersSummary, loading, error } = useSelector(
    (state) => state.ladger
  );

  const { emails, loading: unrepliedLoading } = useSelector(
    (state) => state.unreplied
  );
  const currentThreadId = emails.length > 0 ? emails[currentEmailIndex].thread_id : null;
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
    if (threadError) {
      toast.error(threadError);
      dispatch(threadEmailAction.clearAllErrors());
    }
    if (threadMessage) {
      toast.success(threadMessage);
      dispatch(addEvent({
        email: email,
        thread_id: currentThreadId,
        recent_activity: threadMessage,
      }));
      dispatch(threadEmailAction.clearAllMessage());
    }
  }, [
    dispatch,
    error,
    sendError,
    message,
    threadError,
    threadMessage,
  ]);



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
        dispatch(sendEmailToThread(emails[currentEmailIndex].thread_id, replyContent));
        dispatch(addEvent({
          email: email,
          thread_id: emails[currentEmailIndex].thread_id,
          recent_activity: "AI reply sent",
        }));
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
      if (extractEmail(emails[currentEmailIndex].from) !== email) {
        dispatch(getLadgerEmail(extractEmail(emails[currentEmailIndex].from)));
      }
      dispatch(getAiReply(currentThreadId));
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
          threadId={currentThreadId}
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
      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(loading || unrepliedLoading) && <LoadingSkeleton />}
        {!loading && !unrepliedLoading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">

              <ContactHeader onNext={handleNext} onPrev={handlePrev} currentIndex={currentEmailIndex} />

              {!mailersSummary || Object.keys(mailersSummary).length === 0 ? (
                <NoResult />
              ) : (
                <>
                  <MailerSummaryHeader />

                  {emails.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* AI SUMMARY */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-56 overflow-y-auto">
                        <div className="flex items-center justify-start gap-3 mb-2">
                          <h3 className="text-green-700 font-semibold">
                            Quick Reply
                          </h3>
                          {/* Send AI Reply Button - Moved to top right */}
                          {aiReplySentLoading ? (
                            <div className="flex justify-center">
                              <LoadingAll size="25" color="blue" type="ping" />
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400 }}
                              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              onClick={handleAiAutoReply}
                              disabled={!aiReply}
                            >
                              <img
                                width="33"
                                height="33"
                                src="https://img.icons8.com/ultraviolet/40/bot.png"
                                alt="AI Reply"
                              />
                            </motion.button>
                          )}
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
                            className="rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-200 p-1 ml-2 cursor-pointer"
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
                  <ActionButton handleMoveSuccess={handleMoveSuccess} setShowEmails={setShowEmails} setShowIP={setShowIP} threadId={currentThreadId} />
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

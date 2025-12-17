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
<<<<<<< HEAD
import { LoadingAll, LoadingChase, LoadingSpin } from "../Loading";
import {
  sendEmailToThread,
  threadEmailAction,
} from "../../store/Slices/threadEmail";
=======
import { LoadingChase } from "../Loading";
import { sendEmailToThread, threadEmailAction } from "../../store/Slices/threadEmail";
>>>>>>> 26919d5e6bb76b11213aa02a4c3b250969e9116a
import Avatar from "../Avatar";
import LoadingSkeleton from "../LoadingSkeleton";
import Ip from "../Ip";
import { getAvatar } from "../../store/Slices/avatarSlice";
import TimelineEvent from "../TimelineEvent";
import MailerSummaryHeader from "../MailerSummaryHeader";
import NoResult from "../NoResult";
import ContactHeader from "../ContactHeader";
import ActionButton from "../ActionButton";
import { addEvent } from "../../store/Slices/eventSlice";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { unrepliedAction, updateUnrepliedEmails } from "../../store/Slices/unrepliedEmails";
import { updateUnansweredEmails } from "../../store/Slices/unansweredEmails";
import NewEmailBanner from "../NewEmailBanner";
export function TimelinePage() {
  const [showEmail, setShowEmails] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const { currentIndex, setCurrentIndex } = useContext(PageContext);
  const [showAvatar, setShowAvatar] = useState(false);
  const [aiReplySentLoading, setAiReplySentLoading] = useState(false);
<<<<<<< HEAD


=======
>>>>>>> 26919d5e6bb76b11213aa02a4c3b250969e9116a
  const {
    error: sendError,
    message,
    threadId,
  } = useSelector((state) => state.viewEmail);

  const {
    error: threadError,
    message: threadMessage,
    sending,
  } = useSelector((state) => state.threadEmail);
  const dispatch = useDispatch();
  const { ladger, email, mailersSummary, loading, error } = useSelector(
    (state) => state.ladger
  );

  const { emails, loading: unrepliedLoading, showNewEmailBanner } = useSelector(
    (state) => state.unreplied
  );
<<<<<<< HEAD
  const currentThreadId =
    emails.length > 0 ? emails[currentIndex].thread_id : null;
=======
  const currentThreadId = emails?.length > 0 ? emails[currentIndex].thread_id : null;
>>>>>>> 26919d5e6bb76b11213aa02a4c3b250969e9116a
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
      const newEmail = emails.find(
        (email) => email.thread_id == currentThreadId
      );
      dispatch(updateUnrepliedEmails(currentThreadId));
      dispatch(updateUnansweredEmails(newEmail));
      dispatch(
        addEvent({
          email: email,
          thread_id: currentThreadId,
          recent_activity: threadMessage,
        })
      );
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
  const handleMoveSuccess = () => {
    dispatch(getLadgerEmail(email));
  };

  const handleAiAutoReply = async () => {
    setAiReplySentLoading(true);
    try {
      dispatch(
        sendEmailToThread(
          emails[currentIndex].thread_id,
          mailersSummary?.ai_response
        )
      );
      dispatch(
        addEvent({
          email: email,
          thread_id: emails[currentIndex].thread_id,
          recent_activity: "AI reply sent",
        })
      );
    } catch (error) {
      console.error("❌ Error sending AI reply:", error);
      toast.error("Failed to send AI reply");
    } finally {
      setAiReplySentLoading(false);
    }
  };
  const handleNext = () => {
    if (currentIndex < emails?.length - 1) {
      setCurrentIndex((p) => p + 1);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    }
  };

  useEffect(() => {
    if (showNewEmailBanner) {
      const timer = setTimeout(() => {
        setCurrentIndex(0);       // 🔥 redirect to latest email
        dispatch(unrepliedAction.setShowNewEmailBanner(false));
      }, 3000);

      return () => clearTimeout(timer);
<<<<<<< HEAD
    }  }, [showNewEmailBanner]);
=======
    }
  }, [showNewEmailBanner]);
>>>>>>> 26919d5e6bb76b11213aa02a4c3b250969e9116a
  if (showEmail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowEmails(false)}
          view={true}
          tempEmail={email}
        />
      </div>
    );
  }

  if (showThread) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowThread(false)}
          threadId={currentThreadId}
          tempEmail={email}
        />
      </div>
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
      <NewEmailBanner show={showNewEmailBanner} />
      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(loading || unrepliedLoading) && <LoadingSkeleton />}
        {!loading && !unrepliedLoading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">
              <ContactHeader
                onNext={handleNext}
                onPrev={handlePrev}
                currentIndex={currentIndex}
              />

              {!mailersSummary || Object.keys(mailersSummary).length === 0 ? (
                <NoResult />
              ) : (
                <MailerSummaryHeader />
              )}
              {emails?.length > 0 && (
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
                          <LoadingChase size="25" color="blue" type="ping" />
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          onClick={handleAiAutoReply}
<<<<<<< HEAD
                          disabled={
                            sending ||
                            mailersSummary == null ||
                            mailersSummary?.ai_response.trim() === ""
                          }
=======
                          disabled={sending || mailersSummary == null || mailersSummary?.ai_response?.trim() === ""}
>>>>>>> 26919d5e6bb76b11213aa02a4c3b250969e9116a
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

                    {!sending && (
                      <div className="mb-3">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {mailersSummary == null ||
                          mailersSummary?.ai_response == ""
                            ? "No AI reply generated."
                            : mailersSummary?.ai_response}
                        </p>
                      </div>
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
                    <div className="flex items-center justify-start mb-2">
                      <h3 className="text-yellow-700 font-semibold">
                        Latest Message
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="flex items-center gap-2 rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-200 p-2 ml-2 cursor-pointer"
                        onClick={() => setShowThread(true)}
                      >
                        <Reply className="w-6 h-6 text-yellow-700" />
                      </motion.button>
                    </div>
<<<<<<< HEAD
                    
                    {emails.length > 0 &&<div
                      dangerouslySetInnerHTML={{ __html: emails[currentIndex].body || "no body found"}}
                      className="whitespace-pre-line text-sm leading-relaxed"
                    /> }
                    
=======
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: emails?.length > 0 && emails[currentIndex].body ? emails[currentIndex].body : "No Message Found!" }} />


>>>>>>> 26919d5e6bb76b11213aa02a4c3b250969e9116a
                  </div>
                </div>
              )}
              {!(
                !mailersSummary || Object.keys(mailersSummary).length === 0
              ) && (
                <ActionButton
                  handleMoveSuccess={handleMoveSuccess}
                  setShowEmails={setShowEmails}
                  setShowIP={setShowIP}
                  threadId={currentThreadId}
                />
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

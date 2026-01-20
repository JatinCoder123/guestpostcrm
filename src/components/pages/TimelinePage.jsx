import { Mail, Pencil, Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadger, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { viewEmailAction } from "../../store/Slices/viewEmail";
import CreateDeal from "../CreateDeal";
import { motion } from "framer-motion";
import { LoadingChase } from "../Loading";
import {
  sendEmailToThread,
  threadEmailAction,
} from "../../store/Slices/threadEmail";
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
import { unrepliedAction } from "../../store/Slices/unrepliedEmails";
import NewEmailBanner from "../NewEmailBanner";
import { NoSearchFoundPage } from "../NoSearchFoundPage";
import { SocketContext } from "../../context/SocketContext";
import UpdatePopup from "../UpdatePopup";
export function TimelinePage() {
  const [showEmail, setShowEmail] = useState(false);
  const [showUpdateAiReply, setShowUpdateAiReply] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [showThread, setShowThread] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const { currentIndex, setCurrentIndex, enterEmail, search } =
    useContext(PageContext);
  const { setNotificationCount } = useContext(SocketContext);
  const [showAvatar, setShowAvatar] = useState(false);
  const [aiReplySentLoading, setAiReplySentLoading] = useState(false);
  const {
    error: sendError,
    message,
    loading: viewEmailLoading,
    viewEmail,
    threadId,
  } = useSelector((state) => state.viewEmail);

  const {
    error: threadError,
    message: threadMessage,
    sending,
  } = useSelector((state) => state.threadEmail);
  const dispatch = useDispatch();
  const { ladger, email, mailersSummary, searchNotFound, loading, error } =
    useSelector((state) => state.ladger);
  const {
    emails,
    loading: unrepliedLoading,
    showNewEmailBanner,
  } = useSelector((state) => state.unreplied);
  const currentThreadId = emails?.length > 0 && emails[currentIndex]?.thread_id;
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
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      dispatch(
        addEvent({
          email: email,
          thread_id: currentThreadId,
          recent_activity: threadMessage,
        })
      );
      dispatch(threadEmailAction.clearAllMessage());
    }
  }, [dispatch, error, sendError, message, threadError, threadMessage]);
  useEffect(() => {
    if (mailersSummary?.ai_response) {
      setAiReply(mailersSummary?.ai_response);
    }
  }, [mailersSummary]);
  const handleMoveSuccess = () => {
    dispatch(getLadger({ email }));
  };
  const handleActionBtnClick = (btnBody) => {
    if (emails.length == 0) {
      toast.info("No Unreplied Email found");
      return;
    }
    dispatch(sendEmailToThread(emails[currentIndex]?.thread_id, btnBody));
    dispatch(
      addEvent({
        email: email,
        thread_id: emails[currentIndex]?.thread_id,
        recent_activity: "Quick Action Button Reply Sent",
      })
    );
  };

  const handleAiAutoReply = async (updatedAiReply) => {
    setAiReplySentLoading(true);
    try {
      dispatch(
        sendEmailToThread(
          emails[currentIndex]?.thread_id
            ? emails[currentIndex]?.thread_id
            : threadId,
          updatedAiReply
        )
      );
      dispatch(
        addEvent({
          email: email,
          thread_id: emails[currentIndex]?.thread_id,
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
        setCurrentIndex(0); // 🔥 redirect to latest email
        dispatch(unrepliedAction.setShowNewEmailBanner(false));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showNewEmailBanner]);
  if (searchNotFound) {
    return <NoSearchFoundPage />;
  }
  if (showEmail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowEmail(false)}
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

  if (showDeal) {
    return <CreateDeal onClose={() => setShowDeal(false)} />;
  }

  if (showIP) {
    return <Ip onClose={() => setShowIP(false)} />;
  }

  return (
    <>
      <NewEmailBanner show={showNewEmailBanner} />
      <UpdatePopup open={showUpdateAiReply} onClose={() => setShowUpdateAiReply(false)} fields={[{
        label: "Ai Reply",
        name: "ai_reply",
        type: "textarea",
        value: aiReply,
      }]}
        buttonLabel="Send"
        loading={aiReplySentLoading}
        onUpdate={(data) => {
          console.log(data);
          setAiReply(data.ai_reply);
          handleAiAutoReply(data.ai_reply);
          setShowUpdateAiReply(false);
        }} />
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
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI SUMMARY */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-56 overflow-y-auto">
                  <div className="flex items-center justify-start gap-2 mb-2">
                    <h3 className="text-green-700 font-semibold">
                      Quick Reply
                    </h3>
                    <button
                      onClick={() => setShowUpdateAiReply(true)}
                      className=" text-green-700 hover:text-green-800 cursor-pointer hover:scael-120 transition-all mr-4"
                    >
                      <Pencil size={20} />
                    </button>
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
                        onClick={() => handleAiAutoReply(aiReply)}
                        disabled={
                          sending ||
                          mailersSummary == null ||
                          mailersSummary?.ai_response?.trim() === ""
                        }
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
                        {aiReply}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-56 overflow-y-auto">
                  <div className="flex items-center mb-2">
                    <h3 className="text-blue-700 font-semibold">AI Summary</h3>

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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 h-56 overflow-y-auto custom-scrollbar shadow-sm">
                  <div className="flex flex-col justify-center mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-yellow-700 font-semibold">
                          Latest Message
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="flex items-center gap-2 rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-200 p-2 ml-2 cursor-pointer"
                          onClick={() => {
                            if (emails.length > 0) {
                              setShowThread(true);
                            } else {
                              setShowEmail(true);
                            }
                          }}
                        >
                          <Reply className="w-6 h-6 text-yellow-700" />
                        </motion.button>
                      </div>

                      {viewEmail?.length > 0 && (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      ${viewEmail[viewEmail.length - 1].from_email === email
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                            }
    `}
                        >
                          <Mail className="w-4 h-4" />

                          {viewEmail[viewEmail.length - 1].from_email === email
                            ? "Client Mail"
                            : "Our Mail"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {viewEmail?.length > 0 && (
                        <>
                          <span className="text-xs text-gray-500">
                            {viewEmail[viewEmail.length - 1]?.date_created}{" "}
                            <br />
                          </span>
                          <span className="text-xs text-gray-500">
                            ({" "}
                            {viewEmail[viewEmail.length - 1]?.date_created_ago}{" "}
                            )<br />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {viewEmailLoading ? (
                    <LoadingSkeleton
                      className="h-56"
                      count={1}
                      width="100%"
                      height="100%"
                    />
                  ) : (
                    <div
                      className="text-gray-700 text-sm leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html:
                          viewEmail?.length > 0
                            ? viewEmail[viewEmail.length - 1]?.body
                            : "No Message Found!",
                      }}
                    />
                  )}
                </div>
              </div>
              {!(
                !mailersSummary || Object.keys(mailersSummary).length === 0
              ) && (
                  <ActionButton
                    handleMoveSuccess={handleMoveSuccess}
                    setShowEmails={setShowEmail}
                    setShowIP={setShowIP}
                    threadId={currentThreadId}
                    handleActionBtnClick={handleActionBtnClick}
                  />
                )}
            </div>

            {ladger?.length > 0 ? (
              <TimelineEvent />
            ) : (
              <div className="py-[2%] px-[30%] ">
                <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-2xl text-center text-white">
                  TIMELINE
                </h1>
                <p className="text-gray-700 text-sm text-center leading-relaxed mt-2">
                  No timeline events found.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showAvatar && <Avatar setShowAvatar={setShowAvatar} onPlay={true} />}
    </>
  );
}

export default TimelinePage;

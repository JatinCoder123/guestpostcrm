import { Mail, Pencil, Reply, SparkleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadger, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { sendEmail, viewEmailAction } from "../../store/Slices/viewEmail";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import LoadingSkeleton from "../LoadingSkeleton";
import Ip from "../Ip";
import { getAvatar } from "../../store/Slices/avatarSlice";
import TimelineEvent from "../TimelineEvent";
import MailerSummaryHeader from "../MailerSummaryHeader";
import ContactHeader from "../ContactHeader";
import ActionButton from "../ActionButton";
import { addEvent } from "../../store/Slices/eventSlice";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { NoSearchFoundPage } from "../NoSearchFoundPage";
import { SocketContext } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { PreviewTemplate } from "../PreviewTemplate";

const decodeHTMLEntities = (str = "") => {
  if (typeof str !== "string") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};
export function TimelinePage() {
  const navigateTo = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [showThread, setShowThread] = useState(false);
  const [showIP, setShowIP] = useState(false);
  const { currentIndex, setCurrentIndex, enterEmail, search } =
    useContext(PageContext);
  const { setNotificationCount } = useContext(SocketContext);
  const [showAvatar, setShowAvatar] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const {
    error: sendError,
    message,
    loading: viewEmailLoading,
    viewEmail,
    sending,
    threadId,
  } = useSelector((state) => state.viewEmail);

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
    if (message) {
      setNotificationCount((prev) => ({
        ...prev,
        refreshUnreplied: Date.now(),
      }));
      setShowPreview(false);
      dispatch(
        addEvent({
          email: email,
          thread_id: currentThreadId,
          recent_activity: message,
        }),
      );
      dispatch(viewEmailAction.clearAllMessage());
    }
  }, [dispatch, error, sendError, message]);
  useEffect(() => {
    setAiReply(mailersSummary?.ai_response);
  }, [mailersSummary]);
  const handleMoveSuccess = () => {
    dispatch(getLadger({ email }));
  };
  const handleActionBtnClick = (btnBody) => {
    if (emails.length == 0) {
      toast.info("No Unreplied Email found");
      return;
    }
    dispatch(sendEmail(btnBody, "Quick Action Button Reply Sent"));
    dispatch(
      addEvent({
        email: email,
        thread_id: emails[currentIndex]?.thread_id,
        recent_activity: "Quick Action Button Reply Sent",
      }),
    );
  };

  const handleAiAutoReply = () => {
    dispatch(sendEmail(editorContent, "Ai Reply Send Successfully"));
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
  if (showPreview) {
    return (
      <PreviewTemplate
        editorContent={editorContent}
        initialContent={aiReply}
        templateContent=""
        aiReply={aiReply}
        threadId={threadId}
        setEditorContent={setEditorContent}
        onClose={() => setShowPreview(false)}
        onSubmit={handleAiAutoReply}
        loading={sending}
      />
    );
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
              <ContactHeader
                onNext={handleNext}
                onPrev={handlePrev}
                currentIndex={currentIndex}
              />

              <MailerSummaryHeader />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI SUMMARY */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-56 overflow-y-auto">
                  <div className="flex items-center justify-start gap-2 mb-2">
                    <h3 className="text-green-700 font-semibold">
                      Quick Reply
                    </h3>
                    {/* Send AI Reply Button - Moved to top right */}

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      onClick={() => setShowPreview(true)}
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
                    {/* PROMPT */}
                    <div className="flex items-center justify-center ml-4">
                      {mailersSummary?.prompt_id &&
                        mailersSummary.prompt_id.trim() !== "" &&
                        mailersSummary.prompt_id.toLowerCase() !== "na" && (
                          <button
                            onClick={() =>
                              navigateTo("/settings/machine-learning", {
                                state: { promptId: mailersSummary.prompt_id },
                              })
                            }
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <SparkleIcon size={20} />
                          </button>
                        )}
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed">
                    {decodeHTMLEntities(
                      mailersSummary?.summary ?? "No AI summary available.",
                    )}
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

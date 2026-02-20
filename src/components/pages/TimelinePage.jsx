import {
  Mail,
  MessageSquare,
  Pencil,
  Reply,
  SparkleIcon,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
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
import PromptViewerModal from "../PromptViewerModal";
import useIdle from "../../hooks/useIdle";
import axios from "axios";

const decodeHTMLEntities = (str = "") => {
  if (typeof str !== "string") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};
export function TimelinePage() {
  const navigateTo = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [showIP, setShowIP] = useState(false);
  const { currentIndex, setCurrentIndex, enterEmail, search } =
    useContext(PageContext);
  const { setNotificationCount } = useContext(SocketContext);
  const [showAvatar, setShowAvatar] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const { crmEndpoint } = useSelector((state) => state.user);

  const [messageMeta, setMessageMeta] = useState({
    subject: "",
    from: "",
    date: "",
    fromEmail: "",
    time: "",
  });
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
  const { emails, loading: unrepliedLoading } = useSelector(
    (state) => state.unreplied,
  );
  const currentThreadId = emails?.length > 0 && emails[currentIndex]?.thread_id;

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
    if (message) {
      setShowPreview(false);
      dispatch(
        addEvent({
          email: email,
          thread_id: currentThreadId,
          recent_activity: message,
        }),
      );
    }
  }, [dispatch, error, sendError, message]);
  useEffect(() => {
    setAiReply(mailersSummary?.ai_response);
  }, [mailersSummary]);
  const handleMoveSuccess = () => {
    dispatch(getLadger({ email }));
  };
  const handleActionBtnClick = (btnBody) => {
    dispatch(
      sendEmail({
        reply: btnBody,
        message: "Quick Action Button Reply Sent",
        threadId,
      }),
    );
    dispatch(
      addEvent({
        email: email,
        thread_id: emails[currentIndex]?.thread_id,
        recent_activity: "Quick Action Button Reply Sent",
      }),
    );
  };

  const handleAiAutoReply = () => {
    dispatch(
      sendEmail({
        reply: editorContent,
        threadId,
        message: "Ai Reply Send Successfully",
      }),
    );
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
  // Function to clean HTML content
  const cleanHtmlContent = (html) => {
    // Basic HTML cleanup
    const cleaned = html
      .replace(/<style[^>]*>.*?<\/style>/gis, "") // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gis, "") // Remove script tags
      .replace(/<!--.*?-->/g, "") // Remove comments
      .trim();

    return cleaned || html;
  };
  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageContent("");
    setSelectedMessageId(null);
  };
  const handleMessageClick = async (event) => {
    if (!event.message_id) return;

    // ✅ open modal FIRST
    setShowMessageModal(true);

    // ✅ show loader INSIDE MODAL
    setIsMessageLoading(true);

    try {
      const baseUrl = crmEndpoint.split("?")[0];
      const { data } = await axios.get(
        `${baseUrl}?entryPoint=fetch_gpc&type=view_msg&message_id=${event.message_id}`,
      );

      console.log("result", data);

      const htmlBody =
        data.email?.html_body ||
        data.email?.body_html ||
        data.email?.content ||
        data.email?.html_body ||
        "";

      const subject = data.email?.subject || event.subject || "No Subject";

      const from =
        data.email?.from_name || event?.from_addr || "Unknown Sender";

      const fromEmail = data.email?.from_addr || event?.from_email || "";

      const createdDate = data.email?.date_created || "";

      let formattedDate = "";
      let formattedTime = "";

      if (createdDate) {
        const d = new Date(createdDate);
        formattedDate = d.toLocaleDateString();
        formattedTime = d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      setMessageMeta({
        subject,
        from,
        fromEmail,
        date: formattedDate,
        time: formattedTime,
      });

      setMessageContent(
        htmlBody
          ? cleanHtmlContent(htmlBody)
          : event.description || event.subject || "No content available",
      );
    } catch (err) {
      setMessageContent(
        event.description || event.subject || "No content available",
      );
    } finally {
      setIsMessageLoading(false);
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
      <style jsx>{`
        .message-content h1,
        .message-content h2,
        .message-content h3,
        .message-content h4 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
          color: #1f2937;
        }

        .message-content p {
          margin-bottom: 1em;
        }

        .message-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .message-content a:hover {
          color: #2563eb;
        }

        .message-content ul,
        .message-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }

        .message-content li {
          margin-bottom: 0.5em;
        }

        .message-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .message-content table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1em;
        }

        .message-content table th,
        .message-content table td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }

        .message-content table th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        .message-content blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding-left: 1em;
          color: #6b7280;
          font-style: italic;
        }

        .message-content code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 0.9em;
        }

        .message-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .message-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }

        .message-content .cta {
          margin: 20px 0;
        }

        .message-content .emoticon {
          display: inline-block;
          vertical-align: middle;
          width: 20px;
          height: 20px;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .message-icon-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-backdrop {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .message-modal {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .message-content-container {
          background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
        }
      `}</style>
      {open && (
        <PromptViewerModal
          promptDetails={selectedPrompt}
          onClose={() => setOpen(false)}
        />
      )}
      {showMessageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop"
          onClick={closeMessageModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="message-modal rounded-3xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✅ HEADER (FIXED) */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <MessageSquare size={24} className="text-white" />

                <div className="flex flex-col leading-tight">
                  <h2 className="text-lg font-semibold text-white">
                    {messageMeta.from}
                  </h2>

                  <span className="text-sm text-blue-100">
                    {messageMeta.fromEmail}
                  </span>

                  <span className="text-xs text-blue-200">
                    {messageMeta.date} • {messageMeta.time}
                  </span>
                </div>
              </div>

              {/* SUBJECT CENTER */}
              <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-xl">
                <h1 className="text-lg font-semibold text-white truncate">
                  {messageMeta.subject}
                </h1>
              </div>

              <button
                onClick={closeMessageModal}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90 cursor-pointer"
                title="Close"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* ✅ SCROLLABLE BODY */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex-1 overflow-y-auto">
              {isMessageLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Loading message content...
                  </p>
                </div>
              ) : messageContent ? (
                <div className="message-content-container w-full max-w-4xl mx-auto">
                  <div
                    className="message-content"
                    style={{
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      fontSize: "15px",
                      lineHeight: "1.8",
                      color: "#2d3748",
                      padding: "20px",
                    }}
                    dangerouslySetInnerHTML={{ __html: messageContent }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                    <MessageSquare size={32} className="text-gray-500" />
                  </div>

                  <p className="text-gray-500 mt-2">
                    This message doesn't contain any readable content.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(loading || unrepliedLoading) && <LoadingSkeleton />}
        {!loading && !unrepliedLoading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">
              <ContactHeader
                onNext={handleNext}
                setShowEmails={setShowEmail}
                onPrev={handlePrev}
                currentIndex={currentIndex}
              />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI SUMMARY */}

                <div>
                  <MailerSummaryHeader />

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 overflow-y-auto flex mt-4 ">
                    <div className="flex flex-col items-center justify-start gap-2 mb-2">
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
                      <div className="flex flex-col items-center justify-center ml-4 ">
                        {mailersSummary?.prompt_details && (
                          <button
                            onClick={() => {
                              setSelectedPrompt(mailersSummary?.prompt_details);
                              setOpen(true);
                            }}
                            className="text-green-600 hover:text-green-700 cursor-pointer mr-4"
                          >
                            <SparkleIcon size={20} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* {!sending && (
                    <div className="mb-3">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {aiReply}
                      </p>
                    </div>
                  )} */}

                    <div className="flex flex-col items-center mb-2 ml-3">
                      {/* <h3 className="text-blue-700 font-semibold">AI Summary</h3> */}

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
                        {mailersSummary?.prompt_details && (
                          <button
                            onClick={() => {
                              setSelectedPrompt(mailersSummary?.prompt_details);
                              setOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 cursor-pointer mr-4 mt-2"
                          >
                            <SparkleIcon size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latest Message */}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 h-115 overflow-y-auto custom-scrollbar shadow-sm">
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
                            setShowEmail(true);
                          }}
                        >
                          <Reply className="w-6 h-6 text-yellow-700" />
                        </motion.button>
                      </div>

                      {viewEmail?.length > 0 && (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      ${
        viewEmail[viewEmail.length - 1].from_email === email
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
                      className={`text-gray-700 text-sm leading-relaxed whitespace-pre-line transition-all duration-300 ${
                        showMore ? "max-h-full" : "max-h-24 overflow-hidden"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html:
                          viewEmail?.length > 0
                            ? viewEmail[viewEmail.length - 1]?.body_html
                              ? viewEmail[viewEmail.length - 1]?.body_html
                              : viewEmail[viewEmail.length - 1]?.body
                            : "No Message Found!",
                      }}
                    />
                  )}
                  {/* Show More (collapsed state) */}
                  {viewEmail?.length > 0 &&
                    viewEmail[viewEmail.length - 1].message_id && (
                      <button
                        onClick={() =>
                          handleMessageClick(viewEmail[viewEmail.length - 1])
                        }
                        className="text-blue-600 hover:text-blue-700 hover:cursor-pointer hover:opacity-90 transition-all duration-300
 relative group message-icon-pulse"
                        title="View Message"
                      >
                        {isMessageLoading ===
                        viewEmail[viewEmail.length - 1].message_id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <MessageSquare />
                        )}
                      </button>
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

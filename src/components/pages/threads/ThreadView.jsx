import { User, Globe, Send, X, ChevronLeft, Move, CornerUpRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getDomain } from "../../../assets/assets.js";
import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import useIdle from "../../../hooks/useIdle";
import { ThreadSkeleton } from "./ThreadSkeleton.jsx";
import { useThreadContext } from "../../../hooks/useThreadContext.js";
import { PageContext } from "../../../context/pageContext.jsx";
import TinyEditor, { SmallTinyEditor } from "../../TinyEditor.jsx";
import { getAiReply } from "../../../store/Slices/aiReply.js";
import MessageOverlay from "./MessageOverlay.jsx";
import { sendEmail } from "../../../store/Slices/viewEmail.js";
import axios from "axios";
import NextPrev from "../../NextPrev.jsx";
import EmojiInput from "../../EmojiPicker.jsx";
export default function ThreadView() {
  const scrollRef = useRef();
  const { emails, loadAiReply = true, superfastReply } = useOutletContext() || [];
  const firstMessageRef = useRef(null);
  const { context: { currentThread: threadId, currentEmail } } = useThreadContext();
  const lastMessageRef = useRef(null);
  useIdle({ idle: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { businessEmail, crmEndpoint, user } = useSelector((s) => s.user);
  const { loading } = useSelector((s) => s.threadEmail);
  const { message: sendMessage, sending } = useSelector((s) => s.viewEmail);
  const [messageLimit, setMessageLimit] = useState(3);
  const [openMessageId, setOpenMessageId] = useState(null);
  const [fullMessage, setFullMessage] = useState(null);
  const [openAttachmentsFor, setOpenAttachmentsFor] = useState(null);
  const attachmentBoxRef = useRef(null);
  const visibleMessages = emails?.slice(-messageLimit);
  const [editorContent, setEditorContent] = useState("");
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef(null);
  const [checkingThreadId, setCheckingTheadId] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState(visibleMessages?.length - 1);
  const downloadAttachment = (att) => {
    const link = document.createElement("a");
    link.href = att.description; // file URL
    link.download = att.filename || "attachment";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const {
    loading: aiLoading,
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((state) => state.aiReply);
  useEffect(() => {
    if (!loading && (loadAiReply || superfastReply)) {
      dispatch(getAiReply(threadId));
    }
  }, [loading, loadAiReply, superfastReply]);
  useEffect(() => {
    if (sendMessage) {
      setEditorContent("");
    }
  }, [sendMessage]);
  useEffect(() => {
    if (message && aiResponse) {
      setEditorContent(aiResponse)
    }
  }, [aiResponse, aiError, message]);
  const fetchFullMessage = async (messageId) => {
    try {
      setFullMessage(null);

      const res = await fetch(
        `${getDomain(crmEndpoint)}/index.php?entryPoint=fetch_gpc&type=view_msg&message_id=${messageId}&full=1`,
      );

      const data = await res.json();

      if (data?.success) {
        setFullMessage(data.email);
      } else {
        toast.error("Failed to load full message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!visibleMessages || visibleMessages?.length === 0) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          scrollRef.current?.children[newIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          return newIndex;
        });
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = Math.min(prev + 1, visibleMessages?.length - 1);
          scrollRef.current?.children[newIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          return newIndex;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleMessages]);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [emails?.length]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        attachmentBoxRef.current &&
        !attachmentBoxRef.current.contains(e.target)
      ) {
        setOpenAttachmentsFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSendClick = async () => {
    try {
      setCheckingTheadId(true);
      const { data } = await axios.get(
        `${crmEndpoint}&type=re_check_thread&email=${currentEmail}`,
      );
      console.log("MATHED THREAD ID", data);

      if (!data?.success) {
        toast.error("Failed to verify thread!");
        return;
      }
      console.log("THREAD", threadId);
      // 🔹 Check thread match
      if (data.thread_id !== threadId) {
        toast.error("Thread mismatch! Cannot send email ");
        return;
      }
      const contentToSend = editorContent;
      const formData = new FormData();
      formData.append("threadId", data.thread_id);
      formData.append("replyBody", contentToSend);
      formData.append("email", currentEmail);
      formData.append("current_email", user.email);
      formData.append("force_send", 1);
      formData.append("cc", "");
      formData.append("to", "");
      [].forEach((file) => {
        formData.append("attachments[]", file.file);
      });

      dispatch(sendEmail(formData));
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while checking thread!");
    } finally {
      setCheckingTheadId(false);
    }
  };
  return (
    <>
      <SendingOverlay sending={sending || checkingThreadId} email={currentEmail} />

      <motion.div
        className="
                fixed inset-0 z-[999]
                bg-white
                w-screen h-screen
                flex flex-col
                overflow-hidden
  "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">

          {/* 🔹 LEFT SIDE */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-3">
              {/* OPEN GMAIL */}
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
                    "_blank"
                  )
                }
              >
                <Send className="w-5 h-5" />
                <h2 className="text-xl font-bold tracking-tight">
                  Email Thread
                </h2>
              </div>

              {/* COPY LINK */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const link = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Email thread link copied!");
                }}
                title="Copy Gmail link"
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition shadow-sm"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 🔥 RIGHT SIDE (CLIENT EMAIL) */}
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm">

            <Mail className="w-4 h-4 opacity-80" />

            <span className="text-sm font-medium truncate max-w-[250px]">
              {currentEmail}
            </span>

          </div>
          <NextPrev />
        </div>
        {loading ? (
          <ThreadSkeleton />
        ) : (
          <>
            <div className="px-6 pt-4 pb-3 bg-gradient-to-b from-gray-50 to-gray-100 flex gap-3 border-b border-gray-200">
              {/* LOAD MORE / SHOW ALL (conditional) */}
              {messageLimit < emails?.length && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setMessageLimit((p) => p + 3)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Load More
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setMessageLimit(emails.length)}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Show All
                  </motion.button>
                </>
              )}

              {/* FIRST / LAST (ALWAYS AVAILABLE) */}
              {emails?.length > 0 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      // Step 1: show all messages if not already
                      if (messageLimit < emails.length) {
                        setMessageLimit(emails.length);
                      }

                      // Step 2: wait for DOM update, then scroll
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }, 50);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    First Message
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    Last Message
                  </motion.button>
                </>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 space-y-5"
            >
              {visibleMessages?.map((mail, idx) => {
                const isUser = mail.from_email.includes(businessEmail);
                const isFirst = idx === 0;
                const isLast = idx === visibleMessages?.length - 1;

                // ✅ REAL index calculation
                const baseIndex = emails?.length - visibleMessages?.length;
                const realIndex = baseIndex + idx + 1;
                const formatMessage = (html) => {
                  if (!html) return "";

                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, "text/html");

                  // ✅ 1. Fix already existing <a> tags
                  doc.querySelectorAll("a").forEach((a) => {
                    const href = a.getAttribute("href");
                    if (!href) return;

                    // keep original text IF it's meaningful
                    const text = a.textContent.trim();

                    if (!text || text === href) {
                      // if ugly or same as URL → shorten it
                      let short = href.replace(/^https?:\/\//, "");
                      if (short.length > 50) short = short.slice(0, 50) + "...";
                      a.textContent = short;
                    }

                    a.setAttribute("target", "_blank");
                    a.setAttribute("rel", "noopener noreferrer");
                  });

                  // ✅ 2. Convert ONLY plain text URLs (not inside <a>)
                  const walk = (node) => {
                    if (node.nodeType === 3) {
                      const urlRegex = /(https?:\/\/[^\s]+)/g;

                      if (urlRegex.test(node.nodeValue)) {
                        const span = document.createElement("span");

                        span.innerHTML = node.nodeValue.replace(
                          urlRegex,
                          (url) => {
                            let short = url.replace(/^https?:\/\//, "");
                            if (short.length > 50)
                              short = short.slice(0, 50) + "...";

                            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${short}</a>`;
                          },
                        );

                        node.replaceWith(...span.childNodes);
                      }
                    } else if (node.nodeType === 1 && node.tagName !== "A") {
                      node.childNodes.forEach(walk);
                    }
                  };

                  walk(doc.body);

                  return doc.body.innerHTML;
                };
                return (
                  <motion.div
                    key={mail.message_id || idx}
                    ref={
                      isFirst ? firstMessageRef : isLast ? lastMessageRef : null
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[70%] p-5 rounded-2xl transition-all duration-300
  ${isUser
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                        }
  ${isLast ? "shadow-2xl scale-[1]" : "shadow-lg"}
`}
                    >
                      <div className="absolute -top-4 left-4 px-2 py-1 mt-5 ml-0 text-xs font-semibold text-white bg-blue-500 rounded-full shadow-sm">
                        {realIndex}
                      </div>
                      {isLast && (
                        <div
                          className={`absolute -inset-1 rounded-3xl blur-2xl opacity-50 -z-10
        ${isUser ? "bg-indigo-500" : "bg-blue-400"}
      `}
                        />
                      )}
                      <div
                        className={`mb-4 px-4 py-2 rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm ${isUser
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                      >
                        {/* NAME */}
                        <div className="flex items-center gap-2 font-semibold">
                          <User className="w-3.5 h-3.5 opacity-70" />
                          <span>
                            {isUser ? "You" : mail.from_name || "Sender"}
                          </span>
                        </div>

                        {/* DATE & TIME */}
                        <div className="flex flex-col text-right leading-tight">
                          <span
                            className={`${isUser ? "opacity-90" : "text-gray-500"}`}
                          >
                            {mail.date_created}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {mail.date_created_ago}
                          </span>
                        </div>
                      </div>

                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(
                            mail.body_html ? mail.body_html : mail.body,
                          ),
                        }}
                        className="mail-content text-sm leading-relaxed max-w-full
    overflow-x-auto break-words [&_*]:max-w-full"
                      />
                      {/* ATTACHMENTS BUTTON */}
                      {mail?.attachment?.length > 0 && (
                        <button
                          onClick={() =>
                            setOpenAttachmentsFor(
                              openAttachmentsFor === mail.message_id
                                ? null
                                : mail.message_id,
                            )
                          }
                          className="mt-3 flex items-center gap-2 text-xs font-medium
      bg-gray-100 hover:bg-gray-200
      px-3 py-1.5 rounded-lg
      text-gray-700 border border-gray-300"
                        >
                          📎 Attachments ({mail.attachment.length})
                        </button>
                      )}

                      {/* ATTACHMENT BOX */}
                      {openAttachmentsFor === mail.message_id && (
                        <div
                          ref={attachmentBoxRef}
                          className="
      absolute z-30 bottom-14 left-0
      w-72 max-h-64
      bg-white border border-gray-200
      rounded-xl shadow-xl
      p-2
      overflow-y-auto
    "
                        >
                          {mail.attachment?.map((att) => (
                            <button
                              key={att.id}
                              onClick={() => downloadAttachment(att)}
                              className="
          w-full flex items-center gap-3
          px-3 py-2
          rounded-lg
          hover:bg-gray-100
          text-left
          transition
          overflow-hidden
        "
                            >
                              <div className="text-xl shrink-0">📄</div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {att.filename}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {att.file_mime_type}
                                </p>
                              </div>

                              <span className="text-xs text-blue-600 font-semibold shrink-0">
                                Download
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* THREE DOT MENU */}
                      <button
                        onClick={() => {
                          setOpenMessageId(mail.message_id);
                          fetchFullMessage(mail.message_id);
                        }}
                        className="
    absolute bottom-2 left-2
    z-20
    bg-white
    text-black
    p-1.5
    rounded-full
    shadow-md
    hover:bg-gray-100
  "
                        title="View full message"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-2 border-t bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl relative rounded-t-lg">
              {loadAiReply || superfastReply ? (
                <>
                  <div className="relative  rounded-2xl overflow-hidden h-[250px]  flex justify-end gap-4 shadow-lg">

                    {/* 🔥 LEFT PANEL */}
                    <div className="w-[35%] bg-white/20 backdrop-blur-md text-white p-5 flex flex-col justify-between rounded-lg">

                      {/* ✨ Title Section */}
                      <div className="flex justify-between">
                        <div> <h2 className="text-lg font-bold flex items-center gap-2">
                          ⚡ Super Fast Reply
                        </h2>
                          <p className="text-xs opacity-90 mt-1">
                            Send quick AI-powered responses instantly
                          </p></div>

                      </div>

                      {/* 🚀 Buttons Section */}
                      <div className="flex flex-col gap-3 mt-4">

                        {/* Direction Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/thread/reply`)}
                          className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/30 transition"
                        >
                          <CornerUpRight className="w-4 h-4" />
                          Compose
                        </motion.button>

                        {/* Send Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendClick}
                          disabled={checkingThreadId || sending}
                          className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </motion.button>

                      </div>
                    </div>

                    {/* ✨ RIGHT PANEL (EDITOR ONLY) */}
                    <div className="w-[50%] bg-white p-2 rounded-lg">

                      <SmallTinyEditor
                        setEditorContent={setEditorContent}
                        editorContent={editorContent}
                        setEditorReady={setEditorReady}
                        editorRef={editorRef}
                      />

                    </div>
                  </div>

                </>

              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/thread/reply`)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Reply</span>
                </motion.button>
              )}
            </div>
          </>
        )}

        <AnimatePresence>
          {openMessageId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {fullMessage?.subject || "Email"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {fullMessage?.from_name} &lt;{fullMessage?.from_email}&gt;
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOpenMessageId(null);
                      setFullMessage(null);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* BODY */}
                <iframe
                  title="Email Preview"
                  className="w-[700px] h-[700px] border-0"
                  sandbox=""
                  srcDoc={`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
            padding: 16px;
            background: #ffffff;
          }
        </style>
      </head>
      <body>
        ${fullMessage?.body_html || fullMessage?.body || ""}
      </body>
    </html>
  `}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}


export const SendingOverlay = ({ sending, email }) => {
  return (
    <AnimatePresence>
      {sending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md"
        >
          {/* 📤 Icon animation */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-5xl mb-4"
          >
            📤
          </motion.div>

          {/* Heading */}
          <h2 className="text-xl font-semibold text-gray-800">
            Sending Email
          </h2>

          {/* Email */}
          <p className="text-sm text-gray-600 mt-1">
            To: <span className="font-medium">{email}</span>
          </p>

          {/* Moving text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 mt-2"
          >
            Moving forward to next email...
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "50%" }}
            transition={{ duration: 1 }}
            className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mt-4 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
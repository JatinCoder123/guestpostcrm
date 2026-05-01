import { User, Globe, Send, X, ChevronLeft, Move, CornerUpRight, Mail, Edit, DollarSign, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { motion, AnimatePresence, useMotionTemplate } from "framer-motion";
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
import { SmallTinyEditor } from "../../TinyEditor.jsx";
import { aiReplyAction, getAiReply } from "../../../store/Slices/aiReply.js";
import NextPrev from "../../NextPrev.jsx";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { SendingOverlay } from "./SendingOverlay.jsx";
import MailHeaderLeft from "./MailHeaderLeft.jsx";
import ReplyButtons from "./ReplyButtons.jsx";
import Inbox from "./Inbox.jsx";
import { fetchGpc } from "../../../services/api.js";

export default function ThreadView() {
  const scrollRef = useRef();
  const { emails, loadAiReply = true, superfastReply, editorContent, setEditorContent, handleSendClick, checkingThreadId, contentLoading } = useOutletContext() || [];
  const firstMessageRef = useRef(null);
  const { context: { currentThread: threadId, currentEmail } } = useThreadContext();
  const lastMessageRef = useRef(null);
  useIdle({ idle: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { crmEndpoint } = useSelector((s) => s.user);
  const { loading } = useSelector((s) => s.threadEmail);
  const { message: sendMessage, sending } = useSelector((s) => s.viewEmail);
  const [messageLimit, setMessageLimit] = useState(3);
  const [openMessageId, setOpenMessageId] = useState(null);
  const [fullMessage, setFullMessage] = useState(null);
  const visibleMessages = emails?.slice(-messageLimit);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(visibleMessages?.length - 1);

  const {
    loading: aiLoading,
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((state) => state.aiReply);
  useEffect(() => {
    dispatch(getAiReply(threadId));
    setEditorContent("")
  }, [threadId]);
  useEffect(() => {
    if (sendMessage) {
      setEditorContent("");
    }
  }, [sendMessage]);
  useEffect(() => {
    if (message && aiResponse) {
      setEditorContent(aiResponse)
      dispatch(aiReplyAction.clearMessge())
    }
  }, [aiResponse, aiError, message]);
  const fetchFullMessage = async (messageId) => {
    try {
      setFullMessage(null);
      const data = await fetchGpc({ params: { type: 'view_msg', message_id: messageId, full: 1 } });
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
        <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">

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
          {superfastReply && <MailHeaderLeft />}
          {superfastReply && <NextPrev />}

        </div>
        {loading ? (
          <ThreadSkeleton />
        ) : (
          <>
            <NavigationBar messageLimit={messageLimit} setMessageLimit={setMessageLimit} emails={emails} scrollRef={scrollRef} />
            <PanelGroup direction="vertical" className="h-full">
              <Panel defaultSize={45} minSize={20}>
                <Inbox scrollRef={scrollRef} visibleMessages={visibleMessages} emails={emails} firstMessageRef={firstMessageRef} lastMessageRef={lastMessageRef} setOpenMessageId={setOpenMessageId} fetchFullMessage={fetchFullMessage} />
              </Panel>
              <PanelResizeHandle className="cursor-row-resize" disabled={!superfastReply} />
              <Panel defaultSize={!superfastReply ? 1 : 55} minSize={10}>
                <div className="h-full p-2 border-t bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl relative rounded-t-3xl">
                  {loadAiReply || superfastReply ? (
                    <div className="relative  rounded-2xl overflow-hidden h-full  flex justify-end gap-4 shadow-lg">

                      {/* 🔥 LEFT PANEL */}
                      <div className="w-[40%] bg-white/20 backdrop-blur-md text-white p-5 flex flex-col justify-between gap-4 rounded-lg">

                        {/* ✨ Title Section */}
                        <div className="flex justify-between">
                          <h2 className="text-lg font-bold flex items-center gap-2">
                            ⚡ Super Fast Reply
                          </h2>
                          <div className="flex gap-3"> <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendClick}
                            disabled={checkingThreadId || sending}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold flex w-fit ml-auto items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                          >
                            <Send className="w-4 h-4" />
                            Send
                          </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Compose"

                              onClick={() => navigate(`/thread/reply`)}
                              className="bg-white/20 backdrop-blur-md cursor-pointer px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/30 transition"
                            >
                              <CornerUpRight className="w-4 h-4" />
                            </motion.button></div>



                        </div>
                        <ReplyButtons editorReady={editorReady} editorRef={editorRef} />
                        {/* Send Button */}

                      </div>

                      {/* ✨ RIGHT PANEL (EDITOR ONLY) */}
                      <div className="w-[60%] bg-white p-2 rounded-lg h-full relative">

                        {/* 🔥 LOADING OVERLAY */}
                        {contentLoading && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-lg">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-sm text-gray-600 font-medium">Loading content...</p>
                            </div>
                          </div>
                        )}

                        {/* ✨ EDITOR */}
                        <SmallTinyEditor
                          setEditorContent={setEditorContent}
                          editorContent={editorContent}
                          setEditorReady={setEditorReady}
                          editorRef={editorRef}
                        />

                      </div>
                    </div>

                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/thread/reply`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Reply</span>
                    </motion.button>
                  )}
                </div></Panel>
            </PanelGroup >


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




function NavigationBar({ messageLimit, setMessageLimit, emails, scrollRef }) {
  return (
    <div className="p-3 flex gap-3 border-b  backdrop-blur-xl ">
      {messageLimit < emails?.length && (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMessageLimit((p) => p + 3)}
            className="px-5 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            Load More
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setMessageLimit(emails.length)}
            className="px-5 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
            className="p-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <ArrowBigUp />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
            }}
            className="p-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <ArrowBigDown />
          </motion.button>
        </>
      )}
    </div>
  )
}
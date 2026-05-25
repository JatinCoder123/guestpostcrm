import {
  User,
  Globe,
  Send,
  X,
  ChevronLeft,
  Move,
  CornerUpRight,
  Mail,
  Edit,
  DollarSign,
  ArrowBigUp,
  ArrowBigDown,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from "react-router-dom";

import useIdle from "../../../hooks/useIdle";
import { ThreadSkeleton } from "./ThreadSkeleton.jsx";
import { useThreadContext } from "../../../hooks/useThreadContext.js";
import { SmallTinyEditor } from "../../TinyEditor.jsx";
import { aiReplyAction, getAiReply } from "../../../store/Slices/aiReply.js";

import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";

import { SendingOverlay } from "./SendingOverlay.jsx";
import ReplyButtons from "./ReplyButtons.jsx";
import Inbox from "./Inbox.jsx";
import { fetchGpc } from "../../../services/api.js";
import RightThreadHeader from "./RightThreadHeader.jsx";
import NavigationBar from "./NavigationBar.jsx";

export default function ThreadView() {
  const scrollRef = useRef();

  const {
    emails,
    loadAiReply = true,
    superfastReply,
    editorContent,
    setEditorContent,
    handleSendClick,
    checkingThreadId,
    contentLoading,
  } = useOutletContext() || [];

  const firstMessageRef = useRef(null);
  const { mailersSummary, loading: summaryLoading } = useSelector(state => state.mailersSummary)

  const {
    context: { currentThread: threadId, currentEmail },
  } = useThreadContext();

  const lastMessageRef = useRef(null);

  useIdle({ idle: false });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((s) => s.threadEmail);

  const { sending } = useSelector((s) => s.viewEmail);

  const [messageLimit, setMessageLimit] = useState(3);
  const [openMessageId, setOpenMessageId] = useState(null);
  const [fullMessage, setFullMessage] = useState(null);

  const visibleMessages = emails?.slice(-messageLimit);

  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef(null);

  const bottomPanelRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(
    visibleMessages?.length - 1
  );

  const {
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((state) => state.aiReply);

  useEffect(() => {
    dispatch(getAiReply(threadId));
    setEditorContent("");
  }, [threadId]);

  useEffect(() => {
    if (message && aiResponse) {
      setEditorContent(aiResponse);
      dispatch(aiReplyAction.clearMessge());
    }
  }, [aiResponse, aiError, message]);

  const fetchFullMessage = async (messageId) => {
    try {
      setFullMessage(null);

      const data = await fetchGpc({
        params: {
          type: "view_msg",
          message_id: messageId,
          full: 1,
        },
      });

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
          const newIndex = Math.min(
            prev + 1,
            visibleMessages?.length - 1
          );

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

    scrollRef.current.scrollTop =
      scrollRef.current.scrollHeight;
  }, [emails?.length]);

  return (
    <>
      <SendingOverlay
        sending={sending || checkingThreadId}
        email={currentEmail}
      />

      <motion.div
        className="
          fixed inset-0 z-[999]
          bg-white
          w-full h-screen
          flex flex-col
          overflow-hidden
        "
      >
        {/* HEADER */}
        <div className="flex justify-between flex-wrap items-center px-6 py-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-3 group">
              <div
                className="flex items-center gap-3 cursor-pointer transition"
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
                    "_blank"
                  )
                }
              >
                <h2
                  className="
                    text-md font-semibold tracking-tight
                    truncate max-w-[400px]
                    transition-all duration-300
                    hover:text-blue-200 hover:underline
                  "
                >
                  {emails?.[emails?.length - 1]?.subject}
                </h2>
              </div>
            </div>
          </div>

          <RightThreadHeader />
        </div>

        {loading ? (
          <ThreadSkeleton />
        ) : (
          <>
            <NavigationBar
              messageLimit={messageLimit}
              setMessageLimit={setMessageLimit}
              emails={emails}
              scrollRef={scrollRef}
            />

            <PanelGroup
              direction="vertical"
              className="h-full"
            >
              {/* TOP PANEL */}
              <Panel defaultSize={45} minSize={0}>
                <Inbox
                  scrollRef={scrollRef}
                  visibleMessages={visibleMessages}
                  emails={emails}
                  firstMessageRef={firstMessageRef}
                  lastMessageRef={lastMessageRef}
                  setOpenMessageId={setOpenMessageId}
                  fetchFullMessage={fetchFullMessage}
                />
              </Panel>

              {/* RESIZE HANDLE */}
              <PanelResizeHandle
                className="h-1  transition-colors cursor-row-resize"
              />

              {/* BOTTOM PANEL */}
              <Panel
                ref={bottomPanelRef}
                defaultSize={!superfastReply ? 1 : 55}
                minSize={10}
                maxSize={100}
              >
                <div className="h-full p-2 border-t bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl relative rounded-t-3xl">
                  {/* PANEL CONTROLS */}
                  {superfastReply && (
                    <div className="absolute -top-2 left-[40%] -translate-x-1/2 z-50 flex gap-3">
                      {/* UP */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (bottomPanelRef.current) {
                            const current =
                              bottomPanelRef.current.getSize?.() ||
                              55;

                            bottomPanelRef.current.resize(
                              Math.min(current + 50, 100)
                            );
                          }
                        }}
                        className="bg-white text-indigo-600 p-2 rounded-full shadow-xl hover:bg-gray-100 transition"
                      >
                        <ArrowBigUp className="w-5 h-5" />
                      </motion.button>

                      {/* DOWN */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (bottomPanelRef.current) {
                            const current =
                              bottomPanelRef.current.getSize?.() ||
                              55;

                            bottomPanelRef.current.resize(
                              Math.max(current - 50, 10)
                            );
                          }
                        }}
                        className="bg-white text-indigo-600 p-2 rounded-full shadow-xl hover:bg-gray-100 transition"
                      >
                        <ArrowBigDown className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}

                  {loadAiReply || superfastReply ? (
                    <div className="relative rounded-2xl overflow-hidden h-full flex justify-end gap-4 shadow-lg">
                      {/* LEFT PANEL */}
                      <div className="w-[40%] bg-white/20 backdrop-blur-md text-white p-5 flex flex-col justify-between gap-4 rounded-lg">
                        <div className="flex justify-between">
                          <h2 className="text-lg font-bold flex items-center gap-2">
                            ⚡   AI Summary
                          </h2>

                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSendClick}
                              disabled={
                                checkingThreadId || sending
                              }
                              className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                            >
                              <Send className="w-4 h-4" />
                              Send
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Compose"
                              onClick={() =>
                                navigate(`/thread/reply`)
                              }
                              className="bg-white/20 backdrop-blur-md cursor-pointer px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/30 transition"
                            >
                              <CornerUpRight className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* SUMMARY */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 h-[260px] overflow-hidden flex flex-col">



                          {/* CONTENT */}
                          <div className="flex-1 overflow-hidden">
                            {summaryLoading ? (
                              <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-white/20 rounded w-full"></div>
                                <div className="h-4 bg-white/20 rounded w-[90%]"></div>
                                <div className="h-4 bg-white/20 rounded w-[80%]"></div>
                                <div className="h-4 bg-white/20 rounded w-[70%]"></div>
                                <div className="h-4 bg-white/20 rounded w-[60%]"></div>
                                <div className="h-4 bg-white/20 rounded w-[85%]"></div>
                              </div>
                            ) : (
                              <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-sm text-white/90 leading-7 whitespace-pre-wrap break-words">
                                  {mailersSummary?.summary || (
                                    <span className="text-white/50">
                                      No summary available
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <ReplyButtons
                          editorReady={editorReady}
                          editorRef={editorRef}
                        />
                      </div>

                      {/* RIGHT PANEL */}
                      <div className="w-[60%] bg-white p-2 rounded-lg h-full relative">
                        {/* LOADING */}
                        {contentLoading && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-lg">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                              <p className="text-sm text-gray-600 font-medium">
                                Loading content...
                              </p>
                            </div>
                          </div>
                        )}

                        {/* EDITOR */}
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
                      onClick={() =>
                        navigate(`/thread/reply`)
                      }
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Reply</span>
                    </motion.button>
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </>
        )}

        {/* FULL MESSAGE MODAL */}
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
                      {fullMessage?.from_name} &lt;
                      {fullMessage?.from_email}&gt;
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
                        <meta
                          name="viewport"
                          content="width=device-width, initial-scale=1"
                        />
                        <style>
                          body {
                            margin: 0;
                            padding: 16px;
                            background: #ffffff;
                          }
                        </style>
                      </head>
                      <body>
                        ${fullMessage?.body_html ||
                    fullMessage?.body ||
                    ""
                    }
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
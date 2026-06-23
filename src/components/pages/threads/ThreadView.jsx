import {
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from "react-router-dom";

import useIdle from "../../../hooks/useIdle";
import { ThreadSkeleton } from "./ThreadSkeleton.jsx";
import { SmallTinyEditor } from "../../TinyEditor.jsx";

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
import {
  useMailerSummary,
  useRegenMailerSummary,
} from "../../../queries/mailerSummary.queries.js";
import { useThread } from "../../../queries/threads.queries.js";

export default function ThreadView() {
  const scrollRef = useRef();

  const {
    loadAiReply = true,
    superfastReply,
    editorContent,
    setEditorContent,
    checkingThreadId,
    email,
    threadId,
  } = useOutletContext() || [];

  const { data: emailsData, isPending: loading } = useThread(email, threadId);
  const emails = emailsData?.emails;
  const leftPanelRef = useRef(null);

  const [showReplyPanel, setShowReplyPanel] = useState(
    loadAiReply || superfastReply
  );

  const firstMessageRef = useRef(null);
  const lastMessageRef = useRef(null);

  const { data, isPending: summaryLoading } = useMailerSummary(email);
  const regenSummary = useRegenMailerSummary();
  const mailersSummary = data?.mailers_summary;

  const hasMutatedRef = useRef({});
  const lastLoadedRef = useRef({ email: "", aiResponse: "" });

  useIdle({ idle: false });

  const navigate = useNavigate();

  const { sending } = useSelector((s) => s.viewEmail);

  const [messageLimit, setMessageLimit] = useState(3);
  const [openMessageId, setOpenMessageId] = useState(null);
  const [fullMessage, setFullMessage] = useState(null);

  const visibleMessages = emails?.slice(-messageLimit);

  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(
    visibleMessages?.length ? visibleMessages.length - 1 : 0
  );



  // Clear editor content when email changes to prevent showing old thread's content
  useEffect(() => {
    if (email) {
      setEditorContent("");
    }
  }, [email, setEditorContent]);

  useEffect(() => {
    if (!email) return;

    if (summaryLoading || regenSummary.isPending) return;

    const aiResponse = mailersSummary?.ai_response;

    if (!aiResponse) {
      if (!hasMutatedRef.current[email]) {
        hasMutatedRef.current[email] = true;
        regenSummary.mutate(email);
      }
      return;
    }

    if (
      lastLoadedRef.current.email !== email ||
      lastLoadedRef.current.aiResponse !== aiResponse
    ) {
      setEditorContent(aiResponse);
      lastLoadedRef.current = { email, aiResponse };
    }
  }, [
    email,
    mailersSummary,
    summaryLoading,
    regenSummary.isPending,
    setEditorContent,
  ]);

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
      toast.error("Failed To Fetch Full Message!");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!visibleMessages || visibleMessages.length === 0) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setFocusedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);

          scrollRef.current?.children?.[newIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          return newIndex;
        });
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();

        setFocusedIndex((prev) => {
          const newIndex = Math.min(prev + 1, visibleMessages.length - 1);

          scrollRef.current?.children?.[newIndex]?.scrollIntoView({
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
      <SendingOverlay sending={sending || checkingThreadId} email={email} />

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
        <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-1 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="cursor-pointer rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <div className="group flex items-center gap-3">
              <div
                className="flex cursor-pointer items-center gap-3 transition"
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
                    "_blank"
                  )
                }
              >
                <h2
                  className="
                    max-w-[400px] truncate text-md font-semibold tracking-tight
                    transition-all duration-300 hover:text-blue-200 hover:underline
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
          <PanelGroup direction="horizontal" className="flex-1">
            {/* LEFT PANEL */}
            {showReplyPanel && (
              <>
                <Panel
                  ref={leftPanelRef}
                  minSize={10}
                  maxSize={90}
                  className="flex h-full flex-col overflow-hidden border-r border-gray-200 bg-slate-50"
                >
                  {/* AI Summary */}
                  <div className="flex-shrink-0 border-b border-gray-200 bg-white p-3">
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-2 rounded-lg bg-slate-100 px-4 py-3">
                        <h2 className="text-sm font-medium tracking-wide text-purple-600">
                          ✦ AI Summary
                        </h2>

                        <div className="max-h-[180px] overflow-y-auto">
                          {summaryLoading || regenSummary.isPending ? (
                            <div className="space-y-3 animate-pulse">
                              <div className="h-3 w-full rounded bg-slate-200" />
                              <div className="h-3 w-[92%] rounded bg-slate-200" />
                              <div className="h-3 w-[80%] rounded bg-slate-200" />
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {mailersSummary?.summary || "No summary available"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="relative min-h-0 flex-1 bg-white">
                    {(summaryLoading || regenSummary.isPending) && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent"></div>
                          <p className="text-xs font-medium text-gray-600">
                            Loading content...
                          </p>
                        </div>
                      </div>
                    )}

                    <SmallTinyEditor
                      setEditorContent={setEditorContent}
                      editorContent={editorContent}
                      setEditorReady={setEditorReady}
                      editorRef={editorRef}
                    />
                  </div>

                  {/* Reply Buttons */}
                  <div className="flex-shrink-0 border-t border-gray-200 bg-slate-50 p-3">
                    <ReplyButtons editorReady={editorReady} editorRef={editorRef} />
                  </div>
                </Panel>

                {/* divider wrapper */}
                <div className="relative flex w-4 shrink-0 items-stretch justify-center">
                  {/* actual draggable resize handle */}
                  <PanelResizeHandle className="absolute inset-0 z-10 cursor-col-resize">
                    <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gray-200 transition-colors hover:bg-indigo-500" />
                  </PanelResizeHandle>

                  {/* clickable buttons layer */}
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="pointer-events-auto flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (leftPanelRef.current) {
                            const current =
                              leftPanelRef.current.getSize?.() ||
                              40;

                            leftPanelRef.current.resize(
                              Math.min(current + 25, 100)
                            );
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
                        title="Shrink left panel"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (leftPanelRef.current) {
                            const current =
                              leftPanelRef.current.getSize?.() ||
                              40;

                            leftPanelRef.current.resize(
                              Math.max(current - 25, 10)
                            );
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
                        title="Expand left panel"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* RIGHT PANEL */}
            <Panel className="flex h-full flex-col overflow-hidden bg-white">
              <Inbox
                scrollRef={scrollRef}
                visibleMessages={visibleMessages}
                emails={emails}
                firstMessageRef={firstMessageRef}
                lastMessageRef={lastMessageRef}
                setOpenMessageId={setOpenMessageId}
                fetchFullMessage={fetchFullMessage}
                messageLimit={messageLimit}
                setMessageLimit={setMessageLimit}
                showReplyPanel={showReplyPanel}
                setShowReplyPanel={setShowReplyPanel}
              />

              {!(loadAiReply || superfastReply) && (
                <div className="flex flex-shrink-0 justify-center border-t border-gray-100 bg-white p-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/thread/reply`)}
                    className="flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
                  >
                    <Send className="h-5 w-5" />
                    <span>Reply</span>
                  </motion.button>
                </div>
              )}
            </Panel>
          </PanelGroup>
        )}

        {/* FULL MESSAGE MODAL */}
        <AnimatePresence>
          {openMessageId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {fullMessage?.subject || "Email"}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {fullMessage?.from_name} &lt;{fullMessage?.from_email}
                      &gt;
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setOpenMessageId(null);
                      setFullMessage(null);
                    }}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* BODY */}
                <iframe
                  title="Email Preview"
                  className="h-[700px] w-[700px] border-0"
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
import {
  Mail,
  User,
  Globe,
  Handshake,
  Send,
  Brain,
  X,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail } from "../store/Slices/viewEmail";
import { getThreadEmail, sendEmailToThread, threadEmailAction } from "../store/Slices/threadEmail";
import { getAiReply } from "../store/Slices/aiReply";
import { Editor } from "@tinymce/tinymce-react";
import {
  CREATE_DEAL_API_KEY,
  MODULE_URL,
  TINY_EDITOR_API_KEY,
} from "../store/constants";
import { LoadingChase } from "./Loading";
import { toast } from "react-toastify";
import { base64ToUtf8 } from "../assets/assets";
import useModule from "../hooks/useModule";

export default function EmailBox({ onClose, view, threadId, tempEmail }) {
  const scrollRef = useRef();
  const editorRef = useRef(null);
  const dispatch = useDispatch();

  const { viewEmail, threadId: viewThreadId } = useSelector((s) => s.viewEmail);
  const { businessEmail } = useSelector((s) => s.user);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { aiReply } = useSelector((s) => s.aiReply);

  const emails = view ? viewEmail : threadEmail;
  useEffect(() => {
    if (!view && threadId) {
      dispatch(getThreadEmail(tempEmail, threadId))
    }
  }, [threadId, view]);
  const [messageLimit, setMessageLimit] = useState(3);
  const [showEditorScreen, setShowEditorScreen] = useState(false);
  const [input, setInput] = useState("");
  const [openParent, setOpenParent] = useState(null);

  const [templateId, setTemplateId] = useState(null);
  const [editorReady, setEditorReady] = useState(false);

  // FETCH BUTTONS
  const { loading, data: buttons } = useModule({
    url: `https://errika.guestpostcrm.com/index.php?entryPoint=get_buttons&type=regular&email=${tempEmail}`,
    name: "BUTTONS",
    dependencies: [tempEmail],
  });

  // DEFAULT TEMPLATE
  const { loading: defTemplateLoading, data: defaultTemplate } = useModule({
    url: `https://errika.guestpostcrm.com/?entryPoint=updateOffer&email=${tempEmail}`,
    name: "DEFAULT TEMPLATE",
    dependencies: [tempEmail],
  });

  // SELECTED TEMPLATE
  const { loading: templateLoading, data: template } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: { id: templateId },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: `TEMPLATE WITH ID ${templateId}`,
    dependencies: [templateId],
    enabled: templateId,
  });

  // LOAD TEMPLATE INTO EDITOR
  useEffect(() => {
    if ((template || defaultTemplate) && editorReady && editorRef.current) {
      const htmlContent = template?.[0]?.body_html || base64ToUtf8(defaultTemplate.html_base64);
      if (htmlContent) {
        editorRef.current.setContent(htmlContent);
        setInput(htmlContent);
      } else {
        toast.warn("Template is empty—starting with blank editor.");
      }
    }
  }, [template, defaultTemplate, editorReady]);

  // AI REPLY
  useEffect(() => {
    if (threadId) dispatch(getAiReply(threadId));
    else if (viewThreadId && view) dispatch(getAiReply(viewThreadId));
  }, [threadId, viewThreadId]);

  const insertAiReply = () => {
    if (!aiReply) return toast.error("AI reply not ready yet.");
    const formatted = /<[a-z][\s\S]*>/i.test(aiReply)
      ? aiReply
      : aiReply.replace(/\n/g, "<br>");
    setOpenParent(null);
    setTemplateId(null);
    setInput(formatted);
    editorRef.current?.setContent(formatted);
  };

  const htmlToPlainText = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html || "";
    return temp.textContent || temp.innerText || "";
  };

  const handleSendClick = () => {
    if (!showEditorScreen) {
      setShowEditorScreen(true);

      if (template && editorRef.current) {
        editorRef.current.setContent(template[0]?.body_html);
        setInput(template[0]?.body_html);
      }
      if (defaultTemplate && editorRef.current) {
        editorRef.current.setContent(base64ToUtf8(defaultTemplate.html_base64));
        setInput(base64ToUtf8(defaultTemplate.html_base64));
      }
      return;
    }

    const contentToSend =
      editorRef.current?.getContent() ||
      input;

    if (view) dispatch(sendEmail(contentToSend));
    else dispatch(sendEmailToThread(threadId, contentToSend));

    onClose();
    setInput("");
    editorRef.current?.setContent("");
  };

  const handleBackClick = () => {
    if (showEditorScreen) {
      setShowEditorScreen(false);
    } else {
      onClose();
    }
  };
  const visibleMessages = emails?.slice(-messageLimit);
  useEffect(() => {
    if (scrollRef.current && visibleMessages?.length <= 3) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 500 }}
      className="bg-white rounded-3xl shadow-2xl w-full h-screen flex flex-col overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackClick}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5" />
            <h2 className="text-xl font-bold tracking-tight">
              {showEditorScreen ? "Compose Email" : "Email Thread"}
            </h2>
          </div>
        </div>
      </div>

      {/* ========================= EDITOR SCREEN ========================= */}
      {showEditorScreen ? (
        <div className="flex flex-col h-full">
          <div className="flex-1 px-6 pb-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-full"
            >
              <Editor
                apiKey={TINY_EDITOR_API_KEY}
                value={input}
                onInit={(e, editor) => {
                  editorRef.current = editor;
                  setEditorReady(true);
                }}
                onEditorChange={setInput}
                init={{
                  height: "100%",
                  menubar: false,
                  toolbar:
                    "undo redo | bold italic underline | bullist numlist | removeformat",
                  branding: false,
                  statusbar: false,
                  content_style:
                    "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6; }",
                }}
              />
            </motion.div>
          </div>

          {/* ACTION ROW */}
          <div className="p-6 border-t bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              {/* AI REPLY BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                onClick={insertAiReply}
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  AI Reply
                </span>
              </motion.button>

              {/* DEFAULT TEMPLATE */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                onClick={() => {
                  setTemplateId(null);
                  if (defaultTemplate && editorRef.current) {
                    const html = base64ToUtf8(defaultTemplate.html_base64);
                    editorRef.current.setContent(html);
                    setInput(html);
                    setOpenParent(null);
                  }
                }}
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  Template
                </span>
              </motion.button>

              {/* PARENT + CHILD BUTTONS */}
              {loading ? (
                <LoadingChase className="p-4" />
              ) : (
                buttons?.map((btnGroup, i) => {
                  const parent = btnGroup.parent_btn;
                  const children = btnGroup.child_btn;
                  const isOpen = openParent === parent.id;

                  return (
                    <div key={i} className="relative">
                      {/* PARENT BUTTON */}
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        onClick={() => {
                          setTemplateId(parent.email_template_id);
                          setOpenParent(isOpen ? null : parent.id);
                        }}
                      >
                        {parent.button_label}
                      </motion.button>

                      {/* CHILDREN LIST */}
                      <AnimatePresence>
                        {isOpen && children && (
                          <motion.div
                            initial={{ x: -20, opacity: 0, scale: 0.95 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: -20, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, type: "spring" }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 flex gap-2 bg-white p-3 rounded-2xl shadow-2xl border border-gray-200"
                          >
                            {children?.map((child, j) => (
                              <motion.button
                                key={j}
                                whileHover={{ scale: 1.03, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setTemplateId(child.email_template_id);
                                  setOpenParent(null);
                                }}
                                className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                              >
                                {child.button_label}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* SEND BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Email</span>
            </motion.button>
          </div>
        </div>
      ) : (
        /* ========================= CHAT SCREEN ========================= */
        <>
          <div className="px-6 pt-4 pb-3 bg-gradient-to-b from-gray-50 to-gray-100 flex gap-3 border-b border-gray-200">
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
                  onClick={() => setMessageLimit(emails?.length)}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Show All
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
              return (
                <motion.div
                  key={mail.message_id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-5 rounded-2xl shadow-lg ${isUser
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-medium ${isUser ? "opacity-90" : "text-gray-500"
                          }`}
                      >
                        {isUser ? "You" : mail.from_name || "Sender"}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(mail.date_created).toLocaleString()}
                      </span>
                    </div>
                    <div
                      dangerouslySetInnerHTML={{ __html: mail.body }}
                      className="mail-content text-sm leading-relaxed"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="p-6 border-t bg-white shadow-2xl">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendClick}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>Reply</span>
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}

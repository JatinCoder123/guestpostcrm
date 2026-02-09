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
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail } from "../store/Slices/viewEmail";
import {
  getThreadEmail,
  sendEmailToThread,
  threadEmailAction,
} from "../store/Slices/threadEmail";
import { aiReplyAction, getAiReply } from "../store/Slices/aiReply";
import { Editor } from "@tinymce/tinymce-react";
import { CREATE_DEAL_API_KEY, TINY_EDITOR_API_KEY } from "../store/constants";
import { LoadingChase } from "./Loading";
import { toast } from "react-toastify";
import { base64ToUtf8, getDomain } from "../assets/assets";
import useModule from "../hooks/useModule";
import PageLoader from "./PageLoader";
export default function EmailBox({
  onClose,
  view,
  threadId,
  tempEmail,
  importBtn = null,
}) {
  const scrollRef = useRef();
  const editorRef = useRef(null);
  const [editorContent, setEditorContent] = useState();
  const firstMessageRef = useRef(null);
  const lastMessageRef = useRef(null);

  const dispatch = useDispatch();

  const { viewEmail, threadId: viewThreadId } = useSelector((s) => s.viewEmail);
  const { businessEmail, crmEndpoint } = useSelector((s) => s.user);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const [aiReplyContent, setAiReplyContent] = useState("");
  const [aiNewContent, setAiNewContent] = useState("");
  const {
    loading: aiLoading,
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((state) => state.aiReply);

  const {
    loading: templateListLoading,
    data: templateList,
    error,
    refetch,
  } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates" },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
    name: "TEMPLATE LIST",
    dependencies: [crmEndpoint],
    enabled: false,
  });
  const emails = view ? viewEmail : threadEmail;
  useEffect(() => {
    if (!view && threadId) {
      dispatch(getThreadEmail(tempEmail, threadId));
    }
  }, [threadId, view]);
  const [messageLimit, setMessageLimit] = useState(3);
  const [openMessageId, setOpenMessageId] = useState(null);
  const [fullMessage, setFullMessage] = useState(null);
  const [fullLoading, setFullLoading] = useState(false);

  const [showEditorScreen, setShowEditorScreen] = useState(false);
  const [input, setInput] = useState("");
  const [openParent, setOpenParent] = useState(null);

  const [templateId, setTemplateId] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);

  // FETCH BUTTONS
  const { loading, data: buttons } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_buttons&type=regular&email=${tempEmail}`,
    name: "BUTTONS",
    dependencies: [tempEmail],
  });

  // DEFAULT TEMPLATE
  const { loading: defTemplateLoading, data: defaultTemplate } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=updateOffer&email=${tempEmail}`,
    name: "DEFAULT TEMPLATE",
    dependencies: [tempEmail],
  });

  // SELECTED TEMPLATE
  const { loading: templateLoading, data: template } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_post_all&action_type=get_data`,
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
      const htmlContent =
        template?.[0]?.body_html || base64ToUtf8(defaultTemplate.html_base64);
      if (htmlContent) {
        setEditorContent(htmlContent);
        setInput(htmlContent);
      } else {
        toast.warn("Template is empty—starting with blank editor.");
      }
    }
  }, [template, defaultTemplate, editorReady]);

  function insertAiReply(input) {
    setOpenParent(null);
    setTemplateId(null);
    setInput(input);
    setEditorContent(input);
  }
  const fetchFullMessage = async (messageId) => {
    try {
      setFullLoading(true);
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
    } finally {
      setFullLoading(false);
    }
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
        setEditorContent(template[0]?.body_html);
        setInput(template[0]?.body_html);
      }
      if (defaultTemplate && editorRef.current) {
        setEditorContent(base64ToUtf8(defaultTemplate.html_base64));
        setInput(base64ToUtf8(defaultTemplate.html_base64));
      }
      return;
    }

    const contentToSend = editorContent || input;

    if (view) dispatch(sendEmail(contentToSend));
    else dispatch(sendEmailToThread(threadId, contentToSend));

    onClose();
    setInput("");
    setEditorContent("");
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
  useEffect(() => {
    if (message && aiResponse) {
      if (message == "User") setAiNewContent(aiResponse);
      else if (message == "New") setAiNewContent(aiResponse);
      else setAiReplyContent(aiResponse);
      insertAiReply(aiResponse);
      dispatch(aiReplyAction.clearMessge());
    }
    if (aiError) {
      toast.error(aiError);
      dispatch(aiReplyAction.clearAllErrors());
    }
  }, [message, aiResponse, dispatch]);
  return (
    <>
      {(aiLoading || templateLoading) && <PageLoader />}

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
              {/* OPEN GMAIL */}
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/u/0/#inbox/${view ? viewThreadId : threadId}`,
                    "_blank",
                  )
                }
              >
                <Send className="w-5 h-5" />
                <h2 className="text-xl font-bold tracking-tight">
                  {showEditorScreen ? "Compose Email" : "Email Thread"}
                </h2>
              </div>

              {/* COPY LINK */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ⛔ prevent opening gmail
                  const link = `https://mail.google.com/mail/u/0/#inbox/${view ? viewThreadId : threadId}`;
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
          {importBtn && importBtn()}
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
                  // tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"
                  value={editorContent || input}
                  onEditorChange={setEditorContent}
                  onInit={(e, editor) => {
                    editorRef.current = editor;
                    setEditorReady(true);
                  }}
                  init={{
                    height: "100%",
                    menubar: true,
                    branding: false,
                    statusbar: true,

                    /* ================= PLUGINS ================= */
                    plugins: `
      advlist autolink autosave directionality
      visualblocks visualchars wordcount
      fullscreen preview searchreplace
      insertdatetime lists link image media
      table charmap pagebreak nonbreaking
      anchor code codesample help
      emoticons quickbars
    `,

                    /* ================= TOOLBAR ================= */
                    toolbar: `
      undo redo | blocks fontfamily fontsize |
      bold italic underline strikethrough forecolor backcolor |
      alignleft aligncenter alignright alignjustify |
      bullist numlist outdent indent |
      link image media table |
      emoticons charmap insertdatetime |
      preview fullscreen |
      code help
    `,

                    toolbar_mode: "sliding",

                    /* ================= MENUBAR ================= */
                    menubar: "file edit view insert format tools table help",

                    /* ================= QUICKBARS ================= */
                    quickbars_selection_toolbar:
                      "bold italic underline | quicklink h2 h3 blockquote",
                    quickbars_insert_toolbar: "image media table",

                    /* ================= AUTOSAVE ================= */
                    autosave_ask_before_unload: true,
                    autosave_interval: "30s",
                    autosave_restore_when_empty: true,

                    /* ================= IMAGES ================= */
                    image_advtab: true,
                    image_caption: true,
                    image_title: true,
                    automatic_uploads: true,

                    /* ================= TABLE ================= */
                    table_advtab: true,
                    table_cell_advtab: true,
                    table_row_advtab: true,
                    table_resize_bars: true,

                    /* ================= LINKS ================= */
                    link_assume_external_targets: true,
                    link_context_toolbar: true,

                    /* ================= CODE ================= */
                    codesample_languages: [
                      { text: "HTML/XML", value: "markup" },
                      { text: "JavaScript", value: "javascript" },
                      { text: "CSS", value: "css" },
                      { text: "Java", value: "java" },
                      { text: "Python", value: "python" },
                      { text: "PHP", value: "php" },
                    ],

                    /* ================= ACCESSIBILITY ================= */
                    a11y_advanced_options: true,

                    /* ================= CONTENT STYLE ================= */
                    content_style: `
      body {
        font-family: -apple-system, BlinkMacSystemFont,
          'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: #333;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      table, th, td {
        border: 1px solid #ccc;
      }

      th, td {
        padding: 8px;
      }
    `,

                    /* ================= PREVIEW ================= */
                    preview_styles:
                      "font-family font-size font-weight font-style text-decoration color background-color border padding margin line-height",

                    /* ================= UX ================= */
                    contextmenu: "link image table",
                    resize: true,
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
                  onClick={() => {
                    if (aiReplyContent == "") {
                      dispatch(getAiReply(view ? viewThreadId : threadId));
                    }
                    insertAiReply(aiReplyContent);
                  }}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    AI Reply
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={() => {
                    dispatch(
                      getAiReply(
                        view ? viewThreadId : threadId,
                        1,
                        aiNewContent == "" ? "" : editorContent,
                      ),
                    );

                    insertAiReply(aiNewContent);
                  }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    AI Now
                  </span>
                </motion.button>
                <AnimatePresence>
                  {showTemplatePopup && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                      >
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Select Email Template
                          </h3>
                          <button
                            onClick={() => setShowTemplatePopup(false)}
                            className="p-2 rounded-full hover:bg-gray-100"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        {templateListLoading && (
                          <div className="flex items-center justify-center">
                            <LoadingChase />
                          </div>
                        )}
                        {/* TEMPLATE LIST */}
                        {!templateListLoading && (
                          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                            {templateList.map((tpl) => (
                              <motion.button
                                key={tpl.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setEditorContent(tpl.body_html);
                                  setInput(tpl.body_html);
                                  setTemplateId(tpl.id);
                                  setOpenParent(null);
                                  setShowTemplatePopup(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition font-medium"
                              >
                                {tpl.name}
                              </motion.button>
                            ))}
                          </div>
                        )}
                        {!templateListLoading && templateList.length === 0 && (
                          <div className="flex items-center justify-center">
                            <p className="text-gray-500">No templates found</p>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* DEFAULT TEMPLATE */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={() => {
                    setTemplateId(null);
                    if (defaultTemplate && editorRef.current) {
                      const html = base64ToUtf8(defaultTemplate.html_base64);
                      setEditorContent(html);
                      setInput(html);
                      setOpenParent(null);
                    }
                    setShowTemplatePopup(true);
                    refetch();
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
                const isLast = idx === visibleMessages.length - 1;
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
                      className={`relative max-w-[70%] p-5 rounded-2xl shadow-lg ${
                        isUser
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <div
                        className={`mb-4 px-4 py-2 rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm ${
                          isUser
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
                          __html: mail.body_html ? mail.body_html : mail.body,
                        }}
                        className="mail-content text-sm leading-relaxed"
                      />
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

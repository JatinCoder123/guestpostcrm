import {
  Mail,
  User,
  Globe,
  Handshake,
  Send,
  Brain,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail } from "../store/Slices/viewEmail";
import { sendEmailToThread } from "../store/Slices/threadEmail";
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
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { aiReply } = useSelector((s) => s.aiReply);
  const { email } = useSelector((s) => s.ladger);

  const emails = view ? viewEmail : threadEmail;

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
    if (template && editorReady && editorRef.current) {
      editorRef.current.setContent(template[0]?.body_html || "");
      setInput(template[0]?.body_html || "");
    } else if (defaultTemplate && editorReady && editorRef.current) {
      editorRef.current.setContent(base64ToUtf8(defaultTemplate.html_base64));
      setInput(base64ToUtf8(defaultTemplate.html_base64));
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
      editorRef.current?.getContent({ format: "text" }) ||
      htmlToPlainText(input);

    if (view) dispatch(sendEmail(contentToSend));
    else dispatch(sendEmailToThread(threadId, contentToSend));

    onClose();
    setInput("");
    editorRef.current?.setContent("");
  };

  const visibleMessages = emails.slice(-messageLimit);

  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full h-screen flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <h2 className="text-lg font-semibold">
            {showEditorScreen ? "Write Email" : "Email Conversation"}
          </h2>
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ========================= EDITOR SCREEN ========================= */}
        {showEditorScreen ? (
          <div className="flex flex-col h-full">
            <button
              onClick={() => setShowEditorScreen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 m-4 rounded-lg w-28"
            >
              ← Back
            </button>

            <div className="flex-1 px-4">
              <Editor
                apiKey={TINY_EDITOR_API_KEY}
                value={input}
                onInit={(e, editor) => {
                  editorRef.current = editor;
                  setEditorReady(true);
                }}
                onEditorChange={setInput}
                init={{
                  height: "70vh",
                  menubar: false,
                  toolbar:
                    "undo redo | bold italic underline | bullist numlist | removeformat",
                  branding: false,
                  statusbar: false,
                }}
              />
            </div>

            {/* ACTION ROW */}
            <div className=" relative p-4 border-t bg-white flex items-start gap-4">
              <div className=" flex items-center gap-3">
                {/* AI REPLY BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg"
                  onClick={insertAiReply}
                >
                  <Brain className="w-4 h-4" />
                </motion.button>

                {/* DEFAULT TEMPLATE */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-3 rounded-lg"
                  onClick={() => {
                    setTemplateId(null);
                    if (defaultTemplate && editorRef.current) {
                      const html = base64ToUtf8(defaultTemplate.html_base64);
                      editorRef.current.setContent(html);
                      setInput(html);
                    }
                  }}
                >
                  <Mail className="w-4 h-4" />
                </motion.button>

                {/* PARENT + CHILD BUTTONS */}
                {loading ? (
                  <LoadingChase />
                ) : (
                  buttons?.map((btnGroup, i) => {
                    const parent = btnGroup.parent_btn;
                    const children = btnGroup.child_btn;
                    const isOpen = openParent === parent.id;

                    return (
                      <div key={i} className="relative">
                        {/* PARENT BUTTON */}
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow"
                          onClick={() =>
                            setOpenParent(isOpen ? null : parent.id)
                          }
                        >
                          {parent.button_label}
                        </motion.button>

                        {/* CHILDREN LIST */}
                        <AnimatePresence>
                          {isOpen && children && (
                            <motion.div
                              initial={{ x: -40, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -40, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="absolute top-[-16px] left-90 z-50  flex gap-2 bg-white p-2 rounded-xl shadow-lg border z-50"
                            >
                              {children.map((child, j) => (
                                <motion.button
                                  key={j}
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => {
                                    setTemplateId(child.email_template_id);
                                    setOpenParent(null);
                                  }}
                                  className="bg-gray-100 px-3 py-2 rounded-lg border text-sm shadow-sm"
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
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleSendClick}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================= CHAT SCREEN ========================= */
          <>
            <div className="px-4 pt-4 pb-2 bg-gray-100 flex gap-3">
              {messageLimit < emails.length && (
                <>
                  <button
                    onClick={() => setMessageLimit((p) => p + 3)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Load More
                  </button>
                  <button
                    onClick={() => setMessageLimit(emails.length)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                  >
                    Show All
                  </button>
                </>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-6"
            >
              {visibleMessages.map((mail, idx) => {
                const isUser = mail.from_email.includes(email);
                return (
                  <div
                    key={mail.message_id || idx}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-4 rounded-xl shadow ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white border text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-xs opacity-75 mb-1">
                        {new Date(mail.date_created).toLocaleString()}
                      </p>
                      <p className="whitespace-pre-line text-sm">{mail.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t bg-white flex justify-end">
              <button
                onClick={handleSendClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

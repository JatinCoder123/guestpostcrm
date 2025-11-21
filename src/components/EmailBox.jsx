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
import axios from "axios";
import { toast } from "react-toastify";

export default function EmailBox({ onClose, view, threadId }) {
  const scrollRef = useRef();
  const editorRef = useRef(null);

  const dispatch = useDispatch();

  const { viewEmail, threadId: viewThreadId } = useSelector((s) => s.viewEmail);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { aiReply } = useSelector((s) => s.aiReply);
  const { email } = useSelector((s) => s.ladger);
  const [templateId, setTemplateId] = useState(null);
  const emails = view ? viewEmail : threadEmail;

  const [messageLimit, setMessageLimit] = useState(3);
  const [showEditorScreen, setShowEditorScreen] = useState(false);
  const [input, setInput] = useState("");

  // Negotiation Buttons
  const [buttons, setButtons] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNegoButtons, setShowNegoButtons] = useState(false);

  // Template
  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Fetch Negotiation Buttons
  useEffect(() => {
    setLoading(true);
    const fetchBtn = async () => {
      try {
        const res = await axios.get(
          `https://errika.guestpostcrm.com/index.php?entryPoint=get_buttons&type=offer&email=${email}`
        );
        console.log("BUTTON  ", res);

        setButtons(res.data);
      } catch (e) {
        toast.error("Failed to load negotiation buttons");
      }
      setLoading(false);
    };
    fetchBtn();
  }, [email]);

  // Fetch Template
  useEffect(() => {
    setTemplateLoading(true);

    const fetchTemplate = async () => {
      try {
        // Get template ID
        let res = await axios.get(
          `https://errika.guestpostcrm.com/index.php?entryPoint=get_buttons&type=regular&email=${email}`
        );
        console.log("TEMPLATE ID ", res);
        const id = res.data[0].email_template_id;

        // Fetch template body
        res = await axios.post(
          `${MODULE_URL}&action_type=get_data`,
          {
            module: "EmailTemplates",
            where: { id },
          },
          {
            headers: {
              "x-api-key": `${CREATE_DEAL_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("TEMPLATE ", res);

        setTemplate(res.data[0].body_html);
      } catch (error) {
        toast.error("Error fetching email template");
      }

      setTemplateLoading(false);
    };

    fetchTemplate();
  }, [email]);
  // Fetch Template
  useEffect(() => {
    setTemplateLoading(true);

    const fetchTemplate = async (templateId) => {
      try {
        // Fetch template body
        const res = await axios.post(
          `${MODULE_URL}&action_type=get_data`,
          {
            module: "EmailTemplates",
            where: { id: templateId },
          },
          {
            headers: {
              "x-api-key": `${CREATE_DEAL_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("TEMPLATE WITH ID", res);

        setTemplate(res.data[0].body_html);
      } catch (error) {
        toast.error("Error fetching email template");
      }

      setTemplateLoading(false);
    };
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Load Template into Editor when ready
  useEffect(() => {
    if (template && editorRef.current) {
      editorRef.current.setContent(template);
      setInput(template);
    }
  }, [template]);

  // AI reply fetch
  useEffect(() => {
    if (threadId) dispatch(getAiReply(threadId));
    else if (viewThreadId && view) dispatch(getAiReply(viewThreadId));
  }, [threadId, viewThreadId]);

  // Function to insert AI reply manually
  const insertAiReply = () => {
    if (!aiReply) {
      toast.error("AI reply not ready yet.");
      return;
    }

    const isHTML = /<[a-z][\s\S]*>/i.test(aiReply);
    const formatted = isHTML ? aiReply : aiReply.replace(/\n/g, "<br>");

    setInput(formatted);
    editorRef.current?.setContent(formatted);
  };

  // Extract plain text if needed
  const htmlToPlainText = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html || "";
    return temp.textContent || temp.innerText || "";
  };

  // Send Email Logic
  const handleSendClick = () => {
    if (!showEditorScreen) {
      setShowEditorScreen(true);

      // On first open → load template inside editor
      if (template && editorRef.current) {
        editorRef.current.setContent(template);
        setInput(template);
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
        className="bg-white rounded-2xl shadow-2xl w-full h-[100vh] flex flex-col overflow-hidden"
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

        {/* ===================== EDITOR MODE ===================== */}
        {showEditorScreen ? (
          <div className="flex flex-col h-full">
            {/* BACK */}
            <button
              onClick={() => setShowEditorScreen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 m-4 rounded-lg w-28"
            >
              ← Back
            </button>

            {/* EDITOR */}
            <div className="flex-1 px-4">
              <Editor
                apiKey={TINY_EDITOR_API_KEY}
                value={input}
                onInit={(e, editor) => (editorRef.current = editor)}
                onEditorChange={setInput}
                init={{
                  height: 350,
                  menubar: false,
                  toolbar:
                    "undo redo | bold italic underline | bullist numlist | removeformat",
                  branding: false,
                  statusbar: false,
                }}
              />
            </div>

            {/* BUTTON ROW */}
            <div className="p-4 border-t bg-white flex items-start gap-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative flex items-center gap-3"
              >
                {/* AI Reply */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg flex items-center justify-center"
                  onClick={insertAiReply}
                >
                  <Brain className="w-4 h-4" />
                </motion.button>

                {/* Offer */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-3 rounded-lg flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>

                {/* Negotiation */}
                <motion.button
                  onClick={() => setShowNegoButtons((prev) => !prev)}
                  whileHover={{ scale: 1.08 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-lg flex items-center justify-center"
                >
                  <Handshake className="w-4 h-4" />
                </motion.button>

                {/* Negotiation Dropdown */}
                <AnimatePresence>
                  {showNegoButtons && (
                    <motion.div
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3"
                    >
                      {loading ? (
                        <LoadingChase />
                      ) : (
                        buttons?.map((b, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => {
                              setTemplateId(b.email_template_id);
                              setShowNegoButtons(false);
                            }}
                            className="w-full p-2 bg-gray-100 rounded-lg border text-left shadow-sm"
                          >
                            {b.button_label}
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

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
          /* ================= CHAT SCREEN ================= */
          <>
            {/* LOAD MORE */}
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

            {/* CHAT LIST */}
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

            {/* CHAT FOOTER */}
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

import { Mail, User, Globe, Handshake, Send, Brain, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail } from "../store/Slices/viewEmail";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { getAiReply } from "../store/Slices/aiReply";
import { Editor } from "@tinymce/tinymce-react";
import { TINY_EDITOR_API_KEY } from "../store/constants";

export default function EmailBox({ onClose, view, threadId }) {
  const scrollRef = useRef();
  const editorRef = useRef(null);

  const { viewEmail, threadId: viewThreadId } = useSelector((s) => s.viewEmail);
  const { threadEmail } = useSelector((s) => s.threadEmail);
  const { aiReply, loading } = useSelector((s) => s.aiReply);
  const { email } = useSelector((s) => s.ladger);

  const emails = view ? viewEmail : threadEmail;
  const dispatch = useDispatch();

  // NEW STATES
  const [messageLimit, setMessageLimit] = useState(3); // initially 3
  const [showEditorScreen, setShowEditorScreen] = useState(false); // editor hidden
  const [input, setInput] = useState("");

  // Load AI reply
  useEffect(() => {
    if (threadId) {
      dispatch(getAiReply(threadId));
    } else if (viewThreadId && view) {
      dispatch(getAiReply(viewThreadId));
    }
  }, [threadId, viewThreadId]);

  // Insert AI reply into editor
  useEffect(() => {
    if (aiReply) {
      const isHTML = /<[a-z][\s\S]*>/i.test(aiReply);
      const formatted = isHTML ? aiReply : aiReply.replace(/\n/g, "<br>");

      setInput(formatted);
    }
  }, [aiReply]);

  const htmlToPlainText = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html || "";
    return temp.textContent || temp.innerText || "";
  };

  // FIRST CLICK = show editor
  // SECOND CLICK = send message
  const handleSendClick = () => {
    if (!showEditorScreen) {
      setShowEditorScreen(true);
      return;
    }

    let contentToSend =
      editorRef.current?.getContent({ format: "text" }) ||
      htmlToPlainText(input);

    if (view) dispatch(sendEmail(contentToSend));
    else dispatch(sendEmailToThread(threadId, contentToSend));

    setInput("");
    onClose();
    editorRef.current?.setContent("");
  };

  // Show only latest messages
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

        {/* ================================================= */}
        {/* ============= EDITOR SCREEN ====================== */}
        {/* ================================================= */}
        {showEditorScreen ? (
          <div className="flex flex-col h-full">
            {/* BACK BUTTON */}
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

            {/* FOOTER WITH ALL BUTTONS */}
            <div className="p-4 border-t bg-white flex items-start gap-4">
              {/* BUTTON GRID */}
              <div className="w-1/5">
                <div className="grid grid-cols-3 gap-2">
                  {/* AI Reply */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg flex items-center justify-center"
                  >
                    <Brain className="w-4 h-4" />
                  </motion.button>

                  {/* View Mail */}
                  <motion.button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </motion.button>

                  {/* View Contact */}
                  <motion.button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </motion.button>

                  {/* View IP */}
                  <motion.button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </motion.button>

                  {/* Create Deal */}
                  <motion.button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg flex items-center justify-center">
                    <Handshake className="w-4 h-4" />
                  </motion.button>
                </div>
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
          /* ================================================= */
          /* ============= CHAT SCREEN ======================== */
          /* ================================================= */
          <>
            {/* LOAD MORE BUTTONS AT TOP */}
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

            {/* CHAT MESSAGES */}
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

            {/* FOOTER - ONLY SEND BUTTON */}
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

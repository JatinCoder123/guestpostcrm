import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail } from "../store/Slices/viewEmail";
import { sendEmailToThread } from "../store/Slices/threadEmail";
import { getAiReply } from "../store/Slices/aiReply";

export default function EmailBox({ onClose, view, threadId }) {
  const scrollRef = useRef();
  const textareaRef = useRef(null);
  const { viewEmail, threadId: viewThreadId } = useSelector(
    (state) => state.viewEmail
  );
  const { threadEmail } = useSelector((state) => state.threadEmail);
  const { aiReply, loading, error } = useSelector((state) => state.aiReply);
  const [input, setInput] = useState("");
  const emails = view ? viewEmail : threadEmail;
  const { email } = useSelector((state) => state.ladger);
  const dispatch = useDispatch();
  useEffect(() => {
    if (threadId) {
      dispatch(getAiReply(threadId));
    } else if (viewThreadId && view) {
      console.log("Gettin AI Reply");
      dispatch(getAiReply(viewThreadId));
    }
  }, [threadId, viewThreadId]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [emails]);
  const handleClickAiReplyBtn = () => {};
  const handleClickSendBtn = () => {
    if (view) {
      dispatch(sendEmail(input));
    } else {
      dispatch(sendEmailToThread(props.threadId, input));
    }
  };
  // ⌨️ Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (view) {
        dispatch(sendEmail(input));
      } else {
        dispatch(sendEmailToThread(props.threadId, input));
      }
    }
  };
  // 🧠 Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);
  useEffect(() => {
    setInput(aiReply);
  }, [aiReply, loading, dispatch]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <h2 className="text-lg font-semibold">Email Conversation</h2>
        <button
          onClick={onClose}
          className="text-white cursor-pointer hover:text-gray-200 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Email Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-6"
      >
        {emails.map((mail, index) => {
          const isUser = mail.from_email.includes(email);
          return (
            <motion.div
              key={mail.message_id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } w-full`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                  isUser
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {/* Header Info */}
                <div className="mb-2">
                  <p className="text-sm font-semibold">
                    {isUser ? "You" : mail.from_name || "Unknown Sender"}
                  </p>
                  <p className="text-xs opacity-70">
                    {new Date(mail.date_created).toLocaleString()}
                  </p>
                </div>

                {/* Subject */}
                {mail.subject && (
                  <p
                    className={`text-sm mb-2 font-medium ${
                      isUser ? "text-blue-100" : "text-gray-600"
                    }`}
                  >
                    {mail.subject}
                  </p>
                )}

                {/* Email Body Handling */}
                <div className="space-y-3">
                  {/* Plain Text Body */}
                  {mail.body && mail.body.trim() !== "" && (
                    <p
                      className={`whitespace-pre-line leading-relaxed text-sm ${
                        isUser ? "text-blue-50" : "text-gray-800"
                      }`}
                    >
                      {mail.body}
                    </p>
                  )}

                  {/* No Content Fallback */}
                  {!mail.body && (
                    <p
                      className={`italic ${
                        isUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      (No content)
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Footer (reply input area) */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          {loading && <p>Generating Ai Reply...</p>}
          {!loading && (
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              className="flex-1 min-w-0 resize-none max-h-40 overflow-y-auto
              px-3 py-2 rounded-lg border-none outline-none bg-gray-200
              text-black placeholder-gray-400
              w-full sm:w-auto"
              rows={1}
            />
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClickSendBtn}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-md"
          >
            Send
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClickAiReplyBtn}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-md"
          >
            Ai Reply
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

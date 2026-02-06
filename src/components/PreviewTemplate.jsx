import { AnimatePresence, motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import { Brain, Zap, Trash2, Mail, Send, X } from "lucide-react";
import { useEffect } from "react";
import { TINY_EDITOR_API_KEY } from "../store/constants";

export const PreviewTemplate = ({
  editorContent,
  setEditorContent,
  initialContent = "",
  aiReply = "",
  templateContent = "",
  onClose,
  onSubmit,
  loading = false,
}) => {
  /* ---------------- INITIAL CONTENT ---------------- */
  useEffect(() => {
    setEditorContent(initialContent || "");
  }, [initialContent]);

  /* ---------------- HANDLERS ---------------- */
  const handleClear = () => {
    setEditorContent("");
  };
  const handleAiNow = () => {
    const randomTexts = [
      "Hope you’re doing well. Just wanted to quickly follow up on this.",
      "Thank you for reaching out. I’ll look into this and get back to you shortly.",
      "This sounds great. Let’s discuss the next steps soon.",
      "I appreciate the update. Please let me know if you need anything from my side.",
    ];

    const randomText =
      randomTexts[Math.floor(Math.random() * randomTexts.length)];

    setEditorContent(randomText);
  };

  const handleAiReply = () => {
    if (aiReply) {
      setEditorContent(aiReply);
    }
  };

  const handleTemplate = () => {
    if (templateContent) {
      setEditorContent(templateContent);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black z-50">
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-screen h-screen bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h2 className="text-lg font-semibold">Email Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X size={26} />
          </button>
        </div>

        {/* EDITOR */}
        <div className="flex-1 overflow-hidden">
          <Editor
            apiKey={TINY_EDITOR_API_KEY}
            value={editorContent}
            onEditorChange={setEditorContent}
            init={{
              height: "100%",
              menubar: false,
              plugins:
                "preview searchreplace autolink fullscreen image link media table lists advlist code wordcount",
              toolbar:
                "undo redo | formatselect | bold italic underline | \
                 alignleft aligncenter alignright | \
                 bullist numlist | link image | preview fullscreen | code",
              toolbar_mode: "sliding",
              content_style: `
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif;
                  font-size: 15px;
                  line-height: 1.6;
                  color: #333;
                }
              `,
            }}
          />
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-3 border-t bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* AI REPLY */}
            <ActionButton
              icon={<Brain />}
              label="AI Reply"
              gradient="from-indigo-500 to-blue-600"
              onClick={handleAiReply}
            />

            {/* AI NOW */}
            <ActionButton
              icon={<Zap />}
              label="AI Now"
              gradient="from-fuchsia-500 to-purple-600"
              onClick={handleAiNow}
            />

            {/* TEMPLATE */}
            <ActionButton
              icon={<Mail />}
              label="Templates"
              gradient="from-slate-600 to-slate-800"
              onClick={handleTemplate}
            />

            {/* CLEAR */}
            <ActionButton
              icon={<Trash2 />}
              label="Clear"
              gradient="from-rose-500 to-red-600"
              onClick={handleClear}
            />
          </div>

          {/* SEND */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white  p-4 rounded-2xl cursor-pointer font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
          >
            <Send className="w-5 h-5" />
            <span>{loading ? "Sending..." : "Send Email"}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------------- REUSABLE BUTTON ---------------- */
const ActionButton = ({ icon, label, gradient, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} text-white p-3 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 flex items-center gap-2`}
  >
    {icon}
    <span className="text-sm font-medium hidden sm:inline">{label}</span>
  </motion.button>
);

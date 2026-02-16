import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

/**
 * Decode HTML entities like &gt; &quot; &amp; etc.
 */
const decodeHTML = (text = "") => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

export default function PromptViewerModal({ promptDetails, onClose }) {
  const navigate = useNavigate();
  const [view, setView] = useState("prompt"); // prompt | response

  if (!promptDetails || !promptDetails.length) return null;

  const {
    full_prompt,
    response,
    name,
    date_entered,
    prompt_id,
  } = promptDetails[0];

  const decodedPrompt = useMemo(() => {
    return decodeHTML(full_prompt)
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, [full_prompt]);

  const decodedResponse = useMemo(() => {
    return decodeHTML(response || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, [response]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}   // 👈 click outside closes modal
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()} // 👈 prevent inside clicks
        >
          {/* 🔝 HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-zinc-700">
            <div>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                {name}
              </h2>
              <p className="text-xs text-zinc-500">
                Created on {date_entered}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Toggle Prompt / Response */}
              <button
                onClick={() =>
                  setView((prev) =>
                    prev === "response" ? "prompt" : "response"
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition
                  ${view === "response"
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }
                `}
              >
                <Eye className="w-4 h-4" />
                View {view === "response" ? "Prompt" : "Response"}
              </button>

              {/* Edit */}
              <button
                onClick={() =>
                  navigate("/settings/machine-learning", {
                    state: { promptId: prompt_id },
                  })
                }
                className="px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 📄 CONTENT */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {view === "prompt" ? "Full Prompt" : "Model Response"}
            </div>

            <motion.pre
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="
                whitespace-pre-wrap
                text-sm
                leading-relaxed
                text-zinc-800 dark:text-zinc-200
                bg-zinc-50 dark:bg-zinc-800
                p-5 rounded-2xl
                border dark:border-zinc-700
                font-mono
              "
            >
              {view === "prompt"
                ? decodedPrompt
                : decodedResponse || "No response available"}
            </motion.pre>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

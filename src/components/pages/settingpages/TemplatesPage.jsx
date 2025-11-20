import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import {
  CREATE_DEAL_API_KEY,
  MODULE_URL,
  TINY_EDITOR_API_KEY,
} from "../../../store/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit3, X } from "lucide-react";
import { useState } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import { Editor } from "@tinymce/tinymce-react";
import beautify from "js-beautify"; // ← only this extra import

export default function TemplatesPage() {
  const [viewItem, setViewItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showSource, setShowSource] = useState(false); // false = preview, true = clean HTML code

  const { loading, data, error, refetch } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates" },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  // Beautified HTML (computed once)
  const prettyHtml = beautify.html(viewItem?.body_html || "", {
    indent_size: 2,
    space_in_empty_paren: true,
  });

  // When opening the viewer
  const openViewer = (item) => {
    setViewItem(item);
    setEditorContent(item.body_html);
    setIsEditing(false);
    setShowSource(false); // always start with preview
  };
  if (viewItem) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">{viewItem.name}</h2>
            <button
              onClick={() => setViewItem(null)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={28} />
            </button>
          </div>

          {/* Buttons */}
          <div className="p-4 border-b bg-gray-50 flex gap-3 flex-wrap">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Edit3 size={18} /> {isEditing ? "Close Editor" : "Edit Template"}
            </button>

            {!isEditing && (
              <button
                onClick={() => setShowSource(!showSource)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showSource ? "👁️ Preview" : "📄 View HTML Source"}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {/* Editor */}
            {isEditing && (
              <Editor
                apiKey="2kf8gyd7ms1x661uenztdjekg8v7b9iw4eageav7rlqiekjg"
                value={editorContent}
                onEditorChange={setEditorContent}
                init={{
                  height: "100%",
                  menubar: true,
                  plugins: "lists link image table code",
                  toolbar:
                    "undo redo | bold italic | bullist numlist | link image | code",
                }}
              />
            )}

            {/* Preview */}
            {!isEditing && !showSource && (
              <div className="p-8 bg-gray-50">
                <div
                  className="bg-white rounded-xl shadow border p-8 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewItem.body_html }}
                />
              </div>
            )}

            {/* Clean HTML Source */}
            {!isEditing && showSource && (
              <pre className="p-6 bg-gray-900 text-green-400 text-sm overflow-x-auto font-mono leading-relaxed">
                <code>{prettyHtml}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <Header text={"Template Manager"} />

      {loading && <Loading text={"Templates"} />}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {!loading && !error && !data && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No Template items found.</p>
        </div>
      )}

      {/* Cards */}
      {data?.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl 
                         border border-gray-200 p-5 flex flex-col 
                         justify-between group transition-all"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {item.name}
                </h2>

                {/* Description */}
                <p className="mt-4 text-sm text-gray-700 line-clamp-3">
                  {item.description || "No description"}
                </p>
              </div>

              {/* View Button */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => openViewer(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                             rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Eye size={18} />
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

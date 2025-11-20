import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
<<<<<<< HEAD
import {
  CREATE_DEAL_API_KEY,
  MODULE_URL,
  TINY_EDITOR_API_KEY,
} from "../../../store/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit3, X } from "lucide-react";
=======
import { CREATE_DEAL_API_KEY, MODULE_URL, TINY_EDITOR_API_KEY } from "../../../store/constants";
import { motion } from "framer-motion";
import { Eye, X } from "lucide-react";
>>>>>>> d54f068ba2fdfd2249b16fc7867584b5828158fc
import { useState } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import { Editor } from "@tinymce/tinymce-react";
<<<<<<< HEAD
import beautify from "js-beautify"; // ← only this extra import
=======
>>>>>>> d54f068ba2fdfd2249b16fc7867584b5828158fc

export default function TemplatesPage() {
  const [viewItem, setViewItem] = useState(null);
  const [editorContent, setEditorContent] = useState("");

  const { loading, data, error, refetch } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates" },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
  });
<<<<<<< HEAD
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
=======

  const openViewer = (item) => {
    setViewItem(item);
    setEditorContent(item.body_html || "");
  };

  // ====================== VIEWER MODAL ======================
  if (viewItem) {
    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={() => setViewItem(null)}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h2 className="text-2xl font-bold">{viewItem.name}</h2>
            <button
              onClick={() => setViewItem(null)}
              className="p-2 hover:bg-white/20 rounded-full transition"
>>>>>>> d54f068ba2fdfd2249b16fc7867584b5828158fc
            >
              <X size={28} />
            </button>
          </div>

<<<<<<< HEAD
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
=======
          {/* TinyMCE Editor with Preview & Code buttons */}
          <div className="flex-1 overflow-hidden">
            <Editor
              apiKey= {TINY_EDITOR_API_KEY}
              value={editorContent}
              onEditorChange={setEditorContent}
              init={{
                height: "100%",
                menubar: false,
                plugins:
                  "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount advlist code help",
                toolbar:
                  "undo redo | formatselect | bold italic underline strikethrough | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | link image media table | \
                  preview fullscreen | code",
                toolbar_mode: "sliding",
                content_style: `
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                    font-size: 15px; 
                    line-height: 1.6; 
                    color: #333; 
                  }
                  img { max-width: 100%; height: auto; }
                  table { border-collapse: collapse; }
                `,
                // Makes the Preview look exactly like a real email
                preview_styles:
                  "font-family font-size font-weight font-style text-decoration color background-color border padding margin line-height",
              }}
            />
          </div>

          {/* Footer Tip */}
          <div className="px-6 py-3 bg-gray-50 border-t text-center text-sm text-gray-600">
            ✨ Use the <strong>Preview</strong> button above to see the final email • Use <strong>&lt;&gt; Source code</strong> to edit raw HTML
          </div>
        </motion.div>
>>>>>>> d54f068ba2fdfd2249b16fc7867584b5828158fc
      </div>
    );
  }

  // ====================== MAIN LIST VIEW ======================
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <Header text="Template Manager" />

      {loading && <Loading text="Loading templates" />}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {!loading && !error && (!data || data.length === 0) && (
        <div className="mt-12 text-center p-16 bg-white border-2 border-dashed border-gray-300 rounded-2xl">
          <p className="text-xl text-gray-600">No email templates found.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {data.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all group cursor-pointer"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                  {item.description || "No description available"}
                </p>
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => openViewer(item)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg active:scale-98 transition-all"
                >
                  <Eye size={19} />
                  Open Editor
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
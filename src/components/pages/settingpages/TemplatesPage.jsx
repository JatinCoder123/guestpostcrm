import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../../../store/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit3, X } from "lucide-react";
import { useState } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import { Editor } from "@tinymce/tinymce-react";

export default function TemplatesPage() {
  const [viewItem, setViewItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const { loading, data, error, refetch } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates" },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const openViewer = (item) => {
    setViewItem(item);
    setEditorContent(item.body_html);
    setIsEditing(false);
  };
  if (viewItem) {
    return (
      <AnimatePresence>
        <motion.div
          className="flex w-full items-center justify-center z-50 "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-xl overflow-y-auto max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{viewItem.name}</h2>

              <button
                onClick={() => setViewItem(null)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Toggle Button */}
            <div className="mb-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white
                             rounded-lg shadow hover:bg-purple-700 active:scale-95 transition"
              >
                <Edit3 size={18} />
                {isEditing ? "Close Editor" : "Edit Template"}
              </button>
            </div>

            {/* HTML Viewer / TinyMCE Editor */}
            {!isEditing && (
              <div
                className="prose max-w-full border p-4 rounded-xl bg-gray-50"
                dangerouslySetInnerHTML={{ __html: viewItem.body_html }}
              ></div>
            )}

            {isEditing && (
              <Editor
                apiKey="no-api-key-needed"
                value={editorContent}
                onEditorChange={(content) => setEditorContent(content)}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | bold italic | alignleft aligncenter alignright | code",
                }}
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
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

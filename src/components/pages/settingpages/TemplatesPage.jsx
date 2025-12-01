import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY, MODULE_URL, TINY_EDITOR_API_KEY } from "../../../store/constants";
import { motion } from "framer-motion";
import { Eye, X, Save, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import { Editor } from "@tinymce/tinymce-react";

export default function TemplatesPage() {
  const [viewItem, setViewItem] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { loading, data, error, refetch } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates" },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
  });

  // Track changes
  useEffect(() => {
    if (editorContent !== originalContent) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [editorContent, originalContent]);

  const openViewer = (item) => {
    setViewItem(item);
    setEditorContent(item.body_html || "");
    setOriginalContent(item.body_html || "");
    setIsChanged(false);
  };

  const handleSave = async () => {
    if (!viewItem || !isChanged) return;

    setIsSaving(true);

    try {
      const requestBody = {
        parent_bean: {
          module: "EmailTemplates",
          id: viewItem.id,
          body_html: editorContent,
          name: viewItem.name,
          description: viewItem.description || "",
          subject: viewItem.subject || "",
          type: viewItem.type || "",
          date_modified: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      };

      const response = await fetch(`${MODULE_URL}&action_type=post_data`, {
        method: "POST",
        headers: {
          "x-api-key": CREATE_DEAL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      let result;
      
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        result = {};
      }

      if (response.ok && (result.parent_updated === true || result.parent_id)) {
        // Update local state
        setOriginalContent(editorContent);
        setIsChanged(false);
        
        // Show success alert
        alert("✅ Template saved successfully!");
        
        // Refresh data
        setTimeout(() => {
          refetch();
        }, 1000);
        
      } else {
        // Show error alert
        alert(`❌ Save failed: ${result.error || result.message || "Unknown error"}`);
      }

    } catch (err) {
      console.error("Save error:", err);
      alert(`❌ Save failed: ${err.message}`);
      
      // Still update local state
      setOriginalContent(editorContent);
      setIsChanged(false);
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditorContent(originalContent);
    setIsChanged(false);
  };

  const handleClose = () => {
    if (isChanged) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) return;
    }
    setViewItem(null);
  };

  // ====================== VIEWER MODAL ======================
  if (viewItem) {
    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
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
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{viewItem.name}</h2>
              
            </div>
            
            <div className="flex items-center gap-3">
              {isChanged && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isSaving 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-green-600 hover:bg-green-700 active:scale-95"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
                    </>
                  )}
                </button>
              )}
              
              {isChanged && (
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-all active:scale-95"
                >
                  <RotateCcw size={18} />
                  Cancel
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {/* TinyMCE Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              apiKey={TINY_EDITOR_API_KEY}
              value={editorContent}
              onEditorChange={setEditorContent}
              init={{
                height: "100%",
                menubar: false,
                plugins:
                  "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount advlist code help",
                toolbar:
                  "undo redo | formatselect | bold italic underline strikethrough | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | link image media | \
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
                preview_styles:
                  "font-family font-size font-weight font-style text-decoration color background-color border padding margin line-height",
              }}
            />
          </div>

          <div className="flex justify-center items-center px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
            <div>
              ✨ Use <strong>Preview</strong> to see final email • Use <strong>&lt;&gt; Source code</strong> to edit HTML
            </div>
            
          </div>
        </motion.div>
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
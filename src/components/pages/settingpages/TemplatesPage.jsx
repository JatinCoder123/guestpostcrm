import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY, TINY_EDITOR_API_KEY } from "../../../store/constants";
import { motion } from "framer-motion";
import { Eye, X, Save, RotateCcw, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import { Editor } from "@tinymce/tinymce-react";
import { useSelector } from "react-redux";

export default function TemplatesPage() {
  const [viewItem, setViewItem] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { crmEndpoint } = useSelector((state) => state.user);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { loading, data, error, refetch } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates" },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
  });


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

      const response = await fetch(`${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=post_data`, {
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
        setOriginalContent(editorContent);
        setIsChanged(false);
        alert("✅ Template saved successfully!");

        setTimeout(() => {
          refetch();
        }, 1000);

      } else {
        alert(`❌ Save failed: ${result.error || result.message || "Unknown error"}`);
      }

    } catch (err) {
      console.error("Save error:", err);
      alert(`❌ Save failed: ${err.message}`);

      setOriginalContent(editorContent);
      setIsChanged(false);

    } finally {
      setIsSaving(false);
    }
  };


  const handleCreateNewTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert("Please enter template name");
      return;
    }
    if (!newDescription.trim()) {
      alert("Please enter description here");
      return;
    }

    setIsCreating(true);

    try {
      const requestBody = {
        parent_bean: {
          module: "EmailTemplates",
          name: newTemplateName,
          description: newDescription || "",
          body_html: newTemplateContent || "<p>New template content</p>",
          subject: "",
          type: "",
          assigned_user_id: "",
          published: "off",
          text_only: "0",
          date_entered: new Date().toISOString().slice(0, 19).replace('T', ' '),
          date_modified: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      };

      console.log("Creating new template:", requestBody);

      const response = await fetch(`${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=post_data`, {
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

      console.log("Create response:", result);

      if (response.ok && (result.parent_updated === true || result.parent_id || result.id)) {
        alert("✅ New template created successfully!");


        setNewTemplateName("");
        setNewDescription("");
        setNewTemplateContent("");
        setShowNewTemplateModal(false);


        setTimeout(() => {
          refetch();
        }, 1000);

      } else {
        alert(`❌ Failed to create template: ${result.error || result.message || "Unknown error"}`);
      }

    } catch (err) {
      console.error("Create error:", err);
      alert(`❌ Failed to create template: ${err.message}`);
    } finally {
      setIsCreating(false);
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

  const handleCloseNewTemplateModal = () => {
    if (newTemplateName.trim() || newTemplateContent.trim()) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) return;
    }
    setShowNewTemplateModal(false);
  };


  if (showNewTemplateModal) {
    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={handleCloseNewTemplateModal}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Create New Template</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateNewTemplate}
                disabled={isCreating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isCreating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 active:scale-95"
                  }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Template
                  </>
                )}
              </button>

              <button
                onClick={handleCloseNewTemplateModal}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {/* Template Name Input */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  autoFocus
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter Description"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* TinyMCE Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              apiKey={TINY_EDITOR_API_KEY}
              value={newTemplateContent}
              onEditorChange={setNewTemplateContent}
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
              ✨ Enter template name above and design your email template
            </div>
          </div>
        </motion.div>
      </div>
    );
  }


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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSaving
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


  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <Header text="Template Manager"
        handleCreate={() => setShowNewTemplateModal(true)}
        showCreateButton={true}

      />


      {loading && <Loading text="Loading templates" />}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {!loading && !error && (!data || data.length === 0) && (
        <div className="mt-12 text-center p-16 bg-white border-2 border-dashed border-gray-300 rounded-2xl">
          <p className="text-xl text-gray-600">No email templates found.</p>
          <button
            onClick={() => setShowNewTemplateModal(true)}
            className="mt-6 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:shadow-lg active:scale-98 transition-all mx-auto"
          >
            <Plus size={20} />
            Create Your First Template
          </button>
        </div>
      )}

      {data && data.length > 0 && (
        <>
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
                  <div className="mt-2 text-xs text-gray-400">
                    {item.date_modified || item.date_entered}
                  </div>
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


          <div className="mt-10 text-center">
            <button
              onClick={() => setShowNewTemplateModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:shadow-lg active:scale-98 transition-all mx-auto"
            >
              <Plus size={20} />
              Add Another Template
            </button>
          </div>
        </>
      )}
    </div>
  );
}
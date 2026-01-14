import { motion } from "framer-motion"
import { TINY_EDITOR_API_KEY } from "../store/constants";
import { Editor } from "@tinymce/tinymce-react";
import { X } from "lucide-react";
export const PreviewTemplate = ({ editorContent, setEditorContent, onClose, onSubmit, loading }) => {
    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.93, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-end items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSubmit}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 active:scale-95"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
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

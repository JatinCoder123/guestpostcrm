import { AnimatePresence, motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import { Brain, Zap, Trash2, Mail, Send, X, Sparkle, Eye, List } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CREATE_DEAL_API_KEY, TINY_EDITOR_API_KEY } from "../store/constants";
import { useDispatch, useSelector } from "react-redux";
import { aiReplyAction, getAiReply } from "../store/Slices/aiReply";
import { toast } from "react-toastify";
import PageLoader from "./PageLoader";
import { ViewButton } from "./ViewButton";
import useModule from "../hooks/useModule";

export const PreviewTemplate = ({
  editorContent,
  setEditorContent,
  initialContent = "",
  aiReply = "",
  templateContent = "",
  onClose,
  threadId,
  onSubmit,
  loading = false,
}) => {
  /* ---------------- INITIAL CONTENT ---------------- */
  useEffect(() => {
    setEditorContent(initialContent || "");
  }, [initialContent]);
  const {
    loading: aiLoading,
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((state) => state.aiReply);
  const {
    crmEndpoint
  } = useSelector((state) => state.user);
  const editorRef = useRef(null)
  const dispatch = useDispatch();
  const [aiReplyContent, setAiReplyContent] = useState(aiReply);
  const [aiNewContent, setAiNewContent] = useState("");
  const [userContent, setUserContent] = useState("");
  useEffect(() => {
    if (message && aiResponse) {
      if (message == "User") setAiNewContent(aiResponse);
      else if (message == "New") setAiNewContent(aiResponse);
      else setAiReplyContent(aiResponse);
      setEditorContent(aiResponse);
      dispatch(aiReplyAction.clearMessge());
    }
    if (aiError) {
      console.log(aiError);
      toast.error(aiError);
      dispatch(aiReplyAction.clearAllErrors());
    }
  }, [message, aiResponse, dispatch]);
  const { loading: priceTempLoading, data: priceTemp } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: {
        name: "PRICE_LIST",
      },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "Price Template",

  });
  const insertTextAtCursor = () => {
    if (editorRef.current) {
      editorRef.current.focus(); // ensure cursor is active
      editorRef.current.insertContent(priceTemp[0]?.body_html ?? "No Content Available");
    }
  };
  return (
    <>
      {aiLoading && <PageLoader />}

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
              onInit={(e, editor) => {
                editorRef.current = editor;
              }}
              init={{
                height: "100%",
                menubar: true,
                branding: false,
                statusbar: true,

                /* ================= PLUGINS ================= */
                plugins: `
      advlist autolink autosave directionality
      visualblocks visualchars wordcount
      fullscreen preview searchreplace
      insertdatetime lists link image media
      table charmap pagebreak nonbreaking
      anchor code codesample help
      emoticons quickbars
    `,

                /* ================= TOOLBAR ================= */
                toolbar: `
      undo redo | blocks fontfamily fontsize |
      bold italic underline strikethrough forecolor backcolor |
      alignleft aligncenter alignright alignjustify |
      bullist numlist outdent indent |
      link image media table |
      emoticons charmap insertdatetime |
      preview fullscreen |
      code help
    `,

                toolbar_mode: "sliding",

                /* ================= MENUBAR ================= */
                menubar: "file edit view insert format tools table help",

                /* ================= QUICKBARS ================= */
                quickbars_selection_toolbar:
                  "bold italic underline | quicklink h2 h3 blockquote",
                quickbars_insert_toolbar: "image media table",

                /* ================= AUTOSAVE ================= */
                autosave_ask_before_unload: true,
                autosave_interval: "30s",
                autosave_restore_when_empty: true,

                /* ================= IMAGES ================= */
                image_advtab: true,
                image_caption: true,
                image_title: true,
                automatic_uploads: true,

                /* ================= TABLE ================= */
                table_advtab: true,
                table_cell_advtab: true,
                table_row_advtab: true,
                table_resize_bars: true,

                /* ================= LINKS ================= */
                link_assume_external_targets: true,
                link_context_toolbar: true,

                /* ================= CODE ================= */
                codesample_languages: [
                  { text: "HTML/XML", value: "markup" },
                  { text: "JavaScript", value: "javascript" },
                  { text: "CSS", value: "css" },
                  { text: "Java", value: "java" },
                  { text: "Python", value: "python" },
                  { text: "PHP", value: "php" },
                ],

                /* ================= ACCESSIBILITY ================= */
                a11y_advanced_options: true,

                /* ================= CONTENT STYLE ================= */
                content_style: `
      body {
        font-family: -apple-system, BlinkMacSystemFont,
          'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: #333;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      table, th, td {
        border: 1px solid #ccc;
      }

      th, td {
        padding: 8px;
      }
    `,

                /* ================= PREVIEW ================= */
                preview_styles:
                  "font-family font-size font-weight font-style text-decoration color background-color border padding margin line-height",

                /* ================= UX ================= */
                contextmenu: "link image table",
                resize: true,
              }}
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-3 border-t bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* AI REPLY */}
              <ViewButton Icon={Sparkle}>
                <ActionButton
                  Icon={Brain}
                  label="AI Reply"
                  gradient="from-indigo-500 to-blue-600"
                  onClick={() => {
                    if (aiReplyContent == "") {
                      dispatch(getAiReply(threadId));
                    }
                    setEditorContent(aiReplyContent);
                  }}
                />
              </ViewButton>



              {/* AI NOW */}
              <ViewButton Icon={Sparkle}>
                <ActionButton
                  Icon={Zap}
                  label="AI Now"
                  gradient="from-fuchsia-500 to-purple-600"
                  onClick={() => {
                    dispatch(getAiReply(threadId, 1, editorContent));
                    setEditorContent(editorContent);
                  }}
                />
              </ViewButton>


              {/* TEMPLATE */}
              <ViewButton Icon={Eye}>
                <ActionButton
                  Icon={Mail}
                  label="Templates"
                  gradient="from-slate-600 to-slate-800"
                  onClick={() => {
                    setEditorContent(templateContent);
                  }}
                />
              </ViewButton>
              <ViewButton Icon={Eye}>
                <ActionButton
                  Icon={List}
                  label="Price"
                  gradient="from-slate-600 to-slate-800"
                  onClick={insertTextAtCursor}
                />
              </ViewButton>


              {/* CLEAR */}
              <ActionButton
                Icon={Trash2}
                label="Clear"
                gradient="from-rose-500 to-red-600"
                onClick={() => {
                  setEditorContent(userContent);
                }}
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
    </>
  );
};

/* ---------------- REUSABLE BUTTON ---------------- */
const ActionButton = ({ Icon, label, gradient, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} text-white p-3 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 flex items-center gap-2`}
  >
    <Icon className="w-4 h-4" />    <span className="text-sm font-medium hidden sm:inline">{label}</span>
  </motion.button>
);

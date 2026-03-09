import { Editor } from "@tinymce/tinymce-react";
import { TINY_EDITOR_API_KEY } from "../store/constants";
import { motion } from "framer-motion";

const TinyEditor = ({
  editorContent,
  setEditorContent,
  editorRef,
  setEditorReady
}) => {
  return (
    <div className="flex-1  overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-full w-full"
      >
        <Editor
          apiKey={TINY_EDITOR_API_KEY}
          value={editorContent}
          onEditorChange={setEditorContent}
          onInit={(e, editor) => {
            editorRef.current = editor;
            setEditorReady(true);
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
      </motion.div>
    </div>
  );
};

export default TinyEditor;

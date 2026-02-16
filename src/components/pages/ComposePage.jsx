import { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { Send } from "lucide-react";
import { toast } from "react-toastify";
import { TINY_EDITOR_API_KEY } from "../../store/constants";
import { useSelector } from "react-redux";
export default function ComposePage({ businessEmail }) {
  const editorRef = useRef(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const { crmEndpoint } = useSelector((state) => state.user);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      if (!to || !subject) {
        toast.error("To and Subject are required");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("email", to);
      formData.append("subject", subject);
      formData.append("replyBody", editorRef.current.getContent());
      formData.append("current_email", businessEmail);
      formData.append("cc", cc);
      formData.append("bcc", bcc);

      files.forEach((file) => {
        formData.append("attachments[]", file);
      });

      await axios.post(
        `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=compose`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Email Sent Successfully 🚀");

      // Reset form
      setTo("");
      setSubject("");
      setCc("");
      setBcc("");
      setFiles([]);
      editorRef.current.setContent("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b text-xl font-semibold">Compose Email</div>

      {/* FORM */}
      <div className="p-6 space-y-4">
        <input
          type="text"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="text"
          placeholder="Cc"
          value={cc}
          onChange={(e) => setCc(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="text"
          placeholder="Bcc"
          value={bcc}
          onChange={(e) => setBcc(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        {/* TinyMCE */}
        <div className="h-[400px]">
          <Editor
            apiKey={TINY_EDITOR_API_KEY}
            onInit={(evt, editor) => (editorRef.current = editor)}
            init={{
              height: 400,
              menubar: true,
              plugins:
                "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount emoticons",
              toolbar:
                "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image | emoticons | code",
            }}
          />
        </div>

        {/* Attachments */}
        <input
          type="file"
          multiple
          onChange={(e) => setFiles([...e.target.files])}
          className="w-full"
        />

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Send size={18} />
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

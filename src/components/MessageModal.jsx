import { motion } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useThreadContext } from "../hooks/useThreadContext";
import { useSelector } from "react-redux";

const MessageModal = ({
  showMessageModal,
  closeMessageModal,
  messageId,
  email,
  threadId,
  viewEmail,
  count,
}) => {
  const [messageContent, setMessageContent] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const { crmEndpoint } = useSelector((s) => s.user);
  const { handleMove } = useThreadContext();
  const [messageMeta, setMessageMeta] = useState({
    subject: "",
    from: "",
    date: "",
    fromEmail: "",
    time: "",
  });

  const cleanHtmlContent = (html) => {
    const cleaned = html
      .replace(/<style[^>]*>.*?<\/style>/gis, "")
      .replace(/<script[^>]*>.*?<\/script>/gis, "")
      .replace(/<!--.*?-->/g, "")
      .trim();

    return cleaned || html;
  };

  useEffect(() => {
    if (!showMessageModal || !messageId) return;

    const fetchMessage = async () => {
      setIsMessageLoading(true);

      try {
        const baseUrl = crmEndpoint.split("?")[0];

        const { data } = await axios.get(
          `${baseUrl}?entryPoint=fetch_gpc&type=view_msg&message_id=${messageId}`,
        );
        console.log("Fetched message data:", data);
        console.log("Fetched message Id:", messageId);
        const htmlBody =
          data.email?.body_html ||
          data.email?.body ||
          data.email?.content ||
          "";

        const subject = data.email?.subject || "No Subject";

        const from = data.email?.from_name || "Unknown Sender";

        const fromEmail = data.email?.from_addr || "";

        const createdDate = data.email?.date_created || "";

        let formattedDate = "";
        let formattedTime = "";

        if (createdDate) {
          const d = new Date(createdDate);

          formattedDate = d.toLocaleDateString();

          formattedTime = d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        setMessageMeta({
          subject,
          from,
          fromEmail,
          date: formattedDate,
          time: formattedTime,
        });

        setMessageContent(
          htmlBody ? cleanHtmlContent(htmlBody) : "No content available",
        );
      } catch (err) {
        setMessageContent("No content available");
      } finally {
        setIsMessageLoading(false);
      }
    };

    fetchMessage();
  }, [showMessageModal, messageId]);

  if (!showMessageModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-md"
      onClick={closeMessageModal}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden shadow-2xl bg-white"
      >
        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleMove({ email, threadId, viewEmail })}
              className="relative rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all p-1"
            >
              <img
                src="https://img.icons8.com/keek/100/new-post.png"
                alt="new-post"
                className="w-8 h-8"
              />

              {count > 0 && (
                <span className="absolute -top-2 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            <div className="flex flex-col leading-tight">
              <h2 className="text-lg font-semibold text-white">
                {messageMeta.from}
              </h2>

              <span className="text-sm text-blue-100">
                {messageMeta.fromEmail}
              </span>

              <span className="text-xs text-blue-200">
                {messageMeta.date} • {messageMeta.time}
              </span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center max-w-xl">
            <h1 className="text-lg font-semibold text-white truncate">
              {messageMeta.subject}
            </h1>
          </div>

          <button
            onClick={closeMessageModal}
            className="p-2 hover:bg-white/20 rounded-full transition hover:rotate-90"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex-1 overflow-y-auto">
          {isMessageLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />

              <p className="text-gray-600 font-medium">
                Loading message content...
              </p>
            </div>
          ) : messageContent ? (
            <div className="w-full max-w-4xl mx-auto rounded-xl border border-white/50 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] shadow-inner p-5">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: messageContent }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={32} className="text-gray-500" />

              <p className="text-gray-500 mt-2">
                This message doesn't contain readable content.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MessageModal;

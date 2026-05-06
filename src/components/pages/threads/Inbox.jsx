import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { FETCH_GPC_X_API_KEY } from "../../../store/constants";
const Inbox = ({
  scrollRef,
  visibleMessages,
  emails,
  firstMessageRef,
  lastMessageRef,
  setOpenMessageId,
  fetchFullMessage,
}) => {
  const { businessEmail } = useSelector((s) => s.user);
  const [openAttachmentsFor, setOpenAttachmentsFor] = useState(null);
  const attachmentBoxRef = useRef(null);
  const downloadAttachment = async (att) => {
    try {
      // dynamic import so you don't even need top-level import
      const axios = (await import("axios")).default;

      const response = await axios.get(att.description, {
        responseType: "blob", // 🔥 required for file download
        headers: {
          "X-Api-Key": FETCH_GPC_X_API_KEY,
        },
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = att.filename || "attachment";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        attachmentBoxRef.current &&
        !attachmentBoxRef.current.contains(e.target)
      ) {
        setOpenAttachmentsFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 space-y-5"
    >
      {visibleMessages?.map((mail, idx) => {
        const isUser = mail.from_email.includes(businessEmail);
        const isFirst = idx === 0;
        const isLast = idx === visibleMessages?.length - 1;

        // ✅ REAL index calculation
        const baseIndex = emails?.length - visibleMessages?.length;
        const realIndex = baseIndex + idx + 1;
        const formatMessage = (html) => {
          if (!html) return "";

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // ✅ 1. Fix already existing <a> tags
          doc.querySelectorAll("a").forEach((a) => {
            const href = a.getAttribute("href");
            if (!href) return;

            // keep original text IF it's meaningful
            const text = a.textContent.trim();

            if (!text || text === href) {
              // if ugly or same as URL → shorten it
              let short = href.replace(/^https?:\/\//, "");
              if (short.length > 50) short = short.slice(0, 50) + "...";
              a.textContent = short;
            }

            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
          });

          // ✅ 2. Convert ONLY plain text URLs (not inside <a>)
          const walk = (node) => {
            if (node.nodeType === 3) {
              const urlRegex = /(https?:\/\/[^\s]+)/g;

              if (urlRegex.test(node.nodeValue)) {
                const span = document.createElement("span");

                span.innerHTML = node.nodeValue.replace(urlRegex, (url) => {
                  let short = url.replace(/^https?:\/\//, "");
                  if (short.length > 50) short = short.slice(0, 50) + "...";

                  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${short}</a>`;
                });

                node.replaceWith(...span.childNodes);
              }
            } else if (node.nodeType === 1 && node.tagName !== "A") {
              node.childNodes.forEach(walk);
            }
          };

          walk(doc.body);

          return doc.body.innerHTML;
        };
        return (
          <motion.div
            key={mail.message_id || idx}
            ref={isFirst ? firstMessageRef : isLast ? lastMessageRef : null}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[70%] p-5 rounded-2xl transition-all duration-300
  ${
    isUser
      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
  }
  ${isLast ? "shadow-2xl scale-[1]" : "shadow-lg"}
`}
            >
              <div className="absolute -top-4 left-4 px-2 py-1 mt-5 ml-0 text-xs font-semibold text-white bg-blue-500 rounded-full shadow-sm">
                {realIndex}
              </div>
              {isLast && (
                <div
                  className={`absolute -inset-1 rounded-3xl blur-2xl opacity-50 -z-10
        ${isUser ? "bg-indigo-500" : "bg-blue-400"}
      `}
                />
              )}
              <div
                className={`mb-4 px-4 py-2 rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm ${
                  isUser
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {/* NAME */}
                <div className="flex items-center gap-2 font-semibold">
                  <User className="w-3.5 h-3.5 opacity-70" />
                  <span>{isUser ? "You" : mail.from_name || "Sender"}</span>
                </div>

                {/* DATE & TIME */}
                <div className="flex flex-col text-right leading-tight">
                  <span
                    className={`${isUser ? "opacity-90" : "text-gray-500"}`}
                  >
                    {mail.date_created}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {mail.date_created_ago}
                  </span>
                </div>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: formatMessage(
                    mail.body_html ? mail.body_html : mail.body,
                  ),
                }}
                className="mail-content text-sm leading-relaxed max-w-full
    overflow-x-auto break-words [&_*]:max-w-full"
              />
              {/* ATTACHMENTS BUTTON */}
              {mail?.attachment?.length > 0 && (
                <button
                  onClick={() =>
                    setOpenAttachmentsFor(
                      openAttachmentsFor === mail.message_id
                        ? null
                        : mail.message_id,
                    )
                  }
                  className="mt-3 flex items-center gap-2 text-xs font-medium
      bg-gray-100 hover:bg-gray-200
      px-3 py-1.5 rounded-lg
      text-gray-700 border border-gray-300"
                >
                  📎 Attachments ({mail.attachment.length})
                </button>
              )}

              {/* ATTACHMENT BOX */}
              {openAttachmentsFor === mail.message_id && (
                <div
                  ref={attachmentBoxRef}
                  className="
      absolute z-30 bottom-14 left-0
      w-72 max-h-64
      bg-white border border-gray-200
      rounded-xl shadow-xl
      p-2
      overflow-y-auto
    "
                >
                  {mail.attachment?.map((att) => (
                    <button
                      key={att.id}
                      onClick={() => downloadAttachment(att)}
                      className="
          w-full flex items-center gap-3
          px-3 py-2
          rounded-lg
          hover:bg-gray-100
          text-left
          transition
          overflow-hidden
        "
                    >
                      <div className="text-xl shrink-0">📄</div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {att.filename}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {att.file_mime_type}
                        </p>
                      </div>

                      <span className="text-xs text-blue-600 font-semibold shrink-0">
                        Download
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* THREE DOT MENU */}
              <button
                onClick={() => {
                  setOpenMessageId(mail.message_id);
                  fetchFullMessage(mail.message_id);
                }}
                className="
    absolute bottom-2 left-2
    z-20
    bg-white
    text-black
    p-1.5
    rounded-full
    shadow-md
    hover:bg-gray-100
  "
                title="View full message"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Inbox;

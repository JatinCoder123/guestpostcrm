
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FETCH_GPC_X_API_KEY } from "../../../store/constants";
import { toast } from "react-toastify";
import NavigationBar from "./NavigationBar";
import IconButton from "../../ui/Buttons/IconButton";
import { EllipsisVertical, User } from "lucide-react";
const STAGE_STYLES = [
  {
    label: "Deal",
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon: "💲",
  },
  {
    label: "Offer",
    wrap: "bg-violet-50 border-violet-200 text-violet-700",
    icon: "📄",
  },
  {
    label: "Order",
    wrap: "bg-blue-50 border-blue-200 text-blue-700",
    icon: "🛒",
  },
  {
    label: "Confirm",
    wrap: "bg-green-50 border-green-200 text-green-700",
    icon: "✓",
  },
  {
    label: "Delivery",
    wrap: "bg-indigo-50 border-indigo-200 text-indigo-700",
    icon: "📦",
  },
  {
    label: "Update",
    wrap: "bg-orange-50 border-orange-200 text-orange-700",
    icon: "↻",
  },
];

const getStageData = (realIndex) => {
  return STAGE_STYLES[(realIndex - 1) % STAGE_STYLES.length];
};

const getInitials = (name = "") => {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
};

const Inbox = ({
  scrollRef,
  visibleMessages,
  emails,
  firstMessageRef,
  lastMessageRef,
  setOpenMessageId,
  fetchFullMessage,
  messageLimit,
  setMessageLimit,
  showReplyPanel,
  setShowReplyPanel,
}) => {
  const { businessEmail } = useSelector((s) => s.user);
  const [openAttachmentsFor, setOpenAttachmentsFor] = useState(null);
  const attachmentBoxRef = useRef(null);

  const downloadAttachment = async (att) => {
    try {
      const axios = (await import("axios")).default;

      const response = await axios.get(att.description, {
        responseType: "blob",
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
      toast.error("Something went wrong while downloading the file");
    }
  };

  const formatMessage = (html) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Fix already existing links
    doc.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const text = a.textContent.trim();

      if (!text || text === href) {
        let short = href.replace(/^https?:\/\//, "");
        if (short.length > 50) short = short.slice(0, 50) + "...";
        a.textContent = short;
      }

      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    // Convert plain text URLs to links
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <NavigationBar
        messageLimit={messageLimit}
        setMessageLimit={setMessageLimit}
        emails={emails}
        scrollRef={scrollRef}
        showReplyPanel={showReplyPanel}
        setShowReplyPanel={setShowReplyPanel}
      />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto bg-[#f3f4f6] px-6 py-5 space-y-6"
      >
        {visibleMessages?.map((mail, idx) => {
          const fromEmail = mail?.from_email?.toLowerCase?.() || "";
          const userEmail = businessEmail?.toLowerCase?.() || "";

          const isUser =
            !!userEmail &&
            (fromEmail === userEmail || fromEmail.includes(userEmail));

          const isFirst = idx === 0;
          const isLast = idx === visibleMessages?.length - 1;

          const baseIndex = emails?.length - visibleMessages?.length;
          const realIndex = baseIndex + idx + 1;

          const stage = getStageData(realIndex);

          return (
            <motion.div
              key={mail.message_id || idx}
              ref={isFirst ? firstMessageRef : isLast ? lastMessageRef : null}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex flex-col gap-4 items-end "
            >
              <div
                className={`relative
w-full sm:w-[85%] 
min-h-[220px] sm:min-h-[240px] md:min-h-[260px]
p-5 rounded-2xl transition-all duration-300
flex flex-col justify-end
  ${isUser
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }
  ${isLast ? "shadow-2xl scale-[1]" : "shadow-lg"}
`}
              >
                <div>
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
                    className={`mb-4 px-4 py-2 rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm ${isUser
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                  >
                    {/* NAME */}
                    <div className="flex items-center gap-2 font-semibold">
                      <User className="w-3.5 h-3.5 opacity-70" />
                      <span>{mail.from_name}</span>
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

                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(
                      mail.body_html ? mail.body_html : mail.body,
                    ),
                  }}
                  className="mail-content text-sm leading-relaxed max-w-full
break-words [&_*]:max-w-full
flex-1
max-h-[140px] sm:max-h-[180px] md:max-h-[220px]
overflow-y-auto overflow-x-auto
pr-2"
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
    </div>
  );
};

export default Inbox;


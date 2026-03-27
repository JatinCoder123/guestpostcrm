import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  SparkleIcon,
  FileText,
  MessageSquare,
  Search,
  Cross,
  Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";
import { getLadger } from "../store/Slices/ladger";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const TimelineEvent = ({ handleMessageClick }) => {
  const { ladger, email, pageCount, pageIndex, loading } = useSelector(
    (state) => state.ladger,
  );
  const [selectedView, setSelectedView] = useState("important");
  const [timelineData, setTimelineData] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [messageData, setMessageData] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (!ladger) return;

    if (selectedView === "all") {
      setTimelineData(ladger);
    } else if (selectedView === "important") {
      const finalData = ladger.filter(
        (item) =>
          !(
            item.parent_type === "outr_snts" &&
            item.type_c !== "First Reply Sent" &&
            item.type_c !== "First Reply Scheduled"
          ),
      );
      setTimelineData(finalData);
    } else if (selectedView === "orderMain") {
      const finalData = ladger.filter(
        (item) =>
          item.parent_type === "outr_order_gp_li" ||
          item.parent_type === "outr_paypal_invoice_links",
      );
      setTimelineData(finalData);
    }
  }, [selectedView, ladger]);

  const navigateTo = useNavigate();

  const getContactIdFromEvent = (event) => {
    if (event.contact_id) {
      return event.contact_id;
    }

    if (event.module === "Contacts" && event.parent_id) {
      return event.parent_id;
    }

    if (event.parent_type === "Contacts" && event.parent_id) {
      return event.parent_id;
    }

    if (event.description || event.subject) {
      const text = (event.description || event.subject).toLowerCase();
      const idMatch = text.match(/id[: ]\s*(\d+)/i);
      if (idMatch) {
        return idMatch[1];
      }
    }

    return null;
  };

  const getReminderFilterType = (eventType) => {
    if (!eventType) return "";

    const type = eventType.toLowerCase();

    const mappings = {
      reply: "Before_Reply_Reminder",
      offer: "Before_Offer_Reminder",
      deal: "Deal_Reminder",
      order: "Order_Reminder",
      invoice: "Invoice_Reminder",
      payment: "Payment_Reminder",
      follow: "Followup_Reminder",
    };

    for (const key in mappings) {
      if (type.includes(key)) {
        return mappings[key];
      }
    }

    return eventType
      .replace(/scheduled|reminder/gi, "")
      .trim()
      .replace(/\s+/g, "_");
  };

  const onEyeClick = (type, event) => {
    if (!type) return;

    const lowerType = type.toLowerCase();
    const contactId = getContactIdFromEvent(event);

    // Handle reminder events
    if (lowerType.includes("scheduled") || lowerType.includes("reminder")) {
      const filterType = getReminderFilterType(type);
      let queryParams = new URLSearchParams();

      // Add filter type if available
      if (filterType) {
        queryParams.append("filter", filterType);
      }

      // Add contact ID if available (for single contact filtering)
      if (contactId) {
        queryParams.append("contact_id", contactId);
      }

      const queryString = queryParams.toString();
      navigateTo(`/reminders/${event.thread_id_c}`, { state: { email } });
      return;
    }
    if (lowerType.includes("contact")) {
      navigateTo("/contacts");

      return;
    }

    // Handle other non-reminder events with contact context
    const routeMap = [
      { key: "invoice", path: "/invoices" },
      { key: "deal", path: "/deals" },
      { key: "order", path: "/orders" },
      { key: "payment", path: "/payments" },
      { key: "offer", path: "/offers" },
    ];

    const matchedRoute = routeMap.find((route) =>
      lowerType.includes(route.key),
    );

    if (matchedRoute) {
      // If we have a contact ID, pass it as query param for filtering
      if (contactId) {
        navigateTo(`${matchedRoute.path}?contact_id=${contactId}`);
      } else {
        navigateTo(matchedRoute.path);
      }
      return;
    }

    // Default fallback
    navigateTo("/");
  };

  // Function to get tooltip text based on event type and contact
  const getTooltipText = (event) => {
    const type = event.type_c || "";
    const contactName = event.contact_name || "";
    const isReminderEvent =
      type.toLowerCase().includes("scheduled") ||
      type.toLowerCase().includes("reminder");

    if (isReminderEvent) {
      const filterType = getReminderFilterType(type);
      const contactText = contactName ? ` for ${contactName}` : "";
      return `View ${type} reminders${contactText}`;
    }

    if (type.toLowerCase().includes("contact")) {
      return contactName ? `View ${contactName}` : "View contact details";
    }

    return event.description || "View details";
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  if (!loading && (!ladger || ladger.length === 0)) {
    return (
      <div className="py-[2%] px-[30%] ">
        <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-2xl text-center text-white">
          TIMELINE
        </h1>
        <p className="text-gray-700 text-sm text-center leading-relaxed mt-2">
          No timeline events found.
        </p>
      </div>
    );
  }
  return (
    <div className="relative">
      <div ref={topRef} className="py-[2%] px-[30%]">
        <h1
          onClick={scrollToTop}
          className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 
             p-2 rounded-2xl text-center text-white
             cursor-pointer hover:opacity-90 transition-opacity"
        >
          TIMELINE
        </h1>

        <div className="flex justify-center mt-6">
          <div className="relative w-[360px]">
            {/* 🔍 SEARCH MODE */}
            {isSearchOpen ? (
              <div className="relative flex items-center bg-white rounded-full shadow-md border border-gray-300 p-4">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search timeline..."
                  className="flex-1 px-3 bg-transparent focus:outline-none text-sm"
                />

                {/* ❌ CLOSE SEARCH */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="relative flex items-center bg-gray-100 rounded-full p-1 shadow-inner w-[360px]">
                {/* 🔍 Search icon (outside pill area) */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-purple-600 transition z-10"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Tabs wrapper (pill only moves here) */}
                <div className="relative flex flex-1 items-center">
                  {/* Sliding pill */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`absolute top-1 left-1 h-[calc(100%-8px)]
        w-[calc(33.333%-4px)]
        rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-md
        ${
          selectedView === "all"
            ? "translate-x-0"
            : selectedView === "important"
              ? "translate-x-full"
              : "translate-x-[200%]"
        }`}
                  />

                  {[
                    { key: "all", label: "All" },
                    { key: "important", label: "Important" },
                    { key: "orderMain", label: "Orders" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedView(tab.key)}
                      className={`relative z-10 flex-1 py-4 text-sm font-semibold rounded-full
          transition-colors duration-300
          ${
            selectedView === tab.key
              ? "text-white"
              : "text-gray-600 hover:text-purple-600"
          }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-6">
          {timelineData?.length > 0 && (
            <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300 rounded-full"></div>
          )}

          <div className="space-y-6">
            {timelineData.map((event, index) => {
              const prevEvent = index > 0 && timelineData[index - 1];

              const showSeparator =
                event.date_entered !== prevEvent?.date_entered && index != 0;
              const type = event.type_c || "";
              const lowerType = type.toLowerCase();
              const isReminderEvent =
                lowerType.includes("scheduled") ||
                lowerType.includes("reminder");
              const isContactEvent = lowerType.includes("contact");
              const filterType = isReminderEvent
                ? getReminderFilterType(type)
                : null;
              const contactId = getContactIdFromEvent(event);
              const hasTemplate =
                event.template_id && event.template_id.trim() !== "";
              const hasMessageContent = event.description || event.subject;
              const hasMessageId = event.message_id_c;

              return (
                <>
                  {showSeparator && (
                    <div className="relative flex gap-0 my-0">
                      <div className="relative z-10 w-16 flex-shrink-0">
                        <div className="w-12 h-12 flex items-center justify-center">
                          <img
                            src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/image__7_-removebg-preview.png"
                            alt="separator"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    key={event.id}
                    className="relative flex items-start gap-4"
                  >
                    <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center mt-3">
                      <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-white shadow-lg">
                        <img
                          width="40"
                          height="40"
                          src={event.icon}
                          alt="icon"
                        />
                      </div>
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 
                                 absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"
                      />
                    </div>
                    <div
                      className={`group flex-1 border-2 rounded-xl p-4 mt-3 shadow-sm relative
                      ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-200 to-white border-yellow-300"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {/* 🔥 HOVER ACTION BAR */}
                      <div
                        className="absolute right-4 top-10 flex gap-3 bg-white border rounded-lg px-3 py-2 shadow-md
             opacity-0 translate-y-1 pointer-events-none
             group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
             transition-all duration-200 z-20"
                      >
                        {/* 👁 VIEW */}
                        <button
                          onClick={() => onEyeClick(type, event)}
                          className="text-blue-600 hover:scale-110"
                        >
                          <Eye size={18} />
                        </button>

                        {/* 💬 MESSAGE */}
                        {event.message_id_c && (
                          <button
                            onClick={() =>
                              handleMessageClick(event.message_id_c)
                            }
                            className="text-purple-600 hover:scale-110"
                          >
                            <MessageSquare size={18} />
                          </button>
                        )}

                        {/* 📄 TEMPLATE */}
                        {event.template_id && (
                          <button
                            onClick={() =>
                              navigateTo("/settings/templates", {
                                state: { templateId: event.template_id },
                              })
                            }
                            className="text-green-600 hover:scale-110"
                          >
                            <FileText size={18} />
                          </button>
                        )}

                        {/* ✨ PROMPT (NO DEBUG REDIRECT NOW) */}
                        {event.prompt_details && (
                          <button
                            onClick={() =>
                              navigateTo("settings/debugging", {
                                state: { prompt: event.prompt_details[0] },
                              })
                            }
                            className="text-yellow-600 hover:scale-110"
                          >
                            <SparkleIcon size={18} />
                          </button>
                        )}
                        {/* Visualization */}
                        {event.visualization && (
                          <button
                            onClick={() => {
                              setActiveVisualization(event.visualization);
                              setShowVisualization(true);
                            }}
                            className="text-blue-600 hover:scale-110"
                          >
                            <Workflow size={18} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 flex items-center gap-2">
                          <div
                            className="relative group cursor-pointer hover:cursor-pointer hover:opacity-90 transition-all duration-300
 "
                          >
                            <div
                              className="absolute left-1/2 -translate-x-1/2 -top-10
                                       whitespace-nowrap px-3 py-1.5 text-xs
                                       bg-gray-900 text-white rounded-md shadow-lg
                                       opacity-0 group-hover:opacity-100
                                       transition-opacity duration-200
                                       pointer-events-none z-50"
                            >
                              {getTooltipText(event)}

                              {isReminderEvent && filterType && (
                                <div className="text-xs text-gray-300 mt-1">
                                  Filter: {filterType.replace(/_/g, " ")}
                                  {contactId && " • Single Contact"}
                                </div>
                              )}

                              {isContactEvent && contactId && (
                                <div className="text-xs text-gray-300 mt-1">
                                  Single Contact View
                                </div>
                              )}

                              <div
                                className="absolute left-1/2 -translate-x-1/2 top-full
                                         w-2 h-2 bg-gray-900 rotate-45"
                              />
                            </div>
                          </div>

                          <span className="font-medium">
                            {type
                              ? type.charAt(0).toUpperCase() + type.slice(1)
                              : "Event"}
                          </span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">
                            {event.date_entered}
                          </span>
                        </div>
                      </div>

                      {/* Additional info about the event */}
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        {event.assigned_user_name && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {event.assigned_user_name}
                          </span>
                        )}

                        {event.module && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {event.module}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
            {activeVisualization && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                <div className="bg-white w-[1200px] max-w-[1200px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
                  {/* Close */}
                  <button
                    onClick={() => setActiveVisualization(null)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
                  >
                    ✕
                  </button>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    Process Visualization
                  </h2>

                  {/* Steps */}
                  <div className="flex flex-col gap-2">
                    {activeVisualization?.map((step, index) => {
                      const colors = [
                        { card: "bg-[#1a73c8]", num: "bg-[#155eaa]" },
                        { card: "bg-[#e07020]", num: "bg-[#c25e10]" },
                        { card: "bg-[#3a9e3a]", num: "bg-[#2e852e]" },
                      ];
                      const arrowColors = ["#e07020", "#3a9e3a", "#888888"];
                      const color = colors[index % colors.length];

                      return (
                        <div key={step.id}>
                          {/* Step Card */}
                          <div
                            className={`flex items-stretch rounded-xl overflow-hidden ${color.card}`}
                          >
                            {/* Number Circle */}
                            <div
                              className={`w-[72px] min-w-[72px] flex items-center justify-center ${color.num}`}
                            >
                              <span className="w-[50px] h-[50px] rounded-full border-2 border-white/60 flex items-center justify-center text-white text-2xl font-medium">
                                {step.process_no}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 px-5 py-3">
                              <p className="text-white text-xl font-medium mb-1">
                                <strong>{step.name?.split(":")[0]}</strong>
                                {step.name?.includes(":") && (
                                  <span className="font-normal">
                                    {" "}
                                    :{" "}
                                    {step.name
                                      .split(":")
                                      .slice(1)
                                      .join(":")
                                      .trim()}
                                  </span>
                                )}
                              </p>
                              {(() => {
                                const text =
                                  step.description
                                    ?.replace(/<[^>]*>/g, "")
                                    .trim() || "No description available";
                                const words = text.split(/\s+/);
                                const preview =
                                  words.length > 50
                                    ? words.slice(0, 50).join(" ") + "..."
                                    : text;

                                return (
                                  <p
                                    title={text}
                                    className="text-white/90 text-sm leading-relaxed cursor-default"
                                  >
                                    {preview}
                                  </p>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Arrow between steps */}
                          {index < activeVisualization.length - 1 && (
                            <div className="flex justify-center my-1">
                              <svg width="32" height="28" viewBox="0 0 32 28">
                                <polygon
                                  points="4,0 28,0 16,28"
                                  fill={arrowColors[index % arrowColors.length]}
                                  opacity="0.85"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {timelineData?.length > 0 && (
        <Pagination
          slice={"ladger"}
          fn={(p) => dispatch(getLadger({ page: p, loading: false }))}
        />
      )}
      {timelineData?.length > 8 && (
        <div className="absolute right-4 bottom-6 flex flex-col gap-3 z-50">
          {/* Go to Top */}
          <button
            onClick={scrollToTop}
            className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 
                 text-white shadow-xl flex items-center justify-center 
                 hover:scale-110 transition-all duration-300"
          >
            ↑
          </button>

          {/* Go to Bottom */}
          <button
            onClick={scrollToBottom}
            className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 
                 text-white shadow-xl flex items-center justify-center 
                 hover:scale-110 transition-all duration-300"
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineEvent;

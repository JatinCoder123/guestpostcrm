import { useDispatch, useSelector } from "react-redux";
import { Eye, SparkleIcon, FileText, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";
import { getLadger } from "../store/Slices/ladger";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { CREATE_DEAL_API_KEY, TINY_EDITOR_API_KEY } from "../store/constants";

const TimelineEvent = () => {
  const { ladger, email } = useSelector((state) => state.ladger);
  const { crmEndpoint } = useSelector((state) => state.user);
  const [selectedView, setSelectedView] = useState("important");
  const [timelineData, setTimelineData] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateContent, setTemplateContent] = useState("");
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messageMeta, setMessageMeta] = useState({
    subject: "",
    from: "",
    date: "",
    fromEmail: "",
    time: ""
  });


  const [originalTemplateContent, setOriginalTemplateContent] = useState("");
  const [isTemplateChanged, setIsTemplateChanged] = useState(false);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);

  useEffect(() => {
    setIsTemplateChanged(templateContent !== originalTemplateContent);
  }, [templateContent, originalTemplateContent]);



  const topRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedView === "all") {
      setTimelineData(ladger);
    }
    if (selectedView === "important") {
      const finalData = ladger.filter(
        (item) =>
          !(
            item.parent_type === "outr_snts" &&
            item.type_c !== "First Reply Sent" &&
            item.type_c !== "First Reply Scheduled"
          ),
      );
      setTimelineData(finalData);
    }
    if (selectedView === "orderMain") {
      const finalData = ladger.filter(
        (item) =>
          item.parent_type == "outr_order_gp_li" || // Orders
          item.parent_type == "outr_paypal_invoice_links", // PayPal Invoices
      );
      setTimelineData(finalData);
      return;
    }
  }, [selectedView]);
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


  const handleMessageClick = async (event) => {

    if (!event.message_id_c) return;

    // ✅ open modal FIRST
    setShowMessageModal(true);

    // ✅ show loader INSIDE MODAL
    setIsMessageLoading(true);

    try {

      const baseUrl = crmEndpoint.split("?")[0];

      const response = await fetch(
        `${baseUrl}?entryPoint=fetch_gpc&type=view_msg&message_id=${event.message_id_c}`
      );

      const result = await response.json();

      const htmlBody =
        result.email?.html_body ||
        result.email?.body_html ||
        result.email?.content ||
        result.html_body ||
        "";

      const subject =
        result.email?.subject ||
        event.subject ||
        "No Subject";

      const from =
        result.email?.from_name ||
        result.email?.from_addr ||
        "Unknown Sender";

      const fromEmail =
        result.email?.from_addr ||
        result.email?.from_email ||
        "";

      const createdDate = result.email?.date_created || "";

      let formattedDate = "";
      let formattedTime = "";

      if (createdDate) {
        const d = new Date(createdDate);
        formattedDate = d.toLocaleDateString();
        formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      setMessageMeta({
        subject,
        from,
        fromEmail,
        date: formattedDate,
        time: formattedTime
      });


      setMessageContent(
        htmlBody
          ? cleanHtmlContent(htmlBody)
          : event.description || event.subject || "No content available"
      );

    } catch (err) {

      setMessageContent(
        event.description || event.subject || "No content available"
      );

    } finally {
      setIsMessageLoading(false);
    }
  };


  // Function to clean HTML content
  const cleanHtmlContent = (html) => {
    // Basic HTML cleanup
    const cleaned = html
      .replace(/<style[^>]*>.*?<\/style>/gsi, '') // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gsi, '') // Remove script tags
      .replace(/<!--.*?-->/g, '') // Remove comments
      .trim();

    return cleaned || html;
  };

  // Function to close message modal
  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageContent("");
    setSelectedMessageId(null);
  };

  // Function to handle template icon click
  const handleTemplateClick = async (templateId, event) => {
    if (!templateId || templateId.trim() === "") return;

    setLoadingTemplate(true);
    setSelectedTemplate({
      id: templateId,
      eventData: event,
    });

    try {
      // Fetch the email template from EmailTemplates module
      const response = await fetch(
        `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
        {
          method: "POST",
          headers: {
            "x-api-key": CREATE_DEAL_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            module: "EmailTemplates",
            id: templateId,
          }),
        },
      );

      const responseText = await response.text();
      let result;

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        result = {};
      }

      if (response.ok) {
        // Check different response structures
        let templateData;

        if (Array.isArray(result)) {
          // If result is an array, find the template with matching ID
          templateData = result.find((t) => t.id === templateId);
        } else if (result.data && Array.isArray(result.data)) {
          templateData = result.data.find((t) => t.id === templateId);
        } else if (result.parent_bean) {
          templateData = result.parent_bean;
        } else {
          templateData = result;
        }

        if (templateData && templateData.body_html) {
          setTemplateData(templateData);
          const content = templateData.body_html || "";

          setTemplateData(templateData);
          setTemplateContent(content);
          setOriginalTemplateContent(content); // ⭐ IMPORTANT
          setIsTemplateChanged(false);
          setShowTemplateModal(true);

          setShowTemplateModal(true);
        } else {
          throw new Error("Template content not found");
        }
      } else {
        throw new Error(
          `Failed to fetch template: ${result.error || result.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error fetching template:", error);

      // Fallback: Create a simple template data object
      setTemplateData({
        id: templateId,
        name: "Template Preview",
        body_html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Template Preview</h2>
            <p>Template ID: ${templateId}</p>
            <p><strong>Event Type:</strong> ${event.type_c || "N/A"}</p>
            <p><strong>Subject:</strong> ${event.subject_c || event.subject || "N/A"}</p>
            <p><strong>Contact:</strong> ${event.name || "N/A"}</p>
            <p>Error loading template: ${error.message}</p>
          </div>
        `,
      });
      setTemplateContent(`
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>Template Preview</h2>
          <p>Template ID: ${templateId}</p>
          <p><strong>Event Type:</strong> ${event.type_c || "N/A"}</p>
          <p><strong>Subject:</strong> ${event.subject_c || event.subject || "N/A"}</p>
          <p><strong>Contact:</strong> ${event.name || "N/A"}</p>
          <p>Error loading template: ${error.message}</p>
        </div>
      `);
      setShowTemplateModal(true);
    } finally {
      setLoadingTemplate(false);
    }
  };


  // for save by kjl
  const handleTemplateSave = async () => {

    if (!templateData?.id) return;
    if (!isTemplateChanged) return;
    if (isTemplateSaving) return;

    setIsTemplateSaving(true);

    try {

      const requestBody = {
        parent_bean: {
          module: "EmailTemplates",
          id: templateData.id,
          body_html: templateContent,
          name: templateData.name,
          description: templateData.description || "",
          subject: templateData.subject || "",
          type: templateData.type || "",
        },
      };

      const response = await fetch(
        `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=post_data`,
        {
          method: "POST",
          headers: {
            "x-api-key": CREATE_DEAL_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to update template");
      }

      // ✅ Mark as saved
      setOriginalTemplateContent(templateContent);
      setIsTemplateChanged(false);

      alert("✅ Template updated successfully!");

    } catch (err) {

      alert("❌ Save failed — changes are still unsaved.");
      console.error(err);

    } finally {
      setIsTemplateSaving(false);
    }
  };





  // Function to close template modal
  const closeTemplateModal = () => {

    if (isTemplateChanged) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Close anyway?"
      );

      if (!confirmClose) return;
    }

    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setTemplateData(null);
    setTemplateContent("");
    setOriginalTemplateContent("");
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

  return (
    <>
      <style jsx>{`
        .message-content h1,
        .message-content h2,
        .message-content h3,
        .message-content h4 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
          color: #1f2937;
        }
        
        .message-content p {
          margin-bottom: 1em;
        }
        
        .message-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .message-content a:hover {
          color: #2563eb;
        }
        
        .message-content ul,
        .message-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .message-content li {
          margin-bottom: 0.5em;
        }
        
        .message-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        
        .message-content table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1em;
        }
        
        .message-content table th,
        .message-content table td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }
        
        .message-content table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .message-content blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding-left: 1em;
          color: #6b7280;
          font-style: italic;
        }
        
        .message-content code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }
        
        .message-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .message-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        
        .message-content .cta {
          margin: 20px 0;
        }
        
        .message-content .emoticon {
          display: inline-block;
          vertical-align: middle;
          width: 20px;
          height: 20px;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        
        }
        
        .message-icon-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .modal-backdrop {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        .message-modal {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        
        .message-content-container {
          background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
        }
      `}</style>

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
          <div className="relative flex bg-gray-100 rounded-full p-1 w-[360px] shadow-inner">
            {/* Sliding pill */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(33.333%-4px)]
        rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-md
        ${selectedView === "all"
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
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full
          transition-colors duration-300 hover:cursor-pointer hover:opacity-90 transition

          ${selectedView === tab.key
                    ? "text-white"
                    : "text-gray-600 hover:text-purple-600"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-6">
          {timelineData?.length > 0 && (
            <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300 rounded-full"></div>
          )}

          <div className="space-y-6">
            {timelineData.map((event, index) => {
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
              const hasTemplate = event.template_id && event.template_id.trim() !== "";
              const hasMessageContent = event.description || event.subject;
              const hasMessageId = event.message_id_c;

              return (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center mt-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-white shadow-lg">
                      <img width="40" height="40" src={event.icon} alt="icon" />
                    </div>
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 
                                 absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"
                    />
                  </div>
                  <div
                    className={`flex-1 border-2 rounded-xl p-4 mt-3 shadow-sm
                      ${index === 0
                        ? "bg-gradient-to-r from-yellow-200 to-white border-yellow-300"
                        : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 flex items-center gap-2">
                        <div
                          className="relative group cursor-pointer hover:cursor-pointer hover:opacity-90 transition-all duration-300
 "
                          onClick={() => onEyeClick(type, event)}
                        >
                          <Eye
                            size={20}
                            className={`transition-transform duration-200 group-hover:scale-110 hover:cursor-pointer hover:opacity-90 transition-all duration-300

                              ${isReminderEvent
                                ? "text-purple-600"
                                : isContactEvent
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                          />

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

                        {hasMessageId && (
                          <button
                            onClick={() => handleMessageClick(event)}
                            className="text-blue-600 hover:text-blue-700 hover:cursor-pointer hover:opacity-90 transition-all duration-300
 relative group message-icon-pulse"
                            title="View Message"
                            disabled={isMessageLoading === event.message_id_c}
                          >
                            {isMessageLoading === event.message_id_c ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            ) : (<MessageSquare />
                            )}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-8
                                          whitespace-nowrap px-2 py-1 text-xs
                                          bg-gray-900 text-white rounded-md
                                          opacity-0 group-hover:opacity-100
                                          transition-opacity duration-200
                                          pointer-events-none z-50">
                              View Message
                              <div className="absolute left-1/2 -translate-x-1/2 top-full
                                            w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          </button>
                        )}

                        {/* Template Icon - Only show if template_id exists */}
                        {hasTemplate && (
                          <button
                            onClick={() => handleTemplateClick(event.template_id, event)}
                            className="text-green-600 hover:text-green-700 cursor-pointer relative group"
                            title={`Preview Template: ${event.template_id}`}
                            disabled={
                              loadingTemplate &&
                              selectedTemplate?.id === event.template_id
                            }
                          >



                            <FileText size={20} />
                            {loadingTemplate &&
                              selectedTemplate?.id === event.template_id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}

                            <div
                              className="absolute left-1/2 -translate-x-1/2 -top-8
                                        whitespace-nowrap px-2 py-1 text-xs
                                        bg-gray-900 text-white rounded-md
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity duration-200
                                        pointer-events-none z-50"
                            >
                              Preview Template
                              <div
                                className="absolute left-1/2 -translate-x-1/2 top-full
                                          w-2 h-2 bg-gray-900 rotate-45"
                              />
                            </div>
                          </button>
                        )}

                        {event.prompt_id.trim() !== "" &&
                          event.prompt_id.toLowerCase() !== "na" && (
                            <button
                              onClick={() =>
                                navigateTo("/settings/machine-learning", {
                                  state: { promptId: event.prompt_id },
                                })
                              }
                              className="text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              <SparkleIcon size={20} />
                            </button>
                          )}
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
              );
            })}
            {timelineData?.length === 0 ? (
              <div className="text-center text-gray-500">No events found</div>
            ) : (
              <div className="relative flex gap-4 mt-6">
                <div className="relative z-10 w-16 flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/image__7_-removebg-preview.png"
                      alt="end"
                    />
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

       {/* Attractive Message Content Modal - CENTERED AND BEAUTIFUL */}
     {showMessageModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop"
    onClick={closeMessageModal}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300
      }}
      className="message-modal rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* ✅ HEADER (FIXED) */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
        
        <div className="flex items-center gap-3">
          <MessageSquare size={24} className="text-white" />

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

        {/* SUBJECT CENTER */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-xl">
          <h1 className="text-lg font-semibold text-white truncate">
            {messageMeta.subject}
          </h1>
        </div>

        <button
          onClick={closeMessageModal}
          className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90 cursor-pointer"
          title="Close"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* ✅ SCROLLABLE BODY */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex-1 overflow-y-auto">
        
        {isMessageLoading ? (

          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading message content...
            </p>
          </div>

        ) : messageContent ? (

          <div className="message-content-container w-full max-w-4xl mx-auto">
            <div
              className="message-content"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: "15px",
                lineHeight: "1.8",
                color: "#2d3748",
                padding:"20px"
              }}
              dangerouslySetInnerHTML={{ __html: messageContent }}
            />
          </div>

        ) : (

          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
              <MessageSquare size={32} className="text-gray-500" />
            </div>

            <p className="text-gray-600 text-lg font-medium">
              No message content available
            </p>

            <p className="text-gray-500 mt-2">
              This message doesn't contain any readable content.
            </p>
          </div>

        )}
      </div>
    </motion.div>
  </div>
)}


      {/* Template Modal */}
      {showTemplateModal && templateData && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 hover:cursor-pointer hover:opacity-90 transition-all duration-300
"
          onClick={closeTemplateModal}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden hover:cursor-pointer hover:opacity-90 transition-all duration-300
"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">

              <h2 className="text-2xl font-bold">
                {templateData.name || "Template Editor"}
              </h2>

              <div className="flex gap-3">

                <button
                  onClick={handleTemplateSave}
                  disabled={!isTemplateChanged || isTemplateSaving}
                  className={`px-4 py-2 rounded-lg font-medium transition hover:cursor-pointer hover:opacity-90 transition-all duration-300
 ${!isTemplateChanged || isTemplateSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {isTemplateSaving ? "Saving..." : "Save"}
                </button>

                {isTemplateChanged && (
                  <button
                    onClick={() => setTemplateContent(originalTemplateContent)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg hover:cursor-pointer hover:opacity-90 transition-all duration-300
"
                  >
                    Cancel
                  </button>
                )}

                <button
                  onClick={closeTemplateModal}
                  className="p-2 hover:bg-white/20 rounded-full transition hover:cursor-pointer hover:opacity-90 transition-all duration-300
"
                >
                  <X size={28} />
                </button>

              </div>
            </div>


            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              <Editor
                apiKey={TINY_EDITOR_API_KEY}
                value={templateContent}
                onEditorChange={setTemplateContent}
                init={{
                  height: "100%",
                  menubar: false,
                  plugins:
                    "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount advlist code help emoticons",
                  toolbar:
                    "undo redo | formatselect | bold italic underline strikethrough | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | link image media | \
                    preview fullscreen | code emoticons",
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
                  // readonly: true
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default TimelineEvent;
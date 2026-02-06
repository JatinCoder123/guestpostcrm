import { useDispatch, useSelector } from "react-redux";
import { Eye, SparkleIcon, FileText } from "lucide-react";
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
          setTemplateContent(templateData.body_html || "");
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

  // Function to close template modal
  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setTemplateData(null);
    setTemplateContent("");
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
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full
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
              const hasTemplate =
                event.template_id && event.template_id.trim() !== "";

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
                      ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-200 to-white border-yellow-300"
                          : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 flex items-center gap-2">
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => onEyeClick(type, event)}
                        >
                          <Eye
                            size={20}
                            className={`transition-transform duration-200 group-hover:scale-110
                              ${
                                isReminderEvent
                                  ? "text-purple-600"
                                  : isContactEvent
                                    ? "text-green-600"
                                    : "text-blue-600"
                              }`}
                          />

                          {/* Tooltip */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -top-10
                                       whitespace-nowrap px-3 py-1.5 text-xs
                                       bg-gray-900 text-white rounded-md shadow-lg
                                       opacity-0 group-hover:opacity-100
                                       transition-opacity duration-200
                                       pointer-events-none z-50"
                          >
                            {getTooltipText(event)}

                            {/* Show filter info for reminders */}
                            {isReminderEvent && filterType && (
                              <div className="text-xs text-gray-300 mt-1">
                                Filter: {filterType.replace(/_/g, " ")}
                                {contactId && " • Single Contact"}
                              </div>
                            )}

                            {/* Show contact info for contact events */}
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
                        {/* Template Icon - Only show if template_id exists */}
                        {hasTemplate && (
                          <button
                            onClick={() =>
                              handleTemplateClick(event.template_id, event)
                            }
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

                            {/* Tooltip for template */}
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

                    {/* Event subject */}
                    {event.subject && (
                      <div className="text-sm text-gray-600">
                        {event.subject}
                      </div>
                    )}

                    {/* Show contact name if available */}
                    {event.contact_name && (
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Contact:</span>{" "}
                        {event.contact_name}
                      </div>
                    )}

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

      {/* Template Modal */}
      {showTemplateModal && templateData && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeTemplateModal}
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
                <h2 className="text-2xl font-bold">
                  {templateData.name || "Template Preview"}
                </h2>
              </div>

              <button
                onClick={closeTemplateModal}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={28} />
              </button>
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
                  readonly: true, // Make it read-only for viewing only
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

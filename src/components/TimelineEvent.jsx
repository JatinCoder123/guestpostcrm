import React from "react";
import Pagination from "./Pagination";
import { getLadgerEmail } from "../store/Slices/ladger";
import { useSelector } from "react-redux";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TimelineEvent = () => {
  const { ladger } = useSelector((state) => state.ladger);
  const navigateTo = useNavigate();

  // Function to extract contact ID from event data
  const getContactIdFromEvent = (event) => {
    // Check if event has contact_id directly
    if (event.contact_id) {
      return event.contact_id;
    }
    
    // Check if parent_id might be contact ID (when module is Contacts)
    if (event.module === "Contacts" && event.parent_id) {
      return event.parent_id;
    }
    
    // Check if there's a parent_type contact with parent_id
    if (event.parent_type === "Contacts" && event.parent_id) {
      return event.parent_id;
    }
    
    // Try to extract from description or subject
    if (event.description || event.subject) {
      const text = (event.description || event.subject).toLowerCase();
      // Look for patterns like "Contact: John Doe (ID: 123)"
      const idMatch = text.match(/id[: ]\s*(\d+)/i);
      if (idMatch) {
        return idMatch[1];
      }
    }
    
    return null;
  };

  // Function to map timeline event types to reminder filter types
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
      follow: "Followup_Reminder"
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
        queryParams.append('filter', filterType);
      }
      
      // Add contact ID if available (for single contact filtering)
      if (contactId) {
        queryParams.append('contact_id', contactId);
      }
      
      const queryString = queryParams.toString();
      navigateTo(`/reminders${queryString ? `?${queryString}` : ''}`);
      return;
    }

    // Handle contact events - navigate to single contact view
    if (lowerType.includes("contact")) {
      if (contactId) {
        // Navigate to single contact view
        navigateTo(`/contacts/${contactId}`);
      } else {
        // Fallback to contacts list if no ID
        navigateTo('/contacts');
      }
      return;
    }

    // Handle other non-reminder events with contact context
    const routeMap = [
      { key: "invoice", path: "/invoices" },
      { key: "deal", path: "/deals" },
      { key: "order", path: "/orders" },
      { key: "payment", path: "/payments" },
      { key: "offer", path: "/offers" }
    ];

    const matchedRoute = routeMap.find(route =>
      lowerType.includes(route.key)
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

  // Function to get appropriate icon based on event type
  const getEventIcon = (eventType) => {
    if (!eventType) return "https://img.icons8.com/bubbles/100/new-post.png";
    
    const typeLower = eventType.toLowerCase();
    
    if (typeLower.includes("contact")) {
      return "https://img.icons8.com/color/96/contacts.png";
    }
    if (typeLower.includes("invoice")) {
      return "https://example.guestpostcrm.com/gp_icons/Invoices.png";
    }
    if (typeLower.includes("reminder") || typeLower.includes("scheduled")) {
      if (typeLower.includes("reply")) {
        return "https://example.guestpostcrm.com/gp_icons/offer.png";
      }
      if (typeLower.includes("offer")) {
        return "https://example.guestpostcrm.com/gp_icons/offer.png";
      }
      if (typeLower.includes("deal")) {
        return "https://example.guestpostcrm.com/gp_icons/deal.png";
      }
      if (typeLower.includes("order")) {
        return "https://example.guestpostcrm.com/gp_icons/order.png";
      }
      if (typeLower.includes("payment")) {
        return "https://img.icons8.com/color/96/money-transfer.png";
      }
      if (typeLower.includes("follow")) {
        return "https://img.icons8.com/color/96/follow.png";
      }
      return "https://img.icons8.com/color/96/alarm-clock.png";
    }
    return "https://img.icons8.com/bubbles/100/new-post.png";
  };

  // Function to get tooltip text based on event type and contact
  const getTooltipText = (event) => {
    const type = event.type_c || "";
    const contactName = event.contact_name || "";
    const isReminderEvent = type.toLowerCase().includes("scheduled") || 
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

  return (
    <>
      <div className="py-[2%] px-[30%]">
        <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-2xl text-center text-white">
          TIMELINE
        </h1>

        <div className="relative mt-6">
          <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300 rounded-full"></div>

          <div className="space-y-6">
            {ladger.map((event, index) => {
              const type = event.type_c || "";
              const lowerType = type.toLowerCase();
              const isReminderEvent = lowerType.includes("scheduled") || 
                                     lowerType.includes("reminder");
              const isContactEvent = lowerType.includes("contact");
              const filterType = isReminderEvent ? getReminderFilterType(type) : null;
              const contactId = getContactIdFromEvent(event);
              
              return (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center mt-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-white shadow-lg">
                      <img
                        width="40"
                        height="40"
                        src={getEventIcon(type)}
                        alt="icon"
                      />
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
                          className="relative group cursor-pointer"
                          onClick={() => onEyeClick(type, event)}
                        >
                          <Eye
                            size={20}
                            className={`transition-transform duration-200 group-hover:scale-110
                              ${isReminderEvent ? 'text-purple-600' : 
                                isContactEvent ? 'text-green-600' : 'text-blue-600'}`}
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
                                Filter: {filterType.replace(/_/g, ' ')}
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

                      <span className="text-gray-500 text-sm">
                        {event.date_entered}
                      </span>
                    </div>

                    {/* Event subject */}
                    {event.subject && (
                      <div className="text-sm text-gray-600">{event.subject}</div>
                    )}
                    
                    {/* Show contact name if available */}
                    {event.contact_name && (
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Contact:</span> {event.contact_name}
                      </div>
                    )}
                    
                    {/* Additional info about the event */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      {event.assigned_user_name && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {event.assigned_user_name}
                        </span>
                      )}
                      
                      {event.module && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          {event.module}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

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
          </div>
        </div>
      </div>

      <Pagination slice={"ladger"} fn={getLadgerEmail} />
    </>
  );
};

export default TimelineEvent;
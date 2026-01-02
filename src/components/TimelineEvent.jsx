import React from "react";
import Pagination from "./Pagination";
import { getLadgerEmail } from "../store/Slices/ladger";
import { useSelector } from "react-redux";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TimelineEvent = () => {
  const { ladger } = useSelector((state) => state.ladger);
  const navigateTo = useNavigate();

  // Function to map timeline event types to reminder filter types
  const getReminderFilterType = (eventType) => {
    if (!eventType) return "";
    
    const eventTypeLower = eventType.toLowerCase();
    console.log("Mapping event type:", eventType);
    
    // First, extract the base type before "Scheduled" or "Reminder"
    let baseType = eventType;
    
    // Remove "Scheduled" from the end
    if (eventTypeLower.includes("scheduled")) {
      baseType = eventType.replace(/scheduled/gi, "").trim();
    }
    
    // Remove "Reminder" from the end
    if (eventTypeLower.includes("reminder")) {
      baseType = eventType.replace(/reminder/gi, "").trim();
    }
    
    // Map common timeline event types to reminder filter types
    const typeMappings = {
      // Before Reply variants
      'before reply': 'Before_Reply_Reminder',
      'reply': 'Before_Reply_Reminder',
      
      // Before Offer variants
      'before offer': 'Before_Offer_Reminder',
      'offer': 'Before_Offer_Reminder',
      
      // Deal variants
      'deal': 'Deal_Reminder',
      
      // Order variants
      'order': 'Order_Reminder',
      
      // Invoice variants
      'invoice': 'Invoice_Reminder',
      
      // Payment variants
      'payment': 'Payment_Reminder',
      'payment due': 'Payment_Reminder',
      
      // Followup variants
      'followup': 'Followup_Reminder',
      'follow up': 'Followup_Reminder',
    };
    
    // Check for exact matches in mappings
    for (const [key, value] of Object.entries(typeMappings)) {
      if (baseType.toLowerCase().includes(key) || eventTypeLower.includes(key)) {
        console.log("Matched mapping:", key, "->", value);
        return value;
      }
    }
    
    // Special case for "Before Reply Reminder-scheduled" or similar patterns
    if (eventTypeLower.includes("before") && eventTypeLower.includes("reply")) {
      console.log("Special case: Before Reply -> Before_Reply_Reminder");
      return "Before_Reply_Reminder";
    }
    
    if (eventTypeLower.includes("before") && eventTypeLower.includes("offer")) {
      console.log("Special case: Before Offer -> Before_Offer_Reminder");
      return "Before_Offer_Reminder";
    }
    
    // Default: convert to underscore format, preserving the original
    const filterType = eventType
      .replace(/\s+/g, '_')
      .replace(/-/g, '_')
      .replace(/\s*-\s*/g, '_')  // Handle dash with spaces
      .replace(/[^a-zA-Z0-9_]/g, '')  // Remove special characters
      .replace(/_+/g, '_')  // Remove multiple underscores
      .trim();
    
    console.log("Default conversion result:", filterType);
    return filterType;
  };

  const onEyeClick = (type) => {
    if (!type) return;
    
    console.log("Eye clicked on type:", type);
    
    if (type.includes("Contact")) {
      console.log("Navigating to contacts");
      navigateTo(`/contacts`);
    } 
    else if (type.includes("Invoice")) {
      console.log("Navigating to invoices");
      navigateTo(`/invoices`);
    }
    else if (type.includes("Scheduled") || type.includes("Reminder")) {
      // Get the filter type for reminders
      const filterType = getReminderFilterType(type);
      console.log("Filter type determined:", filterType);
      
      // Navigate to reminders with filter parameter
      if (filterType) {
        navigateTo(`/reminders?filter=${encodeURIComponent(filterType)}`);
        console.log("Navigating to reminders with filter:", filterType);
      } else {
        navigateTo(`/reminders`);
        console.log("Navigating to reminders without filter");
      }
    } else {
      console.log("Unknown type, navigating to home");
      navigateTo(`/`);
    }
  };

  // Function to get appropriate icon based on event type
  const getEventIcon = (eventType) => {
    if (!eventType) return "https://img.icons8.com/bubbles/100/new-post.png";
    
    const typeLower = eventType.toLowerCase();
    
    if (typeLower.includes("contact")) {
      return "https://img.icons8.com/color/96/contacts.png";
    }
    if (typeLower.includes("invoice")) {
      return "https://img.icons8.com/color/96/invoice.png";
    }
    if (typeLower.includes("reminder") || typeLower.includes("scheduled")) {
      if (typeLower.includes("reply")) {
        return "https://img.icons8.com/color/96/reply-arrow.png";
      }
      if (typeLower.includes("offer")) {
        return "https://img.icons8.com/color/96/offer.png";
      }
      if (typeLower.includes("deal")) {
        return "https://img.icons8.com/color/96/handshake.png";
      }
      if (typeLower.includes("order")) {
        return "https://img.icons8.com/color/96/purchase-order.png";
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

  return (
    <>
      {/* TIMELINE EVENTS */}
      <div className="py-[2%] px-[30%]">
        <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-2xl text-center text-white">
          TIMELINE
        </h1>

        <div className="relative mt-6">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300 rounded-full"></div>

          <div className="space-y-6">
            {ladger.map((event, index) => {
              // Determine if this is a reminder type event
              const isReminderEvent = event.type_c && 
                (event.type_c.includes("Scheduled") || 
                 event.type_c.includes("Reminder"));
              
              // Get the filter type for tooltip
              const filterType = isReminderEvent ? getReminderFilterType(event.type_c) : null;
              
              return (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* ICON */}
                  <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center mt-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-white shadow-lg">
                      <img
                        width="40"
                        height="40"
                        src={getEventIcon(event.type_c)}
                        alt="icon"
                      />
                    </div>

                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 
                                 absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"
                    />
                  </div>

                  {/* CARD */}
                  <div
                    className={`flex-1 border-2 rounded-xl p-4 mt-3 shadow-sm
                    ${index === 0
                        ? "bg-gradient-to-r from-yellow-200 to-white border-yellow-300"
                        : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 flex items-center gap-2">
                        {/* EYE WITH TOOLTIP */}
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => onEyeClick(event.type_c)}
                        >
                          <Eye
                            size={20}
                            className={`transition-transform duration-200 group-hover:scale-110
                              ${isReminderEvent ? 'text-purple-600' : 'text-blue-600'}`}
                          />

                          {/* TOOLTIP */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -top-10
                                       whitespace-nowrap px-3 py-1.5 text-xs
                                       bg-gray-900 text-white rounded-md shadow-lg
                                       opacity-0 group-hover:opacity-100
                                       transition-opacity duration-200
                                       pointer-events-none z-50"
                          >
                            {isReminderEvent 
                              ? `View ${event.type_c} reminders` 
                              : event.description || "View details"
                            }
                            
                            {isReminderEvent && filterType && (
                              <div className="text-xs text-gray-300 mt-1">
                                Filter: {filterType.replace(/_/g, ' ')}
                              </div>
                            )}

                            {/* ARROW */}
                            <div
                              className="absolute left-1/2 -translate-x-1/2 top-full
                                         w-2 h-2 bg-gray-900 rotate-45"
                            />
                          </div>
                        </div>

                        <span className="font-medium">
                          {event.type_c
                            ? event.type_c.charAt(0).toUpperCase() +
                            event.type_c.slice(1)
                            : "Event"}
                        </span>
                      </span>

                      <span className="text-gray-500 text-sm">
                        {event.date_entered}
                      </span>
                    </div>

                    {/* SUBJECT / DESCRIPTION */}
                    {event.subject && (
                      <div className="text-sm text-gray-600">{event.subject}</div>
                    )}
                    
                    {/* Reminder type hint */}
                    {isReminderEvent && (
                      <div className="mt-2 text-xs text-purple-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V7z" clipRule="evenodd" />
                        </svg>
                        Click to view all {event.type_c} reminders
                        {filterType && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            Filter: {filterType.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Event metadata */}
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

            {/* END ICON */}
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

      {/* PAGINATION */}
      <Pagination slice={"ladger"} fn={getLadgerEmail} />
    </>
  );
};

export default TimelineEvent;
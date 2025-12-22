import React from "react";
import Pagination from "./Pagination";
import { getLadgerEmail } from "../store/Slices/ladger";
import { useSelector } from "react-redux";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TimelineEvent = () => {
  const { ladger } = useSelector((state) => state.ladger);
  const navigateTo = useNavigate();

  const onEyeClick = (type) => {
    if (!type) return;
    if (type.includes("Contact")) navigateTo(`/contacts`);
    if (type.includes("Scheduled") || type.includes("Reminder"))
      navigateTo(`/reminders`);
    if (type.includes("Invoice")) navigateTo(`/invoices`);
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
            {ladger.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* ICON */}
                <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center mt-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <img
                      width="40"
                      height="40"
                      src={
                        event.icon ||
                        "https://img.icons8.com/bubbles/100/new-post.png"
                      }
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
                          className="text-blue-600 transition-transform duration-200 group-hover:scale-110"
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
                          {event.description
                            ? event.description
                            : "View details"}

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
                </div>
              </div>
            ))}

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

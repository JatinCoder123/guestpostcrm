import React from "react";
import Pagination from "./Pagination";
import { getLadgerEmail } from "../store/Slices/ladger";
import { useSelector } from "react-redux";
import { Eye } from "lucide-react";

const TimelineEvent = () => {
  const { ladger } = useSelector((state) => state.ladger);
  return (
    <>
      {/* TIMELINE EVENTS */}
      <div className="py-[2%] px-[30%]">
        <h1 className="font-mono text-2xl bg-gradient-to-r from-purple-600 to-blue-600  p-2 rounded-4xl  text-center text-white">
          TIMELINE
        </h1>
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300"></div>

          <div className="space-y-6">
            {ladger.map((event, index) => (
              <div key={event.id} className="relative flex items-center gap-4">
                {/* Dot */}
                <div className="relative z-10 w-16 flex-shrink-0 mt-3   flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <img
                      width="100"
                      height="100"
                      src={event.icon ? event.icon : "https://img.icons8.com/bubbles/100/new-post.png"}
                      alt="new-post"
                    />
                  </div>

                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 
                                          absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"
                  ></div>
                </div>

                {/* Card */}
                <div
                  className={`flex-1 border-2 rounded-xl  p-4 mt-3 ${index == 0 ? "bg-gradient-to-r from-[#FFFF00] to-white" : ""
                    }`}
                >
                  <div className="flex items-center gap-2 justify-between mb-2">
                    <span className="text-gray-700 flex items-center justify-center gap-2">
                      <span title={event.description ? event.description : ""} className="cursor-pointer hover:scale-110"><Eye size={20} className="text-blue-600" /></span>
                      <span>{event.type_c?.charAt(0).toUpperCase() +
                        event.type_c?.slice(1)}</span>
                    </span>

                    <span className="text-gray-500 text-sm">
                      {event.date_entered}
                    </span>
                  </div>
                  {/* optionally add event message preview */}
                  {event.subject && (
                    <div className="text-sm text-gray-600">{event.subject}</div>
                  )}
                </div>
              </div>
            ))}
            {/* END ICON */}
            <div className="relative flex gap-4">
              <div className="relative z-10 w-16 flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/image__7_-removebg-preview.png"
                    alt=""
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

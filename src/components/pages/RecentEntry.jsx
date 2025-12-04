import {
  CalendarDays,
  Mail,
  Activity,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getEvents } from "../../store/Slices/eventSlice";

export function RecentEntry() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(getEvents("all"));
  }, [dispatch]);

  return (
    <div className="p-8">

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="bg-green-600 py-4 px-8">
          <div className="grid grid-cols-4 text-left text-white text-lg font-semibold">
            <div className="flex items-center gap-2">
              <CalendarDays size={22} /> DATE
            </div>
             <div className="flex items-center gap-2">
          CONTACT
            </div>
            <div className="flex items-center gap-2">
              <Mail size={22} /> EMAIL
            </div>
            
            <div className="flex items-center gap-2">
              <Activity size={22} /> RECENT ACTIVITY
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-4">

          {loading && (
            <p className="text-center py-4 text-lg">Loading...</p>
          )}

          {!loading && events.length === 0 && (
            <p className="text-center text-lg py-4">No events found</p>
          )}

          {/* Rows */}
          {events.map((event, index) => (
            <div
              key={index}
              className="grid grid-cols-4 py-5 border-b text-gray-800 hover:bg-gray-50 transition"
            >
              {/* Date */}
              <div className="flex items-center gap-3 text-[17px]">
                <CalendarDays size={20} className="text-green-700" />
                {event.date_entered ?? "—"}
              </div>

              


              {/* Email */}
              <div className="flex items-center gap-3 text-[17px] text-blue-600  cursor-pointer">
               
                {event.real_name?.split("<")[0].trim() ?? "—"}
              </div>

               <div className="flex items-center gap-3 text-[17px] text-blue-600 underline cursor-pointer">
                <Mail size={20} className="text-blue-600" />
                {event.name?.split("<")[0].trim() ?? "—"}
              </div>

              {/* Recent Activity */}
              <div className="flex items-center gap-3 text-[17px] truncate max-w-[600px]">
                <Activity size={20} className="text-purple-600" />
                {event.recent_activity ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ladgerAction } from "../../store/Slices/ladger";

export function TimelinePage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { ladger, duplicate, loading, error } = useSelector(
    (state) => state.ladger
  );
  const dispatch = useDispatch();

  // const timelineEvents = [
  //   {
  //     id: 1,
  //     type: "First Reply Send",
  //     subject: "Guest Post Partnership",
  //     motive: "Business Collaboration",
  //     mailerSummary: "Complete Sales Cycle",
  //     stage: "",
  //     status: "",
  //     date: "11 Nov at 6:55 PM",
  //     color: "bg-orange-100 border-orange-300",
  //     icon: "📧",
  //   },
  //   {
  //     id: 2,
  //     type: "Contact Created",
  //     subject: "Guest Post Partnership",
  //     motive: "Business Collaboration",
  //     mailerSummary: "Complete Sales Cycle",
  //     stage: "",
  //     status: "",
  //     date: "11 Nov at 6:55 PM",
  //     color: "bg-purple-100 border-purple-300",
  //     icon: "👤",
  //   },
  //   {
  //     id: 3,
  //     type: "Account Created",
  //     subject: "Guest Post Partnership",
  //     motive: "Business Collaboration",
  //     mailerSummary: "Complete Sales Cycle",
  //     stage: "",
  //     status: "",
  //     date: "11 Nov at 6:55 PM",
  //     color: "bg-green-100 border-green-300",
  //     icon: "🏢",
  //   },
  //   {
  //     id: 4,
  //     type: "Deal",
  //     subject: "Guest Post Partnership",
  //     motive: "Business Collaboration",
  //     mailerSummary: "Complete Sales Cycle",
  //     stage: "",
  //     status: "",
  //     date: "11 Nov at 6:55 PM",
  //     color: "bg-red-100 border-red-300",
  //     icon: "💼",
  //   },
  //   {
  //     id: 5,
  //     type: "Offer",
  //     subject: "Guest Post Partnership",
  //     motive: "Business Collaboration",
  //     mailerSummary: "Complete Sales Cycle",
  //     stage: "",
  //     status: "",
  //     date: "11 Nov at 6:55 PM",
  //     color: "bg-blue-100 border-blue-300",
  //     icon: "🎁",
  //   },
  // ];
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
  }, [dispatch, loading, error]);

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white flex justify-between items-center">
         {/* Left Side - Welcome Text */}
  <h1 className="text-2xl font-semibold">Welcome GuestPostCRM</h1>

        {/* Right Side - Email Box */}
  <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
    <Mail className="w-4 h-4 text-white mr-2" />
    <span className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-medium">
      quietfluence@gmail.com
    </span>
  </div>
      </div>

      {/* Timeline Header */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      TIMELINE : 
                    </span>
                    <span className="text-gray-700 text-base">{ladger.length > 0 && ladger[0].name}</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-8 h-8" />
                      <span className="text-gray-900 text-sm font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                Duplicate={duplicate}
              </span>
              <button className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Auto Refresh:</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoRefresh ? "bg-gray-800" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoRefresh ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  ></div>
                </button>
                <span className="text-gray-400 text-xs">(every 5s)</span>
              </div>
            </div>
          </div>

          {/* Timeline Details */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">SUBJECT</span>
              <p className="text-gray-900 mt-1">Guest Post Partnership</p>
            </div>
            <div>
              <span className="text-gray-500">MOTIVE</span>
              <p className="text-gray-900 mt-1">Business Collaboration</p>
            </div>
            <div>
              <span className="text-gray-500">MAILER SUMMARY</span>
              <p className="text-gray-900 mt-1">Complete Sales Cycle</p>
            </div>
            <div>
              <span className="text-gray-500">Date</span>
              <p className="text-gray-900 mt-1">11 Nov at 6:55 PM</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Mail className="w-4 h-4" />
              <span>View Email</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <span>View Contact</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <span>View Deal</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <span>View Orders</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <span>AI Reply</span>
            </button>
          </div>
        </div>

{/* Timeline Events */}
<div className="py-[2%] px-[30%]">
  <div className="relative">
    {/* Timeline Line */}
    <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300"></div>

    <div className="space-y-6">
      {ladger.length > 0 &&
        ladger.map((event, index) => (
          <div key={event.id} className="relative flex items-center gap-4">
            {/* Timeline Icon */}
            <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <img
                  width="100"
                  height="100"
                  src="https://img.icons8.com/bubbles/100/new-post.png"
                  alt="new-post"
                />
              </div>

              {/* Horizontal Line */}
              <div class="bg-gradient-to-r from-purple-600 to-blue-600 absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"></div>

            </div>

            {/* Event Card */}
            <div
              className={`flex-1 border-2 rounded-xl p-4 ${event.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">{event.type_c}</span>
                <span className="text-gray-500 text-sm">
                  {event.date_entered}
                </span>
              </div>
            </div>
          </div>
        ))}

      {/* End Icon */}
      <div className="relative flex gap-4">
        <div className="relative z-10 w-16 flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <span className="text-xl">🏁</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>

      <Footer />
    </div>
  );
}

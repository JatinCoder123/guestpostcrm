import { Mail, Link2, List } from "lucide-react";
import { useSelector } from "react-redux";
import { periodOptions } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { PageContext } from "../context/pageContext";
const LOCAL_KEY = "create_deals_draft_v1";
const WelcomeHeader = () => {
  const { email, timeline } = useSelector((state) => state.ladger);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);
  const { welcomeHeaderContent } = useContext(PageContext)

  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

  const time = periodOptions.find((o) => o.period == timeline)?.title;

  // 🔥 NEW: Get pending deals count from localStorage
  let pendingDeals = null;
  const raw = localStorage.getItem(LOCAL_KEY);
  if (raw) {
    const deals = JSON.parse(raw);
    if (Array.isArray(deals) && deals.length > 0) {
      pendingDeals = deals.length;
    }
  }
  const naviageTo = useNavigate();
  return (
    <div className="h-20 w-full relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 mb-5 flex items-center">
      {/* Soft Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80" />

      {/* Light Orbs */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-5">
          {/* Title */}
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Results
            {welcomeHeaderContent && <span> from <span className="font-bold text-gray-900">{welcomeHeaderContent}</span> email </span>}
            for{" "}
            <span className="font-bold text-gray-900">
              {time?.replace(/_/g, " ")}
            </span>
            {email && (
              <>
                {" • "}
                <span className="font-bold text-blue-600">{email}</span>
              </>
            )}
            {/* 🔥 NEW: Pending Deals Badge */}
            {pendingDeals !== null && pendingDeals != 0 && (
              <>
                {" • "}
                <button
                  onClick={() => naviageTo("deals/create")}
                  className="font-bold text-orange-600 cursor-pointer"
                >
                  {pendingDeals} Pending Deals
                </button>
              </>
            )}
          </p>

          {/* Hover Badges */}
          <div className="flex items-center gap-3">
            {/* CRM Badge */}
            {crmDomain && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-400 cursor-pointer">
                <Link2 className="w-4 h-4 text-purple-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-64 transition-all duration-600 ease-out">
                  CRM:{" "}
                  <span className="font-bold text-purple-700">{crmDomain}</span>
                </span>
              </div>
            )}

            {/* Business Email Badge */}
            {businessEmail && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer">
                <Mail className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-80 transition-all duration-600 ease-out">
                  Email:{" "}
                  <span className="font-bold text-blue-700">
                    {businessEmail}
                  </span>
                </span>
              </div>
            )}

            {/* Business Email Badge */}
            <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer">
              <List className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Wolf GIF */}
        <div className="flex-shrink-0 pr-2">
          <img
            src="https://errika.guestpostcrm.com/images/wolf-5.gif"
            alt="Wolf"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;

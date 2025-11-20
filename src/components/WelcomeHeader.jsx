import { Mail, Link2 } from "lucide-react";
import { useSelector } from "react-redux";
import { periodOptions } from "../assets/assets";

const WelcomeHeader = () => {
  const { email, timeline } = useSelector((state) => state.ladger);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);

  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

  const time = periodOptions.find((o) => o.period == timeline)?.title;

  return (
    <div className="h-20 w-full relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 mb-5 flex items-center">
      {/* Soft light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80" />
      
      {/* Minimal subtle orbs that don't push height */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-4">
        {/* Left: Compact Text + Hover Badges */}
        <div className="flex items-center gap-5">
          {/* Main Text - super compact */}
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Results for{" "}
            <span className="font-bold text-gray-900">
              {time?.replace(/_/g, " ")}
            </span>
            {email && (
              <>
                {" • "}
                <span className="font-bold text-blue-600">{email}</span>
              </>
            )}
          </p>

          {/* Hover-Reveal Badges - tiny but elegant */}
          <div className="flex items-center gap-3">
            {/* CRM Badge */}
            {crmDomain && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-400 cursor-pointer">
                <Link2 className="w-4 h-4 text-purple-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-64 transition-all duration-600 ease-out">
                  CRM: <span className="font-bold text-purple-700">{crmDomain}</span>
                </span>
              </div>
            )}

            {/* Business Email Badge */}
            {businessEmail && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer">
                <Mail className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-80 transition-all duration-600 ease-out">
                  Email: <span className="font-bold text-blue-700">{businessEmail}</span>
                </span>
              </div>
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* BUSINESS EMAIL BADGE */}
        {businessEmail && (
          <div
            className="
              flex items-center gap-3 px-5 py-2.5
              bg-white/20 backdrop-blur-xl
              border border-white/30 rounded-full
              shadow-[0_4px_12px_rgba(255,255,255,0.2)]
              select-none
            "
          >
            <Mail className="w-4 h-4 text-white" />
            <span
              className="
                bg-white text-gray-800 shadow-sm
                text-sm font-semibold tracking-wide
                px-3 py-1 rounded-full
              "
            >
              {businessEmail}
            </span>
          </div>
        )}
=======
        {/* Right: Big Wolf - perfectly sized for h-20 card */}
        <div className="flex-shrink-0 pr-2">
          <img
            src="https://errika.guestpostcrm.com/images/wolf-5.gif"
            alt="Wolf"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>
>>>>>>> f635d4f14897bff9f512b1e3a3d34786134e4ffa
      </div>
    </div>
  );
};

export default WelcomeHeader;
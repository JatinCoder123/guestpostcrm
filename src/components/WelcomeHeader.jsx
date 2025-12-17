import { Mail, Link2, List } from "lucide-react";
import { useSelector } from "react-redux";
import { periodOptions } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const WelcomeHeader = () => {
  const { email, timeline, loading } = useSelector((state) => state.ladger);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);
  const { count } = useSelector((state) => state.events);

  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [count]);

  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

  const time = periodOptions.find((o) => o.period == timeline)?.title;

  return (
    <div className="h-20 w-full relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 mb-5 flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Results for{" "}
            <span className="font-bold text-gray-900">
              {time?.replace(/_/g, " ")}
            </span>
            {email && !loading && (
              <>
                {" • "}
                <span className="font-bold text-blue-600">{email}</span>
              </>
            )}
          </p>

          {/* BADGES */}
          <div className="flex items-center gap-3">
            {/* CRM */}
            {crmDomain && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-400 cursor-pointer">
                <Link2 className="w-4 h-4 text-purple-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-64 transition-all duration-600">
                  CRM:{" "}
                  <span className="font-bold text-purple-700">{crmDomain}</span>
                </span>
              </div>
            )}

            {/* Business Email */}
            {businessEmail && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer">
                <Mail className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-80 transition-all duration-600">
                  Email:{" "}
                  <span className="font-bold text-blue-700">
                    {businessEmail}
                  </span>
                </span>
              </div>
            )}

            {/* Marketplace Button */}
            <div
              onClick={() => navigate("/RecentEntry")}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer"
            >
              <List className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
              <div
                className={`
      absolute -top-2 -right-2
      bg-blue-600 text-white text-xs font-semibold
      rounded-full w-5 h-5
      flex items-center justify-center
      shadow-md
      transition-all duration-300 ease-out
      ${animate ? "scale-125 opacity-100" : "scale-90 opacity-90"}
    `}
              >
                {count}
              </div>
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

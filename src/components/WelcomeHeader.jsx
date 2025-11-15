import { Mail, Server } from "lucide-react";
import { useSelector } from "react-redux";
import { periodOptions } from "../assets/assets";

const WelcomeHeader = () => {
  const { email, timeline } = useSelector((state) => state.ladger);
  const { crmEndpoint } = useSelector((state) => state.user);

  // Extract CRM domain from https://domain.com...
  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

  const time = periodOptions.find((option) => option.period == timeline)?.title;

  return (
    <div
      className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 
                    rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden"
    >
      {/* Decorative Gradient Glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent)] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative flex justify-between items-center flex-wrap gap-4 z-10">
        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-wide drop-shadow">
            Welcome to GuestPostCRM
          </h1>

          {/* Result Line */}
          <p className="text-white/80 text-sm mt-1">
            Showing results of{" "}
            <span className="font-semibold text-white">
              {time?.replace("_", " ")}
            </span>{" "}
            for <span className="font-semibold text-white">{email}</span>
          </p>

          {/* Connected CRM */}
          {crmDomain && (
            <div
              className="flex items-center gap-2 mt-3 bg-white/20 px-3 py-1.5 
                            rounded-lg backdrop-blur-xl border border-white/30 
                            shadow-sm w-fit"
            >
              <Server className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">
                Connected CRM:{" "}
                <span className="text-white font-semibold">{crmDomain}</span>
              </span>
            </div>
          )}
        </div>

        {/* Email Badge */}
        <div
          className="flex items-center bg-white/20 rounded-full px-4 py-2 
                        backdrop-blur-xl border border-white/30 shadow-md"
        >
          <Mail className="w-4 h-4 text-white mr-2" />
          <span
            className="bg-white text-gray-800 rounded-full px-3 py-1 
                           text-sm font-medium shadow-sm"
          >
            {email}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;

import { Mail, Link2 } from "lucide-react";
import { useSelector } from "react-redux";
import { periodOptions } from "../assets/assets";
import { useContext } from "react";
import { PageContext } from "../context/pageContext";

const WelcomeHeader = () => {
  const { email, timeline } = useSelector((state) => state.ladger);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);
  const { enteredEmail } = useContext(PageContext);

  // Extract CRM domain from https://domain.com...
  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

  const time = periodOptions.find((option) => option.period == timeline)?.title;

  const finalEmail = email; // shorten
  return (
    <div
      className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 
                    rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden"
    >
      {/* Soft glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent)] pointer-events-none"></div>

      <div className="relative flex justify-between items-center flex-wrap gap-4 z-10">
        {/* LEFT */}
        <div>
          {/* Result Line */}
          <p className="text-white/80 text-sm mt-1">
            Showing results of{" "}
            <span className="font-semibold text-white">
              {time?.replace("_", " ")}
            </span>
            {/* Only show "for email" IF email exists */}
            {finalEmail && (
              <>
                {" "}
                for{" "}
                <span className="font-semibold text-white">{finalEmail}</span>
              </>
            )}
          </p>

          {/* CRM INFO — Hover Expand */}
          {crmDomain && (
            <div
              className="group flex items-center gap-2 mt-3 
                            bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xl 
                            border border-white/20 shadow-sm w-fit 
                            transition-all duration-300 cursor-pointer"
            >
              <Link2
                className="w-4 h-4 text-white transition-all duration-300 
                                group-hover:scale-110"
              />

              <span
                className="text-white font-medium text-sm 
                               max-w-0 overflow-hidden whitespace-nowrap 
                               group-hover:max-w-[500px] transition-all duration-300"
              >
                Connected CRM:{" "}
                <span className="text-white font-semibold">{crmDomain}</span>
              </span>
            </div>
          )}
        </div>

        {/* EMAIL BADGE */}
        {businessEmail && (
          <div
            className="flex items-center bg-white/20 rounded-full px-4 py-2 
                          backdrop-blur-xl border border-white/30 shadow-md"
          >
            <Mail className="w-4 h-4 text-white mr-2" />
            <span
              className="bg-white text-gray-800 rounded-full px-3 py-1 
                               text-sm font-medium shadow-sm"
            >
              {businessEmail}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeHeader;

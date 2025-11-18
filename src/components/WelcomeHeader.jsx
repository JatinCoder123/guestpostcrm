import { Mail, Link2 } from "lucide-react";
import { useSelector } from "react-redux";
import { periodOptions } from "../assets/assets";

const WelcomeHeader = () => {
  const { email, timeline } = useSelector((state) => state.ladger);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);

  // Extract CRM domain
  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

  const time = periodOptions.find((option) => option.period == timeline)?.title;

  const finalEmail = email;

  return (
    <div
      className="
      bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-700
      rounded-3xl p-5 mb-3 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)]
      relative overflow-hidden
      font-inter
    "
    >
      {/* Glow Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent)] opacity-40 pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-center flex-wrap gap-6">
        {/* LEFT BLOCK */}
        <div className="space-y-3">
          {/* Timeline + Email */}
          <p className="text-sm text-white/80 tracking-wide">
            Showing results of{" "}
            <span className="font-semibold text-white">
              {time?.replace("_", " ")}
            </span>{" "}
            {finalEmail && (
              <>
                for{" "}
                <span className="font-semibold text-white">{finalEmail}</span>
              </>
            )}
          </p>

          {/* CRM CONNECTED BADGE */}
          {crmDomain && (
            <div
              className="
                group flex items-center gap-2
                px-4 py-2 bg-white/10 rounded-xl
                border border-white/20 backdrop-blur-xl
                w-fit shadow-md cursor-pointer
                hover:bg-white/20 transition-all duration-300
              "
            >
              <Link2 className="w-4 h-4 text-white group-hover:scale-110 transition" />

              <span
                className="
                  text-white text-sm tracking-wide font-medium
                  max-w-0 overflow-hidden whitespace-nowrap
                  group-hover:max-w-[500px]
                  transition-all duration-500
                "
              >
                Connected CRM:{" "}
                <span className="font-semibold">{crmDomain}</span>
              </span>
            </div>
          )}
        </div>

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
              {crmDomain}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeHeader;

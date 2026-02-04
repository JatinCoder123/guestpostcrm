import { Mail, Link2, List, MailCheck } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { periodOptions } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { PageContext } from "../context/pageContext";
import wolfImg from "../assets/wolf-5.gif";
import { unrepliedAction } from "../store/Slices/unrepliedEmails";
import { motion, AnimatePresence } from "framer-motion";

const WelcomeHeader = () => {
  const dispatch = useDispatch();

  const { email, timeline, loading } = useSelector((state) => state.ladger);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);
  const { welcomeHeaderContent, setEnteredEmail, setSearch } =
    useContext(PageContext);
  const { showNewEmailBanner } = useSelector((state) => state.unreplied);
  const { count } = useSelector((state) => state.events);

  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (showNewEmailBanner) {
      const timer = setTimeout(() => {
        dispatch(unrepliedAction.setShowNewEmailBanner(false));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showNewEmailBanner, dispatch]);

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

      {/* 🔔 New Email Notification */}
      <AnimatePresence>
        {showNewEmailBanner && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 22,
            }}
            className="absolute top-3 right-50 z-50"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0 rgba(59,130,246,0)", "0 0 18px rgba(99,102,241,0.45)", "0 0 0 rgba(59,130,246,0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl
        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
        text-white shadow-xl"
            >
              {/* Pulse dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>

              {/* Text */}
              <p className="text-sm font-semibold tracking-wide">
                New email received
              </p>

              {/* Icon wiggle */}
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                <MailCheck />
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            <span className="font-bold text-gray-900">
              {welcomeHeaderContent + " "}
            </span>
            Results for{" "}
            <span className="font-bold text-gray-900">
              {time?.replace(/_/g, " ")}
            </span>
            {email && !loading && (
              <>
                {" • "}
                <button
                  className="font-bold text-blue-600"
                  onClick={() => {
                    setSearch(email);
                    setEnteredEmail(email);
                  }}
                >
                  {email}
                </button>
              </>
            )}
          </p>

          {/* BADGES */}
          <div className="flex items-center gap-3">
            {crmDomain && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-400 cursor-pointer">
                <Link2 className="w-4 h-4 text-purple-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-64 transition-all duration-600">
                  CRM:{" "}
                  <span className="font-bold text-purple-700">
                    {crmDomain?.split(".")[0]}
                  </span>
                </span>
              </div>
            )}

            {businessEmail && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer">
                <Mail className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-80 transition-all duration-600">
                  Business Email:{" "}
                  <span className="font-bold text-blue-700">
                    {businessEmail}
                  </span>
                </span>
              </div>
            )}

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
            src={wolfImg}
            alt="Wolf"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;

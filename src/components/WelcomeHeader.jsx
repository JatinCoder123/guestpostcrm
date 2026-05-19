import {
  Mail,
  Link2,
  List,
  MailCheck,
  MailOpen,
  Send,
  Bell,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { PageContext } from "../context/pageContext";
import {
  getUnrepliedEmail,
  unrepliedAction,
} from "../store/Slices/unrepliedEmails";
import { motion, AnimatePresence } from "framer-motion";
import { fetchGpc } from "../services/api";

const StatBadge = ({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
  borderClass,
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border ${borderClass} ${bgClass} transition-all duration-400 cursor-default`}
    >
      <Icon
        className={`w-4 h-4 ${colorClass} group-hover:scale-125 transition-transform duration-300`}
      />
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
        {label}:
      </span>
      <span
        className={`text-xs font-bold ${colorClass} transition-all duration-300 ${
          animate ? "scale-125 opacity-100" : "scale-100 opacity-90"
        } inline-block`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
};

const WelcomeHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const { crmEndpoint, businessEmail } = useSelector((state) => state.user);
  const email = contactInfo?.email1;
  const { setEnteredEmail, handleClear } = useContext(PageContext);
  const { showNewEmailBanner } = useSelector((state) => state.unreplied);
  const { count } = useSelector((state) => state.events);
  const [animate, setAnimate] = useState(false);

  // ── Stats state ──────────────────────────────────────────────
  const [stats, setStats] = useState({
    reply_recieved: null,
    reply_sent: null,
    reminder_sent: null,
  });

  // ── Fetch stats on mount ──────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchGpc({
          method: "GET",
          params: { type: "statscount" },
        });
        if (data?.success && data?.stats) {
          setStats({
            reply_recieved: data.stats.reply_recieved,
            reply_sent: data.stats.reply_sent,
            reminder_sent: data.stats.reminder_sent,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    loadStats();
  }, []);

  const formatRouteName = (route) => {
    if (route === "/") {
      return (
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={() => {
            localStorage.setItem("searchTerm", email);
            setEnteredEmail(email);
          }}
        >
          {email}
        </span>
      );
    }
    return route.split("/")[1].toUpperCase();
  };

  const resultTitle = formatRouteName(path);

  /* ---------------- EFFECTS ---------------- */

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

  /* ---------------- DOMAIN ---------------- */

  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];

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
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="absolute top-3 right-50 z-50"
          >
            <motion.button
              animate={{
                boxShadow: [
                  "0 0 0 rgba(59,130,246,0)",
                  "0 0 18px rgba(99,102,241,0.45)",
                  "0 0 0 rgba(59,130,246,0)",
                ],
              }}
              onClick={() => {
                dispatch(unrepliedAction.setShowNewEmailBanner(false));
                handleClear();
                navigate("/");
                dispatch(
                  getUnrepliedEmail({ loading: true, type: "email_inbound" }),
                );
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:cursor-pointer
              bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
              text-white shadow-xl"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <p className="text-sm font-semibold tracking-wide">
                New email received
              </p>
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                <MailCheck />
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            <span className="font-bold text-gray-900">Results for </span>
            <span className="font-bold text-gray-900">{resultTitle}</span>
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
              className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer relative"
            >
              <List className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
              <div
                className={`absolute -top-2 -right-2
                bg-blue-600 text-white text-xs font-semibold
                rounded-full w-5 h-5 flex items-center justify-center
                shadow-md transition-all duration-300 ease-out
                ${animate ? "scale-125 opacity-100" : "scale-90 opacity-90"}`}
              >
                {count}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Stats badges */}
        <div className="flex-shrink-0 flex items-center gap-2 pr-2">
          <StatBadge
            icon={MailOpen}
            label="Received"
            value={stats.reply_recieved}
            colorClass="text-emerald-600"
            bgClass="hover:bg-emerald-50"
            borderClass="border-gray-200 hover:border-emerald-300"
          />
          <StatBadge
            icon={Send}
            label="Sent"
            value={stats.reply_sent}
            colorClass="text-blue-600"
            bgClass="hover:bg-blue-50"
            borderClass="border-gray-200 hover:border-blue-300"
          />
          <StatBadge
            icon={Bell}
            label="Reminders"
            value={stats.reminder_sent}
            colorClass="text-amber-600"
            bgClass="hover:bg-amber-50"
            borderClass="border-gray-200 hover:border-amber-300"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;

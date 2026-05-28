import {
  Search,
  Sparkles,
  Flame,
  X,
  CircleAlert,
  Copy,
  Check,
  BellIcon,
  User2,
  ChevronDown,
  LogOut,
  MailWarning,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ladgerAction } from "../store/Slices/ladger";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { logout, userAction } from "../store/Slices/userSlice";
import DropDown from "./DropDown";
import { headingLogo, periodOptions } from "../assets/assets";
import { SocketContext } from "../context/SocketContext";
import IconButton from "./ui/Buttons/IconButton";
import GlobalSearch from "./GlobalSearch";
export function TopNav() {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const [animate, setAnimate] = useState(false);
  const { emails: outboxEmails, loading } = useSelector(state => state.outbox)
  const {
    enteredEmail,
    setEnteredEmail,
    handleClear,
    setShowNextPrev,
    handleDateClick,
    superfastReply,
    superfastToggle,
  } = useContext(PageContext);
  const [search, setSearch] = useState("");

  const profileMenuRef = useRef(null);
  const { notificationCount } = useContext(SocketContext);
  const [errorLogCount, setErrorLogCount] = useState(0);
  const prevCountRef = useRef(errorLogCount);
  const [copied, setCopied] = useState(false);
  const { user, error } = useSelector((state) => state.user);
  const { timeline } = useSelector((state) => state.ladger);
  const { count } = useSelector((state) => state.hot);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  /* 🔴 Blink while input has value */
  useEffect(() => {
    setIsBlinking(enteredEmail?.trim());
    setSearch(enteredEmail);
  }, [enteredEmail]);

  /* 🔍 Search */
  const handleSearch = () => {
    if (!search?.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    handleDateClick({ email: search, navigate: "/" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(search);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelectPeriod = (option) => {
    localStorage.setItem("timeline", option);
    dispatch(ladgerAction.setTimeline(option));
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
  };

  /* Close profile on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (notificationCount.error_log_created) {
      setErrorLogCount((prev) => prev + 1);
    }
  }, [notificationCount.error_log_created]);

  useEffect(() => {
    if (errorLogCount > prevCountRef.current) {
      setAnimate(true);

      setTimeout(() => setAnimate(false), 400); // animation duration
    }

    prevCountRef.current = errorLogCount;
  }, [errorLogCount]);

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const p = user.name.split(" ");
    return p.length === 1
      ? p[0][0].toUpperCase()
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  return (
    <div
      data-tour="top-nav"
      className="bg-white border-b p-1 py-2 flex items-center justify-between sticky top-0 z-50"
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <img
          src={headingLogo}
          className="w-72 h-10 object-contain cursor-pointer"
          onClick={() => navigateTo("")}
        />

        {/* SEARCH AREA */}
        <div className="flex items-center gap-2" data-tour="top-nav-search">
          <GlobalSearch />

          <DropDown
            options={periodOptions}
            handleSelectOption={handleSelectPeriod}
            timeline={timeline}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <div
          onClick={superfastToggle}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-sm font-medium">⚡ Superfast Reply</span>

          <div
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${superfastReply ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${superfastReply ? "translate-x-5" : ""
                }`}
            />
          </div>
        </div>

        <IconButton tooltipPosition="bottom" label="Payment Reminders" icon={BellIcon} variant="primary" className="p-2 rounded-full bg-purple-600 hover:bg-purple-700" rounded="full" iconColor="white" count={3} />

        {outboxEmails.length > 0 && !loading && (
          <IconButton tooltipPosition="bottom" label="OutBox Emails" onClick={() => navigateTo('/outbox')} icon={MailWarning} variant="primary" className="p-2 rounded-full" rounded="full" iconColor="white" count={outboxEmails.length} />
        )}
        <IconButton tooltipPosition="bottom" label="Hot Notification" onClick={() => navigateTo("hot-records")}
          icon={Flame} variant="primary" className="p-2 rounded-full bg-orange-500 hover:bg-orange-600" rounded="full" iconColor="white" count={count} />


        {notificationCount.error_log_created && (
          <IconButton
            onClick={() => navigateTo("/settings/debugging")}
            icon={CircleAlert}
            count={errorLogCount}
            variant="danger"
            rounded="full"
            label="Error Logs"
            tooltipPosition="bottom"
          />)
        }

        <IconButton onClick={() => navigateTo("ai-credits")}
          tooltipPosition="bottom" label="AI Credits" icon={Sparkles} variant="primary" className="p-2  bg-indigo-600 hover:bg-indigo-700" rounded="full" iconColor="white" />

        {/* PROFILE */}
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Open profile menu"
            aria-expanded={showProfileMenu}
            className="
              group flex items-center gap-2 rounded-full border border-slate-200
              bg-white px-2.5 py-1.5 text-slate-700 shadow-sm transition-all
              hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50
              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/25
            "
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 text-sm font-black text-white shadow-sm">
              {getUserInitials()}
            </span>

          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
              >
                <button
                  type="button"
                  onClick={() => {
                    navigateTo("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="group/menu flex w-full items-center gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white p-4 text-left transition hover:from-indigo-50 hover:to-cyan-50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white shadow-md shadow-indigo-500/25">
                    {getUserInitials()}
                  </span>
                  <div className="min-w-0 flex-1">

                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

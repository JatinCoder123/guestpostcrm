import { Search, ChevronDown, Sparkles, User, Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ladgerAction } from "../store/Slices/ladger";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { clearAllUserErrors } from "../store/Slices/userSlice";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

export function TopNav() {
  const [input, setInput] = useState("");
  const [openPeriod, setOpenPeriod] = useState(false);
  const { timeline } = useSelector((state) => state.ladger);
  const { setEnteredEmail } = useContext(PageContext);
  const dropDownRef = useRef();
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { isAuthenticated, user, loading, error, message } = useSelector(
    (state) => state.user
  );
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(clearAllUserErrors());
      navigateTo(`/`);
    }
  }, [error, dispatch, message]);

  const handleSearch = () => {
    if (input.trim()) {
      navigateTo("");
      dispatch(setEnteredEmail(input));
    }
  };
  const handleClear = () => {
    if (input.trim()) {
      setInput("");
      navigateTo("");
      dispatch(setEnteredEmail(null));
    }
  };
  const openPeriodRef = useRef(openPeriod);

  useEffect(() => {
    openPeriodRef.current = openPeriod;
  }, [openPeriod]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openPeriodRef &&
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      ) {
        setOpenPeriod(false); // collapse sidebar
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Dropdown items
  const periodOptions = [
    { period: "today", title: "Today" },
    { period: "yesterday", title: "Yesterday" },
    { period: "this_week", title: "Last 7 Days" },
    { period: "last_week", title: "Last 14 Days" },
    { period: "this_month", title: "Last 30 Days" },
  ];

  const handleSelectPeriod = (option) => {
    dispatch(ladgerAction.setTimeline(option));
    setOpenPeriod(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer">
        <img
          onClick={() => navigateTo("")}
          src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/png%20(1).png"
          alt="GuestPostCRM Logo"
          className="w-80 h-10 object-contain rounded-full"
        />
        {/* Search Bar */}
        <div className="flex items-center gap-3 mx-6 w-full max-w-2xl flex-shrink-0">
          <div className="relative flex-1 min-w-[300px] max-w-[600px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={input}
              placeholder="Search emails or campaigns..."
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-sm">Search</span>
          </button>
          <button
            onClick={handleClear}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-sm">Clear</span>
          </button>
        </div>
        {/* Period Dropdown */}
        <div className="relative w-full" ref={dropDownRef}>
          <button
            onClick={() => setOpenPeriod(!openPeriod)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-900 text-sm whitespace-nowrap">
              {periodOptions.find((option) => option.period == timeline)?.title}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {openPeriod && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {periodOptions.map((option) => (
                <div
                  key={option.period}
                  onClick={() => handleSelectPeriod(option.period)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                >
                  {option.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => navigateTo("ai-credits")}
          className="flex items-center gap-2 p-4 bg-[#f1b911] text-white rounded-full hover:bg-[#cae445] transition-colors"
        >
          <Bell className="w-4 h-4" />
          {/* <span className="text-sm">AI Credits</span> */}
        </button>
        {/* AI Credits Button */}
        <button
          onClick={() => navigateTo("ai-credits")}
          className="flex items-center gap-2 p-4 bg-[#5E17EB] text-white rounded-full hover:bg-[#4d12c4] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {/* <span className="text-sm">AI Credits</span> */}
        </button>

        {/* Profile + Info */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : !isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo("login")}
                className="px-4 py-2 rounded-xl bg-black text-white font-medium shadow-sm hover:opacity-90 transition-all"
              >
                Login
              </motion.button>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={user.profile_pic || "/logo.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full border border-[var(--border)] shadow-sm"
                />
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.25 }}
                className="leading-tight"
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {user?.name || "User"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

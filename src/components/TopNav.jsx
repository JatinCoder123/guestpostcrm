import { Search, Sparkles, Flame, X, User2Icon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ladgerAction } from "../store/Slices/ladger";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { logout, userAction } from "../store/Slices/userSlice";
import DropDown from "./DropDown";
import { periodOptions } from "../assets/assets";

export function TopNav() {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const profileMenuRef = useRef(null);

  const { user, error } = useSelector((state) => state.user);
  const { count } = useSelector((state) => state.hot);

  const { search, setSearch, setEnteredEmail, setWelcomeHeaderContent } =
    useContext(PageContext);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  /* 🔴 Blink while input has value */
  useEffect(() => {
    setIsBlinking(!!search.trim());
  }, [search]);

  /* 🔍 Search */
  const handleSearch = () => {
    if (!search.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    localStorage.setItem("email", search);
    setEnteredEmail(search);
    setWelcomeHeaderContent("Search");
    navigateTo("");
  };

  /* ❌ Clear */
  const handleClear = () => {
    localStorage.removeItem("email");
    setWelcomeHeaderContent("");
    setSearch("");
    setEnteredEmail(null);
    navigateTo("/");
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

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const p = user.name.split(" ");
    return p.length === 1
      ? p[0][0].toUpperCase()
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <img
          src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/png%20(1).png"
          className="w-72 h-10 object-contain cursor-pointer"
          onClick={() => navigateTo("")}
        />

        {/* SEARCH AREA */}
        <div className="flex items-center gap-2">
          {/* INPUT */}
          <div className="relative w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Input Email to Search"
              className="
                w-full pl-10 pr-10 py-2
                bg-gray-50 border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                focus:border-purple-500 shadow-lg
              "
            />

            {/* ❌ CLEAR INSIDE INPUT */}
            {search && (
              <motion.button
                onClick={handleClear}
                animate={isBlinking ? { scale: [1, 1.1, 1] } : {}}
                transition={
                  isBlinking ? { repeat: Infinity, duration: 0.7 } : {}
                }
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2
                  w-6 h-6 flex items-center justify-center rounded-md
                  ${
                    isBlinking
                      ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.9)]"
                      : "bg-gray-300 text-gray-700"
                  }
                `}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* 🔍 SEARCH BUTTON OUTSIDE */}
          <button
            onClick={handleSearch}
            className="
              px-4 py-2 flex items-center gap-2
              bg-blue-600 text-white rounded-lg
              hover:bg-blue-700
            "
          >
            <Search className="w-4 h-4" />
          </button>

          <DropDown
            options={periodOptions}
            handleSelectOption={handleSelectPeriod}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* start by kjl */}
        <motion.button
          onClick={() => navigateTo("hot-records")}
          animate={
            count > 0
              ? {
                  scale: [1, 1.12, 1],
                  boxShadow: [
                    "0 0 0px rgba(59,130,246,0)",
                    "0 0 18px rgba(59,130,246,0.9)",
                    "0 0 18px rgba(239, 68, 213, 0.9)",
                    "0 0 0px rgba(239,68,68,0)",
                  ],
                }
              : {}
          }
          transition={
            count > 0
              ? {
                  repeat: Infinity,
                  duration: 1.6, // normal speed
                  ease: "easeInOut",
                }
              : {}
          }
          className="relative p-4 bg-orange-500 text-white rounded-full"
        >
          <Flame />

          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-800 text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </motion.button>
        {/* end */}

        <button
          onClick={() => navigateTo("avatars")}
          className="p-4 bg-yellow-500 text-white rounded-full"
        >
          <User2Icon />
        </button>

        <button
          onClick={() => navigateTo("ai-credits")}
          className="p-4 bg-purple-600 text-white rounded-full"
        >
          <Sparkles />
        </button>

        {/* PROFILE */}
        <div ref={profileMenuRef} className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
          >
            <span className="font-semibold">{getUserInitials()}</span>
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-xl"
              >
                <div className="p-4">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
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

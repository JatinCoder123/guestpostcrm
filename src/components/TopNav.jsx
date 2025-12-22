import {
  Search,
  Sparkles,
  Flame,
  X,
  User2Icon,
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
import { periodOptions } from "../assets/assets";

export function TopNav() {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const profileMenuRef = useRef(null);

  const { user, loading, error } = useSelector((state) => state.user);
  const { count } = useSelector((state) => state.hot);

  const {
    search,
    setSearch,
    setEnteredEmail,
    setWelcomeHeaderContent,
  } = useContext(PageContext);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  /* 🔥 Blink when typing */
  useEffect(() => {
    if (search.trim()) {
      // If ANY text is typed (not empty)
      setHasTextInput(true);

      // Start blinking animation on clear button
      setIsBlinking(true);

      // Stop blinking after 3 seconds
      const timer = setTimeout(() => setIsBlinking(false), 3000);
      return () => clearTimeout(timer);
    } else {
      // If input is empty
      setHasTextInput(false);
      setIsBlinking(false);
    }
  }, [search]);

  // Effect to handle save info selection
  useEffect(() => {
    // Check if save info is selected
    const isSaveInfoSelected = localStorage.getItem('saveInfo') === 'true' ||
      user?.saveInfo === true ||
      false;

    if (isSaveInfoSelected) {
      setSaveInfoSelected(true);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
  };

  const handleSearch = () => {
    if (!search.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (search.trim()) {
      localStorage.setItem("email", search);
      navigateTo("");
      setWelcomeHeaderContent("Search");
      setEnteredEmail(search);
    }
  };

  /* ❌ Clear */
  const handleClear = () => {
    stopBlinking();
    localStorage.removeItem("email");
    setSearch("");
    setEnteredEmail(null);
    navigateTo("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Function to handle save info selection
  const handleSaveInfoToggle = () => {
    const newSaveInfoState = !saveInfoSelected;
    setSaveInfoSelected(newSaveInfoState);

    // Save to localStorage
    localStorage.setItem('saveInfo', newSaveInfoState.toString());

    toast.info(newSaveInfoState ? "Save Info enabled" : "Save Info disabled");
  };

  /* Close profile on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
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
          onClick={() => {
            stopBlinking();
            navigateTo("");
          }}
        />

        {/* SEARCH BAR */}
        <div className="flex items-center gap-2">
          
          {/* INPUT + SEARCH BUTTON INSIDE */}
          <div className="relative w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Input Email to Search"
              className="
                w-full pl-10 pr-12 py-2
                bg-gray-50 border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                focus:border-purple-500
              "
            />

            {/* 🔍 Search button INSIDE */}
            <button
              onClick={handleSearch}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-8 h-8 flex items-center justify-center
                bg-blue-600 text-white rounded-md
                hover:bg-blue-700
              "
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* ❌ Cancel OUTSIDE */}
          <motion.button
            onClick={handleClear}
            animate={isBlinking ? { scale: [1, 1.1, 1] } : {}}
            transition={isBlinking ? { repeat: Infinity, duration: 0.7 } : {}}
            className={`
              flex cursor-pointer items-center justify-center mr-3 p-2 
              rounded-lg transition-all duration-300 relative
              ${isBlinking ? 'shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''}
              ${hasTextInput || saveInfoSelected
                ? "bg-red-500 hover:bg-red-600 text-white border-2 border-red-800"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            <X className="w-4 h-4" />

            {/* Enhanced blinking effect */}
            {isBlinking && (
              <motion.div
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.1, 1]
                }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="absolute inset-0 rounded-lg bg-red-500 -z-10"
              />
            )}

            {/* Optional: Add notification dot when blinking */}
            {isBlinking && (
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 360, 0]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"
              />
            )}
          </motion.button>

          {/* Period Dropdown */}
          <DropDown
            options={periodOptions}
            handleSelectOption={handleSelectPeriod}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            stopBlinking();
            navigateTo("hot-records");
          }}
          className="relative p-4 bg-orange-500 text-white rounded-full"
        >
          <Flame />
          <span className="absolute -top-1 -right-1 bg-orange-800 text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {count}
          </span>
        </button>

        <button
          onClick={() => {
            stopBlinking();
            navigateTo("avatars");
          }}
          className="p-4 bg-yellow-500 text-white rounded-full"
        >
          <User2Icon />
        </button>

        <button
          onClick={() => {
            stopBlinking();
            navigateTo("ai-credits");
          }}
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
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex flex-col overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>

                  {/* Logout Button */}
                  <motion.button
                    onClick={handleLogout}
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.1 } : {}}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center justify-center cursor-pointer
                      p-2 rounded-full transition-all duration-300 shadow-sm
                      ${loading
                        ? "opacity-50 cursor-not-allowed bg-gray-200"
                        : "hover:bg-red-200"
                      }
                    `}
                  >
                    <img
                      className={`
                        w-8 h-8 transition-all duration-300 
                        ${loading ? "opacity-40" : "opacity-100"}
                      `}
                      src="https://img.icons8.com/arcade/64/exit.png"
                      alt="exit"
                    />
                  </motion.button>
                </div>

                {/* Save Info Toggle in Dropdown */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Save Info
                    </span>
                    <button
                      onClick={handleSaveInfoToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${saveInfoSelected ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${saveInfoSelected ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {saveInfoSelected
                      ? "Clear button stays red when Save Info is enabled"
                      : "Toggle to enable/disable save info"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

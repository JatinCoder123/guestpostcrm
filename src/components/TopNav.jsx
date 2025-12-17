import {
  Search,
  Sparkles,
  Bell,
  LogOut,
  X,
  User2Icon,
  ChevronDown,
  Flame,
  AlertCircle,
  Save,
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
import { getAllHot } from "../store/Slices/hotSlice";

export function TopNav() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { loading, error, user } = useSelector((state) => state.user);
  const { count } = useSelector((state) => state.hot);
  const { setEnteredEmail, search, setWelcomeHeaderContent, setSearch } =
    useContext(PageContext);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const profileMenuRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [saveInfoSelected, setSaveInfoSelected] = useState(false);
  const [hasTextInput, setHasTextInput] = useState(false);

  // Check input whenever search changes
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

  const handleClear = () => {
    if (search.trim()) {
      localStorage.removeItem("email");
      setSearch("");
      navigateTo("");
      setEnteredEmail(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Function to handle save info selection
  const handleSaveInfoToggle = () => {
    const newSaveInfoState = !saveInfoSelected;
    setSaveInfoSelected(newSaveInfoState);
    
    // Save to localStorage
    localStorage.setItem('saveInfo', newSaveInfoState.toString());
    
    toast.info(newSaveInfoState ? "Save Info enabled" : "Save Info disabled");
  };

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPeriod = (option) => {
    localStorage.setItem("timeline", option);
    dispatch(ladgerAction.setTimeline(option));
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3 cursor-pointer">
        <img
          onClick={() => navigateTo("")}
          src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/png%20(1).png"
          alt="GuestPostCRM Logo"
          className="w-80 h-10 object-contain rounded-full"
        />

        {/* Search Bar */}
        <div className="flex items-center gap-2 mx-6 w-full max-w-xl flex-shrink-0">
          <div className="relative flex-1 min-w-[250px] max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              placeholder="Input Email to Search"
              onKeyDown={handleKeyPress}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Search Button (always blue) */}
          <button
            onClick={handleSearch}
            className="flex cursor-pointer items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4 text-white" />
          </button>

          {/* Clear Button - Turns red and blinks when ANY text is typed */}
          <motion.button
            onClick={handleClear}
            animate={isBlinking ? { scale: [1, 1.08, 1] } : {}}
            transition={isBlinking ? { repeat: Infinity, duration: 0.7 } : {}}
            className={`
              flex cursor-pointer items-center justify-center mr-3 p-2 
              rounded-lg transition-all duration-300 relative
              ${isBlinking ? 'shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''}
              ${
                hasTextInput || saveInfoSelected
                  ? "bg-red-600 hover:bg-red-700 text-white border-2 border-red-800"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
            title={hasTextInput ? "Text detected - Clear button is red" : "Clear search"}
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

      {/* Right Section */}
      <div className="flex items-center gap-3 relative">
        {/* Hot Button */}
        <button
          onClick={() => {
            navigateTo("hot-records");
          }}
          className="flex relative cursor-pointer items-center gap-2 p-4 bg-orange-500 text-white rounded-full hover:bg-[#cae445] transition-colors"
        >
          <Flame className="w-5 h-5 text-white-500" />

          <div
            className={`
              absolute -top-2 -right-2
              bg-orange-800 text-white text-xs font-semibold
              rounded-full w-6 h-6 
              flex items-center justify-center
              shadow-md
              transition-all duration-300 ease-out
              ${animate ? "scale-125 opacity-100" : "scale-90 opacity-90"}
            `}
          >
            {count}
          </div>
        </button>

        {/* Notification Button */}
        <button
          onClick={() => {
            navigateTo("avatars");
          }}
          className="flex cursor-pointer items-center gap-2 p-4 bg-[#f1b911] text-white rounded-full hover:bg-[#cae445] transition-colors"
        >
          <User2Icon className="w-4 h-4" />
        </button>

        {/* AI Credits Button */}
        <button
          onClick={() => navigateTo("ai-credits")}
          className="flex cursor-pointer items-center gap-2 p-4 bg-[#5E17EB] text-white rounded-full hover:bg-[#4d12c4] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Profile Section with Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border shadow-sm">
              <span className="text-black font-semibold text-lg">
                {getUserInitials()}
              </span>
            </div>
          </motion.div>
          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="
                  absolute right-2 mt-3 w-72 
                  bg-white/80 backdrop-blur-xl 
                  border border-gray-200 
                  rounded-2xl shadow-2xl z-50 
                  overflow-hidden
                "
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
                      ${
                        loading
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
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        saveInfoSelected ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          saveInfoSelected ? 'translate-x-6' : 'translate-x-1'
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
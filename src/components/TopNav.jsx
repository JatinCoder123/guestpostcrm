import { Search, Sparkles, Bell, LogOut, X, User2Icon, ChevronDown } from "lucide-react";
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
  const [input, setInput] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { loading, error, user } = useSelector((state) => state.user);
  const { setEnteredEmail } = useContext(PageContext);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
  };

  const handleSearch = () => {
    if (input.trim()) {
      navigateTo("");
      setEnteredEmail(input);
    }
  };

  const handleClear = () => {
    if (input.trim()) {
      setInput("");
      navigateTo("");
      setEnteredEmail(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPeriod = (option) => {
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
        <div className="flex items-center gap-3 mx-6 w-full max-w-xl flex-shrink-0">
          <div className="relative flex-1 min-w-[250px] max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={input}
              placeholder="Input Email to Search"
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="flex cursor-pointer items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4 text-white" />
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="flex cursor-pointer items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Period Dropdown */}
        <DropDown
          options={periodOptions}
          handleSelectOption={handleSelectPeriod}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 relative">
        {/* Notification Button */}
        <button className="flex cursor-pointer items-center gap-2 p-4 bg-[#f1b911] text-white rounded-full hover:bg-[#cae445] transition-colors">
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between w-full px-4 py-2 bg-white rounded-lg border">
  {/* User Name */}
  <p className="font-semibold text-gray-900 truncate">
    {user?.name || "User"}
  </p>

  {/* Logout Button */}
  <motion.button
    whileHover={!loading ? { scale: 1.05 } : {}}
    whileTap={!loading ? { scale: 0.95 } : {}}
    onClick={handleLogout}
    disabled={loading}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
      ${
        loading
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "text-red-600 hover:bg-red-50"
      }`}
  >
    <LogOut className="w-5 h-5" />
   
  </motion.button>
</div>
  
                      <p className="text-sm text-gray-500 truncate item-center">
                        {user?.email || "user@example.com"}
                      </p>
                 
                    </div>
                  </div>
                </div>

                
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
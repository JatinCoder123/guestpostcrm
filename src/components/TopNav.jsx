import { Search, Sparkles, Bell, LogOut, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ladgerAction } from "../store/Slices/ladger";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { logout, userAction } from "../store/Slices/userSlice";
import DropDown from "./DropDown";

export function TopNav() {
  const [input, setInput] = useState("");
  const { loading, error, user } = useSelector((state) => state.user);
  const { setEnteredEmail } = useContext(PageContext);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

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

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [dispatch, error]);

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
      {/* Left Section */}
      <div className="flex items-center gap-3 cursor-pointer">
        <img
          onClick={() => navigateTo("")}
          src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/png%20(1).png"
          alt="GuestPostCRM Logo"
          className="w-80 h-10 object-contain rounded-full"
        />

        {/* Search Bar */}
        <div className="flex  items-center gap-3 mx-6 w-full max-w-xl flex-shrink-0">
          <div className="relative flex-1 min-w-[250px] max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={input}
              placeholder="Input Email to Search"
              onChange={(e) => setInput(e.target.value)}
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
            className="flex  cursor-pointer items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <button
          onClick={() => navigateTo("ai-credits")}
          className="flex cursor-pointer items-center gap-2 p-4 bg-[#f1b911] text-white rounded-full hover:bg-[#cae445] transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* AI Credits Button */}
        <button
          onClick={() => navigateTo("ai-credits")}
          className="flex cursor-pointer items-center gap-2 p-4 bg-[#5E17EB] text-white rounded-full hover:bg-[#4d12c4] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border shadow-sm">
              <span className="text-black font-semibold text-lg">
                {(() => {
                  if (!user?.name) return "U";
                  const parts = user.name.trim().split(" ");
                  if (parts.length === 1) return parts[0][0].toUpperCase();
                  return (
                    parts[0][0] + parts[parts.length - 1][0]
                  ).toUpperCase();
                })()}
              </span>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            onClick={handleLogout}
            disabled={loading}
            className={`p-3 rounded-xl cursor-pointer shadow-md transition-all duration-200 flex items-center justify-center
              ${
                loading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg"
              }`}
          >
            {loading ? (
              <span className="text-sm">...</span>
            ) : (
              <LogOut className="w-5 h-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

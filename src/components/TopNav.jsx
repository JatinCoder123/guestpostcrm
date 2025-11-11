import { Search, Clock, ChevronDown, Sparkles, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { getLadgerEmail } from "../store/Slices/ladger";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TopNav() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const handleSearch = () => {
    if (input.trim()) {
      dispatch(getLadgerEmail(input));
    }
  };
  const navigateTo = useNavigate();
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigateTo("/Dashboard")}
      >
        <img
      src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/png%20(1).png"
      alt="GuestPostCRM Logo"
      className="w-80 h-10 object-contain rounded-full"/>

      {/* Search Bar */}
      <div className="flex-1 flex  max-w-md mx-6 gap-3 mx-6 w-full max-w-2xl flex-shrink-0">
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
          className="flex cursor-pointer  items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-sm">Search</span>
        </button>
        <button
          onClick={() => setInput("")}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-sm">Clear</span>
        </button>
      </div>
       {/* My Timeline Dropdown */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Clock className="w-4 h-4 text-gray-600" />
          <div className="text-left">
            <div className="text-gray-900 text-sm">My Timeline</div>
            <div className="text-gray-500 text-xs">Everything</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* Today Dropdown */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <span className="text-gray-900 text-sm">Today</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* AI Credits Button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#5E17EB] text-white rounded-lg hover:bg-[#4d12c4] transition-colors">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">AI Credits</span>
        </button>

        {/* Profile Icon */}
        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white hover:shadow-lg transition-shadow">
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

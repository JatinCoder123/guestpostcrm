import { Search, Clock, ChevronDown, Sparkles, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getLadgerEmail, ladgerAction } from "../store/Slices/ladger";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TopNav() {
  const [input, setInput] = useState("");
  const [openPeriod, setOpenPeriod] = useState(false);
  const {timeline} = useSelector(state=>state.ladger)

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const handleSearch = () => {
    if (input.trim()) {
      dispatch(getLadgerEmail(input));
    }
  };

  // Dropdown items
  const periodOptions = [
   "today","yesterday","this_week","last_week","last_month",
  ];

  const handleSelectPeriod = (option) => {
    dispatch(ladgerAction.setTimeline(option))
    setOpenPeriod(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigateTo("/Dashboard")}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-green-400"></div>
          </div>
        </div>
        <span className="text-gray-900">GuestPostCRM</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 flex max-w-md mx-6 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={input}
            placeholder="Search emails..."
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
          onClick={() => setInput("")}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-sm">Clear</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 relative">
        {/* My Timeline Dropdown */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Clock className="w-4 h-4 text-gray-600" />
          <div className="text-left">
            <div className="text-gray-900 text-sm">My Timeline</div>
            <div className="text-gray-500 text-xs">Everything</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* Period Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenPeriod(!openPeriod)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-900 text-sm">{timeline}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {openPeriod && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {periodOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectPeriod(option)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

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

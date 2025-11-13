import {
  Search,
  Clock,
  ChevronDown,
  Sparkles,
  User,
  Phone,
  Bell,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getLadgerEmail, ladgerAction } from "../store/Slices/ladger";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function TopNav() {
  const [input, setInput] = useState("");
  const [openPeriod, setOpenPeriod] = useState(false);
  const { timeline } = useSelector((state) => state.ladger);
  const dropDownRef = useRef();
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const handleSearch = () => {
    if (input.trim()) {
      dispatch(getLadgerEmail(input));
    }
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openPeriod &&
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      ) {
        setOpenPeriod(false); // collapse sidebar
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  // Dropdown items
  const periodOptions = [
    { period: "today", title: "Today" },
    { period: "yesterday", title: "Yesterday" },
    { period: "this_week", title: "This Week" },
    { period: "last_week", title: "Last Week" },
    { period: "this_month", title: "This Month" },
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
            onClick={() => setInput("")}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-sm">Clear</span>
          </button>
        </div>
        {/* Period Dropdown */}
        <div className="relative" ref={dropDownRef}>
          <button
            onClick={() => setOpenPeriod(!openPeriod)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-900 text-sm ">
              {periodOptions.find((option) => option.period == timeline).title}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {openPeriod && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {periodOptions.map((option) => (
                <div
                  key={option.period}
                  onClick={() => handleSelectPeriod(option.period)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
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

        {/* Profile Icon */}
        <div className="border-l-2 p-2">
          <button className="p-4  rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white hover:shadow-lg transition-shadow">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

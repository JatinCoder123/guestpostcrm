import { useState, useEffect } from "react";
import {
  Search,
  Clock,
  ChevronDown,
  Sparkles,
  Mail,
  UserCircle,
  Briefcase,
  ShoppingCart,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { useDispatch } from "react-redux";
import { getLadger } from "../store/Slices/ladger";

const initialEvents = [
  {
    id: "1",
    type: "normal",
    sender: "partner@company.com",
    title: "New Email Received",
    subject: "Guest Post Partnership",
    motive: "Business Collaboration",
    mailerSummary: "Complete Sales Cycle",
    timestamp: "06 Nov 25 at 03:15 PM",
  },
  {
    id: "2",
    type: "spam",
    sender: "suspicious@sender.com",
    title: "Spam Detected",
    subject: "Suspicious Activity Detected",
    motive: "Spam Prevention",
    mailerSummary: "Email flagged by spam filter",
    timestamp: "06 Nov 25 at 03:15 PM",
    status: "Requires Review",
  },
  {
    id: "3",
    type: "new-email",
    sender: "client@premium.com",
    title: "New Email Received",
    subject: "Guest Post Opportunity - Tech Niche",
    motive: "Partnership Inquiry",
    mailerSummary: "New business opportunity received",
    timestamp: "06 Nov 25 at 03:10 PM",
  },
];

export function Timeline() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineEvents, setTimelineEvents] = useState(initialEvents);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const dispatch = useDispatch();

  const refreshTimeline = () => {
    console.log("Refreshing timeline...");
    setLastRefresh(new Date());
    // In real app, fetch new data from API
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshTimeline();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getBorderColor = (type) => {
    if (type === "spam") return "border-l-yellow-500";
    if (type === "new-email") return "border-l-blue-500";
    return "border-l-transparent";
  };

  const getIcon = (type) => {
    if (type === "spam")
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (type === "new-email")
      return <Inbox className="w-5 h-5 text-blue-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5E17EB] to-[#8B5CF6] flex items-center justify-center text-white">
                GP
              </div>
              <span className="text-gray-900">GuestPostCRM</span>
            </div>

            {/* Search Bar */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search emails or campaigns..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* My Timeline Dropdown */}
            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Clock className="w-4 h-4" />
              <span>My Timeline</span>
            </button>

            {/* Today Dropdown */}
            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <span>Today</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* AI Credits Button */}
            <Button className="bg-gradient-to-r from-[#5E17EB] to-[#8B5CF6] hover:from-[#4E0FCB] hover:to-[#7B4CE6] text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Credits
            </Button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white">
              U
            </div>

            {/* Login with Google */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Login with Google
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#5E17EB] to-[#8B5CF6] px-6 py-6">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-white text-2xl">Welcome GuestPostCRM</h1>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <Mail className="w-4 h-4 text-white" />
            <Input
              type="email"
              placeholder="your.business@email.com"
              className="bg-white border-0 text-gray-900 placeholder:text-gray-500"
              defaultValue="your.business@email.com"
            />
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-gray-700" />
            <h2 className="text-gray-900 text-xl tracking-wider">TIMELINE</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="border-blue-500 cursor-pointer text-blue-600 hover:bg-blue-50"
              onClick={() => dispatch(getLadger())}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Auto Refresh:</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              {autoRefresh && (
                <span className="text-xs text-gray-500">(every 5s)</span>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div
              key={event.id}
              className={`bg-white rounded-lg border-l-4 ${getBorderColor(
                event.type
              )} shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* First Event - Special Layout */}
              {index === 0 && (
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1 tracking-wide">
                        SUBJECT
                      </div>
                      <div className="text-gray-900">{event.subject}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1 tracking-wide">
                        MOTIVE
                      </div>
                      <div className="text-gray-900">{event.motive}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1 tracking-wide">
                        MAILER SUMMARY
                      </div>
                      <div className="text-gray-900">{event.mailerSummary}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Mail className="w-4 h-4 mr-2" />
                      View Email
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      <UserCircle className="w-4 h-4 mr-2" />
                      View Contact
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Briefcase className="w-4 h-4 mr-2" />
                      View Deal
                    </Button>
                    <Button className="bg-gray-500 hover:bg-gray-600 text-white">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Orders
                    </Button>
                    <Button className="bg-gradient-to-r from-[#5E17EB] to-[#8B5CF6] hover:from-[#4E0FCB] hover:to-[#7B4CE6] text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Reply
                    </Button>
                  </div>
                </div>
              )}

              {/* Other Events */}
              {index !== 0 && (
                <div className="p-6">
                  <div className="text-sm text-gray-600 mb-3">
                    {event.sender}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getIcon(event.type)}
                      <h3 className="text-gray-900">{event.title}</h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {event.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1 tracking-wide">
                        SUBJECT
                      </div>
                      <div className="text-gray-900">{event.subject}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1 tracking-wide">
                        MOTIVE
                      </div>
                      <div className="text-gray-900">{event.motive}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1 tracking-wide">
                        MAILER SUMMARY
                      </div>
                      <div className="text-gray-900">{event.mailerSummary}</div>
                    </div>
                  </div>

                  {event.status && (
                    <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-md text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {event.status}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

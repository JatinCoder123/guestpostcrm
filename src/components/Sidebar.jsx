import {
  Clock,
  Mail,
  Shield,
  MessageSquare,
  Handshake,
  Gift,
  ShoppingCart,
  FileText,
  CreditCard,
  Link2,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Sidebar({
  currentPage,
  onPageChange,
  collapsed,
  onToggleCollapse,
}) {
  const navigateTo = useNavigate();
  const menuItems = [
    {
      id: "unreplied-emails",
      label: "Unreplied Emails",
      icon: Mail,
      count: 24,
      color: "text-red-600",
      bgColor: "hover:bg-red-50",
      countColor: "bg-red-500 text-white",
    },
    {
      id: "spam-detection",
      label: "Spam Detection",
      icon: Shield,
      count: 4,
      color: "text-orange-600",
      bgColor: "hover:bg-orange-50",
      countColor: "bg-orange-500 text-white",
    },
    {
      id: "unanswered",
      label: "Unanswered",
      icon: MessageSquare,
      count: 24,
      color: "text-purple-600",
      bgColor: "hover:bg-purple-50",
      countColor: "bg-purple-500 text-white",
    },
    {
      id: "deals",
      label: "Deals",
      icon: Handshake,
      count: 0,
      color: "text-blue-600",
      bgColor: "hover:bg-blue-50",
      countColor: "bg-blue-500 text-white",
    },
    {
      id: "offers",
      label: "Offers",
      icon: Gift,
      count: 0,
      color: "text-green-600",
      bgColor: "hover:bg-green-50",
      countColor: "bg-green-500 text-white",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      count: 0,
      color: "text-indigo-600",
      bgColor: "hover:bg-indigo-50",
      countColor: "bg-indigo-500 text-white",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      count: 0,
      color: "text-yellow-600",
      bgColor: "hover:bg-yellow-50",
      countColor: "bg-yellow-500 text-white",
    },
    {
      id: "payment-missed",
      label: "Payment Missed",
      icon: CreditCard,
      count: 0,
      color: "text-red-600",
      bgColor: "hover:bg-red-50",
      countColor: "bg-red-500 text-white",
    },
    {
      id: "link-removal",
      label: "Link Removal",
      icon: Link2,
      count: 0,
      color: "text-pink-600",
      bgColor: "hover:bg-pink-50",
      countColor: "bg-pink-500 text-white",
    },
    {
      id: "deal-reminders",
      label: "Deal Reminders",
      icon: Bell,
      count: 0,
      color: "text-cyan-600",
      bgColor: "hover:bg-cyan-50",
      countColor: "bg-cyan-500 text-white",
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-white border-r border-gray-200 min-h-[calc(100vh-65px)] p-4 transition-all duration-300 relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      <div className="space-y-2">
        {/* Live Button */}
        <button
  onClick={() => onPageChange("live")}
  className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all ${
    currentPage === "live"
      ? "bg-green-600 text-white shadow-lg" // stronger color + bigger shadow
      : "bg-green-500 text-green-800 hover:bg-green-500" // higher opacity green
  }`}
>
  <div className="flex items-center justify-center gap-2">
    <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
    {!collapsed && <span className="font-medium">Live</span>}
  </div>
</button>

        {/* Menu Items */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
              currentPage === item.id
                ? `bg-gray-100 ${item.color}`
                : `text-gray-700 ${item.bgColor}`
            }`}
          >
            <item.icon
              className={`w-4 h-4 flex-shrink-0 ${
                currentPage === item.id ? "" : "text-gray-500"
              }`}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${item.countColor} min-w-[24px] text-center`}
                >
                  {item.count}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

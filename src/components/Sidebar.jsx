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
import { useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { pageContext } from "./context/activePageContext";

export function Sidebar({ collapsed, onToggleCollapse }) {
  const navigateTo = useNavigate();
  const unrepliedCount = useSelector((state) => state.unreplied?.count ?? 0);
  const unansweredCount = useSelector((state) => state.unanswered?.count ?? 0);
  const dealCount = useSelector((state) => state.deals?.count ?? 0);
  const offersCount = useSelector((state) => state.offers?.count ?? 0);
  const detectionCount = useSelector((state) => state.detection?.count ?? 0);
  const invoiceCount = useSelector((state) => state.invoices?.count ?? 0);
  const orderCount = useSelector((state) => state.orders?.count ?? 0);
  const { activePage, setActivePage } = useContext(pageContext);

  const menuItems = [
    {
      id: "unreplied-emails",
      label: "Unreplied Emails",
      icon: Mail,
      count: unrepliedCount,
      color: "text-red-600",
      bgColor: "hover:bg-red-50",
      countColor: "bg-red-500 text-white",
    },
    {
      id: "spam-detection",
      label: "Spam Detection",
      icon: Shield,
      count: detectionCount,
      color: "text-orange-600",
      bgColor: "hover:bg-orange-50",
      countColor: "bg-orange-500 text-white",
    },
    {
      id: "unanswered",
      label: "Unanswered",
      icon: MessageSquare,
      count: unansweredCount,
      color: "text-purple-600",
      bgColor: "hover:bg-purple-50",
      countColor: "bg-purple-500 text-white",
    },
    {
      id: "deals",
      label: "Deals",
      icon: Handshake,
      count: dealCount,
      color: "text-blue-600",
      bgColor: "hover:bg-blue-50",
      countColor: "bg-blue-500 text-white",
    },
    {
      id: "offers",
      label: "Offers",
      icon: Gift,
      count: offersCount,
      color: "text-green-600",
      bgColor: "hover:bg-green-50",
      countColor: "bg-green-500 text-white",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      count: orderCount,
      color: "text-indigo-600",
      bgColor: "hover:bg-indigo-50",
      countColor: "bg-indigo-500 text-white",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      count: invoiceCount,
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
      count: dealCount,
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
          onClick={() => navigateTo("")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activePage === ""
              ? "bg-green-500 text-white shadow-md"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {!collapsed && <span>Live</span>}
          </div>
        </button>

        {/* Menu Items */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
              activePage === item.id
                ? `bg-gray-100 ${item.color}`
                : `text-gray-700 ${item.bgColor}`
            }`}
          >
            <item.icon
              className={`w-4 h-4 flex-shrink-0 ${
                activePage === item.id ? "" : "text-gray-500"
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

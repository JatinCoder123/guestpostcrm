import {
  Mail,
  Handshake,
  Gift,
  ShoppingCart,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Radio,
  Forward,
  Heart,
  RectangleEllipsis,
  Link,
  BellRing,
  Contact2Icon,
  CircleX,
  Layers,
  BellElectric,
} from "lucide-react";

import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion, } from "framer-motion";
import { LoadingSpin } from "./Loading";
import { BarChart3 } from "lucide-react";
import { useEmailStats } from "../queries/email.queries";
import { useContactStats } from "../queries/contact.queries";
import { useOrderStats } from "../queries/orders.queries";
import { useForwardedStats } from "../queries/forwarded.queries";
import { useDealStats } from "../queries/deals.queries";
import { useOfferStats } from "../queries/offers.queries";
import { useExchangeStats } from "../queries/exchange.queries";
import { useInvoiceStats } from "../queries/invoice.queries";
import { useFavoriteStats } from "../queries/favourite.queries";
import { useReminderStats } from "../queries/reminder.queries";

export function Sidebar() {
  const navigateTo = useNavigate();

  const { activePage, setActivePage, collapsed, setSidebarCollapsed } =
    useContext(PageContext);

  const [openSettingsCard, setOpenSettingsCard] = useState(false);
  const cardRef = useRef(null);

  // Close modal when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setOpenSettingsCard(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const { count: orderRemCount, loading: orderRemLoading } = useSelector(
    (s) => s.reminders,
  );

  const { isPending: contactStatLoading, data: contactStats } = useContactStats()
  const { isPending: emailStatsLoading, data: emailsStats } = useEmailStats()
  const { isPending: orderStatsLoading, data: ordersStats } = useOrderStats()
  const { isPending: forwardStatLoading, data: forwardStats } = useForwardedStats()
  const { isPending: favStatLoading, data: favStats } = useFavoriteStats()
  const { isPending: dealStatLoading, data: dealStats } = useDealStats()
  const { isPending: offerStatLoading, data: offerStats } = useOfferStats()
  const { isPending: exchangeStatLoading, data: exchangeStats } = useExchangeStats()
  const { isPending: invoiceStatLoading, data: invoiceStats } = useInvoiceStats()
  const { isPending: reminderStatLoading, data: reminderStats } = useReminderStats()



  // MENU ITEMS WITH COLORS
  const menuItems = [
    {
      id: "unreplied-emails",
      label: "Unreplied ",
      icon: Mail,
      loading: emailStatsLoading,
      count: emailsStats?.stats?.unreplied?.count,
      color: "text-rose-600",
      hover: "hover:bg-rose-50",
      countBg: "bg-rose-500 text-white",
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: Contact2Icon,
      loading: contactStatLoading,
      count: contactStats?.stats?.all?.count,
      color: "text-fuchsia-600",
      hover: "hover:bg-fuchsia-50",
      countBg: "bg-fuchsia-500 text-white",
    },
    {
      id: "forwarded-emails",
      label: "Assigned",
      icon: Forward,
      loading: forwardStatLoading,
      count: forwardStats?.stats?.forwarded?.count,
      color: "text-sky-600",
      hover: "hover:bg-sky-50",
      countBg: "bg-sky-500 text-white",
    },
    {
      id: "favourite-emails",
      label: "Favourite ",
      icon: Heart,
      loading: favStatLoading,
      count: favStats?.stats?.favorite?.count,
      color: "text-pink-600",
      hover: "hover:bg-pink-50",
      countBg: "bg-pink-500 text-white",
    },
    {
      id: "link-exchange",
      label: "Links Exchange",
      icon: Link,
      loading: exchangeStatLoading,
      count: exchangeStats?.stats?.exchange?.count,
      color: "text-violet-600",
      hover: "hover:bg-violet-50",
      countBg: "bg-violet-500 text-white",
    },
    {
      id: "offers",
      label: "Offers",
      icon: Gift,
      loading: offerStatLoading,
      count: offerStats?.stats?.active?.count,
      color: "text-green-600",
      hover: "hover:bg-green-50",
      countBg: "bg-green-500 text-white",
    },
    {
      id: "deals",
      label: "Deals",
      icon: Handshake,
      loading: dealStatLoading,
      count: dealStats?.stats?.active?.count,
      color: "text-blue-600",
      hover: "hover:bg-blue-50",
      countBg: "bg-blue-500 text-white",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      loading: orderStatsLoading,
      count: ordersStats?.stats?.new?.count,
      color: "text-cyan-600",
      hover: "hover:bg-cyan-50",
      countBg: "bg-cyan-500 text-white",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      loading: invoiceStatLoading,
      count: invoiceStats?.stats?.all?.count,
      color: "text-orange-600",
      hover: "hover:bg-orange-50",
      countBg: "bg-orange-500 text-white",
    },

    {
      id: "reminders",
      label: "Reminders",
      icon: BellRing,
      loading: reminderStatLoading,
      count: reminderStats?.stats?.all?.count,
      color: "text-lime-600",
      hover: "hover:bg-lime-50",
      countBg: "bg-lime-500 text-white",
    },
    {
      id: "Duplicate Rejected",
      label: "Duplicate Rejected",
      icon: CircleX,
      loading: false,
      count: null,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-red-500 text-white",
    },
    {
      id: "Listicle",
      label: "Listicle",
      icon: Layers,
      loading: false,
      count: null,
      color: "text-blue-600",
      hover: "hover:bg-blue-50",
      countBg: "bg-blue-500 text-white",
    },
    {
      id: "reminder-management",
      label: "Reminder Management",
      icon: BellElectric,
      loading: null,
      count: null,
      color: "text-lime-600",
      hover: "hover:bg-lime-50",
      countBg: "bg-lime-500 text-white",
    },
    {
      id: "other",
      label: "Others",
      icon: RectangleEllipsis,
      loading: orderRemLoading,
      count: null,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-blue-500 text-white",
    },
    {
      id: "view-reports",
      label: "Reports",
      icon: BarChart3,
      loading: false,
      count: null,
      color: "text-teal-600",
      hover: "hover:bg-teal-50",
      countBg: "bg-teal-500 text-white ",
    }
  ];

  return (
    <>
      {/* SIDEBAR */}
      <motion.div
        data-tour="sidebar"
        animate={{ width: collapsed ? 100 : 260 }}
        transition={{ duration: 0.25 }}
        className="bg-white border-r border-gray-200 min-h-full
                   p-2 relative flex flex-col shadow-sm"
      >
        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className={`fixed ${collapsed ? "left-23" : "left-62"
            } top-[50%] w-7 h-7 bg-white border border-gray-300 cursor-pointer
                     rounded-full flex items-center justify-center hover:bg-gray-100 shadow`}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* LIVE BUTTON */}
        <button
          data-tour="sidebar-live"
          onClick={() => {
            setActivePage("");
            navigateTo("");
          }}
          className={`w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all
            ${activePage === ""
              ? "bg-green-500 text-white"
              : "bg-green-50 text-green-700"
            }`}
        >
          <Radio className="w-5 h-5 animate-pulse" />
          {!collapsed && <span className="font-medium">Live</span>}
        </button>

        {/* MENU ITEMS */}
        <div className="mt-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSidebarCollapsed(true);
                setActivePage(item.id);
                navigateTo(item.id);
              }}
              className={`w-full flex items-center gap-2 p-2  transition-all duration-200 cursor-pointer
                ${collapsed ? "justify-center" : ""}
                    ${activePage === item.id
                  ? `${item.countBg}  shadow-2xl rounded-full `
                  : `text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${item.hover} rounded-lg`
                }
                `}
            >
              {/* FIXED ICON SIZE ALWAYS */}
              <item.icon
                className={`w-5 h-5 transition-all duration-100 ease-out
    ${activePage === item.id
                    ? " scale-120" : ""

                  }`}
              />

              {/* SHOW LABEL + COUNT ONLY WHEN NOT COLLAPSED */}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count != null && (
                    <span
                      className={`px-2 py-0.5 rounded-full ${activePage == item.id ? "text-md" : "text-xs"} ${item.countBg}`}
                    >
                      {item.loading ? <LoadingSpin /> : item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* SETTINGS BUTTON */}
        <button
          data-tour="sidebar-settings"
          onClick={() => {
            setSidebarCollapsed(true);
            navigateTo("settings");
          }}
          className=" fixed bottom-2 cursor-pointer mt-auto flex items-center gap-3 px-3 py-2.5 
                     bg-gray-200 hover:bg-gray-300 rounded-lg transition-all shadow"
        >
          <Settings className="w-5 h-5 text-gray-700" />
        </button>
      </motion.div>


    </>
  );
}

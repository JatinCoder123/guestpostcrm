import {
  Mail,
  Handshake,
  Gift,
  ShoppingCart,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Settings,
  Cpu,
  Radio,
  Globe,
  User,
  Forward,
  Heart,
  Cog,
  Layers,
  RectangleEllipsis,
  Link2Off,
  Link,
  BellRing,
  Plus,
  Contact2Icon,
  Cable,
  Home,
} from "lucide-react";

import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion, AnimatePresence, color } from "framer-motion";
import { LoadingSpin } from "./Loading";
import { BarChart3 } from "lucide-react";
import { headingLogo, logoText } from "../assets/assets";

export function Sidebar() {
  const navigateTo = useNavigate();

  const { activePage, setActivePage, collapsed, setSidebarCollapsed } =
    useContext(PageContext);
  const [openMenus, setOpenMenus] = useState({});
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

  // Redux counts
  const { countLoading, emailsCount } = useSelector(
    (s) => s.unreplied,
  );
  const { contactLoading } = useSelector(
    (s) => s.viewEmail,
  );
  const { loading: dealsLoading, summary: dealsSummary } = useSelector(
    (s) => s.deals,
  );
  const { loading: offersLoading, summary: offersSummary } = useSelector(
    (s) => s.offers,
  );

  const { count: invoiceCount, loading: invoicesLoading } = useSelector(
    (s) => s.invoices,
  );
  const { loading: ordersLoading, summary: ordersSummary } = useSelector(
    (s) => s.orders,
  );
  const { count: orderRemCount, loading: orderRemLoading } = useSelector(
    (s) => s.reminders,
  );
  const { count: backlinkCount, loading: backlinkLoading } = useSelector(
    (s) => s.backlinks,
  );
  const { count: contactCount, loading: allContactLoading } = useSelector(
    (s) => s.contacts,
  );


  const { count: linkExchangeCount, loading: linkExchangeLoading } =
    useSelector((s) => s.linkExchange);
  const { count: favCount, loading: favLoading } = useSelector((s) => s.fav);
  const { count: forwardCount, loading: forwardLoading } = useSelector(
    (s) => s.forwarded,
  );

  // MENU ITEMS WITH COLORS
  const menuItems = [
    {
      id: "unreplied-emails",
      label: "Unreplied ",
      icon: Mail,
      loading: countLoading,
      count: emailsCount?.inbound,
      color: "text-rose-600",
      hover: "hover:bg-rose-50",
      countBg: "bg-rose-500 text-white",
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: Contact2Icon,
      loading: allContactLoading,
      count: contactCount,
      color: "text-fuchsia-600",
      hover: "hover:bg-fuchsia-50",
      countBg: "bg-fuchsia-500 text-white",
    },
    {
      id: "forwarded-emails",
      label: "Assigned",
      icon: Forward,
      loading: forwardLoading,
      count: forwardCount,
      color: "text-sky-600",
      hover: "hover:bg-sky-50",
      countBg: "bg-sky-500 text-white",
    },
    {
      id: "favourite-emails",
      label: "Favourite ",
      icon: Heart,
      loading: favLoading,
      count: favCount,
      color: "text-pink-600",
      hover: "hover:bg-pink-50",
      countBg: "bg-pink-500 text-white",
    },
    {
      id: "link-exchange",
      label: "Links Exchange",
      icon: Link,
      loading: linkExchangeLoading,
      count: linkExchangeCount,
      color: "text-violet-600",
      hover: "hover:bg-violet-50",
      countBg: "bg-violet-500 text-white",
    },
    {
      id: "offers",
      label: "Offers",
      icon: Gift,
      loading: offersLoading,
      count: offersSummary?.active_offers,
      color: "text-green-600",
      hover: "hover:bg-green-50",
      countBg: "bg-green-500 text-white",
    },
    {
      id: "deals",
      label: "Deals",
      icon: Handshake,
      loading: dealsLoading,
      count: dealsSummary?.active_deals,
      color: "text-blue-600",
      hover: "hover:bg-blue-50",
      countBg: "bg-blue-500 text-white",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      loading: ordersLoading,
      count: ordersSummary?.new_orders,
      color: "text-cyan-600",
      hover: "hover:bg-cyan-50",
      countBg: "bg-cyan-500 text-white",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      loading: invoicesLoading,
      count: invoiceCount,
      color: "text-orange-600",
      hover: "hover:bg-orange-50",
      countBg: "bg-orange-500 text-white",
    },

    {
      id: "reminders",
      label: "Reminders",
      icon: BellRing,
      loading: orderRemLoading,
      count: orderRemCount,
      color: "text-lime-600",
      hover: "hover:bg-lime-50",
      countBg: "bg-lime-500 text-white",
    },
    {
      id: "backlinks",
      label: "Backlinks",
      icon: Cable,
      loading: backlinkLoading,
      count: backlinkCount,
      color: "text-teal-600",
      hover: "hover:bg-teal-50",
      countBg: "bg-teal-500 text-white",
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
      children: [
        {
          id: "market-place",
          label: "Marketplace",
          icon: Globe,
          color: "text-blue-600",
          hover: "hover:bg-blue-50",
          countBg: "bg-blue-500 text-white",
          count: emailsCount?.inbound,
          loading: countLoading,
        },
        {
          id: "moved-emails",
          label: "Moved Emails",
          icon: Mail,
          color: "text-orange-600",
          hover: "hover:bg-orange-50",
          countBg: "bg-orange-500 text-white",
          count: forwardCount,
          loading: forwardLoading,
        },
        {
          id: "default-report",
          label: "Defaulter Emails",
          icon: BellRing,
          color: "text-red-600",
          hover: "hover:bg-red-50",
          countBg: "bg-red-500 text-white",
          count: favCount,
          loading: favLoading,
        },
        {
          id: "tag-manager",
          label: "Tag Manager",
          icon: Layers,
          color: "text-violet-600",
          hover: "hover:bg-violet-50",
          countBg: "bg-violet-500 text-white",
          count: forwardCount,
          loading: forwardLoading,
        },
        {
          id: "ip-manager",
          label: "IP Manager",
          icon: Cpu,
          color: "text-cyan-600",
          hover: "hover:bg-cyan-50",
          countBg: "bg-cyan-500 text-white",
          count: favCount,
          loading: favLoading,
        },
      ]
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
    },
  ];

  return (
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
      <button className="flex items-center p-1">
        <img
          src={headingLogo}
          className="w-72 h-10 object-contain cursor-pointer mt-1 mb-4"
          onClick={() => navigateTo("")}
        />{
          !collapsed && <img
            src={logoText}
            className="w-50 h-10 object-contain cursor-pointer mt-1 mb-4"
            onClick={() => navigateTo("")}
          />
        }

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

      <div className="mt-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const hasChildren = item.children?.length > 0;
          const isOpen = openMenus[item.id];

          return (
            <div key={item.id}>
              {/* PARENT MENU */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    setOpenMenus((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }));
                  } else {
                    setSidebarCollapsed(true);
                    setActivePage(item.id);
                    navigateTo(item.id);
                  }
                }}
                className={`w-full flex items-center gap-2 p-2 transition-all duration-200 cursor-pointer
            ${collapsed ? "justify-center" : ""}
            ${activePage === item.id
                    ? `${item.countBg} shadow-2xl rounded-xl`
                    : `text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${item.hover} rounded-xl`
                  }
          `}
              >
                <item.icon className="w-5 h-5 shrink-0" />

                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">
                      {item.label}
                    </span>

                    {hasChildren && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                          }`}
                      />
                    )}

                    {!hasChildren && item.count != null && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${item.countBg}`}
                      >
                        {item.loading ? (
                          <LoadingSpin />
                        ) : (
                          item.count
                        )}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* CHILDREN */}
              <AnimatePresence>
                {hasChildren && isOpen && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-6 mt-2 space-y-1 overflow-hidden"
                  >
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSidebarCollapsed(true);
                          setActivePage(child.id);
                          navigateTo(child.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all
      ${activePage === child.id
                            ? `${child.countBg} shadow-lg`
                            : `text-gray-600 ${child.hover}`
                          }
    `}
                      >
                        <div className="flex items-center gap-2">
                          <child.icon
                            className={`w-4 h-4 ${activePage === child.id
                              ? "text-white"
                              : child.color
                              }`}
                          />

                          <span>{child.label}</span>
                        </div>

                        {child.count != null && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${activePage === child.id
                              ? "bg-white/20 text-white"
                              : child.countBg
                              }`}
                          >
                            {child.loading ? (
                              <LoadingSpin />
                            ) : (
                              child.count
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
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
  );
}

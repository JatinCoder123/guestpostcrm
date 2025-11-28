import {
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
  ShoppingBag,
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
  PlayIcon,
} from "lucide-react";

import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpin } from "./Loading";

export function Sidebar({ collapsed, setSidebarCollapsed, onToggleCollapse }) {
  const navigateTo = useNavigate();
  const { activePage, setActivePage } = useContext(PageContext);

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
  const { count: unrepliedCount, loading: unrepliedLoading } = useSelector(
    (s) => s.unreplied
  );
  const { count: unansweredCount, loading: unansweredLoading } = useSelector(
    (s) => s.unanswered
  );
  const { count: dealCount, loading: dealsLoading } = useSelector(
    (s) => s.deals
  );
  const { count: offersCount, loading: offersLoading } = useSelector(
    (s) => s.offers
  );
  const { count: detectionCount, loading: detectionLoading } = useSelector(
    (s) => s.detection
  );
  const { count: invoiceCount, loading: invoicesLoading } = useSelector(
    (s) => s.invoices
  );
  const { count: orderCount, loading: ordersLoading } = useSelector(
    (s) => s.orders
  );
  const { count: linkRemCount, loading: linkRemLoading } = useSelector(
    (s) => s.linkRem
  );
  const { count: orderRemCount, loading: orderRemLoading } = useSelector(
    (s) => s.orderRem
  );
  const { count: paymentRemCount, loading: paymentRemLoading } = useSelector(
    (s) => s.paymentRem
  );
  const { count: dealRemCount, loading: dealRemLoading } = useSelector(
    (s) => s.dealRem
  );
  const { count: favCount, loading: favLoading } = useSelector((s) => s.fav);
  const { count: bulkCount, loading: bulkLoading } = useSelector((s) => s.bulk);
  const { count: forwardCount, loading: forwardLoading } = useSelector(
    (s) => s.forwarded
  );

  // MENU ITEMS WITH COLORS
  const menuItems = [
    {
      id: "unreplied-emails",
      label: "Unreplied ",
      icon: Mail,
      loading: unrepliedLoading,
      count: unrepliedCount,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-red-500 text-white",
    },
    {
      id: "unanswered",
      label: "Replied",
      icon: MessageSquare,
      loading: unansweredLoading,
      count: unansweredCount,
      color: "text-purple-600",
      hover: "hover:bg-purple-50",
      countBg: "bg-purple-500 text-white",
    },
    {
      id: "forwarded-emails",
      label: "Forwarded ",
      icon: Forward,
      loading: forwardLoading,
      count: forwardCount,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-blue-500 text-white",
    },
    {
      id: "favourite-emails",
      label: "Favourite ",
      icon: Heart,
      loading: favLoading,
      count: favCount,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-pink-500 text-white",
    },
    {
      id: "offers",
      label: "Offers",
      icon: Gift,
      loading: offersLoading,
      count: offersCount,
      color: "text-green-600",
      hover: "hover:bg-green-50",
      countBg: "bg-green-500 text-white",
    },
    {
      id: "deals",
      label: "Deals",
      icon: Handshake,
      loading: dealsLoading,
      count: dealCount,
      color: "text-blue-600",
      hover: "hover:bg-blue-50",
      countBg: "bg-blue-500 text-white",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      loading: ordersLoading,
      count: orderCount,
      color: "text-indigo-600",
      hover: "hover:bg-indigo-50",
      countBg: "bg-indigo-500 text-white",
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      loading: invoicesLoading,
      count: invoiceCount,
      color: "text-yellow-600",
      hover: "hover:bg-yellow-50",
      countBg: "bg-yellow-500 text-white",
    },

    {
      id: "link-removal",
      label: "Link Removal",
      icon: Link2,
      loading: linkRemLoading,
      count: linkRemCount,
      color: "text-pink-600",
      hover: "hover:bg-pink-50",
      countBg: "bg-pink-500 text-white",
    },

    {
      id: "link-exchange",
      label: "Link Exchange",
      icon: Link,
      loading: linkRemLoading,
      count: linkRemCount,
      color: "text-pink-600",
      hover: "hover:bg-pink-50",
      countBg: "bg-pink-500 text-white",
    },
    {
      id: "deal-reminders",
      label: "Deal Reminders",
      icon: Bell,
      loading: dealRemLoading,
      count: dealRemCount,
      color: "text-cyan-600",
      hover: "hover:bg-cyan-50",
      countBg: "bg-cyan-500 text-white",
    },
    {
      id: "order-reminders",
      label: "Order Reminders",
      icon: ShoppingBag,
      loading: ordersLoading,
      count: orderRemCount,
      color: "text-teal-600",
      hover: "hover:bg-teal-50",
      countBg: "bg-teal-500 text-white",
    },
    {
      id: "payment-missed",
      label: "Payment Reminders",
      icon: CreditCard,
      loading: paymentRemLoading,
      count: paymentRemCount,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-red-500 text-white",
    },
    {
      id: "other",
      label: "Others",
      icon: RectangleEllipsis,
      loading: paymentRemLoading,
      count: paymentRemCount,
      color: "text-red-600",
      hover: "hover:bg-red-50",
      countBg: "bg-blue-500 text-white",
    },
  ];

  return (
    <>
      {/* SIDEBAR */}
      <motion.div
        animate={{ width: collapsed ? 100 : 260 }}
        transition={{ duration: 0.25 }}
        className="bg-white border-r border-gray-200 min-h-[calc(100vh-65px)]
                   p-4 relative flex flex-col shadow-sm"
      >
        {/* COLLAPSE BUTTON */}
        <button
          onClick={onToggleCollapse}
          className={`fixed ${collapsed ? "left-23" : "left-62"
            } top-[50%] w-7 h-7 bg-white border border-gray-300 cursor-pointer
                     rounded-full flex items-center justify-center hover:bg-gray-100 shadow`}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* LIVE BUTTON */}
        <button
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer 
                         ${collapsed ? "justify-center" : ""}
                         ${activePage === item.id
                  ? `bg-gray-100 ${item.color}`
                  : `${item.hover} text-gray-700`
                }`}
            >
              {/* FIXED ICON SIZE ALWAYS */}
              <item.icon
                className={`w-5 h-5 ${activePage === item.id ? item.color : "text-gray-500"
                  }`}
              />

              {/* SHOW LABEL + COUNT ONLY WHEN NOT COLLAPSED */}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${item.countBg}`}
                  >
                    {item.loading ? <LoadingSpin /> : <>{item.count}</>}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* SETTINGS BUTTON */}
        <button
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

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {openSettingsCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              ref={cardRef}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-3xl"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Settings</h2>

                <button
                  onClick={() => setOpenSettingsCard(false)}
                  className="w-8 h-8 cursor-pointer  bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Machine Learning */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setOpenSettingsCard(false)}
                  className="p-4 bg-blue-50 rounded-xl shadow hover:shadow-lg"
                >
                  <Cpu className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="font-semibold text-gray-800">
                    Machine Learning
                  </div>
                  <div className="text-sm text-gray-500">
                    Update ML settings
                  </div>
                </motion.button>

                {/* PayPal */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setOpenSettingsCard(false)}
                  className="p-4 bg-green-50 rounded-xl shadow hover:shadow-lg"
                >
                  <CreditCard className="w-8 h-8 text-green-600 mb-2" />
                  <div className="font-semibold text-gray-800">
                    PayPal Credentials
                  </div>
                  <div className="text-sm text-gray-500">Manage payments</div>
                </motion.button>

                {/* Templates */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setOpenSettingsCard(false)}
                  className="p-4 bg-purple-50 rounded-xl shadow hover:shadow-lg"
                >
                  <FileText className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="font-semibold text-gray-800">Templates</div>
                  <div className="text-sm text-gray-500">Manage templates</div>
                </motion.button>

                {/* Websites */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setOpenSettingsCard(false)}
                  className="p-4 bg-indigo-50 rounded-xl shadow hover:shadow-lg"
                >
                  <Globe className="w-8 h-8 text-indigo-600 mb-2" />
                  <div className="font-semibold text-gray-800">Websites</div>
                  <div className="text-sm text-gray-500">Manage websites</div>
                </motion.button>

                {/* Users */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setOpenSettingsCard(false)}
                  className="p-4 bg-yellow-50 rounded-xl shadow hover:shadow-lg"
                >
                  <User className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="font-semibold text-gray-800">Users</div>
                  <div className="text-sm text-gray-500">Manage users</div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

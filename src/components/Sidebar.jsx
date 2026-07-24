import {
  Mail,
  Handshake,
  Gift,
  ShoppingCart,
  FileText,
  ChevronLeft,
  ChevronDown,
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
  PanelLeft,
  Circle,
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
import { useQuery } from "@tanstack/react-query";
import { userKeys } from "../queries/users.queries";
import { getAllUsers } from "../api/users.api";
import logo, { headingLogo } from "../assets/assets";
import { useGpcController } from "../queries/controller.queries";
import { useLayoutPreferences } from "../queries/prefrences.queries";
import Icon from "./ui/Icon/Icon";

export function Sidebar() {
  const navigateTo = useNavigate();
  const { enteredEmail: email } = useContext(PageContext)
  const [expandedGroups, setExpandedGroups] = useState({});
  const { data: sidebarData, isPending: sidebarLoading } = useLayoutPreferences()
  console.log("SIDEBAR", sidebarData)
  const { user } = useSelector(s => s.user)
  const { data: usersData, isPending: usersPending } = useQuery({ queryKey: userKeys.lists, queryFn: getAllUsers })
  const { data } = useGpcController();
  const summary = data?.summary ?? {}
  const currentUser = usersData?.find((u) => u.description === user.email);
  const currentUserId = currentUser?.id;


  const { activePage, setActivePage, collapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } =
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

  const { isPending: contactStatLoading, data: contactStats } = useContactStats()
  const { isPending: emailStatsLoading, data: emailsStats } = useEmailStats()
  const { isPending: forwardStatLoading, data: forwardStats } = useForwardedStats(currentUserId)
  const { isPending: favStatLoading, data: favStats } = useFavoriteStats()
  const { isPending: exchangeStatLoading, data: exchangeStats } = useExchangeStats()
  const { isPending: offerStatLoading, data: offerStats } = useOfferStats({ email })
  const { isPending: dealStatLoading, data: dealStats } = useDealStats({ email })
  const { isPending: orderStatsLoading, data: ordersStats } = useOrderStats({ email })
  const { isPending: invoiceStatLoading, data: invoiceStats } = useInvoiceStats({ email })
  const { isPending: reminderStatLoading, data: reminderStats } = useReminderStats({ email })

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // MENU ITEMS WITH COLORS
  const menuItems = [
    {
      id: "unreplied-emails",
      label: "Unreplied ",
      icon: Mail,
      loading: emailStatsLoading,
      count: emailsStats?.stats?.inbound?.count,
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
      loading: forwardStatLoading || usersPending,
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
  useEffect(() => {
    if (!sidebarData?.data) return;

    setExpandedGroups(
      Object.fromEntries(
        sidebarData.data.map(group => [group.group_name, true])
      )
    );
  }, [sidebarData]);
  // const isMobile = useMediaQuery("(max-width: 1023px)");
  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <motion.aside
        data-tour="sidebar"
        animate={{
          // x: mobileSidebarOpen ? 0 : -300,
          width: collapsed ? 80 : 260,
        }} transition={{ duration: 0.25 }}
        className="
         fixed
      left-0
      top-0
      z-50
      h-screen
lg:static
 lg:translate-x-0
px-1
flex
flex-col
overflow-hidden
bg-gradient-to-b
from-[#010a1b]
to-[#033081]
text-white
shadow-2xl"
      >

        <div className="mx-3 my-4 h-11 rounded-xl bg-white/90 shadow">
          <div className="group relative flex h-full items-center justify-center gap-3">

            {/* Logo */}
            <img
              src={collapsed ? logo : headingLogo}
              className={`
        h-9 w-auto max-w-[160px] cursor-pointer object-contain transition-all duration-200
        ${collapsed
                  ? "group-hover:hidden"
                  : ""
                }
      `}
              alt="App logo"
              onClick={() => navigateTo("")}
              draggable={false}
            />

            {/* Collapse / Expand Button */}
            <button
              onClick={() => setSidebarCollapsed(!collapsed)}
              className={`
         flex h-7 w-7 items-center justify-center rounded-full shadow cursor-pointer
        transition-all duration-200

        ${collapsed
                  ? "hidden group-hover:flex"
                  : "flex"
                }
      `}
            >
              <PanelLeft className="h-5 w-5" color="#0a3687ff" />
            </button>

          </div>
        </div>
        {/* LIVE BUTTON */}

        <button
          onClick={() => {
            setActivePage("");
            navigateTo("");
          }}
          className="flex items-center justify-center"
        >
          {/* Icon */}
          <div
            className={`
      z-10 flex h-13 w-13 items-center justify-center
      rounded-full border-5 border-[#0b6dfd] bg-white
      shadow-md
    `}
          >
            <Radio className="h-6 w-6 text-black" />
          </div>

          {/* Live Preview */}
          {!collapsed && (
            <div
              className="
        -ml-3 flex h-9 w-[170px]
        items-center justify-center
        rounded-r-xl
        bg-gradient-to-r from-[#0b6dfd] to-[#074197]
        pl-6 pr-4
        text-sm font-medium text-white
        shadow-md
      "
            >
              Live Preview
            </div>
          )}
        </button>
        {/* MENU ITEMS */}
        <div
          className="
    mt-4
    flex-1
    min-h-0
    overflow-y-auto
    pr-1
    custom-scrollbar
  "
        >
          {sidebarLoading ? (
            <div className="animate-pulse space-y-5">
              {[1, 2, 3].map((group) => (
                <div key={group}>
                  {/* Group Header */}
                  {!collapsed && (
                    <div className="mb-3 flex items-center justify-between px-3">
                      <div className="h-3 w-28 rounded bg-white/10" />
                      <div className="h-4 w-4 rounded bg-white/10" />
                    </div>
                  )}

                  {/* Group Items */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 p-2 ${collapsed ? "justify-center" : ""
                          }`}
                      >
                        {/* Icon */}
                        <div className="h-5 w-5 rounded-full bg-white/10 shrink-0" />

                        {!collapsed && (
                          <>
                            {/* Text */}
                            <div className="h-4 flex-1 rounded bg-white/10" />

                            {/* Count */}
                            <div className="h-5 w-8 rounded-full bg-white/10" />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            sidebarData?.data
              ?.sort((a, b) => a.group_priority - b.group_priority)
              .map((group) => (
                <div key={group.group_name} className="mb-3">
                  {/* Group Header */}
                  {!collapsed && (
                    <button
                      onClick={() => toggleGroup(group.group_name)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 hover:bg-white/5"
                    >
                      <span>{group.group_name}</span>

                      {expandedGroups[group.group_name] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  )}

                  {/* Group Items */}
                  {(collapsed || expandedGroups[group.group_name]) && (
                    <div className="mt-1 space-y-1 ml-2">
                      {group.data
                        ?.sort((a, b) => Number(a.weight) - Number(b.weight))
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSidebarCollapsed(true);
                              setActivePage(item.id);

                              navigateTo(
                                item.endpoint ||
                                item.module_name
                                  ?.toLowerCase()
                                  .replace(/\s+/g, "-")
                              );
                            }}
                            className={`
                      flex w-full items-center gap-3 rounded-lg p-2
                      transition-all duration-200
                      hover:bg-white/5
                      ${collapsed ? "justify-center" : ""}
                      ${activePage === item.id
                                ? "bg-white/10 rounded-full shadow-lg"
                                : ""
                              }
                    `}
                          >
                            <Icon
                              name={item.icon}
                              library={item.library}
                              className={`
                        h-4 w-4 shrink-0
                        ${activePage === item.id
                                  ? "scale-125 text-blue-400 "
                                  : ""
                                }
                      `}
                            />

                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate text-left">
                                  {item.name}
                                </span>

                                <span className="rounded-full bg-[#7657ff]/20 px-2 py-0.5 text-xs">
                                  {100}
                                </span>
                              </>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
        <div onClick={() => navigateTo("/settings/controller")}
          className="my-6 flex items-center justify-center cursor-pointer">
          {/* Progress Circle */}
          <div
            className="
    relative z-10 grid size-14 place-items-center rounded-full
    after:absolute after:inset-1.5 after:rounded-full after:bg-[#042158]
    shrink-0
  "
            style={{
              background: `conic-gradient(
      #1775ef ${summary?.total_score ?? 0}%,
      rgba(107,141,189,.33) 0%
    )`,
            }}
          >
            <span className="relative z-10 text-sm font-semibold text-white">
              {summary?.total_score ?? 0}%
            </span>
          </div>

          {/* Automation Score Card */}
          {!collapsed && (
            <div
              className="
        -ml-3 flex h-12 w-[170px]
        items-center rounded-r-xl
        border border-[#3973c9]
        bg-gradient-to-b from-[#011334] to-[#032e7e]
        pl-6 pr-4 shadow-md
        max-h-[850px]:hidden
      "
            >
              <p className="text-sm font-medium leading-5 text-white">
                Automation
                <br />
                Score
              </p>
            </div>
          )}
        </div>

      </motion.aside>
    </>


  );
}

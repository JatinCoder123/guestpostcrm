import {
  ChevronDown,
  ChevronRight,
  PanelLeft,
  Radio,
  Settings,
} from "lucide-react";

import Skeleton from "react-loading-skeleton";

import { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import { PageContext } from "../context/pageContext";

import { useQuery } from "@tanstack/react-query";
import { userKeys } from "../queries/users.queries";
import { getAllUsers } from "../api/users.api";

import { useLayoutPreferences } from "../queries/prefrences.queries";

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

import { useGpcController } from "../queries/controller.queries";

import logo, { headingLogo } from "../assets/assets";

import Icon from "./ui/Icon/Icon";

import { LoadingSpin } from "./Loading";


export function Sidebar() {

  const navigateTo = useNavigate();

  const {
    enteredEmail: email,
    activePage,
    setActivePage,
    collapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useContext(PageContext);


  const { user } = useSelector((state) => state.user);


  /*
  |--------------------------------------------------------------------------
  | USERS
  |--------------------------------------------------------------------------
  */

  const {
    data: usersData,
    isPending: usersPending,
  } = useQuery({
    queryKey: userKeys.lists,
    queryFn: getAllUsers,
  });


  const currentUser = usersData?.find(
    (u) => u.description === user.email
  );

  const currentUserId = currentUser?.id;


  /*
  |--------------------------------------------------------------------------
  | SIDEBAR LAYOUT
  |--------------------------------------------------------------------------
  */

  const {
    data: layoutData,
    isPending: layoutLoading,
  } = useLayoutPreferences();


  const sidebarSections =
    layoutData ?? [];


  /*
  |--------------------------------------------------------------------------
  | EXPANDED GROUPS
  |--------------------------------------------------------------------------
  */

  const [expandedGroups, setExpandedGroups] = useState({});


  /*
  |--------------------------------------------------------------------------
  | INITIALIZE GROUPS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!sidebarSections?.length) {
      return;
    }

    setExpandedGroups((previous) => {

      const next = {};

      sidebarSections.forEach((group) => {

        /*
         * Keep existing state if already initialized.
         * Otherwise open the group.
         */
        next[group.group_name] =
          previous[group.group_name] ?? true;

      });

      return next;

    });

  }, [sidebarSections]);


  /*
  |--------------------------------------------------------------------------
  | GROUP TOGGLE
  |--------------------------------------------------------------------------
  */

  const toggleGroup = (groupName) => {

    setExpandedGroups((previous) => ({
      ...previous,
      [groupName]: !previous[groupName],
    }));

  };


  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const {
    isPending: emailStatsLoading,
    data: emailsStats,
  } = useEmailStats();


  const {
    isPending: contactStatLoading,
    data: contactStats,
  } = useContactStats();


  const {
    isPending: forwardStatLoading,
    data: forwardStats,
  } = useForwardedStats(currentUserId);


  const {
    isPending: favStatLoading,
    data: favStats,
  } = useFavoriteStats();


  const {
    isPending: exchangeStatLoading,
    data: exchangeStats,
  } = useExchangeStats();


  const {
    isPending: offerStatLoading,
    data: offerStats,
  } = useOfferStats({
    email,
  });


  const {
    isPending: dealStatLoading,
    data: dealStats,
  } = useDealStats({
    email,
  });


  const {
    isPending: orderStatsLoading,
    data: ordersStats,
  } = useOrderStats({
    email,
  });


  const {
    isPending: invoiceStatLoading,
    data: invoiceStats,
  } = useInvoiceStats({
    email,
  });


  const {
    isPending: reminderStatLoading,
    data: reminderStats,
  } = useReminderStats({
    email,
  });


  /*
  |--------------------------------------------------------------------------
  | CONTROLLER / AUTOMATION SCORE
  |--------------------------------------------------------------------------
  */

  const {
    data: controllerData,
  } = useGpcController();


  const summary =
    controllerData?.summary ?? {};


  /*
  |--------------------------------------------------------------------------
  | MENU METADATA
  |
  | This keeps your old individual API counts.
  | We are NOT using useSidebarStats.
  |--------------------------------------------------------------------------
  */

  const menuMeta = useMemo(() => ({

    "Inbox": {
      route: "/unreplied-emails",
      count: emailsStats?.stats?.inbound?.count,
      loading: emailStatsLoading,
    },

    "Assigned To Me": {
      route: "/forwarded-emails",
      count: forwardStats?.stats?.forwarded?.count,
      loading: forwardStatLoading || usersPending,
    },

    "Favourites": {
      route: "/favourite-emails",
      count: favStats?.stats?.favorite?.count,
      loading: favStatLoading,
    },



    "Contacts": {
      route: "/contacts",
      count: contactStats?.stats?.all?.count,
      loading: contactStatLoading,
    },

    "Offers": {
      route: "/offers",
      count: offerStats?.stats?.active?.count,
      loading: offerStatLoading,
    },

    "Deals": {
      route: "/deals",
      count: dealStats?.stats?.active?.count,
      loading: dealStatLoading,
    },

    "Orders": {
      route: "/orders",
      count: ordersStats?.stats?.new?.count,
      loading: orderStatsLoading,
    },

    "Invoices": {
      route: "/invoices",
      count: invoiceStats?.stats?.all?.count,
      loading: invoiceStatLoading,
    },

    "Link Exchange": {
      route: "/link-exchange",
      count: exchangeStats?.stats?.exchange?.count,
      loading: exchangeStatLoading,
    },

    "Link Removal": {
      route: "/link-removal",
      count: null,
      loading: false,
    },

    "Reminders": {
      route: "/reminders",
      count: reminderStats?.stats?.all?.count,
      loading: reminderStatLoading,
    },
    "Reports": {
      route: "/view-reports",
      count: reminderStats?.stats?.all?.count,
      loading: reminderStatLoading,
    },



  }), [
    emailsStats,
    emailStatsLoading,

    forwardStats,
    forwardStatLoading,
    usersPending,

    favStats,
    favStatLoading,

    contactStats,
    contactStatLoading,

    offerStats,
    offerStatLoading,

    dealStats,
    dealStatLoading,

    ordersStats,
    orderStatsLoading,

    invoiceStats,
    invoiceStatLoading,

    exchangeStats,
    exchangeStatLoading,

    reminderStats,
    reminderStatLoading,
  ]);


  /*
  |--------------------------------------------------------------------------
  | GET MENU META
  |--------------------------------------------------------------------------
  */

  const getMenuMeta = (item) => {

    return (
      menuMeta[item.name] ?? {
        route:
          item.endpoint ||
          `/${item.name
            ?.toLowerCase()
            ?.trim()
            ?.replace(/\s+/g, "-")}`,

        count: null,

        loading: false,
      }
    );

  };


  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const handleMenuClick = (item) => {

    const meta = getMenuMeta(item);

    setActivePage(item.name);

    /*
     * On mobile or when selecting a menu,
     * collapse sidebar as before.
     */
    setSidebarCollapsed(true);

    navigateTo(meta.route);

    /*
     * Close mobile sidebar.
     */
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }

  };


  /*
  |--------------------------------------------------------------------------
  | SORT GROUPS
  |--------------------------------------------------------------------------
  */

  const sortedGroups = useMemo(() => {

    return [...sidebarSections].sort(
      (a, b) =>
        Number(a.group_priority ?? 0) -
        Number(b.group_priority ?? 0)
    );

  }, [sidebarSections]);


  /*
  |--------------------------------------------------------------------------
  | SIDEBAR
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* MOBILE OVERLAY */}
      {/* ---------------------------------------------------------------- */}

      {mobileSidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            lg:hidden
          "
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}


      {/* ---------------------------------------------------------------- */}
      {/* SIDEBAR */}
      {/* ---------------------------------------------------------------- */}

      <motion.aside
        data-tour="sidebar"

        animate={{
          width: collapsed ? 80 : 260,

          x:
            mobileSidebarOpen
              ? 0
              : undefined,
        }}

        transition={{
          duration: 0.25,
        }}

        className="
          fixed
          left-0
          top-0
          z-50

          flex
          h-screen
          flex-col

          overflow-hidden

          bg-gradient-to-b
          from-sidebar-primary
          via-sidebar-primary
          to-sidebar-secondary

          px-1

          text-white

          shadow-2xl

          lg:static
          lg:z-auto
        "
      >

        {/* ============================================================ */}
        {/* LOADING */}
        {/* ============================================================ */}

        {layoutLoading ? (

          <div className="animate-pulse space-y-5 p-3">

            {[1, 2, 3, 4].map((group) => (

              <div key={group}>

                {!collapsed && (
                  <div className="mb-3 flex items-center justify-between px-3">

                    <div className="h-3 w-28 rounded bg-white/10" />

                    <div className="h-4 w-4 rounded bg-white/10" />

                  </div>
                )}


                <div className="space-y-2">

                  {[1, 2, 3].map((item) => (

                    <div
                      key={item}
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-2

                        ${collapsed
                          ? "justify-center"
                          : ""
                        }
                      `}
                    >

                      <div
                        className="
                          h-9
                          w-9
                          shrink-0
                          rounded-lg
                          bg-white/10
                        "
                      />

                      {!collapsed && (
                        <>
                          <div
                            className="
                              h-4
                              flex-1
                              rounded
                              bg-white/10
                            "
                          />

                          <div
                            className="
                              h-5
                              w-8
                              rounded-full
                              bg-white/10
                            "
                          />
                        </>
                      )}

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <>
            {/* ======================================================== */}
            {/* LOGO */}
            {/* ======================================================== */}

            <div
              className="
                group
                mx-3
                my-4
                h-11
                shrink-0
                rounded-xl
                bg-white/95
                shadow
              "
            >

              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  gap-3
                "
              >

                <img
                  src={
                    collapsed
                      ? logo
                      : headingLogo
                  }

                  className={`
                    h-9
                    w-auto
                    max-w-[160px]
                    cursor-pointer
                    object-contain
                    transition-all
                    duration-200

                    ${collapsed
                      ? "group-hover:hidden"
                      : ""
                    }
                  `}

                  alt="App logo"

                  onClick={() =>
                    navigateTo("")
                  }

                  draggable={false}
                />


                {/* COLLAPSE BUTTON */}

                <button
                  onClick={() =>
                    setSidebarCollapsed(
                      !collapsed
                    )
                  }

                  className={`
                    flex
                    h-7
                    w-7
                    shrink-0
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    shadow
                    transition-all

                    ${collapsed
                      ? "hidden group-hover:flex"
                      : "flex"
                    }
                  `}
                >

                  <PanelLeft
                    className="
                      h-5
                      w-5
                    "
                    color="#0a3687"
                  />

                </button>

              </div>

            </div>


            {/* ======================================================== */}
            {/* LIVE BUTTON */}
            {/* ======================================================== */}

            <button
              data-tour="sidebar-live"

              onClick={() => {

                setActivePage("");

                navigateTo("");

                if (mobileSidebarOpen) {
                  setMobileSidebarOpen(false);
                }

              }}

              className="
                group
                flex
                w-full
                shrink-0
                items-center
                justify-center
                px-2
              "
            >

              {/* LIVE ICON */}

              <div
                className={`
                  z-10
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border-4
                  bg-white
                  shadow-md

                  ${activePage === ""
                    ? "border-blue-500"
                    : "border-blue-400"
                  }
                `}
              >

                <Radio
                  className="
                    h-5
                    w-5
                    text-black
                  "
                />

              </div>


              {/* LIVE LABEL */}

              {!collapsed && (

                <div
                  className="
                    -ml-3
                    flex
                    h-9
                    flex-1
                    items-center
                    justify-center
                    rounded-r-xl
                    bg-gradient-to-r
                    from-[#0b6dfd]
                    to-[#074197]
                    pl-6
                    pr-4
                    text-sm
                    font-medium
                    text-white
                    shadow-md
                  "
                >

                  Live Preview

                </div>

              )}

            </button>


            {/* ======================================================== */}
            {/* MENU */}
            {/* ======================================================== */}

            <div
              className="
                mt-4
                flex-1
                min-h-0
                overflow-y-auto
                rounded-lg
                border-t
                border-sidebar-border
                p-1
                pr-1
                custom-scrollbar
              "
            >

              {sortedGroups.map((group) => {

                const isExpanded =
                  expandedGroups[
                  group.group_name
                  ];


                const sortedItems =
                  [...(group.data ?? [])].sort(
                    (a, b) =>
                      Number(a.weight ?? 0) -
                      Number(b.weight ?? 0)
                  );


                return (

                  <div
                    key={group.group_name}
                    className="mb-3"
                  >

                    {/* ================================================= */}
                    {/* GROUP HEADER */}
                    {/* ================================================= */}

                    {!collapsed && (

                      <button
                        type="button"

                        onClick={() =>
                          toggleGroup(
                            group.group_name
                          )
                        }

                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          px-3
                          py-2

                          text-[11px]
                          font-semibold
                          uppercase
                          tracking-wider

                          text-slate-300

                          transition

                          hover:bg-white/5
                          hover:text-white
                        "
                      >

                        <span>
                          {group.group_name}
                        </span>


                        {isExpanded ? (

                          <ChevronDown
                            className="
                              h-4
                              w-4
                            "
                          />

                        ) : (

                          <ChevronRight
                            className="
                              h-4
                              w-4
                            "
                          />

                        )}

                      </button>

                    )}


                    {/* ================================================= */}
                    {/* COLLAPSED GROUP DIVIDER */}
                    {/* ================================================= */}

                    {collapsed && (
                      <div
                        className="
                          mx-2
                          mb-2
                          border-t
                          border-white/10
                        "
                      />
                    )}


                    {/* ================================================= */}
                    {/* GROUP ITEMS */}
                    {/* ================================================= */}

                    {(collapsed ||
                      isExpanded) && (

                        <div className="space-y-1">

                          {sortedItems.map((item) => {

                            const meta =
                              getMenuMeta(item);


                            const isActive =
                              activePage === item.name;


                            const hasCount =
                              meta.count !== null &&
                              meta.count !== undefined;


                            return (

                              <button
                                key={item.id}

                                type="button"

                                onClick={() =>
                                  handleMenuClick(item)
                                }

                                title={
                                  collapsed
                                    ? item.name
                                    : undefined
                                }

                                className={`
                                group
                                relative
                                flex
                                w-full
                                cursor-pointer
                                items-center
                                gap-1
                                rounded-xl
                                px-2
                                py-2
                                transition-all
                                duration-200

                                ${collapsed
                                    ? "justify-center"
                                    : ""
                                  }

                                ${isActive
                                    ? "bg-white/12 text-white shadow-lg"
                                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                                  }
                              `}
                              >

                                {/* ACTIVE INDICATOR */}

                                {isActive && (

                                  <span
                                    className="
                                    absolute
                                    left-0
                                    h-7
                                    w-1
                                    rounded-r-full
                                    bg-blue-400
                                  "
                                  />

                                )}


                                {/* ICON */}

                                <div
                                  className={`
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  transition-all
                                  duration-200

                                  ${isActive
                                      ? " text-blue-300"
                                      : ""
                                    }
                                `}
                                >

                                  <Icon
                                    name={item.icon}
                                    library={item.library}

                                    className={`
                                    h-5
                                    w-5
                                    transition-transform
                                    duration-200

                                    ${isActive
                                        ? "scale-110"
                                        : "group-hover:scale-105"
                                      }
                                  `}
                                  />

                                </div>


                                {/* LABEL + COUNT */}

                                {!collapsed && (

                                  <>
                                    <span
                                      className={`
                                      flex-1
                                      truncate
                                      text-left
                                      text-sm

                                      ${isActive
                                          ? "font-semibold"
                                          : "font-medium"
                                        }
                                    `}
                                    >
                                      {item.name}
                                    </span>


                                    {/* COUNT */}

                                    {hasCount && (

                                      <span
                                        className={`
                                        min-w-7
                                        rounded-full
                                        px-2
                                        py-0.5
                                        text-center
                                        text-[11px]
                                        font-semibold

                                        ${isActive
                                            ? "bg-blue-500 text-white"
                                            : "bg-white/10 text-slate-300"
                                          }
                                      `}
                                      >

                                        {meta.loading ? (

                                          <Skeleton
                                            width={14}
                                            height={12}
                                            baseColor="rgba(255,255,255,0.12)"
                                            highlightColor="rgba(255,255,255,0.20)"
                                          />

                                        ) : (

                                          meta.count ?? 0

                                        )}

                                      </span>

                                    )}

                                  </>

                                )}

                              </button>

                            );

                          })}

                        </div>

                      )}

                  </div>

                );

              })}

            </div>


            {/* ======================================================== */}
            {/* SETTINGS */}
            {/* ======================================================== */}

            <div onClick={() => navigateTo("/settings/controller")}
              className="my-6 flex items-center justify-center cursor-pointer border-t border-sidebar-border p-2 rounded-full shadow-lg shadow-black">
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
                <span className="relative z-10 text-sm font-semibold text-white ">
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
                    Automation Score

                  </p>
                </div>
              )}
            </div>
          </>

        )}

      </motion.aside>
    </>
  );
}
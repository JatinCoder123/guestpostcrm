import {
  ChevronDown,
  ChevronRight,
  Radio,
  PanelLeft,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";

import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion } from "framer-motion";
import { useForwardedStats } from "../queries/forwarded.queries";
import { useQuery } from "@tanstack/react-query";
import { userKeys } from "../queries/users.queries";
import { getAllUsers } from "../api/users.api";
import logo, { headingLogo } from "../assets/assets";
import { useGpcController } from "../queries/controller.queries";
import { useLayoutPreferences } from "../queries/prefrences.queries";
import Icon from "./ui/Icon/Icon";
import { useSidebarStats } from "../queries/sidebar.queries";

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

  const [sidebarStatsQuery, setSidebarStatsQuery] = useState();
  const [expandedGroups, setExpandedGroups] = useState({});

  const { data: layoutData, isPending: layoutLoading } =
    useLayoutPreferences();

  const sidebarSections = layoutData ?? [];


  const { user } = useSelector((s) => s.user);

  const {
    data: usersData,
    isPending: usersPending,
  } = useQuery({
    queryKey: userKeys.lists,
    queryFn: getAllUsers,
  });

  const { data } = useGpcController();

  const summary = data?.summary ?? {};

  const currentUser = usersData?.find(
    (u) => u.description === user.email
  );

  const currentUserId = currentUser?.id;

  const [openSettingsCard, setOpenSettingsCard] = useState(false);
  const cardRef = useRef(null);

  // Close modal when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target)
      ) {
        setOpenSettingsCard(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const {
    isPending: forwardStatLoading,
    data: forwardStats,
  } = useForwardedStats(currentUserId);

  const {
    isPending: sidebarCountPending,
    data: sidebarCounts,
  } = useSidebarStats({
    email,
    queries: sidebarStatsQuery,
  });

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  useEffect(() => {
    if (!sidebarSections?.data) return;

    setExpandedGroups(
      Object.fromEntries(
        sidebarSections.data.map((group) => [
          group.group_name,
          true,
        ])
      )
    );

    setSidebarStatsQuery(
      sidebarSections.data?.flatMap((group) =>
        (group.data ?? []).map((item) => ({
          key: item.key,
          module: item.module_name,
          ignore_email:
            item.email_by_filter == "1" ? false : true,
          filters: item.count_filters ?? {},
        }))
      ) ?? null
    );
  }, [sidebarSections]);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-[color-mix(in_srgb,var(--foreground)_50%,transparent)]
            lg:hidden
          "
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <motion.aside
        data-tour="sidebar"
        animate={{
          width: collapsed ? 80 : 260,
        }}
        transition={{ duration: 0.25 }}
        className="
          h-screen
          lg:static
          lg:translate-x-0
          px-1
          flex
          flex-col
          overflow-hidden
          bg-gradient-to-b
          from-sidebar-primary
          from-0%
          via-sidebar-primary
          via-2%
          to-sidebar-secondary
          to-100%
          text-[var(--sidebar-primary-foreground)]
          shadow-2xl
        "
      >
        {layoutLoading ? (
          <div className="animate-pulse space-y-5 p-3">
            {[1, 2, 3].map((group) => (
              <div key={group}>
                {/* Group Header */}
                {!collapsed && (
                  <div className="mb-3 flex items-center justify-between px-3">
                    <div
                      className="
                        h-3 w-28 rounded
                        bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_10%,transparent)]
                      "
                    />

                    <div
                      className="
                        h-4 w-4 rounded
                        bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_10%,transparent)]
                      "
                    />
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
                      <div
                        className="
                          h-5 w-5 shrink-0 rounded-full
                          bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_10%,transparent)]
                        "
                      />

                      {!collapsed && (
                        <>
                          {/* Text */}
                          <div
                            className="
                              h-4 flex-1 rounded
                              bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_10%,transparent)]
                            "
                          />

                          {/* Count */}
                          <div
                            className="
                              h-5 w-8 rounded-full
                              bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_10%,transparent)]
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
            {/* Logo */}
            <div
              className="
                mx-3 my-4 h-11 rounded-xl
                bg-background
                shadow
              "
            >
              <div className="group relative flex h-full items-center justify-center gap-3">
                <img
                  src={collapsed ? logo : headingLogo}
                  className={`
                    h-9 w-auto max-w-[160px]
                    cursor-pointer object-contain
                    transition-all duration-200
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
                  onClick={() =>
                    setSidebarCollapsed(!collapsed)
                  }
                  className={`
                    flex h-7 w-7
                    items-center justify-center
                    rounded-full
                    shadow
                    cursor-pointer
                    transition-all duration-200
                    ${collapsed
                      ? "hidden group-hover:flex"
                      : "flex"
                    }
                    bg-[var(--card)]
                  `}
                >
                  <PanelLeft
                    className="h-5 w-5"
                    color="var(--sidebar-primary)"
                  />
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
                className="
                  z-10 flex h-13 w-13
                  items-center justify-center
                  rounded-full
                  border-5
                  border-[var(--topbtn-primary)]
                  bg-[var(--card)]
                  shadow-md
                "
              >
                <Radio
                  className="h-6 w-6"
                  color="var(--foreground)"
                />
              </div>

              {/* Live Preview */}
              {!collapsed && (
                <div
                  className="
                    -ml-3 flex h-9 w-[170px]
                    items-center justify-center
                    rounded-r-xl
                    bg-gradient-to-r
                    from-[var(--topbtn-primary)]
                    to-[var(--topbtn-secondary)]
                    pl-6 pr-4
                    text-sm font-medium
                    text-[var(--sidebar-primary-foreground)]
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
                pr-1 p-1
                custom-scrollbar
                border-t
                border-sidebar-border
                rounded-lg
              "
            >
              {sidebarSections?.data
                ?.sort(
                  (a, b) =>
                    a.weight - b.weight
                )
                .map((group) => (
                  <div
                    key={group.group_name}
                    className="mb-3"
                  >
                    {/* Group Header */}
                    {!collapsed && (
                      <button
                        onClick={() =>
                          toggleGroup(group.group_name)
                        }
                        className="
                          flex w-full
                          items-center justify-between
                          rounded-lg
                          px-3 py-2
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[color-mix(in_srgb,var(--sidebar-primary-foreground)_75%,transparent)]
                          hover:bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_5%,transparent)]
                        "
                      >
                        <span>{group.group_name}</span>

                        {expandedGroups[
                          group.group_name
                        ] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    )}

                    {/* Group Items */}
                    {(collapsed ||
                      expandedGroups[
                      group.group_name
                      ]) && (
                        <div className="mt-1 ml-2 space-y-1">
                          {group.data
                            ?.sort(
                              (a, b) =>
                                Number(a.weight) -
                                Number(b.weight)
                            )
                            .map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSidebarCollapsed(true);
                                  setActivePage(item.id);
                                  navigateTo(
                                    `/${item.navigation}`
                                  );
                                }}
                                className={`
                                flex w-full
                                items-center gap-3
                                rounded-lg p-2
                                transition-all duration-200
                                hover:bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_5%,transparent)]
                                ${collapsed
                                    ? "justify-center"
                                    : ""
                                  }
                                ${activePage === item.id
                                    ? "bg-[color-mix(in_srgb,var(--sidebar-primary-foreground)_10%,transparent)] rounded-full shadow-lg"
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
                                      ? "scale-125 text-[var(--topbtn-primary)]"
                                      : ""
                                    }
                                `}
                                />

                                {!collapsed && (
                                  <>
                                    <span className="flex-1 truncate text-left">
                                      {item.name}
                                    </span>

                                    {item.key &&
                                      sidebarCounts?.stats?.[
                                      item.key
                                      ] &&
                                      sidebarCountPending ? (
                                      <Skeleton count={1} />
                                    ) : (
                                      <span
                                        className="
                                        rounded-full
                                        bg-[color-mix(in_srgb,var(--primary)_20%,transparent)]
                                        px-2 py-0.5
                                        text-xs
                                      "
                                      >
                                        {sidebarCounts?.stats?.[
                                          item.key
                                        ]?.count || 0}
                                      </span>
                                    )}
                                  </>
                                )}
                              </button>
                            ))}
                        </div>
                      )}
                  </div>
                ))}
            </div>

            {/* SIDEBAR FOOTER */}
            {sidebarSections?.sidebar_footer && (
              <div
                onClick={() =>
                  navigateTo("/settings/controller")
                }
                className="
                  my-6
                  flex
                  cursor-pointer
                  items-center
                  justify-center
                  border-t
                  border-sidebar-border
                  p-2
                  rounded-full
                  shadow-lg
                  shadow-[color-mix(in_srgb,var(--foreground)_100%,transparent)]
                "
              >
                {/* Progress Circle */}
                <div
                  className="
                    relative z-10
                    grid size-14
                    shrink-0
                    place-items-center
                    rounded-full
                    after:absolute
                    after:inset-1.5
                    after:rounded-full
                    after:bg-[var(--sidebar-primary)]
                  "
                  style={{
                    background: `conic-gradient(
                      var(--topbtn-primary) ${summary?.total_score ?? 0
                      }%,
                      color-mix(
                        in srgb,
                        var(--sidebar-primary) 33%,
                        transparent
                      ) 0%
                    )`,
                  }}
                >
                  <span
                    className="
                      relative z-10
                      text-sm
                      font-semibold
                      text-[var(--sidebar-primary-foreground)]
                    "
                  >
                    {summary?.total_score ?? 0}%
                  </span>
                </div>

                {/* Automation Score Card */}
                {!collapsed && (
                  <div
                    className="
                      -ml-3
                      flex h-12 w-[170px]
                      max-h-[850px]:hidden
                      items-center
                      rounded-r-xl
                      border
                      border-[var(--sidebar-border)]
                      bg-gradient-to-b
                      from-[var(--sidebar-primary)]
                      to-[var(--sidebar-secondary)]
                      pl-6 pr-4
                      shadow-md
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-medium
                        leading-5
                        text-[var(--sidebar-primary-foreground)]
                      "
                    >
                      {
                        sidebarSections?.sidebar_footer
                          ?.description
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </motion.aside>
    </>
  );
}
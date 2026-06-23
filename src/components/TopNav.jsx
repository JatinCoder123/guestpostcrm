import {
  Sparkles,
  Flame,
  X,
  CircleAlert,
  BellIcon,
  User2,
  LogOut,
  MailWarning,
  Camera,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ladgerAction } from "../store/Slices/ladger";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../context/pageContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { logout, userAction } from "../store/Slices/userSlice";
import DropDown from "./DropDown";
import { headingLogo, periodOptions } from "../assets/assets";
import { SocketContext } from "../context/SocketContext";
import GlobalSearch from "./GlobalSearch";
import ProfileImageCropper from "./ProfileImageCropper";
import { useOutboxStats } from "../queries/outbox.queries";

/* ─────────────────────────────────────────────────────────────
   Reusable icon button — coloured tint + badge + tooltip
───────────────────────────────────────────────────────────── */
const VARIANTS = {
  indigo: {
    wrap: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
    icon: "text-indigo-600",
  },
  purple: {
    wrap: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    icon: "text-purple-600",
  },
  orange: {
    wrap: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    icon: "text-orange-500",
  },
  green: {
    wrap: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    icon: "text-emerald-600",
  },
  red: {
    wrap: "bg-red-50 hover:bg-red-100 border-red-200",
    icon: "text-red-500",
  },
};

function NavBtn({ icon: Icon, label, onClick, count, color = "indigo" }) {
  const v = VARIANTS[color] ?? VARIANTS.indigo;
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 ${v.wrap}`}
      >
        <Icon size={16} className={v.icon} strokeWidth={1.9} />
        {count > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white"
            aria-label={`${count} notifications`}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-l border-t border-slate-100 bg-white" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Avatar colour palette — cycles through 8 distinct combos
───────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-400", dot: "bg-violet-400" },
  { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-400", dot: "bg-emerald-400" },
  { bg: "bg-sky-100", text: "text-sky-700", ring: "ring-sky-400", dot: "bg-sky-400" },
  { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-400", dot: "bg-amber-400" },
  { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-400", dot: "bg-rose-400" },
  { bg: "bg-teal-100", text: "text-teal-700", ring: "ring-teal-400", dot: "bg-teal-400" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-700", ring: "ring-fuchsia-400", dot: "bg-fuchsia-400" },
  { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-400", dot: "bg-orange-400" },
];

function getColorForUser(email = "") {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "", email = "") {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}

function formatLastActive(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ─────────────────────────────────────────────────────────────
   UserActivityPanel — the click-to-open dropdown
───────────────────────────────────────────────────────────── */
function UserActivityPanel({ activeUsers = [], currentUserEmail = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigateTo = useNavigate();

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Split: show current user first, then others (max 3 avatars in stack) */
  const me = activeUsers.find((u) => u.email === currentUserEmail);
  const others = activeUsers.filter((u) => u.email !== currentUserEmail);
  const ordered = me ? [me, ...others] : others;
  const stackVisible = ordered.slice(0, 4);   // max 4 in the pill
  const overflow = Math.max(0, ordered.length - 4);

  const onlineCount = activeUsers.filter((u) => u.status === "online").length;

  return (
    <div ref={ref} className="relative flex items-center">

      {/* ── Trigger pill ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${activeUsers.length} active users`}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 transition hover:bg-indigo-100 active:scale-95"
      >
        {/* Pulsing green dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        {/* Stacked avatars */}
        <div className="flex items-center w-full h-2">
          {stackVisible.map((u, i) => {
            const c = getColorForUser(u.email);
            const initials = getInitials(u.name, u.email);
            const isMe = u.email === currentUserEmail;
            return (
              <span
                key={u.email}
                title={isMe ? "You" : u.name || u.email}
                className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-white
                  ${c.bg} ${c.text}
                  ${i > 0 ? "-ml-1.5" : ""}
                  ${isMe ? "ring-indigo-300" : ""}
                `}
              >
                {initials}
                {/* Online / idle dot */}
                <span
                  className={`absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full border border-white
                    ${u.status === "online" ? "bg-emerald-500" : "bg-amber-400"}`}
                />
              </span>
            );
          })}

          {/* +N overflow */}
          {overflow > 0 && (
            <span className="-ml-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 ring-2 ring-white">
              +{overflow}
            </span>
          )}
        </div>

        {/* Online count */}
        <span className="text-[11px] font-semibold text-indigo-600">
          {onlineCount}
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="absolute right-0 top-full mt-2.5 w-[340px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-500" strokeWidth={2} />
                <span className="text-sm font-semibold text-slate-700">
                  Active users
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                  {activeUsers.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); navigateTo("/settings/user-activity"); }}
                className="text-[11px] font-medium text-indigo-500 hover:text-indigo-700 transition"
              >
                View all →
              </button>
            </div>

            {/* User rows */}
            <div className="max-h-[340px] overflow-y-auto">
              {ordered.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-400">
                  No active users right now.
                </p>
              ) : (
                ordered.map((u) => {
                  const c = getColorForUser(u.email);
                  const initials = getInitials(u.name, u.email);
                  const isMe = u.email === currentUserEmail;
                  const isOnline = u.status === "online";

                  return (
                    <div
                      key={u.email}
                      className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-none hover:bg-slate-50/60 transition"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${c.bg} ${c.text}`}
                        >
                          {initials}
                        </span>
                        <span
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white
                            ${isOnline ? "bg-emerald-500" : "bg-amber-400"}`}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {u.name || "Unknown"}
                          </p>
                          {isMe && (
                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-500">
                              you
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-slate-400">
                          {u.email}
                        </p>
                        {/* Current page */}
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <p className="truncate text-[11px] text-slate-500">

                            {u.page == "/" ? "Timeline" : u.page}
                          </p>
                        </div>
                      </div>

                      {/* Right: status + time */}
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold
                            ${isOnline
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50  text-amber-700"
                            }`}
                        >
                          {isOnline ? "Online" : "Idle"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatLastActive(u.lastActiveAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer legend */}
            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online — active &lt;5 min
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Idle — 5–15 min
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main TopNav
───────────────────────────────────────────────────────────── */
export function TopNav() {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  /* ── Data ── */
  const { data: outboxData, isPending: outboxPending } = useOutboxStats();
  const { enteredEmail, handleClear } = useContext(PageContext);
  // ↓ activeUsers added alongside existing notificationCount
  const { notificationCount, activeUsers = [] } = useContext(SocketContext);
  const { user, error } = useSelector((s) => s.user);
  const { timeline } = useSelector((s) => s.ladger);
  const { count: hotCount } = useSelector((s) => s.hot);

  /* ── Local state ── */
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [errorLogCount, setErrorLogCount] = useState(0);
  const [profilePreview, setProfilePreview] = useState(
    () => sessionStorage.getItem("userProfileImage") || user?.profileImage || ""
  );
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);

  const profileMenuRef = useRef(null);
  const prevCountRef = useRef(0);

  /* ── Derived ── */
  const isSearchActive = Boolean(enteredEmail?.trim());
  const outboxCount = outboxData?.stats?.all?.count ?? 0;
  const showOutbox = outboxCount > 0 && !outboxPending;
  const showErrorLog = Boolean(notificationCount?.error_log_created);

  /* ── Effects ── (unchanged) */
  useEffect(() => {
    const saved = sessionStorage.getItem("userProfileImage");
    setProfilePreview(saved || user?.profileImage || "");
  }, [user?.profileImage]);

  useEffect(() => {
    if (notificationCount?.error_log_created)
      setErrorLogCount((n) => n + 1);
  }, [notificationCount?.error_log_created]);

  useEffect(() => {
    if (errorLogCount > prevCountRef.current) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 400);
    }
    prevCountRef.current = errorLogCount;
  }, [errorLogCount]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Handlers ── (unchanged) */
  const handleSelectPeriod = (option) => {
    localStorage.setItem("timeline", option);
    dispatch(ladgerAction.setTimeline(option));
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
  };



  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropImage(reader.result); setShowCropper(true); };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = (croppedImage) => {
    setProfilePreview(croppedImage);
    sessionStorage.setItem("userProfileImage", croppedImage);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /* ─────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────── */
  return (
    <div
      data-tour="top-nav"
      className="sticky top-0 z-50 flex h-[70px] items-center px-3 gap-3"
      style={{
        background: "linear-gradient(135deg, #ddeaff 100%)",
        borderRadius: "26px",
        border: "1px solid rgba(99,102,241,0.16)",
        borderBottom: "1.5px solid rgba(99,102,241,0.26)",
        boxShadow: [
          "inset 2px 3px 6px rgba(255,255,255,0.95)",
          "inset -1px -2px 4px rgba(99,102,241,0.10)",
          "0 5px 0 0 #c9cbe0",
          "0 7px 20px rgba(60,63,120,0.16)",
          "0 2px 4px rgba(0,0,0,0.06)",
        ].join(","),
      }}
    >
      {/* ══════════════════════════════════════
          LEFT — Logo (unchanged)
      ══════════════════════════════════════ */}
      <div className="flex shrink-0 items-center gap-3">
        <img
          src={headingLogo}
          className="h-9 w-auto max-w-[160px] cursor-pointer object-contain"
          alt="App logo"
          onClick={() => navigateTo("")}
          draggable={false}
        />
      </div>

      {/* ══════════════════════════════════════
          CENTER — Search OR Active banner (unchanged)
      ══════════════════════════════════════ */}
      <div
        className="flex flex-1 items-center gap-2 min-w-0 ml-5 justify-center"
        data-tour="top-nav-search"
      >
        <AnimatePresence mode="wait">
          {isSearchActive ? (
            <motion.div
              key="banner"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-2xl border px-4 py-2 max-w-[440px]"
              style={{
                background: "linear-gradient(100deg,#eef2ff 0%,#e0f2fe 100%)",
                border: "1px solid rgba(99,102,241,0.22)",
                boxShadow: "0 2px 12px rgba(99,102,241,0.12)",
              }}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-indigo-500"
                style={{ animationDuration: "1.4s" }}
              />
              <span className="flex items-center gap-1.5 text-[16px] text-indigo-800 leading-none">
                <span className="shrink-0 font-normal text-indigo-600">
                  Viewing record for
                </span>
                <span
                  title={enteredEmail}
                  className="max-w-[220px] truncate font-bold text-cyan-700 underline underline-offset-2 decoration-dashed cursor-default"
                >
                  {enteredEmail}
                </span>
              </span>
              <button
                type="button"
                aria-label="Clear current record"
                onClick={() => handleClear()}
                className="ml-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500 transition hover:bg-indigo-200 hover:text-indigo-700 active:scale-90"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </motion.div>
          ) : (
            <GlobalSearch />
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Action buttons
      ══════════════════════════════════════ */}
      <div className="flex shrink-0 items-center gap-1.5">

        {/* ── 🆕 User Activity Panel — sits before the other nav buttons ── */}
        <UserActivityPanel
          activeUsers={activeUsers}
          currentUserEmail={user?.email}
        />

        {/* Thin divider between activity panel and icon buttons */}
        <div className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* AI Credits */}
        <NavBtn
          icon={Sparkles}
          label="AI Credits"
          color="indigo"
          onClick={() => navigateTo("ai-credits")}
        />

        {/* Payment Reminders */}
        <NavBtn
          icon={BellIcon}
          label="Payment Reminders"
          color="purple"
          count={3}
          onClick={() => { }}
        />

        {/* Outbox — conditional */}
        {showOutbox && (
          <NavBtn
            icon={MailWarning}
            label="Outbox Emails"
            color="green"
            count={outboxCount}
            onClick={() => navigateTo("/outbox")}
          />
        )}

        {/* Hot Records */}
        <NavBtn
          icon={Flame}
          label="Hot Records"
          color="orange"
          count={hotCount}
          onClick={() => navigateTo("hot-records")}
        />

        {/* Error Logs — conditional + shake animation */}
        {showErrorLog && (
          <motion.div
            animate={animate ? { x: [0, -3, 3, -3, 3, 0] } : {}}
            transition={{ duration: 0.35 }}
          >
            <NavBtn
              icon={CircleAlert}
              label="Error Logs"
              color="red"
              count={errorLogCount}
              onClick={() => navigateTo("/settings/debugging")}
            />
          </motion.div>
        )}

        {/* Divider */}
        <div className="mx-1.5 h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* ── Profile chip (unchanged) ── */}
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((v) => !v)}
            aria-label="Open profile menu"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-1 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-95"
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt={user?.name ?? "Profile"}
                className="h-7 w-7 rounded-lg object-cover"
              />
            ) : (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}
              >
                {getUserInitials()}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                className="absolute right-0 mt-2.5 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10"
              >
                <button
                  type="button"
                  onClick={() => { navigateTo("/profile"); setShowProfileMenu(false); }}
                  className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50"
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt={user?.name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}
                    >
                      {getUserInitials()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-400 mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                    View
                  </span>
                </button>

                <div className="p-2 flex flex-col gap-0.5">
                  <label
                    htmlFor="profile-upload"
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Camera size={14} className="text-slate-500" />
                    </span>
                    Change profile photo
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleProfileUpload}
                  />

                  <button
                    type="button"
                    onClick={() => { navigateTo("/profile"); setShowProfileMenu(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <User2 size={14} className="text-slate-500" />
                    </span>
                    Edit profile
                  </button>

                  <div className="my-1 h-px bg-slate-100 mx-2" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <LogOut size={14} className="text-red-500" />
                    </span>
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Image cropper (unchanged) ── */}
      <ProfileImageCropper
        isOpen={showCropper}
        image={cropImage}
        onClose={() => setShowCropper(false)}
        onSave={handleProfileSave}
      />
    </div>
  );
}
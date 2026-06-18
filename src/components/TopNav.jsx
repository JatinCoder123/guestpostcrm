import {
  Sparkles,
  Flame,
  X,
  CircleAlert,
  BellIcon,
  User2,
  ChevronDown,
  LogOut,
  MailWarning,
  Camera,
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
   Main TopNav
───────────────────────────────────────────────────────────── */
export function TopNav() {
  const dispatch   = useDispatch();
  const navigateTo = useNavigate();

  /* ── Data ── */
  const { data: outboxData, isPending: outboxPending } = useOutboxStats();
  const { enteredEmail, handleDateClick }               = useContext(PageContext);
  const { notificationCount }                           = useContext(SocketContext);
  const { user, error }                                 = useSelector((s) => s.user);
  const { timeline }                                    = useSelector((s) => s.ladger);
  const { count: hotCount }                             = useSelector((s) => s.hot);

  /* ── Local state ── */
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [animate,         setAnimate]         = useState(false);
  const [errorLogCount,   setErrorLogCount]   = useState(0);
  const [profilePreview,  setProfilePreview]  = useState(
    () => sessionStorage.getItem("userProfileImage") || user?.profileImage || ""
  );
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage,   setCropImage]   = useState(null);

  const profileMenuRef = useRef(null);
  const prevCountRef   = useRef(0);

  /* ── Derived ── */
  const isSearchActive = Boolean(enteredEmail?.trim());
  const outboxCount    = outboxData?.stats?.all?.count ?? 0;
  const showOutbox     = outboxCount > 0 && !outboxPending;
  const showErrorLog   = Boolean(notificationCount?.error_log_created);

  /* ── Effects ── */
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

  /* ── Handlers ── */
  const handleSelectPeriod = (option) => {
    localStorage.setItem("timeline", option);
    dispatch(ladgerAction.setTimeline(option));
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
  };

  const handleClearSearch = () => {
    handleDateClick({ email: "", navigate: "/" });
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
        background:   "linear-gradient(180deg,#ffffff 0%,#edeef6 100%)",
        borderRadius: "26px",
        border:       "1px solid rgba(99,102,241,0.16)",
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
          LEFT — Logo (always)
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
          CENTER — Search OR Active banner
      ══════════════════════════════════════ */}
      <div
  className={`flex flex-1 items-center gap-2 min-w-0 ml-5 ${
    isSearchActive ? "justify-center" : "justify-start"
  }`}
  data-tour="top-nav-search"
>
        <AnimatePresence mode="wait">
          {isSearchActive ? (
            /* ── Active record banner ── */
            <motion.div
              key="banner"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{   opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-2xl border px-4 py-2 max-w-[440px]"
              style={{
                background:  "linear-gradient(100deg,#eef2ff 0%,#e0f2fe 100%)",
                border:      "1px solid rgba(99,102,241,0.22)",
                boxShadow:   "0 2px 12px rgba(99,102,241,0.12)",
              }}
            >
              {/* Pulsing live dot */}
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-indigo-500"
                style={{ animationDuration: "1.4s" }}
              />

              {/* Message */}
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

              {/* Clear button */}
              <button
                type="button"
                aria-label="Clear current record"
                onClick={handleClearSearch}
                className="ml-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500 transition hover:bg-indigo-200 hover:text-indigo-700 active:scale-90"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </motion.div>
          ) : (
            /* ── Search + Period ── */
            <motion.div
              key="search-controls"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              <GlobalSearch />
              <DropDown
                options={periodOptions}
                handleSelectOption={handleSelectPeriod}
                timeline={timeline}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Action buttons (always visible)
      ══════════════════════════════════════ */}
      <div className="flex shrink-0 items-center gap-1.5">

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
          onClick={() => {}}
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

        {/* ── Profile chip ── */}
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

          {/* ── Dropdown ── */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{   opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                className="absolute right-0 mt-2.5 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10"
              >
                {/* User header */}
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

                {/* Menu items */}
                <div className="p-2 flex flex-col gap-0.5">
                  {/* Change photo */}
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

                  {/* Edit profile */}
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

                  {/* Logout */}
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

      {/* ── Image cropper (rendered outside flow) ── */}
      <ProfileImageCropper
        isOpen={showCropper}
        image={cropImage}
        onClose={() => setShowCropper(false)}
        onSave={handleProfileSave}
      />
    </div>
  );
}
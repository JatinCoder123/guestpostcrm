import {
  Mail,
  Link2,
  List,
  MailCheck,
  MailOpen,
  Send,
  Bell,
  ChartSpline,
  ArrowRight,
  UserCircle2,
  Loader2,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { createElement, useEffect, useState, useContext } from "react";
import { PageContext } from "../context/pageContext";
import {
  getUnrepliedEmail,
  unrepliedAction,
} from "../store/Slices/unrepliedEmails";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { fetchGpc } from "../services/api";
import {
  ONBOARDING_STEP,
  fetchOnboardingProgress,
  getOnboardingRecordName,
  upsertOnboardingProgress,
} from "../utils/onboardingCompletion";
import { useGpcController } from "../queries/controller.queries";

const FIRST_SYNC_EVENT = "guestpostcrm:first-sync";

const StatBadge = ({
  icon,
  label,
  value,
  colorClass,
  bgClass,
  borderClass,
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 400);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border ${borderClass} ${bgClass} transition-all duration-400 cursor-default`}
    >
      {createElement(icon, {
        className: `w-4 h-4 ${colorClass} group-hover:scale-125 transition-transform duration-300`,
      })}
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
        {label}:
      </span>
      <span
        className={`text-xs font-bold ${colorClass} transition-all duration-300 ${animate ? "scale-125 opacity-100" : "scale-100 opacity-90"
          } inline-block`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
};

const ProfilePromptSkeleton = () => (
  <div className="relative flex min-w-[255px] items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-lg shadow-slate-500/10 backdrop-blur-xl">
    <span className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
      <span className="block h-full w-1/3 animate-pulse rounded-full bg-slate-300" />
    </span>
    <span className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-200" />
    <span className="min-w-0 flex-1 space-y-2">
      <span className="block h-3 w-24 animate-pulse rounded-full bg-slate-200" />
      <span className="block h-4 w-40 animate-pulse rounded-full bg-slate-100" />
    </span>
    <span className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-slate-200" />
  </div>
);

const WelcomeHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const { contactInfo } = useSelector((state) => state.viewEmail);
  const { crmEndpoint, businessEmail, user } = useSelector(
    (state) => state.user,
  );
  const { showNewEmailBanner } = useSelector((state) => state.unreplied);
  const { count } = useSelector((state) => state.events);
  const {data,isPending} = useGpcController()
  const summary = data?.summary ?? {}
  const { loading: contactLoading, contacts } = useSelector(
    (state) => state.contacts,
  );

  const email = contactInfo?.email1;
  const onboardingRecordName = getOnboardingRecordName({
    user,
    businessEmail,
  });

  const { setEnteredEmail, handleClear } = useContext(PageContext);

  const [animate, setAnimate] = useState(false);

  const [stats, setStats] = useState({
    reply_recieved: null,
    reply_sent: null,
    reminder_sent: null,
  });
  const [firstSyncState, setFirstSyncState] = useState({
    status: "idle",
    result: null,
  });
  const [websiteDone, setWebsiteDone] = useState(false);
  const [crmOnboardingStep, setCrmOnboardingStep] = useState(0);
  const [firstSyncRecordsSeen, setFirstSyncRecordsSeen] = useState(false);
  const [crmProgressLoading, setCrmProgressLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchGpc({
          method: "GET",
          params: { type: "statscount" },
        });

        if (data?.success && data?.stats) {
          setStats({
            reply_recieved: data.stats.reply_recieved,
            reply_sent: data.stats.reply_sent,
            reminder_sent: data.stats.reminder_sent,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    loadStats();
  }, []);

  const formatRouteName = (route) => {
    if (route === "/") {
      return (
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={() => {
            localStorage.setItem("searchTerm", email);
            setEnteredEmail(email);
          }}
        >
          {email}
        </span>
      );
    }

    return route.split("/")[1].toUpperCase();
  };

  const resultTitle = formatRouteName(path);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (showNewEmailBanner) {
      const timer = setTimeout(() => {
        dispatch(unrepliedAction.setShowNewEmailBanner(false));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [showNewEmailBanner, dispatch]);

  useEffect(() => {
    const syncHandler = (event) => {
      if (typeof event.detail?.onboardingStep === "number") {
        setCrmOnboardingStep(event.detail.onboardingStep);
        setWebsiteDone(
          event.detail.onboardingStep >= ONBOARDING_STEP.WEBSITE_ADDED,
        );
      }
      if (event.detail?.status === "completed") {
        setFirstSyncRecordsSeen(false);
      }

      setFirstSyncState({
        status: event.detail?.status || "idle",
        result: event.detail?.result ?? null,
      });
    };

    window.addEventListener(FIRST_SYNC_EVENT, syncHandler);

    return () => {
      window.removeEventListener(FIRST_SYNC_EVENT, syncHandler);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCrmOnboardingProgress = async () => {
      if (!crmEndpoint || !onboardingRecordName) {
        setCrmProgressLoading(false);
        return;
      }

      setCrmProgressLoading(true);
      try {
        const current = await fetchOnboardingProgress({
          crmEndpoint,
          name: onboardingRecordName,
        });
        const progress =
          current.step > 0
            ? current
            : await upsertOnboardingProgress({
                crmEndpoint,
                name: onboardingRecordName,
                step: ONBOARDING_STEP.PROFILE_STARTED,
              });
        if (ignore) return;

        setCrmOnboardingStep(progress.step);
        setWebsiteDone(progress.step >= ONBOARDING_STEP.WEBSITE_ADDED);
        if (progress.step >= ONBOARDING_STEP.FIRST_SYNC_DONE) {
          setFirstSyncRecordsSeen(true);
          setFirstSyncState({ status: "completed", result: null });
        }
      } catch (err) {
        console.error("Failed to load CRM onboarding progress:", err);
      } finally {
        if (!ignore) setCrmProgressLoading(false);
      }
    };

    loadCrmOnboardingProgress();

    return () => {
      ignore = true;
    };
  }, [crmEndpoint, onboardingRecordName]);

  const crmDomain = crmEndpoint
    ?.replace("https://", "")
    ?.replace("http://", "")
    ?.split("/")[0];
  const contactOnboardingDone =
    Array.isArray(contacts) && contacts.length > 0;
  const syncDone =
    contactOnboardingDone ||
    crmOnboardingStep >= ONBOARDING_STEP.FIRST_SYNC_DONE;
  const contactCheckLoading =
    crmProgressLoading || (contactLoading && !contactOnboardingDone);
  const firstSyncLoading = firstSyncState.status === "loading";
  const firstSyncCompleted = syncDone;
  const templateDone =
    contactOnboardingDone || crmOnboardingStep >= ONBOARDING_STEP.TEMPLATE_READY;
  const firstSyncRecords = Array.isArray(firstSyncState.result?.records)
    ? firstSyncState.result.records
    : [];
  const profileCompletion = firstSyncCompleted ? 100 : templateDone ? 85 : websiteDone ? 70 : 50;
  const showProfilePrompt =
  path !== "/profile" &&
  (profileCompletion < 100 || firstSyncLoading || contactCheckLoading);
  const showFirstSyncRecordsPrompt =
    path !== "/profile" &&
    firstSyncCompleted &&
    firstSyncRecords.length > 0 &&
    !firstSyncRecordsSeen;
  const profilePromptText = firstSyncLoading
    ? "First sync is running..."
    : contactCheckLoading
      ? "Loading onboarding status..."
    : firstSyncCompleted
      ? `Sync completed${firstSyncState.result?.count ? `: ${firstSyncState.result.count} records` : ""}`
      : websiteDone
    ? templateDone
      ? "Run first sync to unlock full setup"
      : "Save one template to continue setup"
    : "Complete your profile setup";
  const ProfileIcon = firstSyncLoading || contactCheckLoading
    ? Loader2
    : firstSyncCompleted
      ? CheckCircle2
      : UserCircle2;
  const handleShowFirstSyncRecords = () => {
    setFirstSyncRecordsSeen(true);
    navigate("/profile?showFirstSync=1");
  };

  return (
    <div
      data-tour="welcome-header"
      className="h-20 w-full relative overflow-visible rounded-3xl bg-white shadow-lg border border-gray-100 mb-5 flex items-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30" />

      {/* Notification */}
      <AnimatePresence>
        {showNewEmailBanner && (
          <Motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="absolute top-3 right-50 z-50"
          >
            <Motion.button
              animate={{
                boxShadow: [
                  "0 0 0 rgba(59,130,246,0)",
                  "0 0 18px rgba(99,102,241,0.45)",
                  "0 0 0 rgba(59,130,246,0)",
                ],
              }}
              onClick={() => {
                dispatch(unrepliedAction.setShowNewEmailBanner(false));
                handleClear();
                navigate("/");

                dispatch(
                  getUnrepliedEmail({
                    loading: true,
                    type: "email_inbound",
                  }),
                );
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl
              bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
              text-white shadow-xl"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>

              <p className="text-sm font-semibold tracking-wide">
                New email received
              </p>

              <Motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <MailCheck />
              </Motion.span>
            </Motion.button>
          </Motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
            <span className="font-bold text-gray-900">Results for </span>
            <span className="font-bold text-gray-900">{resultTitle}</span>
          </p>

          {/* BADGES */}
          <div className="flex items-center gap-3">
            {crmDomain && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-400 cursor-pointer">
                <Link2 className="w-4 h-4 text-purple-600 group-hover:scale-125 transition-transform duration-300" />

                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-64 transition-all duration-600">
                  CRM:{" "}
                  <span className="font-bold text-purple-700">
                    {crmDomain?.split(".")[0]}
                  </span>
                </span>
              </div>
            )}

            {businessEmail && (
              <div className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer">
                <Mail className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />

                <span className="text-xs font-medium text-gray-700 max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-80 transition-all duration-600">
                  Business Email:{" "}
                  <span className="font-bold text-blue-700">
                    {businessEmail}
                  </span>
                </span>
              </div>
            )}

            <div
              onClick={() => navigate("/RecentEntry")}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-400 cursor-pointer relative"
            >
              <List className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform duration-300" />

              <div
                className={`absolute -top-2 -right-2
                bg-blue-600 text-white text-xs font-semibold
                rounded-full w-5 h-5 flex items-center justify-center
                shadow-md transition-all duration-300 ease-out
                ${animate
                    ? "scale-125 opacity-100"
                    : "scale-90 opacity-90"
                  }`}
              >
                {count}
              </div>
            </div>
          </div>

          {showProfilePrompt && contactCheckLoading ? (
            <ProfilePromptSkeleton />
          ) : showProfilePrompt ? (
            <Motion.button
              type="button"
              onClick={() => navigate("/profile")}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                group relative flex min-w-[255px] items-center gap-3 overflow-hidden rounded-2xl
                border border-indigo-200 bg-white/85 px-3 py-2 text-left shadow-lg
                shadow-indigo-500/10 backdrop-blur-xl transition-all
                hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/20
              "
            >
              <span className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
                <span
                  className={`block h-full rounded-full transition-all duration-700 ${
                    contactCheckLoading
                      ? "animate-pulse bg-slate-300"
                      : "bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500"
                  }`}
                  style={{
                    width: contactCheckLoading
                      ? "35%"
                      : `${profileCompletion}%`,
                  }}
                />
              </span>

              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${firstSyncCompleted
                    ? "bg-emerald-500 shadow-emerald-500/25"
                    : "bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-indigo-500/25"
                  }`}
              >
                <ProfileIcon
                  size={20}
                  className={
                    firstSyncLoading || contactCheckLoading
                      ? "animate-spin"
                      : ""
                  }
                />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block text-xs font-black uppercase tracking-wide ${firstSyncCompleted ? "text-emerald-600" : "text-indigo-600"
                    }`}
                >
                  {contactCheckLoading
                    ? "Checking setup"
                    : firstSyncCompleted
                      ? "Boom, completed"
                      : `Profile ${profileCompletion}%`}
                </span>
                <span className="block truncate text-sm font-bold text-slate-900">
                  {profilePromptText}
                </span>
              </span>

              {contactCheckLoading ? (
                <Loader2 size={18} className="shrink-0 animate-spin text-indigo-500" />
              ) : firstSyncCompleted ? (
                <PartyPopper size={18} className="shrink-0 text-emerald-500" />
              ) : (
                <ArrowRight
                  size={18}
                  className="shrink-0 text-indigo-500 transition-transform group-hover:translate-x-1"
                />
              )}
            </Motion.button>
          ) : null}

          {showFirstSyncRecordsPrompt && (
            <Motion.button
              type="button"
              onClick={handleShowFirstSyncRecords}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                group relative flex min-w-[220px] items-center gap-3 overflow-hidden rounded-2xl
                border border-emerald-200 bg-white/90 px-3 py-2 text-left shadow-lg
                shadow-emerald-500/10 backdrop-blur-xl transition-all
                hover:border-emerald-300 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/20
              "
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                <List size={20} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black uppercase tracking-wide text-emerald-600">
                  First Sync
                </span>
                <span className="block truncate text-sm font-bold text-slate-900">
                 Completed
                </span>
              </span>

              <ArrowRight
                size={18}
                className="shrink-0 text-emerald-500 transition-transform group-hover:translate-x-1"
              />
            </Motion.button>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex-shrink-0 flex items-center gap-2 pr-2">
          {/* SUMMARY */}
          <div
            onClick={() => navigate("/settings/controller")}
            className="relative group cursor-pointer flex items-center justify-center"
          >
            {/* Circular Score */}
            <div className="relative w-16 h-16 hover:scale-110 transition-all duration-300">
              {/* Animated Ring */}
              <svg
                className="w-16 h-16 rotate-[-90deg]"
                viewBox="0 0 120 120"
              >
                {/* Background */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="#ede9fe"
                  strokeWidth="10"
                  fill="none"
                />

                {/* Progress */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={326.72}
                  strokeDashoffset={
                    326.72 -
                    ((summary?.total_score || 0) / 100) * 326.72
                  }
                  className="transition-all duration-1000 ease-out"
                />

                {/* Gradient */}
                <defs>
                  <linearGradient id="gradient">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-violet-700">
                  {summary?.total_score || 0}%
                </span>
              </div>

              {/* Pulse Glow */}
              <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl scale-90 animate-pulse -z-10" />
            </div>

            {/* HOVER CARD */}
            <div
              className="
    absolute top-20 right-0
    w-72
    opacity-0 invisible
    translate-y-2
    group-hover:opacity-100
    group-hover:visible
    group-hover:translate-y-0
    transition-all duration-300
    bg-white/95 backdrop-blur-xl
    text-gray-800
    rounded-3xl shadow-2xl
    border border-gray-200
    p-5 z-50
  "
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="
        w-10 h-10 rounded-2xl
        bg-gradient-to-r from-violet-500 to-fuchsia-500
        flex items-center justify-center
        shadow-lg
      "
                >
                  <ChartSpline className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-violet-700">
                    Automation Summary
                  </h3>

                  <p className="text-xs text-gray-500">
                    AI performance overview
                  </p>
                </div>
              </div>

              {/* Summary Only */}
              <div
                className="
      p-4 rounded-2xl
      bg-gradient-to-br from-violet-50 to-fuchsia-50
      border border-violet-100
    "
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {summary?.automation_summary ||
                    "No automation summary available"}
                </p>
              </div>

            </div>
          </div>
            {/* Vertical Divider */}
<div className="mx-2 w-0.5 h-10 bg-gray-300"></div>
          <StatBadge
            icon={MailOpen}
            label="Received"
            value={stats.reply_recieved}
            colorClass="text-emerald-600"
            bgClass="hover:bg-emerald-50"
            borderClass="border-gray-200 hover:border-emerald-300"
          />

          <StatBadge
            icon={Send}
            label="Sent"
            value={stats.reply_sent}
            colorClass="text-blue-600"
            bgClass="hover:bg-blue-50"
            borderClass="border-gray-200 hover:border-blue-300"
          />

          <StatBadge
            icon={Bell}
            label="Reminders"
            value={stats.reminder_sent}
            colorClass="text-amber-600"
            bgClass="hover:bg-amber-50"
            borderClass="border-gray-200 hover:border-amber-300"
          />

          {/* SUMMARY */}

        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;

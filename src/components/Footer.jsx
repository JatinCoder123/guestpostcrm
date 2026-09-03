import { BellIcon, Flame, List, Mail, MailWarning, MessageCircle, Settings, Sparkles } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useOutboxStats } from "../queries/outbox.queries";
import { useTodayPaymentReminderStats } from "../queries/reminder.queries";
import { useContact } from "../queries/contact.queries";
import { SocketContext } from "../context/SocketContext";
import IconButton from "./ui/Buttons/IconButton";
import { PageContext } from "../context/pageContext";
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
export default function Footer() {
  const { data: outboxData, isPending: outboxPending } = useOutboxStats();
  const { notificationCount, totalUnseenChatCount } = useContext(SocketContext);
  const { collapsed } = useContext(PageContext);
  const [errorLogCount, setErrorLogCount] = useState(0);
  const dispatch = useDispatch()
  const prevCountRef = useRef(0);

  const {
    data: paymentReminderData,
    isPending: paymentReminderPending,
  } = useTodayPaymentReminderStats();
  const { count: hotCount } = useSelector((s) => s.hot);
  const { error, crmDomain, businessEmail } = useSelector((s) => s.user);
  const outboxCount = outboxData?.stats?.all?.count ?? 0;
  const paymentReminderCount =
    paymentReminderData?.total ??
    paymentReminderData?.total_records ??
    paymentReminderData?.count ??
    paymentReminderData?.records?.length ??
    0;

  const showPaymentReminders =
    paymentReminderCount > 0 && !paymentReminderPending;
  const showOutbox = outboxCount > 0 && !outboxPending;
  const showErrorLog = Boolean(notificationCount?.error_log_created);
  const { count } = useSelector((state) => state.events);

  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [count]);
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
  return (
    <footer
      className={`fixed bottom-0 right-0 z-40 flex h-12 items-center justify-between gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar bg-white px-3.5 shadow-[0_-1px_4px_rgba(0,0,0,.08)] transition-[left] duration-300 max-lg:left-0 ${collapsed ? "lg:left-[80px]" : "lg:left-[260px]"
        }`}
    >
      <IconButton icon={Settings} label="Settings" onClick={() => navigate("/settings")} />
      <div className="flex shrink-0 gap-2">
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


        </div>
        <IconButton
          onClick={() => navigate("/internal-chats")}
          icon={MessageCircle}
          label="Internal Chats"
          count={totalUnseenChatCount}
          iconColor="green"
        />
        <IconButton
          onClick={() => navigate("/RecentEntry")}
          icon={List}
          count={count}
          label="Recent Entry"
          showCount={true}

          iconColor="blue"
        />

        <IconButton
          iconColor="purple"
          icon={Sparkles}
          label="AI Credits"
          onClick={() => navigate("/entity/ai-credits/list/table")}
        />
        {showPaymentReminders && (
          <IconButton
            icon={BellIcon}
            label="Payment Reminders"
            count={paymentReminderCount}
            onClick={() =>
              navigate("/reminders", {
                state: {
                  reminderFilter: "today-payment",
                },
              })
            }
          />
        )}

        {/* Outbox — conditional */}
        {showOutbox && (
          <IconButton
            icon={MailWarning}
            iconColor="red"
            label="Outbox Emails"
            count={outboxCount}
            onClick={() => navigate("/entity/outbox/list/table")}
          />
        )}

        {/* Hot Records */}
        <IconButton
          icon={Flame}
          label="Hot Records"
          iconColor="orange"
          count={hotCount}
          onClick={() => navigate("/entity/hot-events/list/table")}
        />

        {/* Error Logs — conditional + shake animation */}
        {showErrorLog && (
          <motion.div
            animate={animate ? { x: [0, -3, 3, -3, 3, 0] } : {}}
            transition={{ duration: 0.35 }}
          >
            <IconButton
              icon={CircleAlert}
              label="Error Logs"
              color="red"
              count={errorLogCount}
              onClick={() => navigate("/settings/debugging")}
            />
          </motion.div>
        )}
      </div>
    </footer >
  );
}

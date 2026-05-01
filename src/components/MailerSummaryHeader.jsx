import { useDispatch, useSelector } from "react-redux";
import { extractEmail } from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { LoadingSpin } from "./Loading";
import { createOrder, getOrders, orderAction } from "../store/Slices/orders";
import { toast } from "react-toastify";
import { PageContext } from "../context/pageContext";
import { useRef } from "react";
import {
  Crown,
  Eye,
  FileText,
  Gift,
  Handshake,
  Plus,
  RefreshCcw,
  RefreshCcwIcon,
  ShoppingCart,
} from "lucide-react";
import { getSync, syncAction } from "../store/Slices/syncSlice";
import SyncSelectionModal from "./SyncSelectionModal";

/* ===================== MAIN ===================== */
const MailerSummaryHeader = () => {
  const { mailersSummary, loading } = useSelector((state) => state.ladger);
  const { contactInfo } = useSelector((state) => state.viewEmail);
  const email = contactInfo?.email1;
  const {
    syncType,
    syncData,
    loading: syncing,
    message,
    error,
    count,
  } = useSelector((state) => state.sync);
  const [showSyncData, setShowSyncData] = useState(false);
  const dispatch = useDispatch();
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders,
  );
  const { offers, loading: offersLoading } = useSelector(
    (state) => state.offers,
  );
  const { deals, loading: dealsLoading } = useSelector((state) => state.deals);
  const { showBrandTimeline } = useSelector((state) => state.brandTimeline);

  const [emailData, setEmailData] = useState({
    orders: [],
    offers: [],
    deals: [],
  });
  const handleSync = (type) => {
    setShowSyncData(true);
    dispatch(getSync(type));
  };
  /* ---------------- ORDERS ---------------- */

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(syncAction.clearAllMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(syncAction.clearAllErrors());
    }
  }, [message, error]);

  /* ---------------- DEALS ---------------- */
  useEffect(() => {
    const actualOrders = showBrandTimeline ? orders : orders?.filter((o) => extractEmail(o.real_name ?? o.email) === email)
    const filtered = actualOrders.filter(
      (d) =>
        !["wrong", "rejected_nontechnical", "completed"].includes(
          d.order_status
        )
    );

    setEmailData((prev) => ({ ...prev, orders: filtered }));
  }, [email, orders, showBrandTimeline]);
  useEffect(() => {
    const actualDeals = showBrandTimeline ? deals : deals?.filter((o) => extractEmail(o.real_name ?? o.email) === email)
    const deal = actualDeals?.filter((d) => d.status === "active");
    setEmailData((prev) => ({ ...prev, deals: deal }));
  }, [email, deals, showBrandTimeline]);

  /* ---------------- OFFERS ---------------- */
  useEffect(() => {
    const actualOffers = showBrandTimeline ? offers : offers?.filter((o) => extractEmail(o.real_name ?? o.email_c) === email)
    const offer = actualOffers?.filter((d) => d.offer_status === "active");
    setEmailData((prev) => ({ ...prev, offers: offer }));
  }, [email, offers, showBrandTimeline]);
  /* ---------------- UI ---------------- */
  return (
    <>
      {showSyncData && count > 0 && (
        <SyncSelectionModal
          onClose={() => setShowSyncData(false)}
          type={syncType}
          data={syncData}
        />
      )}

      <div className=" p-4 bg-slate-50 rounded-3xl shadow-xl border border-slate-200 flex flex-col gap-3">
        {/* TOP INFO */}
        <MailerSummary mailersSummary={mailersSummary} />

        {/* STATS CARDS */}
        <div className="rounded-3xl shadow-sm p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              type="offers"
              title="NO OFFERS"
              Icon={Gift}
              bg={"bg-green-500"}
              color="green"
              data={emailData.offers}
              handleSync={() => handleSync("offers")}
              loading={offersLoading}
            />

            <SummaryCard
              type="orders"
              title="NO ORDERS"
              Icon={ShoppingCart}
              bg={"bg-cyan-500"}
              color="cyan"
              data={emailData.orders}
              handleSync={() => handleSync("orders")}
              loading={ordersLoading}
            />

            <SummaryCard
              type="deals"
              title="NO DEALS"
              Icon={Handshake}
              bg={"bg-blue-500"}
              color="blue"
              data={emailData.deals}
              handleSync={() => handleSync("deals")}
              loading={dealsLoading}
            />

            <SummaryCard
              type="invoice"
              title="NO INVOICE"
              Icon={FileText}
              bg={"bg-orange-500"}
              color="orange"
              data={emailData.invoice}
              handleSync={() => handleSync("invoice")}
              loading={syncType === "invoice"}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MailerSummaryHeader;



function MailerSummary({ mailersSummary }) {
  return (
    <>
      {mailersSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">
              Created At
            </div>
            <div className="font-semibold text-gray-900 mt-1">
              {mailersSummary?.date_entered_formatted || ""}
            </div>
            <div className="text-xs text-gray-500">
              {mailersSummary?.date_entered || ""}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">
              Subject
            </div>
            <Titletooltip content={mailersSummary?.subject || "No Subject"}>
              <div className="font-semibold text-gray-900 mt-1 cursor-pointer hover:text-blue-600 truncate max-w-[280px]">
                {mailersSummary?.subject || ""}
              </div>
            </Titletooltip>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">
              Motive
            </div>
            <Titletooltip content={mailersSummary?.correct_motive || "N/A"}>
              <div className="font-semibold text-gray-900 mt-1 cursor-pointer hover:text-blue-600 truncate max-w-[280px]">
                {mailersSummary?.correct_motive || ""}
              </div>
            </Titletooltip>
          </div>
        </div>
      ) : (
        <div className=" p-6 bg-gray-50 rounded-3xl shadow-xl border border-white/40 flex flex-col items-center gap-4 mb-2">
          <p className="text-gray-800 font-semibold">
            No mail summary available for this email.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 flex gap-2 items-center py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-700 transition"
          >
            <RefreshCcwIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}
    </>
  )
}
/* ===================== SUMMARY CARD ===================== */
function SummaryCard({
  type,
  title,
  Icon,
  handleSync,
  bg,
  color,
  data,
  loading,
}) {
  const { setSidebarCollapsed } = useContext(PageContext);
  const { syncType, loading: syncing } = useSelector((state) => state.sync);
  const { showBrandTimeline } = useSelector((state) => state.brandTimeline);

  const { threadId, contactInfo } = useSelector((state) => state.viewEmail);
  const { creating, message, error } = useSelector((state) => state.orders);
  const { email } = useSelector((state) => state.ladger);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const [highlight, setHighlight] = useState(false);
  const prevLengthRef = useRef(data?.length || 0);

  useEffect(() => {
    if (type !== "orders") return;
    if (message) {
      toast.success(message);
      dispatch(getOrders({ loading: false }));
      dispatch(orderAction.clearAllMessages());
    }

    if (error) {
      toast.error(error);
      dispatch(orderAction.clearAllErrors());
    }
  }, [dispatch, creating, message, error]);

  useEffect(() => {
    if (type !== "orders") return;

    if ((data?.length || 0) > prevLengthRef.current) {
      setHighlight(true);

      const timer = setTimeout(() => {
        setHighlight(false);
      }, 25000); // ✅ 25 seconds

      return () => clearTimeout(timer); // cleanup
    }

    prevLengthRef.current = data?.length || 0;
  }, [data, type]);

  const handleClick = () => {
    setSidebarCollapsed(true);

    if (type === "orders" && data?.length === 0) {
      dispatch(createOrder());
      return;
    }

    data?.length > 0
      ? navigateTo(`/${type}/view`, {
        state: { email, threadId },
      })
      : navigateTo(`/${type}/create`, {
        state: { email, threadId },
      });
  };

  const colorMap = {
    green: "text-green-600",
    blue: "  text-blue-600",
    cyan: " text-cyan-600",
    orange: " text-orange-600",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border-t-2 border-blue-100 p-3 ${colorMap[color]} ${highlight
        ? "ring-2 ring-cyan-400/70 shadow-lg shadow-cyan-400/40 scale-[1.02] transition-all duration-500 ease-out"
        : "transition-all duration-300"
        }`}
    >
      {(creating && type === "orders") ||
        loading ||
        (syncType == type && syncing) ? (
        <LoadingSpin color={color} size={23} stroke="3" />
      ) : (
        <>
          <div className="flex items-center gap-3">
            {type == "orders" && data.length == 0 ? (
              <button
                className="cursor-pointer"
                onClick={() =>
                  navigateTo(`/orders/create`, {
                    state: {
                      email,
                      threadId,
                    },
                  })
                }
              >
                <img
                  width="36"
                  height="36"
                  src="https://img.icons8.com/arcade/64/plus.png"
                  alt="plus"
                />
              </button>
            ) : (
              <div
                className={` relative w-10 h-10 rounded-xl ${bg} shadow flex items-center justify-center text-white text-xl`}
              >
                <Icon />
                {showBrandTimeline && <Crown className="absolute -top-4 left-2 text-yellow-600 w-5 h-5" />}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold">
                {data?.length > 0
                  ? `${data.length} ${data.length === 1 ? type.slice(0, -1).toUpperCase() : type.toUpperCase()}`
                  : title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClick}
              disabled={type == "invoice"}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-lg font-bold hover:scale-110 transition"
            >
              {data?.length > 0 ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleSync}
              disabled={syncing || type == "invoice"}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-lg font-bold hover:scale-110 transition"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

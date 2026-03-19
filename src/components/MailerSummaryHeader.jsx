import { useDispatch, useSelector } from "react-redux";
import { excludeEmail } from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { LoadingChase } from "./Loading";
import { createOrder, getOrders, orderAction } from "../store/Slices/orders";
import { toast } from "react-toastify";
import { PageContext } from "../context/pageContext";
import { Eye, FileIcon, FileText, Gift, Handshake, Plus, RefreshCcw, RefreshCcwIcon, ShoppingCart, TextIcon } from "lucide-react";
import axios from "axios";
import { getSync, syncAction } from "../store/Slices/syncSlice";
import SyncSelectionModal from "./SyncSelectionModal";

/* ===================== MAIN ===================== */
const MailerSummaryHeader = () => {
  const { mailersSummary, email } = useSelector((state) => state.ladger);
  const { syncType, syncData, loading: syncing, message, error, count } = useSelector(state => state.sync)
  const [showSyncData, setShowSyncData] = useState(false)
  const dispatch = useDispatch()
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders,
  );
  const { offers, loading: offersLoading } = useSelector(
    (state) => state.offers,
  );
  const { deals, loading: dealsLoading } = useSelector((state) => state.deals);

  const [emailData, setEmailData] = useState({
    orders: [],
    offers: [],
    deals: [],
  });
  const handleSync = (type) => {
    setShowSyncData(true)
    dispatch(getSync(type))
  };
  /* ---------------- ORDERS ---------------- */
  useEffect(() => {
    if (!mailersSummary) return;

    const order = orders
      ?.filter((o) => excludeEmail(o.real_name ?? o.email) === email)
      .filter(
        (d) =>
          d.order_status !== "wrong" &&
          d.order_status !== "rejected_nontechnical" &&
          d.order_status !== "completed",
      );

    setEmailData((prev) => ({ ...prev, orders: order }));
  }, [email, orders, mailersSummary]);
  useEffect(() => {
    if (message) {
      toast.success(message)
      dispatch(syncAction.clearAllMessage())
    }
    if (error) {
      toast.error(error)
      dispatch(syncAction.clearAllErrors())
    }
  }, [message, error]);

  /* ---------------- DEALS ---------------- */
  useEffect(() => {
    if (!mailersSummary) return;

    const deal = deals?.filter(
      (d) => excludeEmail(d.real_name ?? d.email) === email,
    );

    setEmailData((prev) => ({ ...prev, deals: deal }));
  }, [email, deals, mailersSummary]);

  /* ---------------- OFFERS ---------------- */
  useEffect(() => {
    if (!mailersSummary) return;

    const offer = offers
      ?.filter((o) => excludeEmail(o.real_name ?? o.email) === email)
      .filter((d) => d.offer_status === "active");

    setEmailData((prev) => ({ ...prev, offers: offer }));
  }, [email, offers, mailersSummary]);


  /* ---------------- UI ---------------- */
  return (
    <>{
      showSyncData && count > 0 && <SyncSelectionModal
        onClose={() => setShowSyncData(false)}
        type={syncType}
        data={syncData}
      />
    }

      <div className=" p-4 bg-slate-50 rounded-3xl shadow-xl border border-slate-200 flex flex-col gap-3">
        {/* TOP INFO */}
        {mailersSummary ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        </div> : <div className=" p-6 bg-gray-50 rounded-3xl shadow-xl border border-white/40 flex flex-col items-center gap-4 mb-2">
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
        </div>}


        {/* STATS CARDS */}
        <div className="rounded-3xl shadow-sm p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              type="offers"
              title="NO OFFERS"
              subtitle="Click + to add"
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
              subtitle="Click + to add"
              Icon={ShoppingCart}
              bg={"bg-cyan-500"}
              color="cyan"
              data={emailData.orders}
              handleSync={() => handleSync("orders")}
              loading={ordersLoading}
              setData={setEmailData}
            />

            <SummaryCard
              type="deals"
              title="NO DEALS"
              subtitle="Click + to add"
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
              subtitle="Click + to add"
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

/* ===================== SUMMARY CARD ===================== */
function SummaryCard({
  type,
  title,
  subtitle,
  Icon,
  handleSync,
  bg,
  color,
  data,
  setData,
  loading,
}) {
  const { setSidebarCollapsed } = useContext(PageContext);
  const { syncType, loading: syncing, } = useSelector(state => state.sync)

  const { threadId } = useSelector((state) => state.viewEmail);
  const { creating, message, error } = useSelector((state) => state.orders);
  const { email } = useSelector((state) => state.ladger);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  useEffect(() => {
    if (type !== "orders") return;

    if (message) {
      toast.success(message);
      dispatch(getOrders({ loading: false }));
      setData?.((prev) => ({ ...prev, orders: [1] }));
      dispatch(orderAction.clearAllMessages());
    }

    if (error) {
      toast.error(error);
      dispatch(orderAction.clearAllErrors());
    }
  }, [dispatch, creating, message, error, type, setData]);

  const handleClick = () => {
    setSidebarCollapsed(true);

    if (type === "orders" && data?.length === 0) {
      dispatch(createOrder());
      return;
    }

    data?.length > 0
      ? navigateTo(`/${type}/view`, { state: { email, threadId } })
      : navigateTo(`/${type}/create`, { state: { email, threadId } });
  };

  const colorMap = {
    green: "bg-green-50 border-green-300 text-green-600",
    blue: "bg-blue-50 border-blue-300 text-blue-600",
    cyan: "bg-cyan-100 border-cyan-300 text-cyan-600",
    orange: "bg-orange-50 border-orange-300 text-orange-600",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border-t-2  p-3 ${colorMap[color]}`}
    >
      {(creating && type === "orders") || loading || (syncType == type && syncing) ? (
        <LoadingChase />
      ) : (
        <>
          <div className="flex items-center gap-3">
            {type == "orders" ? (
              <button
                className="cursor-pointer"
                onClick={() =>
                  navigateTo(`/${type}/create`, { state: { email, threadId } })
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
              <div className={`w-10 h-10 rounded-xl ${bg} shadow flex items-center justify-center text-white text-xl`}>
                <Icon />
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

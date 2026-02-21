import { useDispatch, useSelector } from "react-redux";
import { excludeEmail } from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { LoadingChase } from "./Loading";
import { createOrder, getOrders, orderAction } from "../store/Slices/orders";
import { toast } from "react-toastify";
import { PageContext } from "../context/pageContext";
import { Eye, Plus, RefreshCcw } from "lucide-react";
import axios from "axios";

/* ===================== MAIN ===================== */
const MailerSummaryHeader = () => {
  const { mailersSummary, email } = useSelector((state) => state.ladger);
  const [syncing, setSyncing] = useState(null);

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
  const handleSync = async (type) => {
    setSyncing(type);
    try {
      const synscData = await axios.get(
        `https://sales.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=${type}&action=import&email=${email}`,
      );
      if (synscData.data.status === "success") {
        toast.success(`${type} synced successfully!`);
        // Optionally, you can also refresh the data here by dispatching the relevant actions to fetch the updated orders, offers, or deals.
      } else {
        toast.error(`Failed to sync ${type}. Please try again.`);
      }
    } catch (error) {
      toast.error(`Failed to sync ${type}. Please try again.`);
    } finally {
      setSyncing(null);
    }
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

  /* ---------------- EMPTY STATE ---------------- */
  if (!mailersSummary) {
    return (
      <div className="mt-4 p-6 bg-cyan-50 rounded-3xl shadow-xl border border-white/40 flex flex-col items-center gap-4">
        <p className="text-gray-700 font-semibold">
          No mail summary available for this email.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-0 p-4 bg-slate-50 rounded-3xl shadow-xl border border-slate-200">
      {/* TOP INFO */}
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

      {/* STATS CARDS */}
      <div className="bg-white rounded-3xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            type="offers"
            title="NO OFFERS"
            subtitle="Click + to add"
            icon="🎁"
            color="green"
            data={emailData.offers}
            handleSync={() => handleSync("offers")}
            loading={offersLoading || syncing==="offers"}
          />

          <SummaryCard
            type="orders"
            title="NO ORDERS"
            subtitle="Click + to add"
            icon="📦"
            color="blue"
            data={emailData.orders}
            handleSync={() => handleSync("orders")}
            loading={ordersLoading || syncing==="orders"}
            setData={setEmailData}
          />

          <SummaryCard
            type="deals"
            title="NO DEALS"
            subtitle="Click + to add"
            icon="🤝"
            color="purple"
            data={emailData.deals}
            handleSync={() => handleSync("deals")}
            loading={dealsLoading || syncing==="deals"}
          />

          <SummaryCard
            type="invoice"
            title="NO INVOICE"
            subtitle="Click + to add"
            icon="🧾"
            color="orange"
            data={emailData.invoice}
            handleSync={() => handleSync("invoice")}
            loading={syncing==="invoice"}
          />
        </div>
      </div>
    </div>
  );
};

export default MailerSummaryHeader;

/* ===================== SUMMARY CARD ===================== */
function SummaryCard({
  type,
  title,
  subtitle,
  icon,
  handleSync,
  color,
  data,
  setData,
  loading,
}) {
  const { setSidebarCollapsed } = useContext(PageContext);
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
    purple: "bg-purple-50 border-purple-300 text-purple-600",
    orange: "bg-orange-50 border-orange-300 text-orange-600",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border-2 border-dashed px-4 py-4 ${colorMap[color]}`}
    >
      {(creating && type === "orders") || loading ? (
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
                  width="40"
                  height="40"
                  src="https://img.icons8.com/arcade/64/plus.png"
                  alt="plus"
                />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center text-xl">
                {icon}
              </div>
            )}

            <div>
              <p className="text-md font-semibold">
                {data?.length > 0
                  ? `${data.length} ${data.length === 1 ? type.slice(0, -1).toUpperCase() : type.toUpperCase()}`
                  : title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClick}
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

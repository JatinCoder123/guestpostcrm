import { useDispatch, useSelector } from "react-redux";
import { excludeEmail } from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { LoadingChase } from "./Loading";
import { createOrder, getOrders, orderAction } from "../store/Slices/orders";
import { toast } from "react-toastify";
import { PageContext } from "../context/pageContext";

const MailerSummaryHeader = () => {
  const { mailersSummary, email } = useSelector((state) => state.ladger);

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

    setEmailData((prev) => ({
      ...prev,
      orders: order,
    }));
  }, [email, orders, mailersSummary]);

  /* ---------------- DEALS ---------------- */
  useEffect(() => {
    if (!mailersSummary) return;

    const deal = deals?.filter(
      (d) => excludeEmail(d.real_name ?? d.email) === email,
    );

    setEmailData((prev) => ({
      ...prev,
      deals: deal,
    }));
  }, [email, deals, mailersSummary]);

  /* ---------------- OFFERS ---------------- */
  useEffect(() => {
    if (!mailersSummary) return;

    const offer = offers
      ?.filter((o) => excludeEmail(o.real_name ?? o.email) === email)
      .filter((d) => d.offer_status === "active");

    setEmailData((prev) => ({
      ...prev,
      offers: offer,
    }));
  }, [email, offers, mailersSummary]);

  /* =====================================================
     🛑 EMPTY STATE WHEN mailersSummary IS NULL
     ===================================================== */
  if (!mailersSummary) {
    return (
      <div className="mt-4 p-6 bg-cyan-50 rounded-3xl shadow-xl border border-white/40 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-700 font-semibold text-center">
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

  /* ===================== NORMAL UI ===================== */
  return (
    <div className="mt-0 p-4 bg-slate-50 rounded-3xl shadow-xl border border-slate-200">
      {/* TOP INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* CREATED AT */}
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

        {/* SUBJECT */}
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">
            Subject
          </div>
          <Titletooltip content={mailersSummary?.subject || "No Subject"}>
            <div className="font-semibold text-gray-900 mt-1 cursor-pointer hover:text-blue-600">
              {mailersSummary?.subject
                ? mailersSummary.subject.split(" ").slice(0, 6).join(" ") +
                  (mailersSummary.subject.split(" ").length > 6 ? "..." : "")
                : ""}
            </div>
          </Titletooltip>
        </div>

        {/* MOTIVE */}
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">
            Motive
          </div>
          <Titletooltip content={mailersSummary?.correct_motive || "N/A"}>
            <div className="font-semibold text-gray-900 mt-1 cursor-pointer hover:text-purple-600">
              {mailersSummary?.correct_motive
                ? mailersSummary.correct_motive
                    .split(" ")
                    .slice(0, 6)
                    .join(" ") +
                  (mailersSummary.correct_motive.split(" ").length > 6
                    ? "..."
                    : "")
                : ""}
            </div>
          </Titletooltip>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-4 divide-x divide-gray-200">
          {/* OFFERS */}
          <div className="p-4 text-center">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">
              Offers
            </div>
            <TD data={emailData.offers} type="offers" loading={offersLoading} />
          </div>

          {/* DEALS */}
          <div className="p-4 text-center">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">
              Deals
            </div>
            <TD data={emailData.deals} type="deals" loading={dealsLoading} />
          </div>

          {/* ORDERS */}
          <div className="p-4 text-center">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">
              Orders
            </div>
            <TD
              data={emailData.orders}
              setData={setEmailData}
              type="orders"
              loading={ordersLoading}
            />
          </div>

          {/* INVOICES */}
          <div className="p-4 text-center">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">
              Invoices
            </div>
            <TD
              data={emailData.invoice}
              type="invoice"
              loading={dealsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailerSummaryHeader;

/* ===================== TD ===================== */
function TD({ data, type, setData, loading }) {
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
      setData((prev) => ({
        ...prev,
        orders: [1],
      }));
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

  return (
    <td className="border border-blue-400 px-2 py-2 flex items-center justify-center">
      {(creating && type === "orders") || loading ? (
        <LoadingChase />
      ) : (
        <span className="font-semibold text-gray-900 flex items-center justify-center">
          {data?.length > 0
            ? `${data.length} ${data.length === 1 ? type.slice(0, -1) : type}`
            : `No ${type}`}

          <button onClick={handleClick}>
            <img
              className="ml-2"
              width="20"
              height="20"
              src={`https://img.icons8.com/stickers/100/${
                data?.length > 0 ? "visible" : "add"
              }.png`}
              alt="action"
            />
          </button>
        </span>
      )}
    </td>
  );
}

/* ===================== TH ===================== */
function TH({ title }) {
  return (
    <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
      {title}
    </th>
  );
}

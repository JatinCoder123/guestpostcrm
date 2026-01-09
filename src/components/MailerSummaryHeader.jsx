import { useDispatch, useSelector } from "react-redux";
import { excludeEmail } from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadingChase } from "./Loading";
import {
  createOrder,
  getOrdersWithoutLoading,
  orderAction,
} from "../store/Slices/orders";
import { toast } from "react-toastify";
import { useContext } from "react";
import { PageContext } from "../context/pageContext";

const MailerSummaryHeader = () => {
  const { mailersSummary, email } = useSelector((state) => state.ladger);
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.orders
  );
  const { offers, loading: offersLoading } = useSelector(
    (state) => state.offers
  );
  const { deals, loading: dealsLoading } = useSelector((state) => state.deals);
  const [emailData, setEmailData] = useState({
    orders: [],
    offers: [],
    deals: [],
  });
  useEffect(() => {
    const order = orders?.filter(
      (o) => excludeEmail(o.real_name ?? o.email) == email
    ).filter((d) => d.order_status !== "Wrong" && d.order_status !== "Rejected-NonTechnical");
    setEmailData((prev) => ({
      ...prev,
      orders: order,
    }));
  }, [email, orders]);
  useEffect(() => {
    const deal = deals?.filter(
      (d) => excludeEmail(d.real_name ?? d.email) == email
    );
    setEmailData((prev) => ({
      ...prev,
      deals: deal,
    }));
  }, [email, deals]);
  useEffect(() => {
    const offer = offers?.filter(
      (o) => excludeEmail(o.real_name ?? o.email) == email
    ).filter((d) => d.offer_status !== "expire");
    setEmailData((prev) => ({
      ...prev,
      offers: offer,
    }));
  }, [email, offers]);
  return (
    <div className="mt-4 p-6 bg-cyan-50 rounded-3xl shadow-xl border border-white/40">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-blue-400 rounded-xl overflow-hidden text-sm">
          <thead className="bg-blue-50">
            <tr>
              <TH title="DATE" />
              <TH title="SUBJECT" />
              <TH title="MOTIVE" />
              <TH title="ORDER" />
              <TH title="OFFER" />
              <TH title="DEAL" />
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="border border-blue-400 px-4 py-3">
                <div className="font-semibold text-gray-900">
                  {mailersSummary?.date_entered_formatted}
                </div>
                <div className="text-xs text-gray-600">
                  {mailersSummary?.date_entered}
                </div>
              </td>
              <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                <Titletooltip content={mailersSummary?.subject || "No Subject"}>
                  <div className="hover:text-blue-600 transition-colors">
                    {mailersSummary?.subject
                      ? mailersSummary.subject
                        .split(" ")
                        .slice(0, 6)
                        .join(" ") +
                      (mailersSummary.subject.split(" ").length > 6
                        ? "..."
                        : "")
                      : "No Subject"}
                  </div>
                </Titletooltip>
              </td>
              <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                <Titletooltip content={mailersSummary?.motive || "N/A"}>
                  <div className="hover:text-purple-600 transition-colors">
                    {mailersSummary?.correct_motive
                      ? mailersSummary.correct_motive
                        .split(" ")
                        .slice(0, 6)
                        .join(" ") +
                      (mailersSummary.correct_motive.split(" ").length > 6
                        ? "..."
                        : "")
                      : "N/A"}
                  </div>
                </Titletooltip>{" "}
              </td>
              <TD
                data={emailData.orders}
                setData={setEmailData}
                type="orders"
                loading={ordersLoading}
              />
              <TD
                data={emailData.offers}
                type="offers"
                loading={offersLoading}
              />
              <TD data={emailData.deals} type="deals" loading={dealsLoading} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MailerSummaryHeader;

function TD({ data, type, setData, loading }) {
  const { setSidebarCollapsed } = useContext(PageContext);

  const { creating, message, error } = useSelector((state) => state.orders);
  const { email } = useSelector((state) => state.ladger);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  useEffect(() => {
    if (type == "orders") {
      if (message) {
        toast.success(message);
        dispatch(getOrdersWithoutLoading());
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
    }
  }, [dispatch, creating, message, error]);
  const handleClick = () => {
    setSidebarCollapsed(true);
    if (type == "orders" && data?.length == 0) {
      dispatch(createOrder());
      return;
    }
    data?.length > 0
      ? navigateTo(`/${type}/view`, { state: { email } })
      : navigateTo(`/${type}/create`, { state: { email } });
  };
  return (
    <td className="border border-blue-400 px-4 py-3">
      {(creating && type == "orders") || loading ? (
        <LoadingChase />
      ) : (
        <span className="borderpx-4 py-3 font-semibold text-gray-900 flex items-center justify-center">
          {/* {data?.length > 0 ? `${data?.length} ${type}` : `No ${type}`} */}
          {data?.length > 0
            ? `${data.length} ${data.length === 1 ? type.slice(0, -1) : type}`
            : `No ${type}`}

          <button onClick={handleClick}>
            <img
              className="ml-2"
              width="20"
              height="20"
              src={`https://img.icons8.com/stickers/100/${data?.length > 0 ? "visible" : "add"
                }.png`}
              alt="add"
            />
          </button>
        </span>
      )}
    </td>
  );
}
function TH({ title }) {
  return (
    <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
      {title}
    </th>
  );
}

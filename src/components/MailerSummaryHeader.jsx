import { useDispatch, useSelector } from "react-redux";
import {
  daysUntil,
  excludeEmail,
  formatExpiryLabel,
  formatTime,
  getDifference,
} from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadingChase } from "./Loading";
import { createOrder, getOrdersWithoutLoading, orderAction } from "../store/Slices/orders";
import { toast } from "react-toastify";
import { create } from "zustand";

const MailerSummaryHeader = () => {
  const { mailersSummary, email } = useSelector((state) => state.ladger);
  const { orders } = useSelector((state) => state.orders);
  const { offers } = useSelector((state) => state.offers);
  const { deals } = useSelector((state) => state.deals);
  const [emailData, setEmailData] = useState({ orders: [], offers: [], deals: [] });
  useEffect(() => {
    const order = orders.filter(o => excludeEmail(o.real_name) == email)
    setEmailData((prev) => ({
      ...prev,
      orders: order
    }))
  }, [email, orders])
  useEffect(() => {
    const deal = deals.filter(d => excludeEmail(d.real_name) == email)
    setEmailData((prev) => ({
      ...prev,
      deals: deal
    }))
  }, [email, deals])
  useEffect(() => {
    const offer = offers.filter(o => excludeEmail(o.real_name) == email)
    setEmailData((prev) => ({
      ...prev,
      offers: offer
    }))
  }, [email, offers])
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
                  {formatTime(mailersSummary?.date_entered)}
                </div>
                <div className="text-xs text-gray-600">
                  {getDifference(mailersSummary?.date_entered)}
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
                    {mailersSummary?.motive
                      ? mailersSummary.motive.split(" ").slice(0, 6).join(" ") +
                      (mailersSummary.motive.split(" ").length > 6
                        ? "..."
                        : "")
                      : "N/A"}
                  </div>
                </Titletooltip>{" "}
              </td>
              <TD data={emailData.orders} setData={setEmailData} type="orders" />
              <TD data={emailData.offers} type="offers" />
              <TD data={emailData.deals} type="deals" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MailerSummaryHeader;


function TD({ data, type, setData }) {
  const { creating, message, error, loading } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  useEffect(() => {
    if (type == "orders") {
      if (message) {
        toast.success(message)
        dispatch(getOrdersWithoutLoading())
        setData((prev) => ({
          ...prev,
          orders: [1]
        }))
        dispatch(orderAction.clearAllMessages())
      }
      if (error) {
        toast.error(error)
        dispatch(orderAction.clearAllErrors())
      }
    }
  }, [dispatch, creating, message, error])
  const handleClick = () => {
    if (type == "orders" && data.length == 0) {
      dispatch(createOrder())
      return;
    }
    navigateTo(`/${type}/create`)

  }
  return (
    <td className="border border-blue-400 px-4 py-3">
      {(loading || creating) && type == "orders" ? <LoadingChase /> :
        <span className="borderpx-4 py-3 font-semibold text-gray-900 flex items-center justify-center">
          {data.length > 0 ? `${data.length} ${type}` : `No ${type}`}
          <button onClick={handleClick}>
            <img className="ml-2"
              width="20"
              height="20"
              src={`https://img.icons8.com/stickers/100/${data.length > 0 ? "edit" : "add"}.png`}
              alt="add"
            />
          </button>
        </span>}

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
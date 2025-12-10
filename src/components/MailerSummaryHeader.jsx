import { useSelector } from "react-redux";
import {
  daysUntil,
  formatExpiryLabel,
  formatTime,
  getDifference,
} from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const MailerSummaryHeader = () => {
  const { mailersSummary, email } = useSelector((state) => state.ladger);
  const { orders } = useSelector((state) => state.orders);
  const { offers } = useSelector((state) => state.offers);
  const { deals } = useSelector((state) => state.deals);
  const [emailData, setEmailData] = useState({ orders: [], offers: [], deals: [] });
  useEffect(() => {
    const order = orders.filter(o => o.name == email)
    setEmailData((prev) => ({
      ...prev,
      orders: order
    }))
  }, [email, orders])
  useEffect(() => {
    const deal = deals.filter(d => d.email == email)
    setEmailData((prev) => ({
      ...prev,
      deals: deal
    }))
  }, [email, deals])
  useEffect(() => {
    const offer = offers.filter(o => o.name == email)
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
              <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                DATE
              </th>
              <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                SUBJECT
              </th>
              <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                MOTIVE
              </th>
              <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                ORDER
              </th>
              <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                OFFER
              </th>
              <th className="border border-blue-400 px-4 py-3 text-center font-bold text-gray-700">
                DEAL
              </th>
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
              <td className="border border-blue-400 px-4 py-3">

                <span className="borderpx-4 py-3 font-semibold text-gray-900 flex items-center justify-center">
                  {emailData.orders.length > 0 ? `${emailData.orders.length} Orders` : "No Order"}
                  <Link to={"/orders/create"}>
                    <img className="ml-2"
                      width="20"
                      height="20"
                      src={`https://img.icons8.com/stickers/100/${emailData.orders.length > 0 ? "edit" : "add"}.png`}
                      alt="add"
                    />
                  </Link>
                </span>
              </td>
              <td className="border border-blue-400 px-4 py-3">

                <span className="borderpx-4 py-3 font-semibold text-gray-900 flex items-center justify-center">
                  {emailData.offers.length > 0 ? `${emailData.offers.length} Offers` : "No Offer"}
                  <Link to={"/offers/create"}>
                    <img className="ml-2"
                      width="20"
                      height="20"
                      src={`https://img.icons8.com/stickers/100/${emailData.offers.length > 0 ? "edit" : "add"}.png`}
                      alt="add"
                    />
                  </Link>
                </span>
              </td>
              <td className="border border-blue-400 px-4 py-3">

                <span className="borderpx-4 py-3 font-semibold text-gray-900 flex items-center justify-center">
                  {emailData.deals.length > 0 ? `${emailData.deals.length} Deals` : "No Deal"}
                  <Link to={"/deals/create"}>
                    <img className="ml-2"
                      width="20"
                      height="20"
                      src={`https://img.icons8.com/stickers/100/${emailData.deals.length > 0 ? "edit" : "add"}.png`}
                      alt="add"
                    />
                  </Link>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MailerSummaryHeader;

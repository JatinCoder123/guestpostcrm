import { useSelector } from "react-redux";
import {
  daysUntil,
  formatExpiryLabel,
  formatTime,
  getDifference,
} from "../assets/assets";
import { Titletooltip } from "./TitleTooltip";
import { Link } from "react-router-dom";

const MailerSummaryHeader = ({ email }) => {
  const { mailersSummary } = useSelector((state) => state.ladger);
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

                <span className="borderpx-4 py-3 font-semibold text-gray-900 flex align-items-center justify-center">
                  {mailersSummary?.deal ?? "No Order"}
                  <Link to={"/orders/create"}>
                    <img className="ml-2"
                      width="20"
                      height="20"
                      src="https://img.icons8.com/stickers/100/add.png"
                      alt="add"
                    />
                  </Link>
                </span>
              </td>

              <td className="borderpx-4 py-3 mt-4 font-semibold text-gray-900 flex align-items-center justify-center">
                {mailersSummary?.deal ?? "No Deal"}
                <span className="checking align-items-center justify-center">
                  <Link to={"/deals/create"}>
                    <img className="ml-2"
                      width="20"
                      height="20"
                      src="https://img.icons8.com/stickers/100/add.png"
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

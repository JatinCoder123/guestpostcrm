import { useSelector } from "react-redux";
import { daysUntil, formatExpiryLabel, formatTime, getDifference } from "../assets/assets";


const MailerSummaryHeader = () => {
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
                                DEAL EXPIRY
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
                                {mailersSummary?.subject ?? "No Subject"}
                            </td>
                            <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                                {mailersSummary?.motive ?? "N/A"}
                            </td>
                            <td className="border border-blue-400 px-4 py-3">
                                <div
                                    className={`font-semibold ${daysUntil(2) <= 3
                                        ? "text-rose-600"
                                        : "text-gray-900"
                                        }`}
                                >
                                    {formatExpiryLabel(mailersSummary.deal_expiry)}
                                </div>
                                {mailersSummary?.deal_expiry && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        ({formatTime(mailersSummary.deal_expiry)})
                                    </div>
                                )}
                            </td>
                            <td className="border border-blue-400 px-4 py-3 font-semibold text-gray-900">
                                {mailersSummary?.deal ?? "No Deal"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default MailerSummaryHeader
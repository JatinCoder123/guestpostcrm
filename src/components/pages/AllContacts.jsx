import { useContext } from "react";
import {
    Calendar,
    User2,
    Contact2Icon,
    ChartNoAxesColumn,
    TrendingUp,
    ChartSpline,
} from "lucide-react";
import { useSelector } from "react-redux";
import { PageContext } from "../../context/pageContext";


export default function AllContacts() {
    const { contacts, loading } = useSelector((state) => state.contacts);
    const { handleDateClick } = useContext(PageContext);
    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Contact2Icon className="text-fuchsia-600" />
                <h2 className="text-lg font-semibold text-fuchsia-700">
                    Contacts
                </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-xl shadow-sm">
                <table className="w-full border-collapse">
                    {/* THEAD */}
                    <thead className="bg-fuchsia-600 text-white text-sm">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> Created At
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <User2 size={16} /> Name
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <ChartNoAxesColumn size={16} /> Type
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <ChartSpline size={16} /> Stage
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} /> Status
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <ChartNoAxesColumn size={16} /> Category
                                </div>
                            </th>
                        </tr>
                    </thead>

                    {/* TBODY */}
                    <tbody className="text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="text-center py-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : contacts?.length > 0 ? (
                            contacts.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-t hover:bg-gray-50 transition cursor-pointer"
                                >
                                    {/* Created At */}
                                    <td
                                        onClick={() =>
                                            handleDateClick({ email: row?.email_address, navigate: "/" })
                                        }
                                        className="px-4 py-3 text-gray-700"
                                    >
                                        {row.date_entered}
                                    </td>

                                    {/* Email */}
                                    <td
                                        onClick={() =>
                                            handleDateClick({ email: row?.email_address, navigate: "/contacts" })
                                        }
                                        className="px-4 py-3 text-gray-700 font-medium"
                                    >
                                        {row?.first_name || ""} {row?.last_name || ""}
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                            {row?.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            {row?.stage}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                                            {row?.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {row?.customer_type || ""}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-6 text-gray-500">
                                    No Contacts Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
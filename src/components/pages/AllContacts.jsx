import { useContext, useEffect, useState } from "react";
import {
    Calendar,
    User2,
    Contact2Icon,
    ChartNoAxesColumn,
    TrendingUp,
    ChartSpline,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { PageContext } from "../../context/pageContext";
import { addContact, contactAction } from "../../store/Slices/contacts";
import UpdatePopup from "../UpdatePopup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


export default function AllContacts() {
    const { contacts, loading, adding, message, error } = useSelector((state) => state.contacts);
    const { handleDateClick } = useContext(PageContext);
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        if (message) {
            toast.success(message)
            setOpen(false)
            dispatch(contactAction.clearAllMessage())
            navigate("/")


        }
        if (error) {
            toast.error(error)
            setOpen(false)
            dispatch(contactAction.clearAllErrors)
        }
    }, [message, error])
    return (
        <>
            {open && <UpdatePopup
                open={open}
                loading={adding}
                onClose={() => setOpen(false)}
                title="Create Contact"
                fields={[
                    {
                        label: "Name",
                        name: "name",
                        type: "text",
                        value: "",
                        required: true,
                    },
                    {
                        label: "Email",
                        name: "email",
                        type: "text",
                        value: "",
                        required: true
                    },
                    {
                        label: "Source",
                        name: "source",
                        type: "text",
                        value: "Direct Email",
                    },
                ]}
                onUpdate={(contact) => dispatch(addContact(contact))}
                buttonLabel="Create"
            />}

            <div className="p-4">
                {/* Header */}
                <div className="flex items-center  justify-between gap-2 mb-4">
                    <div className="flex items-center  justify-between gap-2 ">
                        <Contact2Icon className="text-fuchsia-600" />
                        <h2 className="text-lg font-semibold text-fuchsia-700">
                            Contacts
                        </h2>
                    </div>

                    <div>
                        <button
                            className="cursor-pointer"
                            onClick={() => setOpen(true)}
                        >
                            <img
                                width="36"
                                height="36"
                                src="https://img.icons8.com/arcade/64/plus.png"
                                alt="plus"
                            />
                        </button>
                    </div>
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
                            {loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        Loading more...
                                    </td>
                                </tr>
                            )}
                            {/* Show existing data ALWAYS if available */}
                            {contacts?.length > 0 &&
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

                                        {/* Name */}
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

                                        {/* Stage */}
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                {row?.stage}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                                                {row?.status}
                                            </span>
                                        </td>

                                        {/* Customer Type */}
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {row?.customer_type || ""}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                            {/* Show loader row WITHOUT hiding data */}


                            {/* Show empty state ONLY when no data AND not loading */}
                            {!loading && contacts?.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-500">
                                        No Contacts Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>

    );
}
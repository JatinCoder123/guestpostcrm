import React, { useContext, useEffect } from "react";
import {
    Calendar,
    User2,
    Contact2Icon,
    ChartNoAxesColumn,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PageContext } from "../../context/pageContext";
import { ladgerAction } from "../../store/Slices/ladger";
import { getAllContacts } from "../../store/Slices/contacts";

export default function AllContacts() {
    const { contacts, loading } = useSelector((state) => state.contacts);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { setWelcomeHeaderContent, setSearch, setEnteredEmail } =
        useContext(PageContext);



    const handleOnClick = (email, path) => {
        localStorage.setItem("email", email);
        setSearch(email);
        setEnteredEmail(email);
        dispatch(ladgerAction.setTimeline(null));
        setWelcomeHeaderContent("Offers");
        navigate(path);
    };

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
                                    <User2 size={16} /> Contact
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <ChartNoAxesColumn size={16} /> Type
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
                                            handleOnClick(row?.email_address, "/")
                                        }
                                        className="px-4 py-3 text-gray-700"
                                    >
                                        {row.date_entered}
                                    </td>

                                    {/* Email */}
                                    <td
                                        onClick={() =>
                                            handleOnClick(row?.email_address, "/contacts/id")
                                        }
                                        className="px-4 py-3 text-gray-700 font-medium"
                                    >
                                        {row.email_address}
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                            {row?.type}
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
import {
    Calendar,
    User2,
    Globe,
    BadgeDollarSign,
    ChartNoAxesColumn,
    ContactRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import UpdatePopup from "../UpdatePopup";

import {
    ShieldCheckIcon,
    UserCheck,
    UserX,
    BadgeCheck,
    FileText,
    ShoppingCart,
    AlertTriangle
} from "lucide-react";
import { addContact, contactAction, getAllContacts } from "../../store/Slices/contacts.js";
import { toast } from "react-toastify";

const STATUS_CONFIG = [
    {
        value: "new",
        label: "New",
        icon: ShieldCheckIcon,
        color: "#3B82F6", // blue
        showAmount: true,
    },
    {
        value: "unverified",
        label: "Unverified",
        icon: UserX,
        color: "#F59E0B", // amber
        showAmount: true,
    },
    {
        value: "verified",
        label: "Verified",
        icon: UserCheck,
        color: "#10B981", // green
        showAmount: true,
    },
    {
        value: "deal",
        label: "Deal",
        icon: FileText,
        color: "#6366F1", // indigo
        showAmount: true,
    },
    {
        value: "offer",
        label: "Offer",
        icon: BadgeCheck,
        color: "#8B5CF6", // violet
        showAmount: true,
    },
    {
        value: "order",
        label: "Order",
        icon: ShoppingCart,
        color: "#22C55E", // green
        showAmount: true,
    },
    {
        value: "defaulter",
        label: "Defaulter",
        icon: AlertTriangle,
        color: "#EF4444", // red
        showAmount: true,
    }
];
export default function AllContacts() {
    const { count, contacts, loading, pageIndex, summary, adding, message, error } =
        useSelector((state) => state.contacts);
    const [open, setOpen] = useState(false)

    const { handleDateClick } =
        useContext(PageContext);
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        if (message) {
            toast.success(message)
            setOpen(false)
            dispatch(contactAction.clearAllMessage())
            navigateTo("/")


        }
        if (error) {
            toast.error(error)
            setOpen(false)
            dispatch(contactAction.clearAllErrors)
        }
    }, [message, error])
    const columns = [
        {
            label: "Created At",
            accessor: "date_entered",
            headerClasses: "",
            icon: Calendar,

            onClick: (row) => handleDateClick({ email: row?.email_address ?? `${row?.first_name} ${row?.last_name} `, navigate: "/" }),
            classes: "truncate max-w-[200px]",
            render: (row) => (
                <span className="font-medium text-gray-700 cursor-pointer">
                    {row.date_entered}
                </span>
            ),
        },
        {
            label: "Name",
            accessor: "first_name",
            headerClasses: "",
            icon: User2,
            classes: "truncate max-w-[200px]",
            onClick: (row) =>
                handleDateClick({ email: row?.email_address, navigate: "/contacts" }),

            render: (row) => (
                <span className="font-medium text-gray-700 cursor-pointer">
                    {row?.first_name || ""} {row?.last_name || ""}                </span>
            ),
        },
        {
            label: "Type",
            accessor: "type",
            headerClasses: "",
            icon: Globe,
            classes: "truncate ",
            render: (row) => (
                <span className="font-medium text-blue-700 ">   {row?.type}</span>
            ),
        },
        {
            label: "Stage",
            accessor: "stage",
            headerClasses: "",
            icon: BadgeDollarSign,
            classes: "truncate max-w-[300px]",

            render: (row) => (
                <span className="font-medium text-green-700 ">{row?.stage}</span>
            ),
        },

        {
            label: "Status",
            accessor: "status",
            headerClasses: "",
            icon: ChartNoAxesColumn,
            classes: "truncate max-w-[300px]",

            render: (row) => (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {row?.status}
                </span>
            ),
        },
        {
            label: "Customer Type",
            accessor: "customer_type",
            headerClasses: "",
            icon: Calendar,
            classes: "truncate max-w-[300px]",

            render: (row) => (
                <span className="font-medium text-green-700 "> {row?.customer_type || ""}</span>
            ),
        },

    ];
    const statusList = STATUS_CONFIG.map((config) => {
        return {
            ...config,
            count: Number(summary?.[`${config.value}`]?.count || 0),
            field: summary?.[`${config.value}`]?.field
        };
    });
    const statusCount = Object.values(summary).reduce((acc, curr) => acc + curr?.count, 0)
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
            <TableView
                tableData={contacts}
                tableName={"Contacts"}
                columns={columns}
                slice={"contacts"}
                statusKey={"stage"}
                statusList={statusList}
                statusCount={statusCount}
                fetchNextPage={() => dispatch(
                    getAllContacts({ page: pageIndex + 1 }))}
            >{
                    <div className="absolute -top-1 right-10">
                        <button
                            className="cursor-pointer"
                            onClick={() => setOpen(true)}
                        >
                            <img
                                width="30"
                                height="30"
                                src="https://img.icons8.com/arcade/64/plus.png"
                                alt="plus"
                            />
                        </button>
                    </div>
                }
                <TableTitleBar
                    Icon={ContactRound}
                    title={"Contacts"}
                    titleClass={"text-fuchsia-600"}
                />
                <Table
                    headerStyle={"  bg-fuchsia-600"}
                    layoutStyle={"grid grid-cols-[1fr_1fr_1fr_200px_200px_1fr]"}
                />
            </TableView>
        </>

    );
}

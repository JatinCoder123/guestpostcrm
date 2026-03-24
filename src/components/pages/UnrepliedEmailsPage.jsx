
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { getInvoices } from "../../store/Slices/invoices.js";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { excludeName, extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import UpdatePopup from "../UpdatePopup.jsx";
import { getUnrepliedEmail } from "../../store/Slices/unrepliedEmails.js";
import {
  Calendar,
  FileText,
  Link2,
  Mail,
  User,
  BarChart4,
  BarChart3,
  User2,
  Gift,
  Pen,
  Globe,
  BadgeDollarSign,
  Clapperboard,
  Package,
  CheckCircle,
  XCircle,
  PauseCircle,
  BadgeCheck,
  Store,
  ListFilter,
  X,
  ChartBar,
  Handshake,
  ShoppingCart,
  MessageCircleReply,
  Mails,
} from "lucide-react";
import { GiGoldBar } from "react-icons/gi";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { FaBtc } from "react-icons/fa";
import { IoIosMailUnread } from "react-icons/io";
const STATUS_CONFIG = [
  {
    value: "unreplied",
    label: "Unreplied",
    icon: Mails,
    color: "#2563eb", // blue
  },
  {
    value: "replied",
    label: "Replied",
    icon: MessageCircleReply,
    color: "#16a34a", // green
  },
  {
    value: "unread",
    label: "Unread",
    icon: IoIosMailUnread,
    color: "#dc2626", // red
  },
  {
    value: "offer",
    label: "Offer",
    icon: Gift,
    color: "#1a931c", // red
  },
  {
    value: "deal",
    label: "Deal",
    icon: Handshake,
    color: "#ca8a04", // yellow
  },
  {
    value: "order",
    label: "Order",
    icon: ShoppingCart,
    color: "#7c3aed", // purple
  },
  {
    value: "brand",
    label: "Brand",
    icon: FaBtc,
    color: "#ed3ab7", // purple
  },
  {
    value: "verified",
    label: "Verified",
    icon: BadgeCheck,
    color: "#56cd1f", // purple
  },
  {
    value: "premium",
    label: "Premium",
    icon: MdOutlineWorkspacePremium,
    color: "#56cd1f", // purple
  },
  {
    value: "gold",
    label: "Gold",
    icon: GiGoldBar,
    color: "#ab9e11", // purple
  },
];
export function UnrepliedEmailsPage() {
  const { count, emails, loading, pageIndex } = useSelector(
    (state) => state.unreplied,
  );
  const { handleMove } = useThreadContext();
  const {
    setWelcomeHeaderContent,
    setSearch,
    setEnteredEmail,
    setCurrentIndex,
  } = useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handleOnClick = (email, navigate, index) => {
    localStorage.setItem("email", email);
    setSearch(email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Unreplied");
    console.log(index);
    setCurrentIndex(index);
    navigateTo(navigate);
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row, index) =>
        handleOnClick(extractEmail(row?.from), "/", index),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },

    {
      label: "Contact",
      accessor: "email_c",
      headerClasses: "",
      icon: User,
      classes: "truncate ",
      onClick: (row, index) =>
        handleOnClick(extractEmail(row?.from), "/contacts", index),

      render: (row) => (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-medium text-gray-800">
            {excludeName(row?.from)}
          </span>

          {row.contact_type === "Brand" && (
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
              Market Place
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Subject",
      accessor: "subject",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      onClick: (row) =>
        handleMove({
          email: extractEmail(row.from),
          threadId: row.thread_id,
        }),
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.subject}
        </span>
      ),
    },
    {
      label: "Stage",
      accessor: "stage",
      headerClasses: "",
      icon: BarChart4,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <div className="flex items-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm border flex items-center `}
          >
            {row.stage}
          </span>
        </div>
      ),
    },
    {
      label: "Count",
      accessor: "thread_count",
      headerClasses: "",
      icon: ChartBar,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.thread_count}
        </span>
      ),
    },
  ];

  return (
    <>
      <TableView
        tableData={emails}
        tableName={"Unreplied"}
        columns={columns}
        slice={"unreplied"}
        statusList={STATUS_CONFIG}
        fetchNextPage={() =>
          dispatch(getUnrepliedEmail({ page: 1 }))
        }
      >
        <TableTitleBar
          Icon={Mail}
          title={"Unreplied Emails"}
          titleClass={"text-rose-700"}
        />
        <Table
          headerStyle={"bg-rose-600"}
          body
          layoutStyle={"grid grid-cols-[200px_1fr_1fr_200px_200px]"}
          rowClassName={(row) =>
            row.contact_type === "Brand"
              ? "bg-orange-50 hover:bg-orange-100"
              : ""
          }
        />
      </TableView>
    </>
  );
}

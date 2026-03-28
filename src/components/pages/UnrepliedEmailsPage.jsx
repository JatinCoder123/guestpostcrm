
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { PageContext } from "../../context/pageContext";
import { excludeName, extractEmail } from "../../assets/assets";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { getUnrepliedEmail } from "../../store/Slices/unrepliedEmails.js";
import {
  Calendar,
  FileText,
  Mail,
  User,
  BarChart4,
  Gift,
  BadgeCheck,
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
    value: "unread",
    label: "Unread",
    icon: IoIosMailUnread,
    color: "#dc2626", // red
    emailType: "email_unread"

  },
  {
    value: "unreplied",
    label: "Unreplied",
    icon: Mails,
    color: "#2563eb", // blue
    emailType: "email_inbound"
  },
  {
    value: "replied",
    label: "Replied",
    icon: MessageCircleReply,
    color: "#16a34a", // green
    emailType: "email_outbound"


  },

  {
    value: "offer",
    label: "Offer",
    icon: Gift,
    color: "#1a931c", // red
    emailType: "email_offer"

  },
  {
    value: "deal",
    label: "Deal",
    icon: Handshake,
    color: "#ca8a04", // yellow
    emailType: "email_deal"

  },
  {
    value: "order",
    label: "Order",
    icon: ShoppingCart,
    color: "#7c3aed", // purple
    emailType: "email_order"

  },
  {
    value: "brand",
    label: "Brand",
    icon: FaBtc,
    color: "#ed3ab7", // purple
    emailType: "email_brand"

  },
  {
    value: "verified",
    label: "Verified",
    icon: BadgeCheck,
    color: "#56cd1f", // purple
    emailType: "email_verified"

  },
  {
    value: "premium",
    label: "Premium",
    icon: MdOutlineWorkspacePremium,
    color: "#56cd1f", // purple
    emailType: "email_premium"

  },
  {
    value: "gold",
    label: "Gold",
    icon: GiGoldBar,
    color: "#ab9e11", // purple
    emailType: "email_gold"

  },
];
export function UnrepliedEmailsPage() {
  const { count, emails, loading, pageIndex, emailsCount, emailType } = useSelector(
    (state) => state.unreplied,
  );
  const { handleMove } = useThreadContext();
  const {
    setCurrentIndex,
    handleDateClick
  } = useContext(PageContext);
  const dispatch = useDispatch();
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row, index) =>
        handleDateClick({ email: extractEmail(row?.from), navigate: "/", index, nextPrev: true }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },

    {
      label: "Contact",
      accessor: "from",
      headerClasses: "",
      icon: User,
      classes: "truncate ",
      onClick: (row, index) =>
        handleDateClick({ email: extractEmail(row?.from), navigate: "/contacts", index, nextPrev: true }),

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
  const status_list = STATUS_CONFIG.map((s) => ({
    ...s,
    handleStatusClick: () => { setCurrentIndex(0), dispatch(getUnrepliedEmail({ type: s.emailType })) },
    checkActive: () => emailType === s.emailType,
    count: emailsCount[s.emailType.split('_')[1]] ? emailsCount[s.emailType.split('_')[1]] : 0
  }))
  const statusCount = Object.values(emailsCount).reduce((acc, curr) => acc + curr, 0)

  return (
    <>
      <TableView
        tableData={emails}
        tableName={"Unreplied"}
        columns={columns}
        slice={"unreplied"}
        statusList={status_list}
        statusCount={statusCount}
        fetchNextPage={() =>
          dispatch(getUnrepliedEmail({ page: pageIndex + 1 }))
        }
      >
        <TableTitleBar
          Icon={Mail}
          title={"Unreplied Emails"}
          titleClass={"text-rose-700"}
        />

        {/* 🔥 TABLE WRAPPER */}
        <div className="relative">

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

          {/* 🔥 LOADING OVERLAY */}
          {loading && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3">

                {/* Spinner */}
                <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>

                {/* Dynamic Text */}
                <p className="text-gray-700 font-medium">
                  {
                    STATUS_CONFIG.find(s => s.emailType === emailType)?.label || "Emails"
                  } Emails Loading...
                </p>

              </div>
            </div>
          )}

        </div>
      </TableView>
    </>
  );
}

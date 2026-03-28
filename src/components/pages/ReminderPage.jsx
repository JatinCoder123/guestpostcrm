import {
  Calendar,
  User2,
  Gift,
  Pen,
  Globe,
  BadgeDollarSign,
  ChartNoAxesColumn,
  Clapperboard,
  Trash,
  ShieldCheckIcon,
  HandCoins,
  ShieldAlert,
  Handshake,
  Bell,
  BellIcon,
  Send,
  ClipboardCheck,
  StopCircle,
  Ban,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import { deleteDeal, getDeals } from "../../store/Slices/deals.js"
import { PageContext } from "../../context/pageContext.jsx";
import { useNavigate } from "react-router-dom";
import { excludeName, extractEmail } from "../../assets/assets.js";
import { ladgerAction } from "../../store/Slices/ladger.js";
import { useThreadContext } from "../../hooks/useThreadContext.js";
import TableView, { Table } from "../ui/table/Table.jsx";
import TableTitleBar from "../ui/table/TableTitleBar.jsx";
import { LoadingChase } from "../Loading.jsx"
import { getOrderRem, orderRemAction, sendReminder } from "../../store/Slices/reminder.js";
import { toast } from "react-toastify";
const STATUS_CONFIG = [
  {
    value: "sent",
    label: "Sent",
    icon: Send,
    color: "#056439ff", // orange (amber-500)
    showAmount: true
  },
  {
    value: "pending",
    label: "Pending",
    icon: StopCircle,
    color: "#d8ef44ff", // red (red-500)
  },
  {
    value: "cancel",
    label: "Cancelled",
    icon: Ban,
    color: "#EF4444", // red (red-500)
  }
];
export function ReminderPage() {
  const { count, reminders, loading, pageIndex, summary, sending, sendReminderId, message, error } = useSelector(
    (state) => state.reminders
  );

  const { handleDateClick } =
    useContext(PageContext);
  const dispatch = useDispatch();

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleDateClick({ email: extractEmail(row?.real_name), navigate: "/" }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      )
    },
    {
      label: "Contact",
      accessor: "real_name",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[200px]",
      onClick: (row) => handleDateClick({ email: extractEmail(row?.real_name), navigate: "/contacts" }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {excludeName(row?.real_name)}
        </span>
      )
    },
    {
      label: "Type",
      accessor: "type",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      render: (row) => (
        <span className="font-medium text-lime-700 ">
          {row.reminder_type_label ||
            row.reminder_type ||
            "N/A"}        </span>
      )
    },
    {
      label: "SCHEDULED TIME",
      accessor: "scheduled_time",
      headerClasses: "",
      icon: Calendar,

      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-green-700 cursor-pointer">
          {row.scheduled_time || "N/A"}        </span>
      )
    },
    {
      label: "STATUS",
      accessor: "status",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${row.status.toLowerCase() === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : row.status.toLowerCase() === "sent"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {row.status}
        </span>
      )
    },

    {
      label: "Action",
      accessor: "action",
      headerClasses: "ml-auto",
      icon: Clapperboard,
      classes: "truncate max-w-[300px] ml-auto",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {sending && sendReminderId === row.id ? (
            <LoadingChase size="20" color="blue" />
          ) : (
            <button
              className={`px-3 py-1  text-white rounded-lg hover:scale-110 transition-colors text-sm 
                            ${row.status === "Sent" ||
                  row.status === "cancel"
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
                }
                          `}
              onClick={() => {
                dispatch(sendReminder(row.id))
              }}
              disabled={
                row.status === "Sent" || row.status === "cancel"
              }
            >
              <img
                width="34"
                height="34"
                src="https://img.icons8.com/arcade/64/send.png"
                alt="send"
              />
            </button>
          )}
        </div>
      )
    },


  ]
  const statusList = STATUS_CONFIG.map(config => {

    return {
      ...config,
      count: Number(summary?.[`${config.value}_deals`] || 0),
    };

  });
  useEffect(() => {
    if (message) {
      toast.success(message)
      dispatch(orderRemAction.clearAllMessage())
      dispatch(getOrderRem());

    }
    if (error) {
      toast.error(error)
      dispatch(orderRemAction.clearAllErrors())
    }
  }, [message, error]);
  return (
    <TableView tableData={reminders} tableName={"Reminders"} columns={columns} slice={"reminders"} statusKey={"status"} statusList={statusList} fetchNextPage={() => dispatch(getOrderRem({ page: pageIndex + 1 }))}   >
      <TableTitleBar Icon={BellIcon} title={"Reminders"} titleClass={"text-lime-700"} />
      <Table headerStyle={"  bg-lime-600"} layoutStyle={"grid grid-cols-[200px_200px_200px_300px_200px_1fr]"} />
    </TableView>
  );
}
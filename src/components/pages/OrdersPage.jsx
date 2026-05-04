import {
  Calendar,
  User2,
  Pen,
  Clapperboard,
  Package,
  CheckCircle,
  XCircle,
  PauseCircle,
  BadgeCheck,
  StoreIcon,
  ListFilter,
  X,
  ShoppingCart,
  DollarSign,
  BarChart,
  BarChart3,
  IdCardIcon,
  Eye,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import {
  getOrders,
  orderAction,
  updateOrder,
} from "../../store/Slices/orders.js";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingAll } from "../Loading.jsx";
const STATUS_CONFIG = [
  {
    value: "new",
    label: "New",
    icon: Package,
    color: "#2563eb", // blue
  },
  {
    value: "accepted",
    label: "Accepted",
    icon: CheckCircle,
    color: "#16a34a", // green
  },
  {
    value: "rejected_nontechnical",
    label: "Rejected",
    icon: XCircle,
    color: "#dc2626", // red
  },
  {
    value: "wrong",
    label: "Wrong",
    icon: X,
    color: "#662744ff", // red
  },
  {
    value: "pending",
    label: "Pending",
    icon: PauseCircle,
    color: "#ca8a04", // yellow
  },
  {
    value: "completed",
    label: "Completed",
    icon: BadgeCheck,
    color: "#7c3aed", // purple
  },
  {
    value: "marketplace",
    label: "Marketplace",
    icon: StoreIcon,
    color: "#ed3ab7", // purple
  },
  {
    value: "listacle",
    label: "Listacle",
    icon: ListFilter,
    color: "#56cd1f", // purple
  },
];
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";

export function OrdersPage() {
  const { count, orders, loading, pageIndex, stats, updating, message, error } =
    useSelector((state) => state.orders);
  const [updateOrderId, setUpdateOrderId] = useState(null);

  const { handleDateClick, enteredEmail } = useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) =>
        handleDateClick({ email: extractEmail(row?.real_name), navigate: "/" }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },
    {
      label: "Contact",
      accessor: "real_name",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[200px]",
      onClick: (row) =>
        handleDateClick({
          email: extractEmail(row?.real_name),
          navigate: "/contacts",
        }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.real_name?.split("<")[0]?.trim()}
        </span>
      ),
    },
    {
      label: "Amount",
      accessor: "website",
      headerClasses: "",
      icon: DollarSign,
      classes: "truncate  max-w-[100px]",
      render: (row) => (
        <span className="font-medium text-blue-700 ">
          ${row.total_amount_c || "0.00"}{" "}
        </span>
      ),
    },
    {
      label: "Status",
      accessor: "order_status",
      headerClasses: "",
      icon: BarChart,
      classes: "truncate max-w-[200px]",

      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700`}
        >
          {row.order_status || "Unknown"}
        </span>
      ),
    },
    {
      label: "Type",
      accessor: "order_type",
      headerClasses: "",
      icon: BarChart3,
      classes: "truncate max-w-[200px]",

      render: (row) => (
        <span className="font-medium text-gray-700 ">{row?.order_type}</span>
      ),
    },
    {
      label: "Modified At",
      accessor: "date_modified",
      headerClasses: "",
      icon: Calendar,
      classes: "truncate max-w-[200px]",

      render: (row) => (
        <span className="px-3 py-1  rounded-full ">{row?.date_modified}</span>
      ),
    },
    {
      label: "Order Id",
      accessor: "order_id",
      headerClasses: "",
      icon: IdCardIcon,
      classes: "truncate max-w-[200px]",

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.order_id}
        </span>
      ),
    },
    {
      label: "Action",
      accessor: "action",
      headerClasses: "ml-auto",
      icon: Clapperboard,
      classes: "truncate max-w-[200px] ml-auto",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              navigateTo(`/orders/edit`, {
                state: {
                  email: extractEmail(row.real_name),
                  threadId: row?.thread_id,
                  id: row?.id,
                },
              })
            }
            className="p-2 hover:bg-blue-100  rounded-full transition-colors cursor-pointer"
            title="Update"
          >
            <Pen className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() =>
              navigateTo(`/orders/view`, {
                state: {
                  email: extractEmail(row.real_name),
                  threadId: row?.thread_id,
                  id: row?.id,
                },
              })
            }
            className="p-2 hover:bg-blue-100  rounded-full transition-colors cursor-pointer"
            title="Update"
          >
            <Eye className="w-5 h-5 text-blue-600" />
          </button>
          {row.order_type == "MARKETPLACE" &&
            row.order_status !== "completed" && (
              <button
                onClick={() => {
                  dispatch(
                    updateOrder({
                      order: { ...row, order_status: "completed" },
                    }),
                  );
                  setUpdateOrderId(row.order_id);
                }}
                disabled={updating}
                className="p-1 hover:bg-green-500 rounded-full transition-colors cursor-pointer"
                title="Complete"
              >
                {updating && updateOrderId == row.order_id ? (
                  <LoadingAll />
                ) : (
                  <IoCheckmarkDoneCircleOutline className="w-8 h-8 text-green-600 hover:text-white   " />
                )}
              </button>
            )}
        </div>
      ),
    },
  ];
  const statusList = STATUS_CONFIG.map((config) => {
    const status = stats.find((s) => s.status == config.value);
    return {
      ...config,
      count: status?.status_count || 0,
      amount: status?.total_amount || 0,
      showAmount: true,
    };
  });
  useEffect(() => {
    if (message) {
      toast.success(message);
      setUpdateOrderId(null);
      dispatch(orderAction.clearAllMessages());
      dispatch(getOrders({ email: enteredEmail }));
    }
    if (error) {
      setUpdateOrderId(null);
      toast.error(error);
      dispatch(orderAction.clearAllErrors());
    }
  }, [message, error]);

  return (
    <TableView
      tableData={orders}
      tableName={"Orders"}
      columns={columns}
      slice={"orders"}
      defaultStatus={"new"}
      statusKey={"order_status"}
      statusList={statusList}
      fetchNextPage={() => dispatch(getOrders({ page: pageIndex + 1 }))}
    >
      <TableTitleBar
        Icon={ShoppingCart}
        title={"Orders"}
        titleClass={"text-cyan-700"}
      />
      <Table
        headerStyle={"  bg-cyan-600"}
        layoutStyle={
          "grid grid-cols-[200px_200px_100px_200px_200px_200px_200px_1fr]"
        }
      />
    </TableView>
  );
}

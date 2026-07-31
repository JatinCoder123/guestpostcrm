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
import { orderAction, updateOrder } from "../../store/Slices/orders.js";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingAll } from "../Loading.jsx";
const STATUS_CONFIG = [
  {
    value: "new",
    label: "New",
    icon: Package,
    color: "#2563eb", // blue
    filter: 'order_status',
    showAmount: true
  },
  {
    value: "accepted",
    label: "Accepted",
    icon: CheckCircle,
    color: "#16a34a", // green
    filter: 'order_status',
    showAmount: true

  },
  {
    value: "rejected_nontechnical",
    label: "Rejected",
    icon: XCircle,
    color: "#dc2626", // red
    filter: 'order_status',
    showAmount: true

  },
  {
    value: "wrong",
    label: "Wrong",
    icon: X,
    color: "#662744", // red
    filter: 'order_status',
    showAmount: true

  },
  {
    value: "pending",
    label: "Pending",
    icon: PauseCircle,
    color: "#ca8a04", // yellow
    filter: 'order_status',
    showAmount: true

  },
  {
    value: "completed",
    label: "Completed",
    icon: BadgeCheck,
    color: "#7c3aed", // purple
    filter: 'order_status',
    showAmount: true

  },
  {
    value: "Marketplace",
    label: "Marketplace",
    icon: StoreIcon,
    color: "#ed3ab7", // purple
    filter: 'order_type',
    showAmount: true

  },
  {
    value: "listacle",
    label: "Listacle",
    icon: ListFilter,
    color: "#56cd1f", // purple
    filter: 'order_type',
    showAmount: true


  },
];
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { orderKeys, useInfiniteOrders, useOrderStats } from "../../queries/orders.queries.js";
import { useTablePreference } from "../../hooks/useTablePreference.js";
import { queryClient } from "../../lib/queryClient.js";

export function OrdersPage() {
  const preferences = useTablePreference("orders");
  const { updating, message, error } = useSelector(state => state.orders);
  const { enteredEmail: email } = useContext(PageContext)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteOrders({ preferences, email });
  if (!isPending) {
    console.log("ORDERS", data)

  }
  const {
    data: summary,
    isPending: summaryLoading,
  } = useOrderStats({ email });
  const [updateOrderId, setUpdateOrderId] = useState(null);

  const { handleDateClick, enteredEmail } = useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const columns = [

    {
      label: "Action",
      accessor: "action",
      icon: Clapperboard,

      width: 220,
      minWidth: 180,
      maxWidth: 300,

      sticky: true,
      sortable: false,
      searchable: false,
      resizable: true,

      headerClasses: "justify-center",
      classes: " ",

      render: (row) => (
        <div className="flex  gap-2">
          <button
            onClick={() =>
              navigateTo(
                `/orders/edit?email=${row.client_email}&id=${row.id}`
              )
            }
            className="rounded-full p-2 transition hover:bg-blue-100"
          >
            <Pen className="h-5 w-5 text-blue-600" />
          </button>

          <button
            onClick={() =>
              navigateTo(
                `/orders/view?email=${row.client_email}&id=${row.id}`
              )
            }
            className="rounded-full p-2 transition hover:bg-blue-100"
          >
            <Eye className="h-5 w-5 text-blue-600" />
          </button>

          {row.order_type?.toLowerCase() === "marketplace" &&
            row.order_status !== "completed" && (
              <button
                disabled={updating}
                onClick={() => {
                  dispatch(
                    updateOrder({
                      order: {
                        ...row,
                        order_status: "completed",
                      },
                    })
                  );

                  setUpdateOrderId(row.order_id);
                }}
                className="rounded-full p-1 transition hover:bg-green-500"
              >
                {updating &&
                  updateOrderId === row.order_id ? (
                  <LoadingAll />
                ) : (
                  <IoCheckmarkDoneCircleOutline className="h-8 w-8 text-green-600 hover:text-white" />
                )}
              </button>
            )}
        </div>
      ),
    },
    {
      label: "Created At",
      accessor: "date_entered",
      icon: Calendar,

      width: 180,
      minWidth: 150,
      maxWidth: 300,

      sticky: true,
      sortable: true,
      searchable: false,
      resizable: true,

      headerClasses: "",
      classes: "truncate",

      onClick: (row) =>
        handleDateClick({
          email: row?.client_email,
          navigate: "/",
        }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered_time_ago}
        </span>
      ),
    },
    {
      label: "Contact",
      accessor: "client_email",
      icon: User2,

      width: 260,
      minWidth: 100,
      maxWidth: 450,

      sticky: true,
      sortable: true,
      searchable: true,
      resizable: true,

      headerClasses: "",
      classes: "truncate",

      onClick: (row) =>
        handleDateClick({
          email: row?.client_email,
          navigate: "/contacts",
        }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer truncate">
          {row?.name}
        </span>
      ),
    },

    {
      label: "Amount",
      accessor: "total_amount_c",
      icon: DollarSign,

      width: 140,
      minWidth: 120,
      maxWidth: 220,

      sticky: false,
      sortable: true,
      searchable: true,
      resizable: true,

      headerClasses: "",
      classes: "",

      render: (row) => (
        <span className="font-medium text-blue-700">
          ${row.total_amount_c || "0.00"}
        </span>
      ),
    },

    {
      label: "Status",
      accessor: "order_status",
      icon: BarChart,

      width: 180,
      minWidth: 150,
      maxWidth: 260,

      sticky: false,
      sortable: true,
      searchable: true,
      resizable: true,

      headerClasses: "",
      classes: "",

      render: (row) => (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
          {row.order_status || "Unknown"}
        </span>
      ),
    },

    {
      label: "Type",
      accessor: "order_type",
      icon: BarChart3,

      width: 180,
      minWidth: 150,
      maxWidth: 260,

      sticky: false,
      sortable: true,
      searchable: true,
      resizable: true,

      headerClasses: "",
      classes: "",

      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.order_type}
        </span>
      ),
    },

    {
      label: "Modified At",
      accessor: "date_modified",
      icon: Calendar,

      width: 200,
      minWidth: 180,
      maxWidth: 320,

      sticky: false,
      sortable: true,
      searchable: false,
      resizable: true,

      headerClasses: "",
      classes: "",

      render: (row) => (
        <span>{row.date_modified}</span>
      ),
    },

    {
      label: "Order Id",
      accessor: "order_id",
      icon: IdCardIcon,

      width: 180,
      minWidth: 150,
      maxWidth: 300,

      sticky: false,
      sortable: true,
      searchable: true,
      resizable: true,

      headerClasses: "",
      classes: "",

      render: (row) => (
        <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
          {row.order_id}
        </span>
      ),
    },


  ];
  const filterColumns = [
    {
      label: "Type",
      accessor: "type",

      values: [
        {
          label: "Link Insertion",
          value: "link_insertion",
        },

        {
          label: "Guest Post",
          value: "guest_post",
        },
        {
          label: "MarketPlace",
          value: "marketplace",
        },
      ],
    },

  ];
  const orders =
    data?.pages?.flatMap(
      (page) => page.records || page.data || []
    ) ?? [];
  const pages = data?.pages ?? [];

  const lastPage = pages[pages.length - 1] ?? {};
  const firstPage = pages[0] ?? {};

  const pageIndex = lastPage.page ?? 1;
  const pageCount = firstPage.total_pages ?? 0;
  const count = firstPage.total ?? 0;

  const loading = isPending || isFetchingNextPage;
  const statusList = STATUS_CONFIG.map((config) => {
    return {
      ...config,
      count: Number(summary?.stats?.[`${config.value}`]?.count || 0),
      amount: Number(summary?.stats?.[`${config.value}`]?.sum_of?.total_amount_c || 0)
    };
  });
  const statusCount = Object.values(summary?.stats ?? {}).reduce((acc, curr) => acc + curr?.count, 0)
  useEffect(() => {
    if (message) {
      toast.success(message);
      setUpdateOrderId(null);
      dispatch(orderAction.clearAllMessages());
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
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
      pageIndex={pageIndex}
      statusCount={statusCount}
      pageCount={pageCount}
      count={count}
      loading={loading}
      preferences={preferences}
      filterColumns={filterColumns}
      refreshKey={["orders"]}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    // fetchNextPage={() => {
    //   if (
    //     hasNextPage &&
    //     !isFetchingNextPage
    //   ) {
    //     fetchNextPage();
    //   }
    // }}
    >
      <TableTitleBar
        Icon={ShoppingCart}
        title={"Orders"}
        titleClass={"text-cyan-700"}
      />
      <Table
        headerStyle={"  bg-cyan-600"}
        layoutStyle={
          "grid grid-cols-8"
        }
      />
    </TableView>
  );
}

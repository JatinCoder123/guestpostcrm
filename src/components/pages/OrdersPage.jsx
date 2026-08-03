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
      accessor: "action",
      label: "Action",
      type: "actions",

      width: 220,
      minWidth: 180,
      maxWidth: 300,

      sticky: true,
      resizable: true,

      sortable: false,
      searchable: false,
      editable: false,

      actions: [
        {
          type: "edit",
          icon: "edit",
          tooltip: "Edit Order",
        },
        {
          type: "view",
          icon: "view",
          tooltip: "View Order",
        },
        {
          type: "complete",
          icon: "check",
          tooltip: "Complete Order",

          visible(record) {
            return (
              record.order_type?.toLowerCase() === "marketplace" &&
              record.order_status !== "completed"
            );
          },
        },
      ],

      headerClasses: "justify-center",
      classes: "justify-center",
    },

    {
      accessor: "date_entered_time_ago",
      label: "Created At",

      type: "date",

      width: 180,
      minWidth: 150,
      maxWidth: 300,

      sticky: true,
      resizable: true,

      sortable: true,
      searchable: false,
      editable: false,

      format: "timeAgo",

      navigate: "/",
    },

    {
      accessor: "name",
      label: "Contact",

      type: "text",

      width: 260,
      minWidth: 180,
      maxWidth: 450,

      sticky: true,
      resizable: true,

      sortable: true,
      searchable: true,
      editable: true,

      classes: "truncate",

      secondaryField: "client_email",

      navigate: "/contacts",

      placeholder: "No Contact",
    },

    {
      accessor: "total_amount_c",
      label: "Amount",

      type: "currency",

      width: 140,
      minWidth: 120,
      maxWidth: 220,

      sortable: true,
      searchable: true,
      editable: true,
      resizable: true,

      format: "currency",

      editor: "number",

      props: {
        currency: "USD",
        precision: 2,
      },

      align: "right",
    },

    {
      accessor: "order_status",
      label: "Status",

      type: "select",

      width: 180,
      minWidth: 150,
      maxWidth: 260,

      sortable: true,
      searchable: true,
      editable: true,
      resizable: true,

      options: [
        {
          label: "New",
          value: "new",
          color: "blue",
        },
        {
          label: "Accepted",
          value: "accepted",
          color: "green",
        },
        {
          label: "Pending",
          value: "pending",
          color: "yellow",
        },
        {
          label: "Completed",
          value: "completed",
          color: "purple",
        },
        {
          label: "Rejected",
          value: "rejected_nontechnical",
          color: "red",
        },
        {
          label: "Wrong",
          value: "wrong",
          color: "gray",
        },
      ],
    },

    {
      accessor: "order_type",
      label: "Type",

      type: "select",

      width: 180,
      minWidth: 150,
      maxWidth: 260,

      sortable: true,
      searchable: true,
      editable: true,
      resizable: true,

      options: [
        {
          label: "Marketplace",
          value: "marketplace",
        },
        {
          label: "Guest Post",
          value: "guest_post",
        },
        {
          label: "Link Insertion",
          value: "link_insertion",
        },
      ],
    },

    {
      accessor: "order_id",
      label: "Order Id",

      type: "badge",

      width: 180,
      minWidth: 150,
      maxWidth: 300,

      sortable: true,
      searchable: true,
      editable: false,
      resizable: true,

      props: {
        color: "orange",
      },
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
    >
      <TableTitleBar
        Icon={ShoppingCart}
        title={"Orders"}
      />

    </TableView>
  );
}

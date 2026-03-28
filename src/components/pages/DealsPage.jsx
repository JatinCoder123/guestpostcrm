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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { deleteDeal, getDeals } from "../../store/Slices/deals.js";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingChase } from "../Loading.jsx";
const STATUS_CONFIG = [
  {
    value: "active",
    label: "Active",
    icon: ShieldCheckIcon,
    color: "#F59E0B", // orange (amber-500)
    showAmount: true,
  },
  {
    value: "expired",
    label: "Expired",
    icon: ShieldAlert,
    color: "#EF4444", // red (red-500)
  },
];
export function DealsPage() {
  const { count, deals, loading, pageIndex, deleting, deleteDealId, summary } =
    useSelector((state) => state.deals);
  const { setWelcomeHeaderContent, setEnteredEmail } =
    useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handleOnClick = (email, navigate) => {
    localStorage.setItem("email", email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Deals");
    navigateTo(navigate);
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleOnClick(extractEmail(row?.real_name), "/"),
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
        handleOnClick(extractEmail(row?.real_name), "/contacts"),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.real_name?.split("<")[0]?.trim()}
        </span>
      ),
    },
    {
      label: "Website",
      accessor: "website",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      render: (row) => (
        <span className="font-medium text-blue-700 ">{row?.website_c}</span>
      ),
    },
    {
      label: "Client Offer",
      accessor: "client_offer_c",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-green-700 ">{row?.dealamount}</span>
      ),
    },

    {
      label: "Stage",
      accessor: "offer_status",
      headerClasses: "",
      icon: ChartNoAxesColumn,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleOnClick(extractEmail(row?.from), "/"),

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.status}
        </span>
      ),
    },
    {
      label: "Expiry Date",
      accessor: "expiry_date",
      headerClasses: "",
      icon: Calendar,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-green-700 ">{row?.expiry_date}</span>
      ),
    },
    {
      label: "Action",
      accessor: "action",
      headerClasses: "ml-auto",
      icon: Clapperboard,
      classes: "truncate max-w-[300px] ml-auto",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {/* Update Button */}
          <button
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title="Update"
            onClick={() =>
              navigateTo(`/deals/edit/${row.id}`, {
                state: {
                  email: extractEmail(row.real_name),
                  threadId: row?.thread_id,
                },
              })
            }
          >
            <Pen className="w-5 h-5 text-blue-600" />
          </button>
          {/* Delete Button */}
          {deleting && deleteDealId === row.id ? (
            <LoadingChase size="20" color="red" />
          ) : (
            <button
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete"
              onClick={() =>
                dispatch(deleteDeal(extractEmail(row.real_name), row.id))
              }
            >
              <Trash className="w-5 h-5 text-red-600" />
            </button>
          )}
        </div>
      ),
    },
  ];
  const statusList = STATUS_CONFIG.map((config) => {
    return {
      ...config,
      count: Number(summary?.[`${config.value}_deals`] || 0),
      amount: config.showAmount && Number(summary?.[`active_deal_amount`] || 0),
    };
  });

  return (
    <TableView
      tableData={deals}
      tableName={"Deals"}
      columns={columns}
      slice={"deals"}
      statusKey={"status"}
      statusList={statusList}
      fetchNextPage={() => dispatch(getDeals({ page: pageIndex + 1 }))}
    >
      <TableTitleBar
        Icon={Handshake}
        title={"Deals"}
        titleClass={"text-blue-700"}
      />
      <Table
        headerStyle={"  bg-blue-600"}
        layoutStyle={"grid grid-cols-[200px_200px_1fr_200px_200px_1fr_1fr]"}
      />
    </TableView>
  );
}

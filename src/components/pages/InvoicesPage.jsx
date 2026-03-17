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
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { getInvoices } from "../../store/Slices/invoices.js"
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingChase } from "../Loading.jsx"
const STATUS_CONFIG = [
  {
    value: "active",
    label: "Sent",
    icon: ShieldCheckIcon,
    color: "#F59E0B", // orange (amber-500)
  },
  {
    value: "accepted",
    label: "Paid",
    icon: HandCoins,
    color: "#10B981", // green (emerald-500)
  },
  {
    value: "expired",
    label: "Draft",
    icon: ShieldAlert,
    color: "#EF4444", // red (red-500)
  }
];
export function InvoicesPage() {
  const { count, invoices, loading, pageIndex, summary } = useSelector(
    (state) => state.invoices
  );


  const { setWelcomeHeaderContent, setSearch, setEnteredEmail } =
    useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handleOnClick = (email, navigate) => {
    localStorage.setItem("email", email);
    setSearch(email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Invoices");
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
      )
    },
    {
      label: "Contact",
      accessor: "real_name",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[200px]",
      onClick: (row) => handleOnClick(extractEmail(row?.real_name), "/contacts"),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.real_name?.split("<")[0]?.trim()}
        </span>
      )
    },
    {
      label: "Website",
      accessor: "website",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      render: (row) => (
        <span className="font-medium text-blue-700 ">
          {row?.website}
        </span>
      )
    },
    {
      label: "Client Offer",
      accessor: "client_offer_c",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-green-700 ">
          {row?.client_offer_c}
        </span>
      )
    },
    {
      label: "Our OFfer",
      accessor: "our_offer_c",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-gray-700 ">
          {row?.our_offer_c}
        </span>
      )
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
          {row?.offer_status}
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
          {/* Update Button */}
          <button
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title="Update"
            onClick={() =>

              navigateTo(`/offers/edit/${row.id}`, {
                state: {
                  email: extractEmail(row.real_name),
                  threadId: row?.thread_id,
                },
              })
            }
          >
            <Pen className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      )
    },


  ]
  const statusList = STATUS_CONFIG.map(config => {

    return {
      ...config,
      count: Number(summary?.[`${config.value}_offers`] || 0),
    };

  });

  return (
    <TableView tableData={invoices} tableName={"Invoices"} columns={columns} slice={"invoices"} statusKey={"offer_status"} statusList={statusList} fetchNextPage={() => dispatch(getInvoices({ page: pageIndex + 1, loading: false }))}   >
      <TableTitleBar Icon={FileText} title={"Invoices"} titleClass={"text-orange-700"} />
      <Table headerStyle={"  bg-orange-600"} layoutStyle={"grid grid-cols-[200px_200px_1fr_200px_200px_200px_1fr]"} />
    </TableView>
  );
}
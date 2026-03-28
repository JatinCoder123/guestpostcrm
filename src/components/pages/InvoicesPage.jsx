import {
  Calendar,
  Pen,
  Globe,
  BadgeDollarSign,
  ChartNoAxesColumn,
  Clapperboard,
  FileText,
  Link2Icon,
  Wallet,
  Banknote,
  Flag,
  SendHorizonal,
  DollarSign,
  NotepadTextDashed,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { getInvoices } from "../../store/Slices/invoices.js"
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import UpdatePopup from "../UpdatePopup.jsx"
import { LoadingChase } from "../Loading.jsx"
const STATUS_CONFIG = [
  {
    value: "SENT",
    label: "Sent",
    icon: SendHorizonal,
    color: "#2563eb", // orange (amber-500)
  },
  {
    value: "PAID",
    label: "Paid",
    icon: DollarSign,
    color: "#10B981", // green (emerald-500)
  },
  {
    value: "DRAFT",
    label: "Draft",
    icon: NotepadTextDashed,
    color: "#ca8a04",
  }
];
export function InvoicesPage() {
  const { count, updating, invoices, loading, pageIndex, stats, } = useSelector(
    (state) => state.invoices
  );
  const [currentUpdateInvoice, setCurrentUpdateInvoice] = useState(null);


  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "paypal":
        return <Wallet className="w-4 h-4 mr-1" />;
      case "payoneer":
        return <Globe className="w-4 h-4 mr-1" />;
      case "wise":
        return <Banknote className="w-4 h-4 mr-1" />;
      case "indian_upi":
        return <Flag className="w-4 h-4 mr-1" />;
      case "swift_india":
        return <Banknote className="w-4 h-4 mr-1" />;
      default:
        return <Wallet className="w-4 h-4 mr-1" />;
    }
  };
  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case "paypal":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "payoneer":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "wise":
        return "bg-green-100 text-green-700 border-green-200";
      case "indian_upi":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "swift_india":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const { handleDateClick } =
    useContext(PageContext);
  const dispatch = useDispatch();

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleDateClick({ email: extractEmail(row?.email_c), navigate: "/" }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      )
    },
    {
      label: "LINK ",
      accessor: "preview",
      headerClasses: "",
      icon: Link2Icon,
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          <a
            href={row.preview}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Invoice
          </a>
        </span>
      )
    },
    {
      label: "CLIENT",
      accessor: "email_c",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      onClick: (row) => handleDateClick({ email: extractEmail(row?.email_c), navigate: "/contacts" }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.email_c}
        </span>
      )
    },
    {
      label: "Amount",
      accessor: "amount_c",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-6 py-4 text-green-600">
          ${parseFloat(row.amount_c || 0).toFixed(2)}
        </span>
      )
    },
    {
      label: "Payment Method",
      accessor: "payment_method",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <div className="flex items-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm border flex items-center ${getPaymentMethodColor(row.payment_method)}`}
          >
            {getPaymentMethodIcon(row.payment_method)}
            {row.payment_method
              ? row.payment_method
                .replace("_", " ")
                .toUpperCase()
              : "N/A"}
          </span>
        </div>
      )
    },
    {
      label: "Status",
      accessor: "status_c",
      headerClasses: "",
      icon: ChartNoAxesColumn,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.status_c}
        </span>
      )
    },
    {
      label: "Due Date",
      accessor: "due_date",
      headerClasses: "",
      icon: ChartNoAxesColumn,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          {row?.due_date}
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
            onClick={() => setCurrentUpdateInvoice(row)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title="Update"
          >
            <Pen className="w-4 h-4 text-blue-600" />
          </button>

        </div>
      )
    },


  ]
  const statusList = STATUS_CONFIG.map(config => {
    const status = stats.find(s => s.status == config.value)
    return {
      ...config,
      count: status?.status_count || 0,
      amount: status?.total_amount || 0,
      showAmount: true
    };

  });

  return (
    <>
      {currentUpdateInvoice && (
        <UpdatePopup
          open={!!currentUpdateInvoice}
          title="Update Invoice"
          fields={[
            {
              name: "name",
              label: "Name",
              type: "text",
              value: currentUpdateInvoice.name,
            },
            {
              name: "email_c",
              label: "Email",
              type: "text",
              value: currentUpdateInvoice.email_c,
            },
            {
              name: "amount_c",
              label: "Amount",
              type: "number",
              value: currentUpdateInvoice.amount_c,
            },
            {
              name: "payment_method",
              label: "Payment Method",
              type: "select",
              value: currentUpdateInvoice.payment_method,
              options: [
                { value: "paypal", label: "PayPal" },
                { value: "payoneer", label: "Payoneer" },
                { value: "wise", label: "Wise" },
                { value: "indian_upi", label: "Indian UPI" },
                { value: "swift_india", label: "Swift India" },
              ],
            },
          ]}
          loading={updating}
          onUpdate={(data) => updateInvoiceHandler(currentUpdateInvoice, data)}
          onClose={() => setCurrentUpdateInvoice(null)}
        />
      )}
      <TableView tableData={invoices} tableName={"Invoices"} columns={columns} slice={"invoices"} statusKey={"status_c"} statusList={statusList} fetchNextPage={() => dispatch(getInvoices({ page: pageIndex + 1 }))}   >
        <TableTitleBar Icon={FileText} title={"Invoices"} titleClass={"text-orange-700"} />
        <Table headerStyle={"  bg-orange-600"} layoutStyle={"grid grid-cols-[200px_200px_1fr_200px_300px_200px_200px_1fr]"} />
      </TableView></>

  );
}
import {
  Calendar,
  Pen,
  Globe,
  BadgeDollarSign,
  ChartNoAxesColumn,
  Clapperboard,
  FileText,
  Link2Icon,
  Mail,
  User,
  BarChart4,
  ChartColumnStackedIcon,

} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { getInvoices } from "../../store/Slices/invoices.js"
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { excludeName, extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import UpdatePopup from "../UpdatePopup.jsx"
import { getUnrepliedEmail } from "../../store/Slices/unrepliedEmails.js";

export function UnrepliedEmailsPage() {
  const { count, emails, loading, pageIndex, } = useSelector(
    (state) => state.unreplied
  );
  const [currentUpdateInvoice, setCurrentUpdateInvoice] = useState(null);


  const { handleMove } = useThreadContext()
  const { setWelcomeHeaderContent, setSearch, setEnteredEmail, setCurrentIndex } =
    useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handleOnClick = (email, navigate, index) => {
    localStorage.setItem("email", email);
    setSearch(email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Unreplied");
    console.log(index)
    setCurrentIndex(index)
    navigateTo(navigate);
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row, index) => handleOnClick(extractEmail(row?.from), "/", index),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      )
    },

    {
      label: "Contact",
      accessor: "email_c",
      headerClasses: "",
      icon: User,
      classes: "truncate ",
      onClick: (row, index) => handleOnClick(extractEmail(row?.from), "/contacts", index),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {excludeName(row?.from)}
        </span>
      )
    },
    {
      label: "Subject",
      accessor: "subject",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleMove({
        email: extractEmail(row.from),
        threadId: row.thread_id,
      }),
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.subject}
        </span>
      )
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
      )
    },
    {
      label: "Count",
      accessor: "thread_count",
      headerClasses: "",
      icon: ChartColumnStackedIcon,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.thread_count}
        </span>
      )
    },



  ]


  return (
    <>

      <TableView tableData={emails} tableName={"Unreplied"} columns={columns} slice={"unreplied"} fetchNextPage={() => dispatch(getUnrepliedEmail({ page: pageIndex + 1 }))}   >
        <TableTitleBar Icon={Mail} title={"Unreplied Emails"} titleClass={"text-rose-700"} />
        <Table headerStyle={"  bg-rose-600"} body layoutStyle={"grid grid-cols-[200px_1fr_1fr_200px_200px]"} />
      </TableView></>

  );
}
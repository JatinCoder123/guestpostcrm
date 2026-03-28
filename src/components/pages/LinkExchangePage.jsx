import {
  Calendar,
  FileText,
  User,
  Heart,
  Link2,
  Send,
  Ban,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { getFavEmails } from "../../store/Slices/favEmailSlice.js";
import { getLinkExchange } from "../../store/Slices/linkExchange.js";
const STATUS_CONFIG = [
  {
    value: "connected",
    label: "Connected",
    icon: Send,
    color: "#056439ff", // orange (amber-500)
    count: 0
  },

  {
    value: "removed",
    label: "Removed",
    icon: Ban,
    color: "#EF4444",
    count: 0// red (red-500)
  }
];
export function LinkExchangePage() {
  const { count, emails, loading, pageIndex, } = useSelector(
    (state) => state.linkExchange
  );
  const { handleMove } = useThreadContext()
  const { handleDateClick } =
    useContext(PageContext);
  const dispatch = useDispatch();

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleDateClick({ email: row?.email_address, navigate: "/" })
      ,
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      )
    },


    {
      label: "Contact",
      accessor: "email_address",
      headerClasses: "",
      icon: User,
      classes: "truncate ",
      onClick: (row) => handleDateClick({ email: row?.email_address, navigate: "/contacts" })
      ,

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.first_name} {row?.last_name}        </span>
      )
    },
    {
      label: "Subject",
      accessor: "subject",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleMove({
        email: row.email_address,
        threadId: row.thread_id,
      }),
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.subject}
        </span>
      )
    },
    {
      label: "Description",
      accessor: "description",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.description}
        </span>
      )
    },
  ]


  return (
    <>

      <TableView tableData={emails} tableName={"Link Exchange Emails"} columns={columns} slice={"linkExchange"} statusList={STATUS_CONFIG} fetchNextPage={() => dispatch(getLinkExchange({ page: pageIndex + 1 }))}   >
        <TableTitleBar Icon={Link2} title={"Link Exchange Emails"} titleClass={"text-violet-700"} />
        <Table headerStyle={"  bg-violet-600"} body layoutStyle={"grid grid-cols-[200px_200px_1fr_1fr]"} />
      </TableView></>

  );
}
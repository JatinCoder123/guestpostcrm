import {
  Calendar,
  FileText,
  User,
  MoveRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { getForwardedEmails } from "../../store/Slices/forwardedEmailSlice.js";

export function ForwardedPage() {
  const { count, emails, loading, pageIndex, } = useSelector(
    (state) => state.forwarded
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
      label: "Assigned At",
      accessor: "date_modified",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleDateClick({ email: row?.email_address, navigate: "/" })
      ,
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_modified}
        </span>
      )
    },

    {
      label: "Contact",
      accessor: "email_c",
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
  ]


  return (
    <>

      <TableView tableData={emails} tableName={"Assign Emails"} columns={columns} slice={"forwarded"} fetchNextPage={() => dispatch(getForwardedEmails({ page: pageIndex + 1 }))}   >
        <TableTitleBar Icon={MoveRight} title={"Assign Emails"} titleClass={"text-sky-700"} />
        <Table headerStyle={"  bg-sky-600"} body layoutStyle={"grid grid-cols-[200px_200px_1fr_1fr]"} />
      </TableView></>

  );
}
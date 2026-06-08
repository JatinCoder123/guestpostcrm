import {
  Calendar,
  FileText,
  User,
  MoveRight,
  Flame,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../../context/pageContext";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { getAllHot } from "../../store/Slices/hotSlice.js";

export function HotPage() {
  const { count, hots, loading, pageIndex, } = useSelector(
    (state) => state.hot
  );

  const { handleMove } = useThreadContext()
  const { handleDateClick } =
    useContext(PageContext);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllHot({}))
  }, [])
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleDateClick({ email: row?.email, navigate: "/" })
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
      accessor: "email",
      headerClasses: "",
      icon: User,
      classes: "truncate ",
      onClick: (row) => handleDateClick({ email: row?.email, navigate: "/contacts" })
      ,

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.name}      </span>
      )
    },
    {
      label: "Description",
      accessor: "description",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleMove({
        email: row.email_address,
        threadId: row.thread_id,
      }),
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.description}
        </span>
      )
    },
    {
      label: "Type",
      accessor: "type",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleMove({
        email: row.email_address,
        threadId: row.thread_id,
      }),
      render: (row) => (
        <span className="px-6 py-4 text-purple-600 cursor-pointer">
          {row.type}
        </span>
      )
    },
  ]


  return (
    <>

      <TableView tableData={hots} tableName={"Hot Events"} columns={columns} slice={"hot"} fetchNextPage={() => dispatch(getAllHot({ page: pageIndex + 1 }))}    >
        <TableTitleBar Icon={Flame} title={"Hot Events"} titleClass={"text-orange-700"} />
        <Table headerStyle={"  bg-orange-600"} body layoutStyle={"grid grid-cols-4"} />
      </TableView></>

  );
}
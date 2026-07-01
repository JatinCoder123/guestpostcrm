import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../../context/pageContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import {
  Calendar,
  FileText,
  Mail,
  User,
  BarChart4,
  ActivityIcon,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom"; // ✅ add useLocation
import { reportKeys, useInfiniteReports } from "../../queries/report.queries";
import { useTablePreference } from "../../hooks/useTablePreference";

export default function GroupReport() {
  const preferences = useTablePreference('report');
  console.log("Report Prefercne c", preferences)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteReports(preferences);
  const { handleDateClick } = useContext(PageContext);
  const reports =
    data?.pages?.flatMap(
      page =>
        page.records || []
    ) ?? [];

  const pages =
    data?.pages ?? [];

  const firstPage =
    pages[0] ?? {};

  const lastPage =
    pages[pages.length - 1] ??
    {};

  const pageIndex =
    lastPage?.pagination?.page ??
    1;

  const pageCount =
    firstPage?.pagination
      ?.totalPages ?? 0;

  const count =
    firstPage?.total_records ??
    0;

  const loading = isPending || isFetchingNextPage;
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,
      onClick: (row, index) =>
        handleDateClick({ email: row?.sender_email, navigate: "/" }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.date_entered}
        </span>
      ),
    },
    {
      label: "Contact",
      accessor: "sender_email",
      headerClasses: "",
      searchable: true,

      icon: User,
      onClick: (row, index) =>
        handleDateClick({ email: row?.sender_email, navigate: "/contacts" }),
      render: (row) => (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-medium text-gray-800">{row.sender_email}</span>
        </div>
      ),
    },
    {
      label: "Action",
      accessor: "action",
      headerClasses: "",
      icon: User,
      searchable: true,

      classes: "truncate max-w-[200px]",
      render: (row) => (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-medium text-gray-800">{row?.action}</span>
        </div>
      ),
    },
    {
      label: "Description",
      accessor: "description",
      searchable: true,

      headerClasses: "",
      icon: User,
      render: (row) => (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-medium text-gray-800">{row?.description}</span>
        </div>
      ),
    },



  ];

  return (
    <>
      <TableView
        tableData={reports}
        tableName={`${preferences?.filters?.category ?? ''} Group Report`}
        columns={columns}
        slice={"report"}
        preferences={preferences}
        pageIndex={pageIndex}
        pageCount={pageCount}
        count={count}
        loading={loading}
        refreshKey={
          reportKeys.all
        }
        fetchNextPage={() => {

          if (
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        }}
      >
        <TableTitleBar
          Icon={Mail}
          title={`${preferences?.filters?.category ?? ''} Group Report`}
          titleClass={"text-teal-700"}
        />

        <div className="relative">
          <Table
            headerStyle={"bg-teal-600"}
            layoutStyle={"grid grid-cols-4"}
          />
        </div>
      </TableView>
    </>
  );
}

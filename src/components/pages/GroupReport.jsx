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

export default function GroupReport() {
  const { category } =
    useParams();

  const location =
    useLocation();

  const stateFilters =
    location.state || {};
  console.log(stateFilters);
  const reportFilter =
    JSON.parse(
      localStorage.getItem(
        "reportFilter"
      ) || "{}"
    );

  const filters = {
    category,

    phase:
      stateFilters.phase ??
      reportFilter.phase ??
      "conversation",

    stage:
      stateFilters.stage ??
      reportFilter.stage ??
      "new",

    report_user_id:
      stateFilters.report_user_id ??
      reportFilter.report_user_id ??
      "",

    from:
      stateFilters.from ??
      reportFilter.from ??
      "",

    from_time:
      stateFilters.from_time ??
      reportFilter.from_time ??
      "00:00:00",

    to:
      stateFilters.to ??
      reportFilter.to ??
      "",

    to_time:
      stateFilters.to_time ??
      reportFilter.to_time ??
      "23:59:59",
  };
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteReports(filters);
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

  const stats =
    firstPage?.stats ?? {};

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
        tableName={`${category} Group Report`}
        columns={columns}
        slice={"report"}

        pageIndex={pageIndex}
        pageCount={pageCount}
        count={count}
        loading={loading}
        refreshKey={
          reportKeys.all
        }
        fetchNextPage={() => {
          console.log("fetchNextPage");

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
          title={`${category} Group Report`}
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

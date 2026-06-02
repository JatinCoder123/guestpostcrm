import {
  Calendar,
  FileText,
  User,
  Link2,
  Send,
  Ban,
} from "lucide-react";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { PageContext } from "../../context/pageContext";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { useTablePreference } from "../../hooks/useTablePreference";
import { useInfiniteLinkExchanges } from "../../queries/linkExchange.queries";

const STATUS_CONFIG = [
  {
    value: "connected",
    label: "Connected",
    icon: Send,
    color: "#056439ff",
    count: 0,
  },
  {
    value: "removed",
    label: "Removed",
    icon: Ban,
    color: "#EF4444",
    count: 0,
  },
];

export function LinkExchangePage() {
  const preferences =
    useTablePreference("linkExchange");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteLinkExchanges(preferences);

  const { handleMove } =
    useThreadContext();

  const { handleDateClick } =
    useContext(PageContext);

  const emails =
    data?.pages?.flatMap(
      (page) => page.records || page.data || []
    ) ?? [];

  const pages = data?.pages ?? [];

  const lastPage =
    pages[pages.length - 1] ?? {};

  const firstPage = pages[0] ?? {};

  const pageIndex =
    lastPage.page ?? 1;

  const pageCount =
    firstPage.total_pages ?? 0;

  const count =
    firstPage.total ?? 0;

  const loading =
    isPending || isFetchingNextPage;

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      icon: Calendar,
      classes: "truncate max-w-[200px]",

      onClick: (row, index) =>
        handleDateClick({
          email: row?.email_address,
          navigate: "/",
          index,
          nextPrev: true,
        }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },

    {
      label: "Contact",
      accessor: "email_address",
      icon: User,
      classes: "truncate",

      onClick: (row, index) =>
        handleDateClick({
          email: row?.email_address,
          navigate: "/contacts",
          index,
          nextPrev: true,
        }),

      render: (row) => (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-medium text-gray-800">
            {row?.first_name || ""}{" "}
            {row?.last_name || ""}
          </span>
        </div>
      ),
    },

    {
      label: "Subject",
      accessor: "subject",
      icon: FileText,
      classes: "truncate max-w-[300px]",

      onClick: (row) =>
        handleMove({
          email: row.email_address,
          threadId: row.thread_id,
        }),

      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.subject}
        </span>
      ),
    },

    {
      label: "Description",
      accessor: "description",
      icon: FileText,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-6 py-4 text-gray-700">
          {row.description}
        </span>
      ),
    },
  ];

  return (
    <TableView
      tableData={emails}
      tableName={"Link Exchange Emails"}
      columns={columns}
      slice={"linkExchange"}
      statusList={STATUS_CONFIG}
      pageIndex={pageIndex}
      pageCount={pageCount}
      count={count}
      loading={loading}
      preferences={preferences}
      refreshKey={["linkExchange"]}
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
        Icon={Link2}
        title={"Link Exchange Emails"}
        titleClass={"text-violet-700"}
      />

      <div className="relative">
        <Table
          headerStyle={"bg-violet-600"}
          layoutStyle={
            "grid grid-cols-[200px_200px_1fr_1fr]"
          }
          rowClassName={(row) =>
            row.status === "connected"
              ? "bg-green-50 hover:bg-green-100"
              : ""
          }
        />
      </div>
    </TableView>
  );
}
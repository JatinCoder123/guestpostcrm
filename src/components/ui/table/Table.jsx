import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import FilterRow from "./FilterRow";
import StatusRow from "./StatusRow";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  EyeOff,
  Funnel,
  FunnelX,
  Plus,
  RotateCcw,
} from "lucide-react";
import { DateRangeFilter } from "../../DateRangeFilter";
import { todayStr } from "../../../services/dateRangeUtils";
import IconButton from "../Buttons/IconButton"
import SearchBar from "./SearchBar";
import FilterColumn from "./FilterColumn";
import { getPreference, preferencesAction } from "../../../store/Slices/preferencesSlice";
import { queryClient } from "../../../lib/queryClient";
import TableViewport from "./TableViewport";
import useActionMutation from "../../fields/actions/useActionMutation";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TableTitleBar from "./TableTitleBar";
import { entityKeys } from "@/hooks/useEntity";
const TableContext = createContext();
export const useTableContext = () => {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error(
      "You're using table context in wrong place",
    );
  }

  return ctx;
};

const TableSkeleton = ({
  columnsLength = 5,
  rows = 6,
}) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map(
        (_, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-b last:border-b-0"
          >
            {Array.from({
              length: columnsLength,
            }).map((_, colIndex) => (
              <td key={colIndex} className="p-4">
                <div className="h-4 w-full rounded bg-gray-300 animate-pulse" />
              </td>
            ))}
          </tr>
        ),
      )}
    </tbody>
  );
};

/* -------------------------------------------------------------------------- */
/*                               FILTER COLUMN                                */
/* -------------------------------------------------------------------------- */



const TableView = ({
  data,
  layout,
  entity,
  statusCount = null,
  preferences,
  searching = true,
  timefilter = true,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  children,
  canAdd = false,
  handleAddClick,
  loading,
}) => {
  const slice = entity
  const STATUS_CONFIG = layout?.config?.statusConfig ?? []

  const timefilterField = layout?.config?.filterColumns ? layout?.config?.filterColumns[0]?.name : 'date_entered';
  const tableName = layout?.label;
  const columns = layout?.config?.columns ?? []
  const filterColumns = layout?.config?.filterColumns ?? []
  const tableData =
    data?.pages?.flatMap(
      (page) => page.records || page.data || []
    ) ?? [];
  const pages = data?.pages ?? [];

  const lastPage = pages[pages.length - 1] ?? {};
  const firstPage = pages[0] ?? {};

  const pageIndex = lastPage.page ?? 1;
  const pageCount = firstPage.total_pages ?? 0;
  const count = firstPage.total ?? 0;
  const sort = preferences?.sorting ?? {}
  const dateFilter = preferences?.date_filter || {};
  const fromDate = dateFilter?.date_from?.split(" ")[0] || todayStr();
  const fromTime = dateFilter.date_from?.split(" ")[1] || "00:01";
  const toDate = dateFilter.date_to?.split(" ")[0] || todayStr();
  const toTime = dateFilter.date_to?.split(" ")[1] || "23:59";
  const filterActive = !!dateFilter.date_from && !!dateFilter.date_to;
  const filters = preferences?.filters ?? {};
  const search = {
    search: preferences?.search_filter?.search || "",
    search_fields: preferences?.search_filter?.search_fields || [],
  };
  const [showStatus, setShowStatus] = useState(true);
  const [showFilterColumn, setShowFilterColumn] = useState(false);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();





  const [selectedRows, setSelectedRows] =
    useState([]);

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);
  useEffect(() => {
    const widths = {};

    columns.forEach((column) => {
      widths[column.accessor] = {
        width: column.width ?? 220,
        minWidth: column.minWidth ?? 120,
        maxWidth: column.maxWidth ?? 700,
        sticky: column.sticky ?? false,
      };
    });

    setColumnWidths(widths);
  }, [columns]);

  const resizeColumn = (accessor, width) => {
    setColumnWidths((prev) => ({
      ...prev,
      [accessor]: {
        ...prev[accessor],
        width: Math.max(
          prev[accessor].minWidth,
          Math.min(width, prev[accessor].maxWidth)
        ),
      },
    }));
  };
  const gridTemplate = useMemo(() => {
    return visibleColumns
      .map(
        (column) =>
          `${columnWidths[column.accessor]?.width || 220}px`
      )
      .join(" ");

  }, [visibleColumns, columnWidths]);
  const stickyColumns = useMemo(() => {
    let left = 0;

    return visibleColumns.map((column) => {
      const current = {
        ...column,
        width: columnWidths[column.accessor]?.width || 220,
        left,
      };

      if (column.sticky) {
        left += current.width;
      }

      return current;
    });
  }, [visibleColumns, columnWidths]);
  const updateSearch = (value) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: entity,
        key: "search_filter",
        value,
      })
    );
  };
  const updateFilters = (value) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: entity,
        key: "filters",
        value,
      })
    );
  };
  const toggleSort = (value) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: entity,
        key: "sorting",
        value: value
      })
    );
  };
  const updateDateFilter = (
    date_from,
    date_to
  ) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: entity,
        key: "date_filter",
        value: {
          date_range: "custom",
          date_from,
          date_to,
          date_field: timefilterField
        },
      })
    );
  };
  const handleResetFilter = () => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: entity,
        key: "date_filter",
        value: {
          date_from: "",
          date_to: "",
          date_range: "",
          date_field: ""
        },
      })
    );
  };
  const handleRefresh = async () => {

    queryClient.resetQueries({
      queryKey: entityKeys.allByEntity(entity),
    });
  };
  const actionMutation =
    useActionMutation();

  const actionContext = {
    navigate: navigateTo,

    // user: currentUser,

    mutateAsync:
      actionMutation.mutateAsync,

    queryClient,

    toast,

    // openModal,

    onActionSuccess: () => { queryClient.invalidateQueries({ queryKey: entityKeys.allByEntity(entity) }) },
    // onActionError,
  };

  const value = {
    tableName,
    layout,
    columns,

    visibleColumns,
    setVisibleColumns,

    columnWidths,
    resizeColumn,

    gridTemplate,
    stickyColumns,

    showStatus,
    setShowStatus,

    search,
    setSearch: updateSearch,

    filters,
    setFilters: updateFilters,

    slice,
    entity,

    sort,
    toggleSort,

    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,

    searching,


    timefilter,

    filterColumns,

    loading,

    selectedRows,
    setSelectedRows,

    pageIndex,
    pageCount,

    count,
    data: tableData,
    actionContext
  };

  return (
    <TableContext.Provider value={value}>
      <motion.div
        className="flex flex-col gap-3 mb-10"
      >
        {/* FILTER ROW */}
        <FilterRow />

        {/* STATUS ROW */}
        <motion.div
          initial={false}
          animate={{
            height: showStatus ? "auto" : 0,
            opacity: showStatus ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          style={{ overflow: "hidden" }}
        >
          {STATUS_CONFIG.length > 0 &&
            count >= 0 && (
              <StatusRow />
            )}
        </motion.div>

        {/* TOOLBAR ROW */}
        <div className="flex items-center  gap-3 bg-white border rounded-xl p-3">
          <div className="flex items-center gap-2">
            {/* FILTER TOGGLE */}
            {filterColumns.length > 0 && <IconButton
              onClick={() =>
                setShowFilterColumn(
                  (prev) => !prev,
                )
              }
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={showFilterColumn ? Funnel : FunnelX}
              label={showFilterColumn ? "Hide Filters" : "Show Filter"}
            />}



            {/* STATUS TOGGLE */}
            {STATUS_CONFIG.length > 0 && <IconButton
              onClick={() =>
                setShowStatus((prev) => !prev)
              }
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={showStatus ? Eye : EyeOff}
              label={showStatus ? "Hide Stats" : "Show Stats"}
            />}


          </div>
          {timefilter && <DateRangeFilter
            fromDate={fromDate}
            fromTime={fromTime}
            toDate={toDate}
            toTime={toTime}
            filterActive={filterActive}
            onApply={({
              fromDate,
              fromTime,
              toDate,
              toTime,
            }) =>
              updateDateFilter(
                `${fromDate} ${fromTime}`,
                `${toDate} ${toTime}`
              )
            }
            onReset={handleResetFilter}
          />}
          {searching && <SearchBar />}
          <div className="ml-auto flex gap-2">
            {canAdd && <IconButton
              onClick={handleAddClick}
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={Plus}
              label="Create"
            />}

            <IconButton
              onClick={handleRefresh}
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={RotateCcw}
              label="Refresh"
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex gap-3">
          {showFilterColumn && filterColumns.length > 0 && <FilterColumn />}

          {/* TABLE */}
          <motion.div
            className="flex-1 rounded-xl border overflow-hidden relative bg-white"
          >
            <TableTitleBar />
            <Table />

            {/* TABLE LOADING */}
            {loading &&
              pageIndex === 1 && tableData.length == 0 && (
                <table className="w-full">
                  <TableSkeleton
                    columnsLength={
                      columns?.length || 5
                    }
                  />
                </table>
              )}

            {/* EMPTY STATE */}
            {!loading && tableData?.length === 0 && <EmptyCard />}
          </motion.div>
        </div>
      </motion.div>
    </TableContext.Provider>
  );
};

export const Table = ({
  className = "",
  style = {},
  ...props
}) => {
  return (
    <div
      className={`relative flex max-h-[500px] w-full flex-col overflow-hidden ${className} `}
      style={style}
    >
      <TableViewport />
    </div>
  );
};
function EmptyCard() {
  const { tableName } = useTableContext()
  return <div className="flex flex-col items-center justify-center py-10 px-6 bg-white border-t">
    <div className="text-5xl mb-4">
      📭
    </div>

    <h3 className="text-xl font-semibold text-gray-700">
      No {tableName} Available
    </h3>

    <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
      There are currently no
      records to display here.
      Once new data is available,
      it will automatically appear.
    </p>
  </div>
}



export default TableView;
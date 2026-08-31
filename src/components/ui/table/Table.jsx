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
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

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
  const slice = entity;

  /*
   * IMPORTANT:
   * Keep fallback arrays/objects stable. Using `?? []` or
   * `?? {}` directly inside the component creates a new
   * reference on every render when the source is undefined.
   */
  const STATUS_CONFIG =
    layout?.config?.statusConfig ?? EMPTY_ARRAY;

  const rawFilterColumns =
    layout?.config?.filterColumns ?? EMPTY_ARRAY;

  const rawColumns =
    layout?.config?.columns ?? EMPTY_ARRAY;

  const timefilterField =
    rawFilterColumns?.[0]?.name || "date_entered";

  const tableName = layout?.label;

  /*
   * Stabilize layout arrays by their content.
   *
   * This protects TableView when a parent recreates the
   * layout/config arrays on every render.
   */
  const columnsKey = JSON.stringify(rawColumns);
  const filterColumnsKey =
    JSON.stringify(rawFilterColumns);
  const statusConfigKey =
    JSON.stringify(STATUS_CONFIG);

  const columns = useMemo(
    () => rawColumns,
    [columnsKey]
  );

  const filterColumns = useMemo(
    () => rawFilterColumns,
    [filterColumnsKey]
  );

  const stableStatusConfig = useMemo(
    () => STATUS_CONFIG,
    [statusConfigKey]
  );

  const tableData =
    data?.pages?.flatMap(
      (page) => page.records || page.data || []
    ) ?? EMPTY_ARRAY;

  const pages =
    data?.pages ?? EMPTY_ARRAY;

  const lastPage =
    pages[pages.length - 1] ?? EMPTY_OBJECT;

  const firstPage =
    pages[0] ?? EMPTY_OBJECT;

  const pageIndex =
    lastPage.page ?? 1;

  const pageCount =
    firstPage.total_pages ?? 0;

  const count =
    firstPage.total ?? 0;

  const sort =
    preferences?.sorting ?? EMPTY_OBJECT;

  const dateFilter =
    preferences?.date_filter ?? EMPTY_OBJECT;

  const fromDate =
    dateFilter?.date_from?.split(" ")[0] ||
    todayStr();

  const fromTime =
    dateFilter?.date_from?.split(" ")[1] ||
    "00:01";

  const toDate =
    dateFilter?.date_to?.split(" ")[0] ||
    todayStr();

  const toTime =
    dateFilter?.date_to?.split(" ")[1] ||
    "23:59";

  const filterActive =
    !!dateFilter?.date_from &&
    !!dateFilter?.date_to;

  const filters =
    preferences?.filters ?? EMPTY_OBJECT;

  /*
   * IMPORTANT:
   * `search` used to be a new object on every render.
   * Memoizing it prevents unnecessary context consumers
   * from reacting to an unrelated TableView render.
   */
  const search = useMemo(
    () => ({
      search:
        preferences?.search_filter?.search || "",
      search_fields:
        preferences?.search_filter?.search_fields ||
        EMPTY_ARRAY,
    }),
    [
      preferences?.search_filter?.search,
      preferences?.search_filter?.search_fields,
    ]
  );

  const [showStatus, setShowStatus] =
    useState(true);

  const [showFilterColumn, setShowFilterColumn] =
    useState(false);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const [selectedRows, setSelectedRows] =
    useState([]);

  /*
   * Initialize these states from the current columns.
   * They are synchronized below with guarded functional
   * updates, so setState is NOT called when nothing changed.
   */
  const [visibleColumns, setVisibleColumns] =
    useState(() => [...columns]);

  const [columnWidths, setColumnWidths] =
    useState(() => {
      const widths = {};

      columns.forEach((column) => {
        widths[column.accessor] = {
          width: column.width ?? 220,
          minWidth: column.minWidth ?? 120,
          maxWidth: column.maxWidth ?? 700,
          sticky: column.sticky ?? false,
        };
      });

      return widths;
    });

  /*
   * Synchronize visible columns safely.
   *
   * Returning the previous state object when the content is
   * identical is critical. It prevents:
   *
   * render -> effect -> setState -> render -> effect -> ...
   */
  useEffect(() => {
    setVisibleColumns((previousColumns) => {
      if (
        previousColumns.length ===
        columns.length
      ) {
        const same = columns.every(
          (column, index) => {
            const previous =
              previousColumns[index];

            if (!previous) {
              return false;
            }

            return (
              previous.accessor ===
              column.accessor &&
              previous.label ===
              column.label &&
              previous.width ===
              column.width &&
              previous.minWidth ===
              column.minWidth &&
              previous.maxWidth ===
              column.maxWidth &&
              previous.sticky ===
              column.sticky &&
              previous.searchable ===
              column.searchable
            );
          }
        );

        if (same) {
          return previousColumns;
        }
      }

      return columns;
    });
  }, [columns]);

  /*
   * Synchronize column widths safely.
   *
   * Preserve manually resized widths when the same column
   * still exists, while adding/removing columns as needed.
   */
  useEffect(() => {
    setColumnWidths((previousWidths) => {
      const nextWidths = {};

      columns.forEach((column) => {
        const previous =
          previousWidths[column.accessor];

        nextWidths[column.accessor] = {
          width:
            previous?.width ??
            column.width ??
            220,
          minWidth:
            column.minWidth ?? 120,
          maxWidth:
            column.maxWidth ?? 700,
          sticky:
            column.sticky ?? false,
        };
      });

      const previousKeys =
        Object.keys(previousWidths);

      const nextKeys =
        Object.keys(nextWidths);

      if (
        previousKeys.length ===
        nextKeys.length &&
        nextKeys.every((key) => {
          const previous =
            previousWidths[key];

          const next =
            nextWidths[key];

          return (
            previous?.width ===
            next.width &&
            previous?.minWidth ===
            next.minWidth &&
            previous?.maxWidth ===
            next.maxWidth &&
            previous?.sticky ===
            next.sticky
          );
        })
      ) {
        return previousWidths;
      }

      return nextWidths;
    });
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

  const actionContext = useMemo(
    () => ({
      navigate: navigateTo,

      // user: currentUser,

      mutateAsync:
        actionMutation.mutateAsync,

      queryClient,

      toast,

      // openModal,

      onActionSuccess: () => {
        queryClient.invalidateQueries({
          queryKey:
            entityKeys.allByEntity(entity),
        });
      },

      // onActionError,
    }),
    [
      navigateTo,
      actionMutation.mutateAsync,
      entity,
    ]
  );

  const value = useMemo(
    () => ({
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
      actionContext,
    }),
    [
      tableName,
      layout,
      columns,
      visibleColumns,
      columnWidths,
      gridTemplate,
      stickyColumns,
      showStatus,
      search,
      filters,
      slice,
      entity,
      sort,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      searching,
      timefilter,
      filterColumns,
      loading,
      selectedRows,
      pageIndex,
      pageCount,
      count,
      tableData,
      actionContext,
    ]
  );

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
          {stableStatusConfig.length > 0 &&
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
            {stableStatusConfig.length > 0 && <IconButton
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
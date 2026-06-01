import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import FilterRow from "./FilterRow";
import StatusRow from "./StatusRow";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  EyeOff,
  Funnel,
  FunnelX,
  RotateCcw,
} from "lucide-react";
import { DateRangeFilter } from "../../DateRangeFilter";
import { todayStr } from "../../../services/dateRangeUtils";
import IconButton from "../Buttons/IconButton"
import SearchBar from "./SearchBar";
import SortDropdown from "./SortDropDown";
import FilterColumn from "./FilterColumn";
import { getPreference, preferencesAction } from "../../../store/Slices/preferencesSlice";
import { queryClient } from "../../../lib/queryClient";
import { contactKeys } from "../../../queries/contact.queries";

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
  tableData = [],
  tableName,
  columns,
  slice,
  statusList = [],
  statusKey = "status",
  statusCount = null,
  searchType = "date_entered",
  filterColumns = [],
  preferences,
  defaultStatus,
  fetchNextPage,
  children,
  pageCount,
  pageIndex,
  count,
  loading,
  showLoading = true,
  handleRefresh,
}) => {
  const sorting = preferences.sorting
  const dateFilter = preferences.date_filter || {};
  const fromDate = dateFilter.date_from?.split(" ")[0] || todayStr();
  const fromTime = dateFilter.date_from?.split(" ")[1] || "00:01";
  const toDate = dateFilter.date_to?.split(" ")[0] || todayStr();
  const toTime = dateFilter.date_to?.split(" ")[1] || "23:59";
  const filterActive = !!dateFilter.date_from && !!dateFilter.date_to;
  const filters = preferences.filters;
  const search = {
    search: preferences.search_filter?.search || "",
    search_fields: preferences.search_filter?.search_fields || [],
  };
  const [showStatus, setShowStatus] = useState(true);
  const [showFilterColumn, setShowFilterColumn] = useState(true);
  const dispatch = useDispatch();





  const [selectedRows, setSelectedRows] =
    useState([]);

  const [visibleColumns, setVisibleColumns] =
    useState([]);

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);


  const updateSearch = (value) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: slice,
        key: "search_filter",
        value,
      })
    );
  };
  const updateFilters = (value) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: slice,
        key: "filters",
        value,
      })
    );
  };
  const updateDateFilter = (
    date_from,
    date_to
  ) => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: slice,
        key: "date_filter",
        value: {
          date_from,
          date_to,
        },
      })
    );
  };
  const handleResetFilter = () => {
    dispatch(
      preferencesAction.updateTablePreference({
        table: slice,
        key: "date_filter",
        value: {
          date_from: "",
          date_to: "",
          date_field: "",
          date_range: "",
        },
      })
    );
  };

  const value = {
    tableName,
    columns,
    statusList,
    statusKey,
    visibleColumns,
    setVisibleColumns,
    showStatus,
    setShowStatus,
    search,
    setSearch: updateSearch,
    filters,
    setFilters: updateFilters,
    slice,
    sorting,
    fetchNextPage,
    filterColumns,
    loading,
    selectedRows,
    setSelectedRows,
    pageIndex,
    pageCount,
    count,
    data: tableData,
  };

  return (
    <TableContext.Provider value={value}>
      <motion.div
        layout
        className="flex flex-col gap-3"
      >
        {/* FILTER ROW */}
        <FilterRow />

        {/* STATUS ROW */}
        <motion.div
          layout
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
          {statusList.length > 0 &&
            count >= 0 && (
              <StatusRow
                statusCount={statusCount}
              />
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
            {statusList.length > 0 && <IconButton
              onClick={() =>
                setShowStatus((prev) => !prev)
              }
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={showStatus ? Eye : EyeOff}
              label={showStatus ? "Hide Stats" : "Show Stats"}
            />}

            <SortDropdown />

          </div>
          <DateRangeFilter
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
          />
          <SearchBar />
          <div className="ml-auto">
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
            layout
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
            className="flex-1 rounded-xl border overflow-hidden relative bg-white"
          >
            {children}

            {/* TABLE LOADING */}
            {loading &&
              pageIndex === 1 && tableData.length == 0 &&
              showLoading && (
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

export const Table = (props) => {
  return (
    <table className="w-full">
      <TableHeader {...props} />
      <TableBody {...props} />
    </table>
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
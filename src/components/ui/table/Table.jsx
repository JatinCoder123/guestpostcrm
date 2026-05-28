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
import { useSelector } from "react-redux";
import {
  Eye,
  EyeOff,
  Funnel,
  FunnelX,
} from "lucide-react";
import { DateRangeFilter } from "../../DateRangeFilter";
import { todayStr } from "../../../services/dateRangeUtils";
import IconButton from "../Buttons/IconButton"
import SearchBar from "./SearchBar";
import SortDropdown from "./SortDropDown";
import FilterColumn from "./FilterColumn";

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
  tableData,
  tableName,
  columns,
  slice,
  statusList = [],
  statusKey = "status",
  statusCount = null,
  searchType = "date_entered",
  filterColumns = [],
  defaultStatus,
  fetchNextPage,
  children,
  showLoading = true,
}) => {
  const [fromDate, setFromDate] =
    useState(todayStr());

  const [fromTime, setFromTime] =
    useState("00:01");

  const [toDate, setToDate] =
    useState(todayStr());

  const [toTime, setToTime] =
    useState("23:59");

  const [filterActive, setFilterActive] =
    useState(false);

  const [showStatus, setShowStatus] =
    useState(true);

  const [showFilterColumn, setShowFilterColumn] =
    useState(true);

  const { pageIndex, pageCount, count, loading } =
    useSelector((state) => state[slice]);

  const [search, setSearch] = useState({
    value: "",
    type: searchType,
  });

  const [filters, setFilters] = useState(() => {
    if (defaultStatus)
      return { [statusKey]: defaultStatus };

    return {};
  });

  const [sort, setSort] = useState({
    column: null,
    direction: "asc",
  });

  const [selectedRows, setSelectedRows] =
    useState([]);

  const [visibleColumns, setVisibleColumns] =
    useState([]);

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const processedData = useMemo(() => {
    let data = [...tableData];

    // SEARCH FILTER
    if (search?.value) {
      if (search.type) {
        data = data.filter((row) =>
          String(row[search.type] || "")
            .toLowerCase()
            .includes(
              search.value.toLowerCase(),
            ),
        );
      } else {
        data = data.filter((row) =>
          Object.values(row)
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(
              search.value.toLowerCase(),
            ),
        );
      }
    }

    // STATUS FILTER
    Object.entries(filters).forEach(
      ([key, value]) => {
        data = data.filter(
          (row) =>
            row[key]?.toLowerCase() ===
            value?.toLowerCase(),
        );
      },
    );

    // DATE RANGE FILTER
    if (filterActive) {
      const from = new Date(
        `${fromDate} ${fromTime}`,
      );

      const to = new Date(
        `${toDate} ${toTime}`,
      );

      data = data.filter((row) => {
        const rowDate = new Date(
          row.real_date_entered,
        );

        return rowDate >= from && rowDate <= to;
      });
    }

    // SORTING
    if (sort.column) {
      data.sort((a, b) => {
        const valA = a[sort.column];
        const valB = b[sort.column];

        if (valA > valB)
          return sort.direction === "asc"
            ? 1
            : -1;

        if (valA < valB)
          return sort.direction === "asc"
            ? -1
            : 1;

        return 0;
      });
    }

    return data;
  }, [
    tableData,
    search,
    filters,
    sort,
    filterActive,
    fromDate,
    fromTime,
    toDate,
    toTime,
  ]);

  const handleResetFilter = () => {
    const today = todayStr();

    setFromDate(today);
    setFromTime("00:01");
    setToDate(today);
    setToTime("23:59");
    setFilterActive(false);
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
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    fetchNextPage,
    filterColumns,
    loading,
    selectedRows,
    setSelectedRows,
    pageIndex,
    pageCount,
    count,
    data: processedData,
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
            <IconButton
              onClick={() =>
                setShowFilterColumn(
                  (prev) => !prev,
                )
              }
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={showFilterColumn ? Funnel : FunnelX}
              label={showFilterColumn ? "Hide Filters" : "Show Filter"}
            />


            {/* STATUS TOGGLE */}
            <IconButton
              onClick={() =>
                setShowStatus((prev) => !prev)
              }
              className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center justify-center"
              icon={showStatus ? Eye : EyeOff}
              label={showStatus ? "Hide Stats" : "Show Stats"}
            />
            <SortDropdown />

          </div>
          <DateRangeFilter
            fromDate={fromDate}
            fromTime={fromTime}
            toDate={toDate}
            toTime={toTime}
            setFromDate={setFromDate}
            setFromTime={setFromTime}
            setToDate={setToDate}
            setToTime={setToTime}
            filterActive={filterActive}
            onApply={() =>
              setFilterActive(true)
            }
            onReset={handleResetFilter}
          />
          <SearchBar />

        </div>

        {/* MAIN CONTENT */}
        <div className="flex gap-3">
          {showFilterColumn && <FilterColumn />}

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
              pageIndex === 1 && processedData.length == 0 &&
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
            {!loading && processedData?.length === 0 && <EmptyCard />}
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
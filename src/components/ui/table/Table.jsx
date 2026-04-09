import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { motion } from "framer-motion"
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import FilterRow from './FilterRow'
import StatusRow from './StatusRow'
import { useSelector } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'
import TableFooter from './TableFooter'

const TableContext = createContext()

export const useTableContext = () => {
    const ctx = useContext(TableContext)
    if (!ctx) {
        throw new Error("You're using table context in wrong place")
    }
    return ctx;
}

const TableView = ({
    allowToView = true,
    tableData,
    tableName,
    columns,
    slice,
    statusList = [],
    statusKey = "status",
    statusCount = null,
    defaultStatus,
    fetchNextPage,
    children,
}) => {

    const { pageIndex, pageCount, count, loading } = useSelector(state => state[slice])

    const [search, setSearch] = useState("")
    const [showStatus, setShowStatus] = useState(true)

    const [filters, setFilters] = useState(() => {
        if (defaultStatus) return { [statusKey]: defaultStatus }
        return {}
    })

    const [sort, setSort] = useState({
        column: null,
        direction: "asc"
    })

    const [selectedRows, setSelectedRows] = useState([])
    const [visibleColumns, setVisibleColumns] = useState([])

    useEffect(() => {
        setVisibleColumns(columns);
    }, [columns]);

    const processedData = useMemo(() => {
        let data = [...tableData]

        if (search) {
            data = data.filter(row =>
                Object.values(row)
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        }

        Object.entries(filters).forEach(([key, value]) => {
            data = data.filter(row => row[key] === value)
        })

        if (sort.column) {
            data.sort((a, b) => {
                const valA = a[sort.column]
                const valB = b[sort.column]

                if (valA > valB) return sort.direction === "asc" ? 1 : -1
                if (valA < valB) return sort.direction === "asc" ? -1 : 1
                return 0
            })
        }

        return data

    }, [tableData, search, filters, sort])

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
        loading,
        selectedRows,
        setSelectedRows,
        pageIndex,
        pageCount,
        count,
        data: processedData
    }

    return (
        <TableContext.Provider value={value}>
            {!allowToView ? (
                <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <EyeOff className="w-10 h-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700">
                        Access Restricted
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">
                        You don’t have permission to view the{" "}
                        <span className="font-medium text-gray-700">{tableName}</span> .
                    </p>
                </div>
            ) : (
                <motion.div layout className='flex flex-col gap-2'>
                    <FilterRow />

                    <motion.div
                        layout
                        initial={false}
                        animate={{
                            height: showStatus ? "auto" : 0,
                            opacity: showStatus ? 1 : 0
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 18
                        }}
                        style={{ overflow: "hidden" }}
                    >
                        {statusList.length > 0 && count >= 0 && (
                            <StatusRow statusCount={statusCount} />
                        )}
                    </motion.div>

                    <motion.div
                        layout
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 18
                        }}
                        className="rounded-xl border overflow-hidden relative"
                    >
                        {statusList.length > 0 && count > 0 && (
                            <div className="flex justify-start absolute top-0 right-1 z-[100]">
                                <button
                                    onClick={() => setShowStatus(prev => !prev)}
                                    className="p-1 text-sm font-semibold rounded-lg bg-sky-400 text-white shadow hover:scale-105 transition cursor-pointer"
                                >
                                    {showStatus ? (
                                        <Eye className="w-4 h-4 text-gray-700" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-700" />
                                    )}
                                </button>
                            </div>
                        )}

                        {children}
                    </motion.div>
                </motion.div>
            )}
        </TableContext.Provider>
    )
}

export const Table = (props) => {
    return (
        <table className="w-full">
            <TableHeader {...props} />
            <TableBody {...props} />
        </table>
    )
}

export default TableView
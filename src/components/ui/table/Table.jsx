import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { motion } from "framer-motion"
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import FilterRow from './FilterRow'
import StatusRow from './StatusRow'
import { useSelector } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'

const TableContext = createContext()

export const useTableContext = () => {
    const ctx = useContext(TableContext)
    if (!ctx) {
        throw new Error("You're using table context in wrong place")
    }
    return ctx;
}

const TableView = ({
    tableData,
    tableName,
    columns,
    slice,
    statusList = [],
    statusKey = "status",
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

            {/* 🔥 Layout animation wrapper */}
            <motion.div layout className='flex flex-col gap-2'>

                <FilterRow />



                {/* 🔥 Animated StatusRow (controlled by showStatus) */}
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
                    {statusList.length > 0 && count > 0 && <StatusRow />}
                </motion.div>

                {/* 🔥 Table smoothly moves up/down */}
                <motion.div
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 18
                    }}
                    className=" rounded-xl border overflow-hidden relative"
                >
                    {statusList.length > 0 && count > 0 && <div className="flex justify-start absolute top-1 right-1 z-[100] ">
                        <button
                            onClick={() => setShowStatus(prev => !prev)}
                            className="p-1 text-sm font-semibold rounded-lg bg-sky-400 text-white shadow hover:scale-105 transition cursor-pointer"
                        >
                            {showStatus ? <EyeOff className="w-4 h-4 text-gray-700" /> : <Eye className="w-4 h-4 text-gray-700" />}
                        </button>
                    </div>}
                    {children}
                </motion.div>

            </motion.div>

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
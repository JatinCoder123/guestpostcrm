import React, { createContext, useContext, useMemo, useState } from 'react'
import TableToolbar from './TableToolbar'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import FilterRow from './FilterRow'
import StatusRow from './StatusRow'
import { useSelector } from 'react-redux'
import TableTitleBar from './TableTitleBar'
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
    columns, slice,
    statusList = [],
    defaultStatus,
    fetchNextPage,
    children,
}) => {
    const { pageIndex, pageCount, count, loading } = useSelector(state => state[slice])
    const [search, setSearch] = useState("")

    const [filters, setFilters] = useState(() => {
        if (defaultStatus) return { status: defaultStatus }
        return {}
    })

    const [sort, setSort] = useState({
        column: null,
        direction: "asc"
    })

    const [selectedRows, setSelectedRows] = useState([])
    const [visibleColumns, setVisibleColumns] = useState(columns)

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
        visibleColumns,
        setVisibleColumns,
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
        pageIndex, pageCount, count,
        data: processedData
    }

    return (

        <TableContext.Provider value={value}>

            <div className='flex flex-col gap-5'>

                <TableToolbar />

                <FilterRow />

                {statusList.length > 0 && <StatusRow />}
                <div className="bg-white  rounded-xl border overflow-hidden">
                    {children}

                </div>


            </div>

        </TableContext.Provider>

    )

}
export const Table = (props) => {
    return (
        <table className="w-full">
            <TableHeader {...props} />
            <TableBody />
        </table>
    )
}




export default TableView
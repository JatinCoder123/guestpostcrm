
import { Package, Download } from "lucide-react"
import { useTableContext } from "./Table"

function TableTitleBar() {

    const { tableName, selectedRows } = useTableContext()

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">

            {/* Left */}
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Package className="w-4 h-4 text-blue-500" />
                {tableName}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    + Select
                </button>

                <button className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100">
                    <Download className="w-4 h-4" />
                    Export
                </button>

            </div>

        </div>
    )
}

export default TableTitleBar

import { BadgeInfo, Download } from "lucide-react"


function TableTitleBar({ Icon, title, iconClass, titleClass }) {
    return (
        <div className="flex items-center font-bold text-xl justify-between p-4 border-b bg-gray-50">

            {/* Left */}
            <div className={`flex items-center gap-2 text-gray-700 font-semibold ${titleClass}`}>
                <Icon className={`w-6 h-6  ${iconClass}`} />
                {title}
                <button on><BadgeInfo /></button>
            </div>

            {/* Right */}
            {/* <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div> */}

        </div>
    )
}

export default TableTitleBar
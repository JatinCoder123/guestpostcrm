
import { BadgeInfo, Download } from "lucide-react"


function TableTitleBar({ Icon, title, iconClass, titleClass, count }) {
    return (
        <div className="flex items-center font-bold text-xl justify-between p-4 border-b bg-gray-50">

            {/* Left */}
            <div className={`flex items-center gap-2 text-gray-700 font-semibold ${titleClass}`}>
                <Icon className={`w-6 h-6  ${iconClass}`} />
                {title}
                <button on><BadgeInfo /></button>
            </div>




        </div>
    )
}

export default TableTitleBar
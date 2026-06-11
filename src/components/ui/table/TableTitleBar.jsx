import { BadgeInfo } from "lucide-react";
import TableFooter from "./TableFooter";
function TableTitleBar({ Icon, title, iconClass, titleClass }) {

    return (
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white shadow-sm rounded-t-xl">
            <div className={`flex items-center gap-3 text-gray-800 ${titleClass}`}>
                <div className="p-2 rounded-lg ">
                    <Icon className={`w-5 h-5 ${iconClass}`} />
                </div>

                <h2 className="text-lg font-semibold">{title}</h2>

                <button className="p-1 hover:bg-gray-100 rounded-md transition">
                    <BadgeInfo className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            <TableFooter />
        </div>
    );
}

export default TableTitleBar;

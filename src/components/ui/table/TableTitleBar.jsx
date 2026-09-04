import { ArrowLeft, BadgeInfo } from "lucide-react";
import TableFooter from "./TableFooter";
import { useNavigate } from "react-router-dom";
import IconButton from "../Buttons/IconButton";
function TableTitleBar({ Icon, title, iconClass, titleClass }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 border-b bg-white shadow-sm rounded-t-xl sm:gap-3 sm:px-5 sm:py-4">

            <div className={`flex min-w-0 items-center gap-2 text-blue-600 sm:gap-3`}>
                <IconButton
                    onClick={() => navigate(-1)}
                    className={`h-9 w-9 shrink-0 rounded-full border bg-white hover:bg-gray-100 transition flex items-center justify-center sm:h-10 sm:w-10`}
                    icon={ArrowLeft}
                    label="Back"
                    tooltipPosition="bottom"
                />
                <div className="min-w-0 p-1 rounded-lg flex items-center gap-2 sm:p-2 sm:gap-3">

                    <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} />
                    <h2 className="truncate text-base font-semibold sm:text-lg">{title}</h2>
                </div>



                <button className="shrink-0 p-1 hover:bg-gray-100 rounded-md transition">
                    <BadgeInfo className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            <TableFooter />
        </div>
    );
}

export default TableTitleBar;

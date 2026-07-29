import { ArrowLeft, BadgeInfo } from "lucide-react";
import TableFooter from "./TableFooter";
import { useNavigate } from "react-router-dom";
import IconButton from "../Buttons/IconButton";
function TableTitleBar({ Icon, title, iconClass, titleClass }) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between px-5 py-4 border-b bg-white shadow-sm rounded-t-xl">

            <div className={`flex items-center gap-3 text-gray-800 ${titleClass}`}>
                <IconButton
                    onClick={() => navigate(-1)}
                    className={`h-10 w-10 rounded-full border bg-white hover:bg-gray-100 transition flex items-center justify-center ${titleClass}`}
                    icon={ArrowLeft}
                    label="Back"
                    tooltipPosition="bottom"
                />
                <div className="p-2 rounded-lg flex items-center gap-3">

                    <Icon className={`w-5 h-5 ${iconClass}`} />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>



                <button className="p-1 hover:bg-gray-100 rounded-md transition">
                    <BadgeInfo className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            <TableFooter />
        </div>
    );
}

export default TableTitleBar;

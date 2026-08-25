import { motion } from "framer-motion";
import { useTableContext } from "./Table";

const TableFooter = () => {
    const {
        pageIndex,
        pageCount,
        count,
        data,
    } = useTableContext();

    const start = count === 0 ? 0 : data.length;
    return (
        <motion.div
            layout
            className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-lg px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 sm:w-auto sm:px-4 sm:py-3"
        >
            {/* LEFT - RESULT INFO */}
            <div className="whitespace-nowrap text-xs text-gray-600 font-medium sm:text-sm">
                Showing{" "}
                <span className="text-black font-semibold">
                    {start}
                </span>{" "}
                of{" "}
                <span className="text-black font-semibold">
                    {count}
                </span>{" "}
                results
            </div>

            {/* RIGHT - PAGE INFO */}
            <div className="whitespace-nowrap text-xs font-semibold text-gray-700 sm:text-sm">
                Page {pageIndex} of {pageCount}
            </div>
        </motion.div>
    );
};

export default TableFooter;
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
            className="flex  items-center justify-between px-4 py-3  bg-gradient-to-r from-gray-50 to-gray-100"
        >
            {/* LEFT - RESULT INFO */}
            <div className="text-sm text-gray-600 font-medium">
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

            {/* CENTER - PAGE INFO */}
            <div className="text-sm font-semibold text-gray-700 ml-50">
                Page {pageIndex} of {pageCount}
            </div>
        </motion.div>
    );
};

export default TableFooter;
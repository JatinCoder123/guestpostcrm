import { useThreadContext } from "../../../hooks/useThreadContext";
import NextPrev from "../../NextPrev";


const RightThreadHeader = () => {
    const { context: { currentEmail: sender } } = useThreadContext()

    return (
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center ">
            {/* Left Section */}
            <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white rounded-t-lg">
                <span className="text-sm opacity-90">Client:</span>
                <div className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
                    {sender}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end">
                <NextPrev />
            </div>
        </div>
    );
};

export default RightThreadHeader;
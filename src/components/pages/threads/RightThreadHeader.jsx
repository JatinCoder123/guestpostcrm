import NextPrev from "../../NextPrev";
import CopyButton from "../../CopyButton"
import { useNavigate, useOutletContext } from "react-router-dom";


const RightThreadHeader = () => {
    const { email, threadId } = useOutletContext()
    const navigate = useNavigate()
    const setParams = (e, t) => {
        const params = new URLSearchParams(location.search);

        params.set("email", e);
        params.set("thread", t);

        navigate(`${location.pathname}?${params.toString()}`);
    };
    return (
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center ">
            {/* Left Section */}
            <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white rounded-t-lg">
                <span className="text-sm opacity-90">Client:</span>
                <div className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
                    {email}
                </div>
                <CopyButton text={email} />
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end">
                <NextPrev prevHandler={(e, t) => setParams(e, t)} nextHandler={(e, t) => setParams(e, t)} />
            </div>
        </div>
    );
};

export default RightThreadHeader;
import React, { useContext, useEffect } from "react";
import { getNoSearchResultData, ladgerAction } from "../store/Slices/ladger";
import { useDispatch, useSelector } from "react-redux";
import { PageContext } from "../context/pageContext";
import { toast } from "react-toastify";
import { LoadingChase } from "./Loading";
import { Calendar, Import } from "lucide-react";

export const NoSearchFoundPage = () => {
    const { search } = useContext(PageContext);
    const { noSearchResultData, loading, error } = useSelector(
        (state) => state.ladger
    );
    const { loading: unrepliedLoading } = useSelector(
        (state) => state.unreplied
    );

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getNoSearchResultData(search));
    }, [search, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(ladgerAction.clearAllErrors());
        }
    }, [error, dispatch]);

    if (loading || unrepliedLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <LoadingChase />
            </div>
        );
    }

    if (!noSearchResultData?.length) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-gray-500">
                No Search Found
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {noSearchResultData.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between gap-4
          bg-white rounded-xl shadow-sm border border-gray-100
          hover:bg-pink-50 transition cursor-pointer px-4 py-3"
                >
                    {/* Left: Avatar + Email */}
                    <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500
            flex items-center justify-center text-white font-semibold">
                            {item.customer_email?.[0]?.toUpperCase()}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                {item.customer_email}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {item.date_created}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Subject */}
                    <div className="flex-1">
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {item.subject}
                        </p>
                    </div>

                    {/* Right: Action */}
                    <button
                        onClick={() => alert("Work in progress")}
                        className="p-2 rounded-lg hover:bg-blue-100 transition"
                        title="Import"
                    >
                        <Import className="w-5 h-5 text-blue-600" />
                    </button>
                </div>
            ))}
        </div>
    );
};

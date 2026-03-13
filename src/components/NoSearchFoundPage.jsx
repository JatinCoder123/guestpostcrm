import React, { useContext, useEffect, useState } from "react";
import {
  getNoSearchResultData,
  ladgerAction,
  manualEmailScan,
} from "../store/Slices/ladger";
import { useDispatch, useSelector } from "react-redux";
import { PageContext } from "../context/pageContext";
import { toast } from "react-toastify";
import { LoadingChase } from "./Loading";
import { Calendar, Eye, ScanSearch } from "lucide-react";
import { useThreadContext } from "../hooks/useThreadContext";
import { extractEmail } from "../assets/assets";

export const NoSearchFoundPage = () => {
  const {
    noSearchResultData,
    noSearchFoundLoading,
    manualScanLoading,
    error,
    manualScanResponse,
  } = useSelector((state) => state.ladger);

  const [currentMessageId, setCurrentMessageId] = useState(null);

  const { setSearch, search, setEnteredEmail } = useContext(PageContext);
  const { handleMove } = useThreadContext();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNoSearchResultData(search));
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }

    if (
      manualScanResponse &&
      manualScanResponse?.message_id == currentMessageId?.message_id
    ) {
      setSearch(currentMessageId?.customer_email);
      setEnteredEmail(currentMessageId?.customer_email);

      localStorage.setItem("email", currentMessageId?.customer_email);

      dispatch(ladgerAction.setTimeline(null));
    }
  }, [error, manualScanResponse, dispatch]);

  if (noSearchFoundLoading) {
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

      {/* Manual Scan Loader */}
      {manualScanLoading && (
        <div className="fixed inset-0 bg-black/20 flex flex-col items-center justify-center z-50 gap-4">
          <LoadingChase />
          <p className="text-white font-medium text-sm tracking-wide">
            Scanning email...
          </p>
        </div>
      )}

      <h1 className="text-center font-semibold text-gray-500">
        TimeLine Does not exists, Results from Live Search
      </h1>

      {noSearchResultData?.map((item) => (
        <div
          key={item.message_id}
          className="flex items-center justify-between gap-4
          bg-white rounded-xl shadow-sm border border-gray-100
          hover:bg-pink-50 transition cursor-pointer px-4 py-3"
        >
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-[220px]">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500
              flex items-center justify-center text-white font-semibold"
            >
              {item.customer_email?.[0]?.toUpperCase()}
            </div>

            <div>
              {/* EMAIL SEARCH BUTTON */}
              <button
                disabled={manualScanLoading}
                onClick={() => {
                  setSearch(item.customer_email);
                  setEnteredEmail(item.customer_email);

                  localStorage.setItem("email", item.customer_email);

                  dispatch(ladgerAction.setTimeline(null));
                }}
                className="text-sm font-medium text-gray-800 hover:underline disabled:opacity-50"
              >
                {item.customer_email}
              </button>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {item.date_created}
              </div>
            </div>
          </div>

          {/* SUBJECT */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 line-clamp-2">
              {item.subject}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">

            {/* SCAN BUTTON */}
            <button
              disabled={manualScanLoading}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMessageId(item);
                dispatch(manualEmailScan(item.message_id));
              }}
              className="px-3 py-1 text-xs rounded-md cursor-pointer bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50"
              title="Scan Email"
            >
              <ScanSearch className="w-5 h-5" />
            </button>

            {/* VIEW BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMove({
                  email: extractEmail(item.customer_email),
                  threadId: item.thread_id,
                });
              }}
              className="px-3 py-1 rounded-md bg-blue-100 transition cursor-pointer"
              title="View"
            >
              <Eye className="w-5 h-5 text-blue-600" />
            </button>

          </div>
        </div>
      ))}
    </div>
  );
};


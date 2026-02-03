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
import { Calendar, Eye, Import } from "lucide-react";
import EmailBox from "./EmailBox";

export const NoSearchFoundPage = () => {
  const {
    noSearchResultData,
    noSearchFoundLoading,
    error,
    manualScanResponse,
  } = useSelector((state) => state.ladger);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [showThread, setShowThread] = useState(false);
  const { setSearch, search, setEnteredEmail } = useContext(PageContext);
  const [popup, setPopup] = useState({
    open: false,
    status: null,
    message: "",
    threadId: null,
  });

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
      setSearch(currentMessageId.customer_email);
      setEnteredEmail(currentMessageId.customer_email);
      dispatch(ladgerAction.setTimeline(null));
    }
  }, [error, manualScanResponse, dispatch]);
  if (showThread) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          importBtn={() => {
            return (
              <button
                onClick={() => {
                  dispatch(manualEmailScan(currentMessageId.message_id));
                  setPopup({ open: true });
                  setShowThread(false);
                }}
                className="p-2 rounded-lg hover:bg-blue-500 transition cursor-pointer"
                title="Import"
              >
                <Import className="w-6 h-6 text-white" />
              </button>
            );
          }}
          onClose={() => setShowThread(false)}
          threadId={currentMessageId?.thread_id}
          tempEmail={currentMessageId?.customer_email}
        />
      </div>
    );
  }
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
      <h1 className="text-center font-semibold text-gray-500">
        TimeLine Does not exists, Results from Live Search
      </h1>
      {noSearchResultData?.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4
          bg-white rounded-xl shadow-sm border border-gray-100
          hover:bg-pink-50 transition cursor-pointer px-4 py-3"
        >
          {/* Left: Avatar + Email */}
          <div className="flex items-center gap-3 min-w-[220px]">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500
            flex items-center justify-center text-white font-semibold"
            >
              {item.customer_email?.[0]?.toUpperCase()}
            </div>

            <div>
              <button
                onClick={() => {
                  setCurrentMessageId(item);
                  dispatch(manualEmailScan(item.message_id));
                }}
                className="text-sm font-medium text-gray-800 hover:underline cursor-pointer"
              >
                {item.customer_email}
              </button>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {item.date_created}
              </div>
            </div>
          </div>

          {/* Middle: Subject */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 line-clamp-2">{item.subject}</p>
          </div>

          {/* Right: Action */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowThread(true);
              setCurrentMessageId(item);
            }}
            className="p-2 rounded-lg hover:bg-blue-100 transition cursor-pointer"
            title="View"
          >
            <Eye className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      ))}
      {popup.open && manualScanResponse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-5 space-y-4">
            <h2 className="text-lg font-semibold">Scan Result</h2>

            {/* MESSAGE */}
            <p className="text-gray-700">{manualScanResponse.message}</p>

            {/* CLOSE */}
            {(manualScanResponse.status === "skipped" ||
              manualScanResponse.status === 404 ||
              manualScanResponse.status === "success") && (
              <button
                className="w-full bg-gray-200 py-2 rounded-lg"
                onClick={() => setPopup({ open: false })}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

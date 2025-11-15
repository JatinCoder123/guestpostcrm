import {
  Mail,
  RefreshCw,
  CheckCircle,
  Phone,
  MessageSquare,
  User,
  Globe,
  Handshake,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadgerEmail, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { getContact, viewEmailAction } from "../../store/Slices/viewEmail";
import ContactBox from "../ContactBox";
import CreateDeal from "../CreateDeal";

/* =====================================================
   LOADING SKELETON COMPONENT
===================================================== */
const LoadingSkeleton = () => {
  return (
    <div className="p-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
          <div className="space-y-2">
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-10 h-5 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-3 mt-6">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export function TimelinePage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showEmail, setShowEmails] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeal, setShowDeal] = useState(false);
  const [showIP, setShowIP] = useState(false);

  const dispatch = useDispatch();

  const { ladger, email, duplicate, mailersSummary, loading, error } =
    useSelector((state) => state.ladger);

  const {
    loading: sendLoading,
    error: sendError,
    message,
  } = useSelector((state) => state.viewEmail);

  /** Disable body scroll when modals open */
  useEffect(() => {
    if (showEmail || showContact || showDeal || showIP) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showEmail, showContact, showDeal, showIP]);

  /** Auto Refresh */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(getLadgerEmail(email));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  /** Error Handling */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(ladgerAction.clearAllErrors());
    }
  }, [dispatch, loading, error]);

  useEffect(() => {
    if (sendError) {
      toast.error(sendError);
      dispatch(viewEmailAction.clearAllErrors());
    }
    if (message) {
      toast.success(message);
      dispatch(viewEmailAction.clearAllMessage());
    }
  }, [dispatch, sendError, sendLoading, message]);

  return (
    <>
      {/* EMAIL POPUP */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <EmailBox onClose={() => setShowEmails(false)} view={true} />
        </div>
      )}

      {/* CONTACT POPUP */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <ContactBox onClose={() => setShowContact(false)} />
        </div>
      )}

      {/* DEAL POPUP */}
      {showDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <CreateDeal onClose={() => setShowDeal(false)} />
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {/* ===========================
            LOADING SKELETON
        ============================ */}
        {loading && <LoadingSkeleton />}

        {/* ===========================
            ACTUAL CONTENT (when NOT loading)
        ============================ */}
        {!loading && (
          <>
            <div className="flex flex-col p-6 border-b border-gray-200">
              {/* TOP HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">
                            {ladger?.length > 0 && ladger[0].name}
                          </span>

                          {/* Verified Icon */}
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>

                        {/* Phone */}
                        <div className="ml-2 flex items-center gap-2 text-green-600">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-gray-700 font-medium">
                            +1234567890
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REFRESH + AUTO REFRESH */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">
                    {duplicate > 1
                      ? `${duplicate} Duplicates`
                      : `${duplicate} Duplicate`}
                  </span>

                  <button
                    onClick={() => dispatch(getLadgerEmail(email))}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Auto Refresh:</span>
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        autoRefresh ? "bg-gray-800" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          autoRefresh ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* ===================== */}
              {/*   NO RESULT FOUND     */}
              {/* ===================== */}
              {!mailersSummary || Object.keys(mailersSummary).length === 0 ? (
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-10 text-center w-full">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/7486/7486780.png"
                    className="w-20 mx-auto mb-4 opacity-70"
                    alt="no-result"
                  />
                  <h2 className="text-xl font-semibold text-gray-700">
                    No Result Found
                  </h2>
                  <p className="text-gray-500 mt-1">
                    We couldn’t find any summary or recent email activity.
                  </p>
                </div>
              ) : (
                <>
                  {/* TIMELINE DETAILS */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">SUBJECT</span>
                      <p className="text-gray-900 mt-1">
                        {mailersSummary?.subject ?? "No Subject"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">MOTIVE</span>
                      <p className="text-gray-900 mt-1">
                        {mailersSummary?.motive}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">TYPE</span>
                      <p className="text-gray-900 mt-1">Brand</p>
                    </div>
                    <div>
                      <span className="text-gray-500">STAGE</span>
                      <p className="text-gray-900 mt-1">
                        {mailersSummary?.stage ?? "No Status"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">STATUS</span>
                      <p className="text-gray-900 mt-1">
                        {mailersSummary?.status ?? "No Status"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">DATE</span>
                      <p className="text-gray-900 mt-1">
                        {mailersSummary?.date_entered}
                      </p>
                    </div>
                  </div>

                  {/* AI + LATEST MESSAGE */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-56 overflow-y-auto">
                      <h3 className="text-blue-700 font-semibold mb-2">
                        AI Summary
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {mailersSummary?.summary ?? "No AI summary available."}
                      </p>
                    </div>

                    {/* Latest Message */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 h-56 overflow-y-auto">
                      <h3 className="text-yellow-700 font-semibold mb-2">
                        Latest Message
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {mailersSummary?.latest_message ??
                          "No recent message found."}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* ===================== */}
              {/*     ACTION BUTTONS    */}
              {/* ===================== */}
              <div className="mt-4 flex flex-wrap gap-2">
                {/* View Email */}
                <button
                  onClick={() => setShowEmails(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
               hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>View Email</span>
                </button>

                {/* View Contact */}
                <button
                  onClick={() => {
                    dispatch(getContact(email));
                    setShowContact(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg 
               hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>View Contact</span>
                </button>

                {/* View IP */}
                <button
                  onClick={() => setShowIP(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg 
               hover:bg-amber-600 transition-all shadow-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>View IP</span>
                </button>

                {/* Create Deal */}
                <button
                  onClick={() => setShowDeal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg 
               hover:bg-purple-700 transition-all shadow-sm"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Create Deal</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => console.log("Open WhatsApp")}
                  className="cursor-pointer hover:scale-105"
                >
                  <img
                    width="48"
                    height="48"
                    src="https://img.icons8.com/color/48/whatsapp--v1.png"
                    alt="whatsapp--v1"
                  />
                </button>

                {/* Call */}
                <button
                  onClick={() => console.log("Call user")}
                  className="cursor-pointer hover:scale-105"
                >
                  <img
                    width="48"
                    height="48"
                    src="https://img.icons8.com/color/48/apple-phone.png"
                    alt="apple-phone"
                  />
                </button>

                {/* SMS */}
                <button
                  onClick={() => console.log("Send SMS")}
                  className="cursor-pointer hover:scale-105"
                >
                  <img
                    width="48"
                    height="48"
                    src="https://img.icons8.com/stickers/100/speech-bubble-with-dots.png"
                    alt="speech-bubble-with-dots"
                  />
                </button>
              </div>
            </div>

            {/* TIMELINE EVENTS */}
            <div className="py-[2%] px-[30%]">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300"></div>

                <div className="space-y-6">
                  {ladger.length > 0 &&
                    ladger.map((event) => (
                      <div
                        key={event.id}
                        className="relative flex items-center gap-4"
                      >
                        {/* Dot */}
                        <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <img
                              width="100"
                              height="100"
                              src="https://img.icons8.com/bubbles/100/new-post.png"
                              alt="new-post"
                            />
                          </div>

                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 
                                          absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"
                          ></div>
                        </div>

                        {/* Card */}
                        <div className="flex-1 border-2 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700">
                              {event.type_c}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {event.date_entered}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* END ICON */}
                  {ladger.length > 0 && (
                    <div className="relative flex gap-4">
                      <div className="relative z-10 w-16 flex-shrink-0">
                        <div className="w-12 h-12 flex items-center justify-center">
                          <img
                            src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/image__7_-removebg-preview.png"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

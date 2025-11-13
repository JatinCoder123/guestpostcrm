import {
  Mail,
  CheckCircle,
  RefreshCw,
  MessageCircle,
  Phone,
  MessageSquare,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Footer } from "../Footer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getLadgerEmail, ladgerAction } from "../../store/Slices/ladger";
import EmailBox from "../EmailBox";
import { getContact, viewEmailAction } from "../../store/Slices/viewEmail";
import ContactBox from "../ContactBox";
export function TimelinePage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showEmail, setShowEmails] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (showEmail || showContact) {
      document.body.style.overflow = "hidden"; // Disable background scroll
    } else {
      document.body.style.overflow = "auto"; // Restore when closed
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup
    };
  }, [showEmail, showContact]);

  const { ladger, email, duplicate, mailersSummary, loading, error } =
    useSelector((state) => state.ladger);
  const {
    loading: sendLoading,
    error: sendError,
    message,
  } = useSelector((state) => state.viewEmail);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(getLadgerEmail(email));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);
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
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <EmailBox onClose={() => setShowEmails(false)} view={true} />
        </div>
      )}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <ContactBox
            onClose={() => {
              setShowContact(false);
            }}
          />
        </div>
      )}

      {/* Timeline Header */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700  font-medium">
                      {ladger?.length > 0 && ladger[0].name}
                    </span>

                    {/* Phone */}
                    <div className="ml-2 flex items-center gap-2 text-green-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-700  font-medium">
                        +1234567890
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

          {/* Timeline Details */}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="text-gray-500">SUBJECT</span>
              <p className="text-gray-900 mt-1">
                {" "}
                {mailersSummary?.subject ?? "No Subject"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">MOTIVE</span>
              <p className="text-gray-900 mt-1">{mailersSummary?.motive}</p>
            </div>
            <div>
              <span className="text-gray-500 ">MAILER SUMMARY</span>
              <p className="text-gray-900 mt-1">{mailersSummary?.summary}</p>
            </div>
            <div>
              <span className="text-gray-500">STAGE</span>
              <p className="text-gray-900 mt-1">
                {" "}
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
              <span className="text-gray-500">Date</span>
              <p className="text-gray-900 mt-1">
                {mailersSummary?.date_entered}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* View Email */}
            <button
              onClick={() => setShowEmails((p) => !p)}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>View Email</span>
            </button>

            {/* View Contact */}
            <button
              onClick={() => {
                dispatch(getContact(email));
                setShowContact((p) => !p);
              }}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>View Contact</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => console.log("Open WhatsApp")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/color/48/whatsapp--v1.png"
                alt="whatsapp--v1"
              />
              <span>WhatsApp</span>
            </button>

            {/* Call */}
            <button
              onClick={() => console.log("Call user")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>

            {/* SMS */}
            <button
              onClick={() => console.log("Send SMS")}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS</span>
            </button>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="py-[2%] px-[30%]">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-[10px] bg-gray-300"></div>

            <div className="space-y-6">
              {ladger.length > 0 &&
                ladger.map((event, index) => (
                  <div
                    key={event.id}
                    className="relative flex items-center gap-4"
                  >
                    {/* Timeline Icon */}
                    <div className="relative z-10 w-16 flex-shrink-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <img
                          width="100"
                          height="100"
                          src="https://img.icons8.com/bubbles/100/new-post.png"
                          alt="new-post"
                        />
                      </div>

                      {/* Horizontal Line */}
                      <div class="bg-gradient-to-r from-purple-600 to-blue-600 absolute top-1/2 left-[56px] w-6 h-[7px] rounded-l-full"></div>
                    </div>

                    {/* Event Card */}
                    <div
                      className={`flex-1 border-2 rounded-xl p-4 ${event.color}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">{event.type_c}</span>
                        <span className="text-gray-500 text-sm">
                          {event.date_entered}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <button className="flex items-center gap-2 px-2 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                          IP
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* End Icon */}
              <div className="relative flex gap-4">
                <div className="relative z-10 w-16 flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <span className="text-xl">
                      <img
                        src="https://dev.outrightcrm.in/dev/Try_our_CRM/wp-content/uploads/images/image__7_-removebg-preview.png"
                        alt=""
                      />{" "}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

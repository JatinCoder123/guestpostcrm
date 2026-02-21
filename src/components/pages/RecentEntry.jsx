import { CalendarDays, Mail, Activity, SparkleIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useContext } from "react";
import { getEvents } from "../../store/Slices/eventSlice";
import { excludeEmail, excludeName, extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import EmailBox from "../EmailBox";
import PromptViewerModal from "../PromptViewerModal";

/* 🔹 Custom Tooltip Component */
const Tooltip = ({ content, children }) => {
  if (!content) return children;

  return (
    <div className="relative group min-w-0">
      {children}
      <div className="absolute z-50 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-1 rounded-md shadow-lg  -top-8 left-1/2 -translate-x-1/2">
        {content}
      </div>
    </div>
  );
};

export function RecentEntry() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [open, setOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showThread, setShowThread] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [email, setEmail] = useState("");

  const { setEnteredEmail, setWelcomeHeaderContent, setSearch } =
    useContext(PageContext);

  const navigateTo = useNavigate();

  useEffect(() => {
    dispatch(getEvents("all"));
  }, [dispatch]);

  if (showThread) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
        <EmailBox
          onClose={() => setShowThread(false)}
          threadId={currentThreadId}
          tempEmail={email}
        />
      </div>
    );
  }

  return (
    <>
      {open && (
        <PromptViewerModal
          promptDetails={selectedPrompt}
          onClose={() => setOpen(false)}
        />
      )}
      <div className="p-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          {/* HEADER */}
          <div className="bg-green-600 py-4 px-8">
            <div className="grid grid-cols-5 text-white text-lg font-semibold">
              <div className="flex items-center gap-2">
                <CalendarDays size={22} /> CREATED AT
              </div>
              <div>CONTACT</div>
              <div className="flex items-center gap-2">
                <Mail size={22} /> EMAIL
              </div>
              <div className="flex items-center gap-2">
                <Activity size={22} /> RECENT ACTIVITY
              </div>
              <div className="flex items-center gap-2 justify-center">
                <SparkleIcon size={22} /> PROMPT
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-8 py-4">
            {loading && <p className="text-center py-4 text-lg">Loading...</p>}

            {!loading && events.length === 0 && (
              <p className="text-center text-lg py-4">No events found</p>
            )}

            {events.map((event, index) => {
              const contactName = excludeName(event.real_name) ?? "—";
              const emailValue =
                excludeEmail(
                  event.real_name === "User" ? event.name : event.real_name,
                ) ?? "—";

              return (
                <div
                  key={index}
                  className="grid grid-cols-5 py-5 border-b text-gray-800 hover:bg-gray-50 transition"
                >
                  {/* DATE */}
                    <div
                      className="flex items-center gap-3 text-[17px] min-w-0 cursor-pointer"
                      onClick={() => {
                        const input = extractEmail(event.name);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        setWelcomeHeaderContent("Unreplied");
                        navigateTo("/");
                      }}
                    >
                      <CalendarDays
                        size={20}
                        className="text-green-700 shrink-0"
                      />
                      <span className="truncate">
                        {event.date_entered ?? "—"}
                      </span>
                    </div>
                  

                  {/* CONTACT */}
                  <Tooltip content={contactName}>
                    <div
                      className="text-[17px] text-blue-600 cursor-pointer truncate min-w-0"
                      onClick={() => {
                        const input = excludeName(event.real_name);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        setWelcomeHeaderContent("Unreplied");
                        navigateTo("/contacts");
                      }}
                    >
                      {contactName}
                    </div>
                  </Tooltip>

                  {/* EMAIL */}
                  <Tooltip content={emailValue}>
                    <div
                      className="flex items-center gap-2 text-[17px] text-blue-600 underline cursor-pointer min-w-0"
                      onClick={() => {
                        const input = excludeEmail(event.real_name);
                        localStorage.setItem("email", input);
                        setSearch(input);
                        setEnteredEmail(input);
                        setWelcomeHeaderContent("Unreplied");
                        setShowThread(true);
                        setCurrentThreadId(event.thread_id);
                        setEmail(input);
                      }}
                    >
                      <Mail size={20} className="shrink-0" />
                      <span className="truncate">{emailValue}</span>
                    </div>
                  </Tooltip>

                  {/* RECENT ACTIVITY */}
                  <Tooltip content={event.recent_activity}>
                    <div className="text-[17px] truncate min-w-0 ml-6">
                      {event.recent_activity ?? "—"}
                    </div>
                  </Tooltip>

                  {/* PROMPT */}
                  <div className="flex items-center justify-center">
                    {event?.prompt_details && (
                      <button
                        onClick={() => {
                          setSelectedPrompt(event.prompt_details);
                          setOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <SparkleIcon size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
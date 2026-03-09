import {
  CalendarDays,
  Mail,
  Activity,
  SparkleIcon,
  UserCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useContext } from "react";
import { getEvents } from "../../store/Slices/eventSlice";
import { excludeEmail, excludeName, extractEmail } from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import PromptViewerModal from "../PromptViewerModal";
import { useThreadContext } from "../../hooks/useThreadContext";

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
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");
  const { setEnteredEmail, setWelcomeHeaderContent, setSearch } =
    useContext(PageContext);
  const { handleMove } = useThreadContext()
  const navigateTo = useNavigate();

  useEffect(() => {
    dispatch(getEvents("all"));
  }, [dispatch]);



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
          {/* SEARCH + FILTER BAR */}
          <div className="p-4 border border-green-200 bg-gradient-to-r from-green-50 via-white to-green-50 flex flex-wrap gap-4 items-center justify-center rounded-xl shadow-md hover:shadow-green-200/50 transition-all duration-300">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-5 py-2.5 bg-white border border-green-200 
  rounded-xl shadow-sm 
  focus:outline-none focus:ring-2 focus:ring-green-400 
  focus:border-green-400 focus:shadow-green-200/50 
  transition-all duration-300"
            />
          </div>
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
              <div className="flex items-center gap-2 justify-center">USER</div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-8 py-4">
            {loading && <p className="text-center py-4 text-lg">Loading...</p>}

            {!loading && events.length === 0 && (
              <p className="text-center text-lg py-4">No events found</p>
            )}

            {events
              ?.filter((event) => {
                const search = searchTerm.toLowerCase();

                const emailValue = excludeEmail(
                  event.real_name === "User" ? event.name : event.real_name,
                );

                // 🔍 Search match
                const matchesSearch =
                  event?.recent_activity?.toLowerCase().includes(search) ||
                  event?.real_name?.toLowerCase().includes(search) ||
                  event?.name?.toLowerCase().includes(search);

                // 📧 Email filter
                const matchesEmail =
                  emailFilter === "all" || emailValue === emailFilter;
                return matchesSearch && matchesEmail;
              })

              ?.map((event, index) => {
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
                        setWelcomeHeaderContent("Recent");
                        navigateTo("/");
                      }}
                    >
                      <span className="truncate">
                        {event.date_entered ?? "—"}
                      </span>
                      <div className="flex items-center justify-center">
                        {event?.prompt_details && (
                          <button
                            onClick={() => {
                              setSelectedPrompt(event.prompt_details);
                              setOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <SparkleIcon size={16} />
                          </button>
                        )}
                      </div>
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
                          setWelcomeHeaderContent("Recent");
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
                          setWelcomeHeaderContent("Recent");
                          handleMove({ email: input, threadId: event.thread_id })
                        }}
                      >
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
                      <UserCircle size={20} />
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

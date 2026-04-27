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
import {
  excludeEmail,
  excludeName,
  extractEmail,
  periodOptions,
} from "../../assets/assets";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { useThreadContext } from "../../hooks/useThreadContext";
import DropDown from "../DropDown";
import useModule from "../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../store/constants";
import { CustomDropdown } from "./settingpages/PromptTestingPage";

/* 🔹 Custom Tooltip Component */
const Tooltip = ({ content, children }) => {
  if (!content) return children;

  return (
    <div className="relative group min-w-0">
      {children}
      <div className="absolute z-50 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-1 rounded-md shadow-lg -top-8 left-1/2 -translate-x-1/2">
        {content}
      </div>
    </div>
  );
};

export function RecentEntry() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const { crmEndpoint } = useSelector((state) => state.user);
  const { loading: grpLoading, data: grpData } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "outr_ledger_manager",
    },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
    name: `Activity Group`,
  });
  // ✅ Updated states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrp, setSelectedGrp] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState(null);

  const { handleDateClick } = useContext(PageContext);
  const { handleMove } = useThreadContext();
  const navigateTo = useNavigate();

  // 🔥 Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 🔥 API call (optimized)
  useEffect(() => {
    dispatch(getEvents({ search: debouncedSearch, timeFilter }));
  }, [dispatch, debouncedSearch, timeFilter]);

  const handleSelectPeriod = (option) => {
    setTimeFilter(option);
  };

  return (
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

          <DropDown
            options={periodOptions}
            handleSelectOption={handleSelectPeriod}
            timeline={timeFilter}
          />
          <CustomDropdown
            className="w-[240px]"
            onChange={(value) => { setSelectedGrp(value), setSearchTerm(value) }}
            value={selectedGrp}
            options={grpData?.map(grp => ({ value: grp.name, label: grp.description }))}
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
            <div className="flex items-center gap-2 justify-center">
              USER
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-4">
          {loading && (
            <p className="text-center py-4 text-lg">Loading...</p>
          )}

          {!loading && events.length === 0 && (
            <p className="text-center text-lg py-4">
              No events found
            </p>
          )}

          {events?.map((event, index) => {
            const contactName = excludeName(event.real_name) ?? "—";
            const emailValue =
              excludeEmail(
                event.real_name === "User"
                  ? event?.name
                  : event.real_name
              ) ?? "—";

            return (
              <div
                key={index}
                className="grid grid-cols-5 py-5 border-b text-gray-800 hover:bg-gray-50 transition"
              >
                {/* DATE */}
                <div
                  className="flex items-center gap-3 text-[17px] min-w-0 cursor-pointer"
                  onClick={() =>
                    handleDateClick({
                      email: extractEmail(event?.real_name),
                      navigate: "/",
                    })
                  }
                >
                  <span className="truncate">
                    {event.date_entered ?? "—"}
                  </span>

                  <div className="flex items-center justify-center">
                    {event?.prompt_details && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          navigateTo("/settings/debugging", {
                            state: { prompt: event.prompt_details[0] },
                          });
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
                    onClick={() =>
                      handleDateClick({
                        email: extractEmail(event?.real_name),
                        navigate: "/contacts",
                      })
                    }
                  >
                    {contactName}
                  </div>
                </Tooltip>

                {/* EMAIL */}
                <Tooltip content={emailValue}>
                  <div
                    className="flex items-center gap-2 text-[17px] text-blue-600 underline cursor-pointer min-w-0"
                    onClick={() => {
                      handleMove({
                        email: extractEmail(event?.real_name),
                        threadId: event.thread_id,
                      });
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

                {/* USER */}
                <div className="flex items-center justify-center gap-2">
                  <UserCircle size={20} />
                  {(event.user_details == false && "GPC") ||
                    event?.user_details?.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
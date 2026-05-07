import {
  CalendarDays,
  Mail,
  Activity,
  SparkleIcon,
  UserCircle,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { getEvents } from "../../store/Slices/eventSlice";

import { excludeName, extractEmail, periodOptions } from "../../assets/assets";

import { PageContext } from "../../context/pageContext";
import { useThreadContext } from "../../hooks/useThreadContext";

import DropDown from "../DropDown";
import useModule from "../../hooks/useModule";

import { CREATE_DEAL_API_KEY } from "../../store/constants";

import { CustomDropdown } from "./settingpages/PromptTestingPage";

import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";

/* 🔹 Tooltip */
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

  const { events } = useSelector((state) => state.events);

  const { crmEndpoint } = useSelector((state) => state.user);

  const { loading: grpLoading, data: grpData } = useModule({
    url: `${
      crmEndpoint.split("?")[0]
    }?entryPoint=get_post_all&action_type=get_data`,
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrp, setSelectedGrp] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState(null);

  const { handleDateClick } = useContext(PageContext);

  const { handleMove } = useThreadContext();

  const navigateTo = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(getEvents({ search: debouncedSearch, timeFilter }));
  }, [dispatch, debouncedSearch, timeFilter]);

  const handleSelectPeriod = (option) => {
    setTimeFilter(option);
  };

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      icon: CalendarDays,

      render: (event) => (
        <div
          className="flex items-center gap-3 min-w-0 cursor-pointer"
          onClick={() =>
            handleDateClick({
              email: extractEmail(event?.real_name),
              navigate: "/",
            })
          }
        >
          <span className="truncate">{event.date_entered ?? "—"}</span>

          {event?.prompt_details?.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                navigateTo("/settings/machine-learning", {
                  state: {
                    prompt: event.prompt_details[0],
                  },
                });
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <SparkleIcon size={16} />
            </button>
          )}
        </div>
      ),
    },

    {
      label: "Contact",
      accessor: "real_name",

      render: (event) => {
        const contactName = excludeName(event.real_name) ?? "—";

        return (
          <Tooltip content={contactName}>
            <div
              className="text-blue-600 cursor-pointer truncate"
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
        );
      },
    },

    {
      label: "Email",
      accessor: "email",
      icon: Mail,

      render: (event) => {
        const emailValue =
          extractEmail(
            event.real_name === "User" ? event?.name : event.real_name,
          ) ?? "—";

        return (
          <Tooltip content={emailValue}>
            <div
              className="flex items-center gap-2 text-blue-600 underline cursor-pointer truncate"
              onClick={() =>
                handleMove({
                  email: extractEmail(event?.real_name),
                  threadId: event.thread_id,
                })
              }
            >
              {emailValue}
            </div>
          </Tooltip>
        );
      },
    },

    {
      label: "Recent Activity",
      accessor: "recent_activity",
      icon: Activity,

      render: (event) => (
        <Tooltip content={event.recent_activity}>
          <div className="truncate">{event.recent_activity ?? "—"}</div>
        </Tooltip>
      ),
    },

    {
      label: "User",
      accessor: "user",
      icon: UserCircle,

      render: (event) => (
        <div className="flex items-center gap-2">
          <UserCircle size={18} />

          {(event.user_details == false && "GPC") || event?.user_details?.name}
        </div>
      ),
    },
  ];

  return (
    <TableView
      tableData={events}
      tableName={"Recent Entries"}
      columns={columns}
      slice={"events"}
    >
      <TableTitleBar
        Icon={Activity}
        title={"Recent Entries"}
        titleClass={"text-green-600"}
      />

      {/* FILTERS */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-gray-50">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />

        <DropDown
          options={periodOptions}
          handleSelectOption={handleSelectPeriod}
          timeline={timeFilter}
        />

        <CustomDropdown
          className="w-[240px]"
          onChange={(value) => {
            setSelectedGrp(value);
            setSearchTerm(value);
          }}
          value={selectedGrp}
          options={grpData?.map((grp) => ({
            value: grp.name,
            label: grp.description,
          }))}
        />
      </div>

      <Table headerStyle={"bg-green-600"} layoutStyle={"grid grid-cols-5"} />
    </TableView>
  );
}

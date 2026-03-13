import React, { useEffect, useMemo, useState, useRef } from "react";
import { CREATE_DEAL_API_KEY } from "../../../store/constants.js";
import useModule from "../../../hooks/useModule.js";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const getToday = () => new Date().toISOString().split("T")[0];

const TABS = [
  { key: "error", label: "Error Logs", module: "outr_error_logs" },
  { key: "gpc", label: "GPC Request / Response", module: "outr_request_and_response" },
  { key: "api", label: "Gmail/ChatGPT/Paypal/MOZ", module: "outr_request_and_response" },
  { key: "prompt", label: "Prompt Ledger", module: "outr_prompt_ledger" },
];

const IMPORTANT_COLUMNS = {
  error: ["date_entered", "email", "log_level", "file_path", "description"],
  api: ["date_entered", "email", "name", "request", "response"],
  gpc: ["date_entered", "email", "name", "request", "response"],
  prompt: ["date_entered", "email", "name", "full_prompt", "response"],
};

const HIDDEN_FIELDS = [
  "id",
  "modified_user_id",
  "created_by",
  "deleted",
  "parent_type",
  "assigned_user_id",
  "date_modified",
  "static_prompt",
];

const TIME_FILTERS = [
  { label: "All", value: "all" },
  { label: "Last 1 Min", value: 1 },
  { label: "Last 5 Min", value: 5 },
  { label: "Last 10 Min", value: 10 },
];

const Debug = () => {

  const { state } = useLocation();
  const navigateTo = useNavigate();

  const [activeTab, setActiveTab] = useState(TABS[3]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [timeline, setTimeline] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [emailSearch, setEmailSearch] = useState("");

  const modalRef = useRef(null);

  const { crmEndpoint } = useSelector((state) => state.user);

  const { loading, data, error, refetch } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: activeTab.module },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: activeTab.label,
  });

  useEffect(() => {
    refetch();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab.key !== "prompt") return;
    if (state?.prompt) setSelectedRecord(state?.prompt);
  }, [loading, data, state?.promptId, activeTab]);

  /* set timeline based on date */
  useEffect(() => {

    const today = getToday();

    if (selectedDate === today) {
      setTimeline(1);
    } else {
      setTimeline("all");
    }

  }, [selectedDate]);

  /* CLICK OUTSIDE MODAL */
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (state?.prompt) navigateTo(-1);
        setSelectedRecord(null);
      }
    };

    if (selectedRecord) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [selectedRecord]);

  /* ESC CLOSE */
  useEffect(() => {

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (state?.prompt) navigateTo(-1);
        setSelectedRecord(null);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);

  }, []);

  const columns = useMemo(() => {
    return IMPORTANT_COLUMNS[activeTab.key] || [];
  }, [activeTab]);

  const truncate = (text, limit = 80) => {
    if (!text) return "-";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const isLargeField = (key) => {
    return ["request", "response", "full_prompt", "description"].includes(key);
  };

  /* FILTERING LOGIC */
  const filteredData = useMemo(() => {

    if (!data) return [];

    return data.filter((row) => {

      const email = (row.email || "").toLowerCase();

      /* EMAIL SEARCH */
      if (emailSearch && !email.includes(emailSearch.toLowerCase())) {
        return false;
      }

      if (!row.date_entered) return true;

      const parsed = row.date_entered.replace(" ", "T");
      const rowDate = new Date(parsed);

      if (isNaN(rowDate)) return true;

      const now = new Date();

      /* TIMELINE FILTER */
      if (timeline !== "all") {
        const diffMinutes = (now - rowDate) / 60000;
        if (diffMinutes > timeline) return false;
      }

      /* DATE FILTER */
      if (selectedDate) {

        const selected = new Date(selectedDate);

        if (
          rowDate.getFullYear() !== selected.getFullYear() ||
          rowDate.getMonth() !== selected.getMonth() ||
          rowDate.getDate() !== selected.getDate()
        ) {
          return false;
        }

      }

      return true;

    });

  }, [data, timeline, selectedDate, emailSearch]);

  return (
    <div className="p-6 space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab.key === tab.key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-6 flex-wrap">

        {/* Email Search */}
        <div className="flex items-center gap-3 bg-gray-100 border rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Email</span>

          <div className="relative">
            <input
              type="text"
              placeholder="Search email..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="bg-white border rounded-md px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-blue-500"
            />

            {emailSearch && (
              <button
                onClick={() => setEmailSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3 bg-gray-100 border rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Timeline</span>

          <select
            value={timeline}
            onChange={(e) => {
              const value =
                e.target.value === "all" ? "all" : Number(e.target.value);
              setTimeline(value);
            }}
            className="bg-white border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {TIME_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 bg-gray-100 border rounded-xl px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Date</span>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">

        {loading && (
          <div className="p-6 text-sm text-gray-500">
            Loading {activeTab.label}...
          </div>
        )}

        {error && (
          <div className="p-6 text-sm text-red-600">
            Failed to load data
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && (

          <table className="min-w-full text-sm">

            <thead className="bg-gray-100 text-left">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 font-semibold text-gray-600">
                    {col.replace(/_/g, " ").toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedRecord(row)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 max-w-xs truncate">
                      {truncate(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>

        )}

        {!loading && !error && filteredData.length === 0 && (
          <div className="p-6 text-sm text-gray-500">
            No records found.
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >

            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                Record Details
              </h2>

              <button
                onClick={() => {
                  if (state?.prompt) navigateTo(-1);
                  setSelectedRecord(null);
                }}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

              {Object.entries(selectedRecord)
                .filter(([key]) => !HIDDEN_FIELDS.includes(key))
                .map(([key, value]) => {

                  const large = isLargeField(key);

                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 bg-gray-50 ${large ? "md:col-span-2" : ""
                        }`}
                    >

                      <div className="text-xs text-gray-500 mb-1">
                        {key.replace(/_/g, " ").toUpperCase()}
                      </div>

                      {large ? (
                        <textarea
                          readOnly
                          value={
                            typeof value === "object"
                              ? JSON.stringify(value, null, 2)
                              : String(value)
                          }
                          className="w-full h-40 text-xs font-mono bg-black text-green-400 p-3 rounded"
                        />
                      ) : (
                        <div className="text-sm break-words">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </div>
                      )}

                    </div>
                  );

                })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Debug;
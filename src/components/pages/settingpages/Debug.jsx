import React, { useEffect, useMemo, useState } from "react";
import { CREATE_DEAL_API_KEY } from "../../../store/constants.js";
import useModule from "../../../hooks/useModule.js";
import { useSelector } from "react-redux";

const TABS = [
  {
    key: "error",
    label: "Error Logs",
    module: "outr_error_logs",
  },
  {
    key: "api",
    label: "API Request / Response",
    module: "outr_request_and_response",
  },
  {
    key: "prompt",
    label: "Prompt Ledger",
    module: "outr_prompt_ledger",
  },
];

const IMPORTANT_COLUMNS = {
  error: ["date_entered", "log_level", "file_path", "description"],
  api: ["date_entered", "name", "request", "response"],
  prompt: ["date_entered", "name", "full_prompt", "response"],
};

const Debug = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const { crmEndpoint } = useSelector((state) => state.user);

  const { loading, data, error, refetch } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: activeTab.module,
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: activeTab.label,
  });

  useEffect(() => {
    refetch();
  }, [activeTab]);

  const columns = useMemo(() => {
    return IMPORTANT_COLUMNS[activeTab.key] || [];
  }, [activeTab]);

  const truncate = (text, limit = 80) => {
    if (!text) return "-";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab.key === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        {loading && (
          <div className="p-6 text-sm text-gray-500">
            Loading {activeTab.label}...
          </div>
        )}

        {error && (
          <div className="p-6 text-sm text-red-600">Failed to load data</div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 font-semibold text-gray-600"
                  >
                    {col.replace(/_/g, " ").toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
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

        {!loading && !error && (!data || data.length === 0) && (
          <div className="p-6 text-sm text-gray-500">No records found.</div>
        )}
      </div>
    </div>
  );
};

export default Debug;

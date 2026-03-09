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

/* fields we never want to show in popup */
const HIDDEN_FIELDS = [
  "id",
  "modified_user_id",
  "created_by",
  "deleted",
  "parent_type",
  "assigned_user_id",
];

const Debug = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  const isLargeField = (key) => {
    const largeFields = ["request", "response", "full_prompt", "description"];
    return largeFields.includes(key);
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

      {/* Table */}
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
                <tr
                  key={index}
                  onClick={() => setSelectedRecord(row)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
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

        {!loading && !error && (!data || data.length === 0) && (
          <div className="p-6 text-sm text-gray-500">No records found.</div>
        )}
      </div>

      {/* Popup Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Record Details</h2>

              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedRecord)
                .filter(([key]) => !HIDDEN_FIELDS.includes(key))
                .map(([key, value]) => {
                  const large = isLargeField(key);

                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 bg-gray-50 ${
                        large ? "md:col-span-2" : ""
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
                          className="w-full h-40 text-xs font-mono bg-black text-green-400 p-3 rounded resize-y"
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

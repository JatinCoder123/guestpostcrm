import React, { useMemo, useState } from "react";
import { CREATE_DEAL_API_KEY } from "../../store/constants";
import { useSelector } from "react-redux";
import useModule from "../../hooks/useModule";

const ErrorLogPage = () => {
  const { crmEndpoint } = useSelector((state) => state.user);
  const [selectedLog, setSelectedLog] = useState(null);
  const [search, setSearch] = useState("");

  const { loading, data, error, refetch } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: "outr_error_logs" },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "Error Logs",
  });

  const logs = useMemo(() => {
    if (!data) return [];
    return data?.data || data || [];
  }, [data]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      log.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [logs, search]);

  const trimText = (text, limit = 80) => {
    if (!text) return "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const getBadge = (level) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";

    if (level === "error") return `${base} bg-red-100 text-red-700`;
    if (level === "warning") return `${base} bg-yellow-100 text-yellow-700`;
    return `${base} bg-blue-100 text-blue-700`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Error Logs</h1>

        <div className="flex gap-3">
          <input
            placeholder="Search logs..."
            className="border px-4 py-2 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-blue-500 text-lg">Loading logs...</div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Failed to fetch logs
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">File Path</th>
                <th className="p-4 text-left">Log Level</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}

              {filteredLogs.map((log, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{log.name}</td>

                  <td className="p-4 text-gray-700">
                    {trimText(log.description, 90)}
                  </td>

                  <td className="p-4 text-gray-500 text-xs break-all">
                    {log.file_path}
                  </td>

                  <td className="p-4">
                    <span className={getBadge(log.log_level)}>
                      {log.log_level}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[750px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedLog.name}
                </h2>

                <span
                  className={`inline-block mt-1 px-3 py-1 text-xs rounded-full ${
                    selectedLog.log_level === "error"
                      ? "bg-red-100 text-red-700"
                      : selectedLog.log_level === "warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedLog.log_level}
                </span>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Description
                </h3>

                <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedLog.description}
                </div>
              </div>

              {/* File Path */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  File Path
                </h3>

                <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg break-all">
                  {selectedLog.file_path}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorLogPage;

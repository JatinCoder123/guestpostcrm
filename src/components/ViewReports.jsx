import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ViewReports() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const {timeline} =  useSelector(state=>state.ladger)

  const fetchReports = async () => {
    setLoading(true);
    


    try {
      // Default API → yesterday data
      const url =
        `https://example.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=report&duration=${timeline}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json?.success && Array.isArray(json.data)) {
        setRows(json.data);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("Failed to load reports", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

//   useEffect(() => {
//     fetchReports();
//   }, []);

useEffect(() => {
  if (timeline) {
    fetchReports();
  }
}, [timeline]);

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-semibold">
          Reports 
        </h1>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading reports…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No data found
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 border-b">
                    Action
                  </th>
                  <th className="text-right px-4 py-2 border-b">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 border-b text-gray-700">
                      {row.action}
                    </td>
                    <td className="px-4 py-2 border-b text-right font-semibold text-gray-900">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ArrowLeft, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GROUP_COLORS = {
  Reminder: "bg-teal-500",
  "Email-Accepted": "bg-blue-500",
  Deal: "bg-blue-600",
  Order: "bg-amber-400",
  Offer: "bg-amber-500",
  "Email-Rejected": "bg-slate-500",
};

const DEFAULT_COLOR = "bg-gray-500";

function groupByDescription(data = []) {
  const map = {};
  data.forEach((row) => {
    const key = row.description;
    if (!map[key]) map[key] = [];
    map[key].push(row);
  });
  return map;
}

export default function ViewReports() {
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null);
  const [baseSummary, setBaseSummary] = useState(null); // 🔥 added
  const [loading, setLoading] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const { crmEndpoint } = useSelector((state) => state.user);
  const { timeline } = useSelector((state) => state.ladger);

  const rows = apiResponse?.data ?? [];
  const grouped = groupByDescription(rows);

  // 🔥 always use baseSummary for cards
  const summarySource = baseSummary || apiResponse;

  const grandTotal = rows.reduce((sum, r) => sum + (parseInt(r.total) || 0), 0);

  const gpcActivity =
    summarySource?.user_summary?.find((u) => u.user_id === "")?.total ?? 0;

  const userActivities =
    summarySource?.user_summary?.filter((u) => u.user_id !== "") ?? [];

  const totalActivity =
    summarySource?.user_summary?.reduce(
      (s, u) => s + (parseInt(u.total) || 0),
      0,
    ) ?? 0;

  const inboundTotal = (summarySource?.data || [])
    .filter((r) => r.action === "Email-Recieved")
    .reduce((s, r) => s + (parseInt(r.total) || 0), 0);

  const outboundTotal = (summarySource?.data || [])
    .filter((r) => r.action === "Email-Reply-Sent")
    .reduce((s, r) => s + (parseInt(r.total) || 0), 0);

  // ── fetch ─────────────────────────────────────────────────────────────
  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = `${crmEndpoint}&type=report&filter=${timeline}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.success) {
        setApiResponse(json);
        setBaseSummary(json); // 🔥 store original
      } else {
        setApiResponse(null);
      }
    } catch {
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FILTER FETCH (only table changes)
  const fetchFiltered = async (params) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        type: "report",
        filter: timeline,
        ...params,
      }).toString();

      const url = `${crmEndpoint}&${query}`;
      const res = await fetch(url);
      const json = await res.json();

      setApiResponse(json?.success ? json : null);
    } catch {
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeline) fetchReports();
  }, [timeline]);

  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGroupClick = (description) => {
    navigate(`/view-reports/${encodeURIComponent(description)}`);
  };

  // ── cards ─────────────────────────────────────────────────────────────
  const topCards = [
    {
      label: "New",
      value: summarySource?.new ?? 0,
    },
    {
      label: "Inbound",
      value: inboundTotal,
      onClick: () => handleGroupClick("Email-Recieved"),
    },
    {
      label: "Outbound",
      value: outboundTotal,
      onClick: () => handleGroupClick("Email-Reply-Sent"),
    },
    {
      label: "Offers",
      value: summarySource?.offer_count ?? 0,
      onClick: () => navigate("/offers"),
    },
    {
      label: "Deals",
      value: summarySource?.deal_count ?? 0,
      onClick: () => navigate("/deals"),
    },
    {
      label: "Orders",
      value: summarySource?.order_count ?? 0,
      onClick: () => navigate("/orders"),
    },
  ];

  const bottomCards = [
    {
      label: "First Reply Sent",
      value:
        summarySource?.data?.find((r) => r.action === "First-Reply-Sent")
          ?.total ?? 0,
      onClick: () => handleGroupClick("First-Reply-Sent"),
    },
    {
      label: "GPC Activity",
      value: gpcActivity,
      onClick: () => fetchFiltered({ user_id: "gpc" }),
    },
    ...userActivities.map((u) => ({
      label: `${u.username} Activity`,
      value: u.total,
      onClick: () => fetchFiltered({ user_id: u.user_id }),
    })),
    {
      label: "Total Activity",
      value: totalActivity,
      onClick: fetchReports,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">GPC Report</h1>
            {apiResponse?.filter_applied && (
              <p className="text-sm text-gray-500 mt-0.5">
                Filter:{" "}
                <span className="capitalize">{apiResponse.filter_applied}</span>
              </p>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setOpenExport((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <Download size={18} />
            Export
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-3">
        {topCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      {/* BOTTOM CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {bottomCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      {/* GROUPED UI (UNCHANGED) */}
      {loading ? (
        <p className="p-4 text-[18px]">Loading data...</p>
      ) : rows.length === 0 ? (
        <p className="p-4 text-[18px]">No data available.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(grouped).map(([description, groupRows]) => {
            const subtotal = groupRows.reduce(
              (s, r) => s + (parseInt(r.total) || 0),
              0,
            );
            const isOpen = openGroups[description];
            const colorClass = GROUP_COLORS[description] ?? DEFAULT_COLOR;

            return (
              <div
                key={description}
                className="rounded-xl overflow-hidden shadow-sm"
              >
                <div
                  className={`${colorClass} text-white flex justify-between items-center px-5 py-3 cursor-pointer`}
                  onClick={() => toggleGroup(description)}
                >
                  <span className="font-semibold text-[15px]">
                    {description}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      Subtotal: {subtotal}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGroupClick(description);
                      }}
                    >
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <table className="w-full text-[15px] bg-white">
                    <tbody>
                      {groupRows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`${row.action}`)}
                        >
                          <td className="px-5 py-2.5">{row.action}</td>
                          <td className="px-5 py-2.5 text-right font-medium">
                            {row.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}

          <div className="flex justify-between items-center bg-gray-800 text-white px-5 py-3 rounded-xl font-semibold">
            <span>Grand Total</span>
            <span>{grandTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-xl shadow-sm p-4"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  );
}

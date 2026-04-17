import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  X,
} from "lucide-react";
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

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function todayStr() {
  return toDateInput(new Date());
}

export default function ViewReports() {
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null);
  const [baseSummary, setBaseSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const [fromDate, setFromDate] = useState(todayStr());
  const [fromTime, setFromTime] = useState("00:01");
  const [toDate, setToDate] = useState(todayStr());
  const [toTime, setToTime] = useState("23:59");
  const [filterActive, setFilterActive] = useState(false);

  const { crmEndpoint } = useSelector((state) => state.user);
  const { timeline } = useSelector((state) => state.ladger);

  const rows = apiResponse?.data ?? [];
  const grouped = groupByDescription(rows);

  const summarySource = baseSummary;

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

  // ── URL builders ──────────────────────────────────────────────────
  const buildUrl = (fd, ft, td, tt, extraParams = {}) => {
    const base = new URLSearchParams({
      type: "report",
      filter: timeline,
      from: fd,
      from_time: `${ft}:00`,
      to: td,
      to_time: `${tt}:59`,
      ...extraParams,
    }).toString();
    return `${crmEndpoint}&${base}`;
  };

  const buildPlainUrl = (extraParams = {}) => {
    const base = new URLSearchParams({
      type: "report",
      filter: timeline,
      ...extraParams,
    }).toString();
    return `${crmEndpoint}&${base}`;
  };

  // ── fetchers ──────────────────────────────────────────────────────
  const fetchSummary = async (fd = null, ft = null, td = null, tt = null) => {
    try {
      let url =
        fd && ft && td && tt
          ? buildUrl(fd, ft, td, tt)
          : `${crmEndpoint}&type=report&filter=${timeline}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json?.success) setBaseSummary(json);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const fetchTable = async (fd, ft, td, tt, extraParams = {}) => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(fd, ft, td, tt, extraParams));
      const json = await res.json();
      setApiResponse(json?.success ? json : null);
    } catch {
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTablePlain = async (extraParams = {}) => {
    setLoading(true);
    try {
      const res = await fetch(buildPlainUrl(extraParams));
      const json = await res.json();
      setApiResponse(json?.success ? json : null);
    } catch {
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter Handlers ───────────────────────────────────────────────
  const handleApplyFilter = () => {
    setFilterActive(true);
    fetchSummary(fromDate, fromTime, toDate, toTime);
    fetchTable(fromDate, fromTime, toDate, toTime);
  };

  const handleResetFilter = () => {
    const today = todayStr();
    setFromDate(today);
    setFromTime("00:01");
    setToDate(today);
    setToTime("23:59");
    setFilterActive(false);

    fetchSummary();
    fetchTablePlain();
  };

  useEffect(() => {
    if (timeline) {
      fetchSummary();
      if (filterActive) {
        fetchSummary(fromDate, fromTime, toDate, toTime);
        fetchTable(fromDate, fromTime, toDate, toTime);
      } else {
        fetchTablePlain();
      }
    }
  }, [timeline]);

  // ── Export Functions ──────────────────────────────────────────────

  const exportToPDF = () => {
    if (rows.length === 0) {
      alert("No data to export!");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text("GPC Report", pageWidth / 2, 20, { align: "center" });

    // Add filter info
    const filterText = filterActive
      ? `Period: ${fromDate} ${fromTime} - ${toDate} ${toTime}`
      : "Period: Default";
    doc.setFontSize(11);
    doc.text(filterText, pageWidth / 2, 30, { align: "center" });

    let y = 40;

    // Summary Section
    doc.setFontSize(14);
    doc.text("Summary", 14, y);
    y += 10;

    const summaryData = [
      ["New", summarySource?.new ?? 0],
      ["Inbound", inboundTotal],
      ["Outbound", outboundTotal],
      ["Offers", summarySource?.offer_count ?? 0],
      ["Deals", summarySource?.deal_count ?? 0],
      ["Orders", summarySource?.order_count ?? 0],
      ["Total Activity", totalActivity],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Category", "Count"]],
      body: summaryData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    y = doc.lastAutoTable.finalY + 15;

    // Detailed Grouped Data
    doc.setFontSize(14);
    doc.text("Detailed Report", 14, y);
    y += 10;

    Object.entries(grouped).forEach(([description, groupRows]) => {
      const subtotal = groupRows.reduce(
        (s, r) => s + (parseInt(r.total) || 0),
        0,
      );

      doc.setFontSize(12);
      doc.text(`${description} (Subtotal: ${subtotal})`, 14, y);
      y += 8;

      const tableBody = groupRows.map((row) => [row.action, row.total]);

      autoTable(doc, {
        startY: y,
        head: [["Action", "Total"]],
        body: tableBody,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [52, 73, 94] },
        margin: { left: 14 },
      });

      y = doc.lastAutoTable.finalY + 12;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    // Grand Total
    doc.setFontSize(14);
    doc.text(`Grand Total: ${grandTotal}`, 14, y + 10);

    doc.save(`GPC_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setOpenExport(false);
  };

  const exportToExcel = async () => {
    if (rows.length === 0) {
      alert("No data to export!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("GPC Report");

    // Title
    worksheet.mergeCells("A1:B1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "GPC Report";
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center" };

    // Filter Info
    worksheet.mergeCells("A2:B2");
    worksheet.getCell("A2").value = filterActive
      ? `Filter: ${fromDate} ${fromTime} - ${toDate} ${toTime}`
      : "Filter: Default";

    let rowIndex = 4;

    // Summary Section
    worksheet.getCell(`A${rowIndex}`).value = "Summary";
    worksheet.getCell(`A${rowIndex}`).font = { bold: true };
    rowIndex++;

    const summaryRows = [
      ["New", summarySource?.new ?? 0],
      ["Inbound", inboundTotal],
      ["Outbound", outboundTotal],
      ["Offers", summarySource?.offer_count ?? 0],
      ["Deals", summarySource?.deal_count ?? 0],
      ["Orders", summarySource?.order_count ?? 0],
      ["Total Activity", totalActivity],
    ];

    summaryRows.forEach(([label, value]) => {
      worksheet.getCell(`A${rowIndex}`).value = label;
      worksheet.getCell(`B${rowIndex}`).value = value;
      rowIndex++;
    });

    rowIndex += 2;

    // Detailed Data
    worksheet.getCell(`A${rowIndex}`).value = "Detailed Report";
    worksheet.getCell(`A${rowIndex}`).font = { bold: true };
    rowIndex++;

    Object.entries(grouped).forEach(([description, groupRows]) => {
      const subtotal = groupRows.reduce(
        (s, r) => s + (parseInt(r.total) || 0),
        0,
      );

      worksheet.getCell(`A${rowIndex}`).value =
        `${description} (Subtotal: ${subtotal})`;
      worksheet.getCell(`A${rowIndex}`).font = { bold: true };
      rowIndex++;

      // Header
      worksheet.getCell(`A${rowIndex}`).value = "Action";
      worksheet.getCell(`B${rowIndex}`).value = "Total";
      worksheet.getRow(rowIndex).font = { bold: true };
      rowIndex++;

      groupRows.forEach((row) => {
        worksheet.getCell(`A${rowIndex}`).value = row.action;
        worksheet.getCell(`B${rowIndex}`).value = parseInt(row.total) || 0;
        rowIndex++;
      });

      rowIndex += 1;
    });

    // Grand Total
    worksheet.getCell(`A${rowIndex}`).value = "Grand Total";
    worksheet.getCell(`B${rowIndex}`).value = grandTotal;
    worksheet.getCell(`A${rowIndex}`).font = { bold: true };
    worksheet.getCell(`B${rowIndex}`).font = { bold: true };

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 25;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `GPC_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setOpenExport(false);
  };

  // ── Group Helpers ─────────────────────────────────────────────────
  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGroupClick = (description) => {
    navigate(`/view-reports/${encodeURIComponent(description)}`);
  };

  // ── Cards Data ────────────────────────────────────────────────────
  const topCards = [
    { label: "New", value: summarySource?.new ?? 0 },
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
      onClick: () =>
        filterActive
          ? fetchTable(fromDate, fromTime, toDate, toTime, { user_id: "gpc" })
          : fetchTablePlain({ user_id: "gpc" }),
    },
    ...userActivities.map((u) => ({
      label: `${u.username} Activity`,
      value: u.total,
      onClick: () =>
        filterActive
          ? fetchTable(fromDate, fromTime, toDate, toTime, {
              user_id: u.user_id,
            })
          : fetchTablePlain({ user_id: u.user_id }),
    })),
    {
      label: "Total Activity",
      value: totalActivity,
      onClick: () =>
        filterActive
          ? fetchTable(fromDate, fromTime, toDate, toTime)
          : fetchTablePlain(),
    },
  ];

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

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenExport((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            <Download size={18} />
            Export
            <ChevronDown size={16} />
          </button>

          {openExport && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
              <button
                onClick={exportToPDF}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                📄 Export as PDF
              </button>
              <button
                onClick={exportToExcel}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                📊 Export as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DATE FILTER BAR - (unchanged) */}
      <div className="bg-white border rounded-xl shadow-sm px-5 py-4 mb-4 flex flex-wrap items-end gap-4">
        <Filter size={16} className="text-gray-400 self-center mb-1" />

        {/* From Date & Time */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            From Time
          </label>
          <input
            type="time"
            value={fromTime}
            step="60"
            onChange={(e) => setFromTime(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="w-px h-8 bg-gray-200 self-end mb-1 hidden sm:block" />

        {/* To Date & Time */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            To Time
          </label>
          <input
            type="time"
            value={toTime}
            step="60"
            onChange={(e) => setToTime(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleApplyFilter}
          className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 self-end"
        >
          Apply Filter
        </button>

        {filterActive && (
          <button
            onClick={handleResetFilter}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 self-end"
          >
            <X size={14} /> Reset
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-3">
        {topCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {bottomCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      {/* Grouped Table */}
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
      className="bg-white border rounded-xl shadow-sm p-4 hover:shadow transition"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  );
}

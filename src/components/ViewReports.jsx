import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ArrowLeft, RefreshCw, ChevronDown, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ViewReports() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openExport, setOpenExport] = useState(false);

  const { timeline } = useSelector((state) => state.ladger);
  // ===== EXPORT PDF =====
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Reports (${timeline || "All Time"})`, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Action", "Total"]],
      body: rows.map((r) => [r.action, r.total]),
      foot: [["Grand Total", grandTotal]],
    });

    doc.save(`report_${timeline || "all_time"}.pdf`);
  };

  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const worksheetData = rows.map((r) => ({
      Action: r.action,
      Total: r.total,
    }));

    worksheetData.push({
      Action: "Grand Total",
      Total: grandTotal,
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, `report_${timeline || "all_time"}.xlsx`);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = `https://example.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=report&duration=${timeline}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json?.success && Array.isArray(json.data)) {
        setRows(json.data);
        console.log("Report data", json.data);
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeline) fetchReports();
  }, [timeline]);

  const grandTotal = rows.reduce(
    (sum, row) => sum + (parseInt(row.total) || 0),
    0,
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold">Reports</h1>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenExport((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <Download size={18} />
            Export
            <ChevronDown size={16} />
          </button>

          {openExport && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  exportPDF();
                  setOpenExport(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📄 Export PDF
              </button>

              <button
                onClick={() => {
                  exportExcel();
                  setOpenExport(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📊 Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Timeline */}
        <div className="bg-white border rounded-[10px] shadow-sm p-4">
          <p className="text-sm text-gray-500">Timeline</p>
          <h3 className="text-[18px] font-semibold mt-1 capitalize">
            {timeline || "All Time"}
          </h3>
        </div>

        {/* Total Records */}
        <div className="bg-white border rounded-[10px] shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Records</p>
          <h3 className="text-[18px] font-semibold mt-1">{rows.length}</h3>
        </div>

        {/* Grand Total */}
        <div className="bg-white border rounded-[10px] shadow-sm p-4">
          <p className="text-sm text-gray-500">Grand Total</p>
          <h3 className="text-[18px] font-semibold mt-1">{grandTotal}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] shadow-md">
        <div
          className="border-b px-4 py-3 font-medium text-center text-[18px]
bg-gradient-to-r from-sky-200 via-sky-100 to-yellow-100
rounded-t-[10px]
"
        >
          Report Details
        </div>

        {loading ? (
          <p className="p-4 text-[18px]">Loading data...</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-[18px]">No data available.</p>
        ) : (
          <table className="w-full text-[18px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Action</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3">{row.action}</td>
                  <td className="p-3 text-right">{row.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="p-3 text-right font-semibold">Grand Total</td>
                <td className="p-3 text-right font-semibold">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

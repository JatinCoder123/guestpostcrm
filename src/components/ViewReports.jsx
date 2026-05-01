import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Download,
  TrendingUp,
  Mail,
  Send,
  Tag,
  Handshake,
  ShoppingCart,
  Activity,
  User,
  FileSpreadsheet,
  FileText,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_COLORS = {
  Reminder: {
    header: "from-teal-500 to-teal-600",
    dot: "#14b8a6",
    light: "#f0fdfa",
    text: "#0f766e",
    badge: "#ccfbf1",
  },
  "Email-Accepted": {
    header: "from-blue-500 to-blue-600",
    dot: "#3b82f6",
    light: "#eff6ff",
    text: "#1d4ed8",
    badge: "#dbeafe",
  },
  Deal: {
    header: "from-indigo-500 to-indigo-700",
    dot: "#6366f1",
    light: "#eef2ff",
    text: "#4338ca",
    badge: "#e0e7ff",
  },
  Order: {
    header: "from-amber-400 to-amber-500",
    dot: "#f59e0b",
    light: "#fffbeb",
    text: "#b45309",
    badge: "#fef3c7",
  },
  Offer: {
    header: "from-orange-400 to-orange-500",
    dot: "#f97316",
    light: "#fff7ed",
    text: "#c2410c",
    badge: "#ffedd5",
  },
  "Email-Rejected": {
    header: "from-slate-400 to-slate-600",
    dot: "#64748b",
    light: "#f8fafc",
    text: "#475569",
    badge: "#e2e8f0",
  },
};
const DEFAULT_COLOR = {
  header: "from-gray-400 to-gray-600",
  dot: "#6b7280",
  light: "#f9fafb",
  text: "#374151",
  badge: "#f3f4f6",
};

const PRESETS = [
  { label: "Today", id: "equals" },
  { sep: true },
  { label: "Last 7 Days", id: "last7" },
  { label: "Last 30 Days", id: "last30" },
  { sep: true },
  { label: "Last Month", id: "lastMonth" },
  { sep: true },
  { label: "Is Between", id: "between" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_HDRS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => fmt(new Date());

function groupByDescription(data = []) {
  return data.reduce((map, row) => {
    (map[row.description] = map[row.description] || []).push(row);
    return map;
  }, {});
}

function fmtDisplay(dateStr, timeStr) {
  if (!dateStr) return "";
  try {
    return new Date(`${dateStr}T${timeStr || "00:00"}`).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    );
  } catch {
    return dateStr;
  }
}

function resolvePreset(id) {
  const now = new Date();
  const y = now.getFullYear(),
    m = now.getMonth(),
    day = now.getDate();
  let from,
    ft = "00:00",
    to,
    tt = "23:59";
  switch (id) {
    case "equals":
      from = to = todayStr();
      ft = "00:01";
      break;
    case "last7":
      from = fmt(new Date(y, m, day - 7));
      to = todayStr();
      break;
    case "last30":
      from = fmt(new Date(y, m, day - 30));
      to = todayStr();
      break;
    case "lastMonth":
      from = fmt(new Date(y, m - 1, 1));
      to = fmt(new Date(y, m, 0));
      break;
    case "lastYear":
      from = `${y - 1}-01-01`;
      to = `${y - 1}-12-31`;
      break;
    default:
      from = todayStr();
      to = fmt(new Date(y, m, day + 7));
  }
  return { from, ft, to, tt };
}

function dtFromStrings(dateStr, timeStr) {
  if (!dateStr) return {};
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mn] = (timeStr || "00:00").split(":").map(Number);
  return { year: y, month: mo - 1, day: d, hour: h, min: mn };
}

function dtToStrings(dt) {
  return {
    date: `${dt.year}-${pad(dt.month + 1)}-${pad(dt.day)}`,
    time: `${pad(dt.hour ?? 0)}:${pad(dt.min ?? 0)}`,
  };
}

function fmtDtDisplay(dt) {
  if (!dt?.year) return "Select date";
  return `${pad(dt.day)} ${MONTH_SHORT[dt.month]} ${dt.year}  ${pad(dt.hour ?? 0)}:${pad(dt.min ?? 0)}`;
}

function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// ─────────────────────────────────────────────────────────────────────────────
// ClockFace
// ─────────────────────────────────────────────────────────────────────────────

function ClockFace({ hour, min, pickingHour, onPickHour, onPickMin }) {
  const cx = 90,
    cy = 90,
    R = 76;
  const items = pickingHour
    ? Array.from({ length: 12 }, (_, i) => {
        const lbl = i === 0 ? 12 : i;
        const ang = (i / 12) * 360 - 90;
        const [x, y] = polar(cx, cy, R - 14, ang);
        return {
          x,
          y,
          lbl: String(lbl),
          sel: hour % 12 === i,
          onClick: () => onPickHour(i),
        };
      })
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((mv, i) => {
        const ang = (i / 12) * 360 - 90;
        const [x, y] = polar(cx, cy, R - 14, ang);
        return {
          x,
          y,
          lbl: pad(mv),
          sel: min === mv,
          onClick: () => onPickMin(mv),
        };
      });

  const [hx, hy] = polar(cx, cy, 44, ((hour % 12) / 12) * 360 - 90);
  const [mx, my] = polar(cx, cy, 60, (min / 60) * 360 - 90);

  return (
    <svg viewBox="0 0 180 180" className="w-full h-full">
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      {Array.from({ length: 60 }).map((_, i) => {
        const ang = (i / 60) * 360 - 90;
        const [x1, y1] = polar(cx, cy, i % 5 === 0 ? R - 5 : R - 2.5, ang);
        const [x2, y2] = polar(cx, cy, R - 0.5, ang);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 5 === 0 ? "#cbd5e1" : "#e2e8f0"}
            strokeWidth={i % 5 === 0 ? "1.5" : "0.8"}
          />
        );
      })}
      {items.map((it, i) => (
        <g key={i} onClick={it.onClick} style={{ cursor: "pointer" }}>
          <circle
            cx={it.x.toFixed(1)}
            cy={it.y.toFixed(1)}
            r="13"
            fill={it.sel ? "#1d4ed8" : "transparent"}
          />
          <text
            x={it.x.toFixed(1)}
            y={(it.y + 4.5).toFixed(1)}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight={it.sel ? "700" : "400"}
            fill={it.sel ? "#fff" : "#374151"}
          >
            {it.lbl}
          </text>
        </g>
      ))}
      <line
        x1={cx}
        y1={cy}
        x2={hx.toFixed(1)}
        y2={hy.toFixed(1)}
        stroke={pickingHour ? "#1d4ed8" : "#94a3b8"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={mx.toFixed(1)}
        y2={my.toFixed(1)}
        stroke={!pickingHour ? "#1d4ed8" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="#1d4ed8" />
      <circle cx={cx} cy={cy} r="2" fill="#fff" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DateTimePicker  — inline, no portal
// ─────────────────────────────────────────────────────────────────────────────

function DateTimePicker({
  value,
  onChange,
  onClose,
  defaultHour = 0,
  defaultMin = 1,
}) {
  const [step, setStep] = useState("date");
  const [pickingHour, setPickingHour] = useState(true);
  const [navYear, setNavYear] = useState(
    value?.year ?? new Date().getFullYear(),
  );
  const [navMonth, setNavMonth] = useState(
    value?.month ?? new Date().getMonth(),
  );
  const today = new Date();
  const firstDay = new Date(navYear, navMonth, 1).getDay();
  const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();

  const prevMonth = () =>
    navMonth === 0
      ? (setNavMonth(11), setNavYear((y) => y - 1))
      : setNavMonth((m) => m - 1);
  const nextMonth = () =>
    navMonth === 11
      ? (setNavMonth(0), setNavYear((y) => y + 1))
      : setNavMonth((m) => m + 1);

  function selectDay(d) {
    onChange({
      ...value,
      year: navYear,
      month: navMonth,
      day: d,
      hour: value?.hour ?? defaultHour,
      min: value?.min ?? defaultMin,
    });
    setTimeout(() => {
      setStep("time");
      setPickingHour(true);
    }, 120);
  }
  function pickHour(h) {
    onChange({ ...value, hour: h });
    setTimeout(() => setPickingHour(false), 120);
  }
  function pickMin(mv) {
    onChange({ ...value, min: mv });
    setTimeout(() => onClose?.(), 100);
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tabs */}
      <div className="flex">
        {[
          ["date", "📅 Date"],
          ["time", "🕐 Time"],
        ].map(([s, lbl]) => (
          <button
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              setStep(s);
            }}
            className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-all ${
              step === s
                ? "bg-blue-700 text-white"
                : "bg-gray-50 text-gray-400 hover:text-gray-700"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* ── DATE ── */}
      {step === "date" && (
        <div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevMonth();
              }}
              className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all font-bold flex items-center justify-center text-base"
            >
              ‹
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month */}
              <div className="relative">
                <select
                  value={navMonth}
                  onChange={(e) => {
                    e.stopPropagation();
                    setNavMonth(Number(e.target.value));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none pl-2.5 pr-6 py-1.5 text-xs font-bold border border-gray-200 rounded-lg bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {MONTHS.map((mo, i) => (
                    <option key={mo} value={i}>
                      {mo}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Year */}
              <div className="relative">
                <select
                  value={navYear}
                  onChange={(e) => {
                    e.stopPropagation();
                    setNavYear(Number(e.target.value));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none pl-2.5 pr-6 py-1.5 text-xs font-bold border border-gray-200 rounded-lg bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from(
                    { length: 21 },
                    (_, i) => new Date().getFullYear() - 10 + i,
                  ).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextMonth();
              }}
              className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all font-bold flex items-center justify-center text-base"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 px-3 pt-2 pb-3">
            {DAY_HDRS.map((d) => (
              <div
                key={d}
                className="text-[9px] text-center text-gray-400 py-1 font-black tracking-widest"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isToday =
                d === today.getDate() &&
                navMonth === today.getMonth() &&
                navYear === today.getFullYear();
              const isSel =
                value?.day === d &&
                value?.month === navMonth &&
                value?.year === navYear;
              return (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectDay(d);
                  }}
                  className={`text-[11px] py-1.5 rounded-lg font-medium transition-all ${
                    isSel
                      ? "bg-blue-700 text-white shadow-sm font-bold"
                      : isToday
                        ? "ring-2 ring-blue-400 text-blue-700 font-bold"
                        : "hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TIME ── */}
      {step === "time" && (
        <div className="p-4 flex flex-col items-center gap-3">
          <div className="w-44 h-44">
            <ClockFace
              hour={value?.hour ?? defaultHour}
              min={value?.min ?? defaultMin}
              pickingHour={pickingHour}
              onPickHour={pickHour}
              onPickMin={pickMin}
            />
          </div>
          <div className="text-2xl font-black text-gray-800 tracking-tight tabular-nums">
            {pad(value?.hour ?? defaultHour)}:{pad(value?.min ?? defaultMin)}
          </div>
          <div className="flex gap-2">
            {[
              ["Hour", true],
              ["Min", false],
            ].map(([lbl, isHour]) => (
              <button
                key={lbl}
                onClick={(e) => {
                  e.stopPropagation();
                  setPickingHour(isHour);
                }}
                className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pickingHour === isHour
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DateRangeFilter
// ─────────────────────────────────────────────────────────────────────────────

function DateRangeFilter({
  fromDate,
  fromTime,
  toDate,
  toTime,
  setFromDate,
  setFromTime,
  setToDate,
  setToTime,
  filterActive,
  onApply,
  onReset,
}) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
        setOpenPicker(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function applyPreset(id) {
    const { from, ft, to, tt } = resolvePreset(id);
    setFromDate(from);
    setFromTime(ft);
    setToDate(to);
    setToTime(tt);
    setActivePreset(id);
    setOpenPicker(null);
  }

  const activePresetLabel = PRESETS.find((p) => p.id === activePreset)?.label;
  const rangeLabel = filterActive
    ? `${fmtDisplay(fromDate, fromTime)}  →  ${fmtDisplay(toDate, toTime)}`
    : "Select a period…";

  const pickerFields = [
    {
      label: "From",
      key: "from",
      date: fromDate,
      time: fromTime,
      setDate: setFromDate,
      setTime: setFromTime,
      dh: 0,
      dm: 1,
    },
    {
      label: "To",
      key: "to",
      date: toDate,
      time: toTime,
      setDate: setToDate,
      setTime: setToTime,
      dh: 23,
      dm: 59,
    },
  ];

  return (
    <div className="relative" ref={dropRef}>
      {/* Trigger */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <CalendarDays size={15} className="text-blue-700" />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <div className="flex flex-col min-w-0">
            {activePresetLabel && (
              <span className="text-[9px] font-black  text-blue-600 leading-none mb-0.5">
                {activePresetLabel}
              </span>
            )}
            <span
              className={`text-sm font-semibold truncate ${filterActive ? "text-gray-800" : "text-gray-400"}`}
            >
              {rangeLabel}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div className="flex items-center gap-2">
          {filterActive && (
            <button
              onClick={() => {
                setActivePreset(null);
                setOpen(false);
                onReset();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-500 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              <RefreshCw size={11} /> Reset
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              onApply();
            }}
            className="px-5 py-2 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Dropdown — allows natural height growth, no overflow-hidden */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl"
          style={{ width: 520 }}
        >
          <div
            className="flex rounded-t-2xl"
            style={{ borderRadius: "16px 16px 0 0", overflow: "hidden" }}
          >
            {/* Preset sidebar */}
            <div className="w-44 bg-gray-50 border-r border-gray-100 py-2 flex-shrink-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 pt-2 pb-2">
                Quick Select
              </p>
              {PRESETS.map((p, i) =>
                p.sep ? (
                  <div key={i} className="my-1 mx-4 border-t border-gray-200" />
                ) : (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all ${
                      activePreset === p.id
                        ? "bg-blue-700 text-white"
                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                    }`}
                  >
                    {p.label}
                  </button>
                ),
              )}
            </div>

            {/* Right panel */}
            <div className="flex-1 p-5 flex flex-col gap-4 min-w-0">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Selected Period
                </p>
                <div
                  className={`rounded-xl px-4 py-3 border ${activePresetLabel ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}
                >
                  <p className="text-sm font-bold text-blue-700">
                    {activePresetLabel || "Custom Range"}
                  </p>
                  {filterActive && (
                    <p className="text-xs text-blue-600 mt-0.5 font-medium">
                      {fmtDisplay(fromDate, fromTime)} →{" "}
                      {fmtDisplay(toDate, toTime)}
                    </p>
                  )}
                </div>
              </div>

              {/* Between pickers — completely inline, grow the dropdown naturally */}
              {activePreset === "between" && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3">
                    {pickerFields.map(
                      ({
                        label,
                        key,
                        date,
                        time,
                        setDate,
                        setTime,
                        dh,
                        dm,
                      }) => (
                        <div key={key}>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block">
                            {label}
                          </label>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPicker(openPicker === key ? null : key);
                            }}
                            className={`w-full border rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all ${
                              openPicker === key
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            {fmtDtDisplay(dtFromStrings(date, time))}
                          </button>

                          {openPicker === key && (
                            <div className="mt-2">
                              <DateTimePicker
                                value={dtFromStrings(date, time)}
                                onClose={() => setOpenPicker(null)}
                                onChange={(dt) => {
                                  const { date: d, time: t } = dtToStrings(dt);
                                  setDate(d);
                                  setTime(t);
                                  setActivePreset("between");
                                }}
                                defaultHour={dh}
                                defaultMin={dm}
                              />
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-700 font-semibold">
                    {fmtDisplay(fromDate, fromTime)} →{" "}
                    {fmtDisplay(toDate, toTime)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => {
                setOpen(false);
                setOpenPicker(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setOpenPicker(null);
                onApply();
              }}
              className="px-6 py-2 text-xs font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MetricCard
// ─────────────────────────────────────────────────────────────────────────────

const CARD_META = {
  New: { icon: TrendingUp, accent: "#059669", bg: "#ecfdf5" },
  Inbound: { icon: Mail, accent: "#2563eb", bg: "#eff6ff" },
  Outbound: { icon: Send, accent: "#7c3aed", bg: "#f5f3ff" },
  Offers: { icon: Tag, accent: "#d97706", bg: "#fffbeb" },
  Deals: { icon: Handshake, accent: "#dc2626", bg: "#fef2f2" },
  Orders: { icon: ShoppingCart, accent: "#0891b2", bg: "#ecfeff" },
  "First Reply Sent": { icon: Activity, accent: "#0284c7", bg: "#e0f2fe" },
  "GPC Activity": { icon: BarChart3, accent: "#7c3aed", bg: "#f5f3ff" },
  "Total Activity": { icon: Activity, accent: "#1d4ed8", bg: "#eff6ff" },
};

function MetricCard({ label, value, onClick }) {
  const meta = CARD_META[label] || {
    icon: User,
    accent: "#6b7280",
    bg: "#f9fafb",
  };
  const Icon = meta.icon;
  const isClickable = !!onClick;

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`group relative bg-white border border-gray-100 rounded-2xl p-4 text-left w-full transition-all duration-200
        ${isClickable ? "hover:shadow-lg hover:border-gray-200 cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={20} style={{ color: meta.accent }} />
        </div>
        {isClickable && (
          <span className="text-[11px] text-gray-300 group-hover:text-blue-400 transition-colors font-bold mt-0.5">
            ↗
          </span>
        )}
      </div>
      <p className="text-[10px]  text-black-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-black-900 tabular-nums tracking-tight">
        {value}
      </p>
      {isClickable && (
        <div
          className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
          style={{ backgroundColor: meta.accent }}
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ViewReports — main
// ─────────────────────────────────────────────────────────────────────────────

export default function ViewReports() {
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null);
  const [baseSummary, setBaseSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const exportRef = useRef(null);

  const [fromDate, setFromDate] = useState(todayStr());
  const [fromTime, setFromTime] = useState("00:01");
  const [toDate, setToDate] = useState(todayStr());
  const [toTime, setToTime] = useState("23:59");
  const [filterActive, setFilterActive] = useState(false);

  const { crmEndpoint } = useSelector((state) => state.user);

  useEffect(() => {
    const h = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setOpenExport(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const rows = apiResponse?.data ?? [];
  const grouped = groupByDescription(rows);
  const grandTotal = rows.reduce((sum, r) => sum + (parseInt(r.total) || 0), 0);

  const rawUserSummary = baseSummary?.user_summary;
  const userSummary = Array.isArray(rawUserSummary)
    ? rawUserSummary
    : rawUserSummary && typeof rawUserSummary === "object"
      ? Object.values(rawUserSummary)
      : [];

  const gpcActivity = userSummary.find((u) => u.user_id === "")?.total ?? 0;
  const userActivities = userSummary.filter((u) => u.user_id !== "");
  const totalActivity = userSummary.reduce(
    (s, u) => s + (parseInt(u.total) || 0),
    0,
  );
  const inboundTotal = (baseSummary?.data || [])
    .filter((r) => r.action === "Email-Recieved")
    .reduce((s, r) => s + (parseInt(r.total) || 0), 0);
  const outboundTotal = (baseSummary?.data || [])
    .filter((r) => r.action === "Email-Reply-Sent")
    .reduce((s, r) => s + (parseInt(r.total) || 0), 0);

  // ── URL builders ─────────────────────────────────────────────────────────────
  const buildUrl = (fd, ft, td, tt, extra = {}) =>
    `${crmEndpoint}&${new URLSearchParams({ type: "report", from: fd, from_time: `${ft}:00`, to: td, to_time: `${tt}:59`, ...extra })}`;
  const buildPlainUrl = (extra = {}) =>
    `${crmEndpoint}&${new URLSearchParams({ type: "report", ...extra })}`;

  // ── Fetchers ──────────────────────────────────────────────────────────────────
  const fetchSummary = async (fd, ft, td, tt) => {
    try {
      const url = fd ? buildUrl(fd, ft, td, tt) : `${crmEndpoint}&type=report`;
      const json = await (await fetch(url)).json();
      if (json?.success) setBaseSummary(json);
    } catch (err) {
      console.error("Summary fetch failed:", err);
    }
  };

  const fetchTable = async (fd, ft, td, tt, extra = {}) => {
    setLoading(true);
    try {
      const json = await (await fetch(buildUrl(fd, ft, td, tt, extra))).json();
      setApiResponse(json?.success ? json : null);
    } catch {
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTablePlain = async (extra = {}) => {
    setLoading(true);
    try {
      const json = await (await fetch(buildPlainUrl(extra))).json();
      setApiResponse(json?.success ? json : null);
    } catch {
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleApplyFilter = () => {
    if (new Date(`${toDate}T${toTime}`) < new Date(`${fromDate}T${fromTime}`)) {
      alert("❌ 'To Date' cannot be earlier than 'From Date'");
      return;
    }
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
    setFilterActive(true);
    fetchSummary(today, "00:01", today, "23:59");
    fetchTable(today, "00:01", today, "23:59");
  };

  useEffect(() => {
    handleApplyFilter();
  }, []);
  useEffect(() => {
    if (filterActive) {
      fetchSummary(fromDate, fromTime, toDate, toTime);
      fetchTable(fromDate, fromTime, toDate, toTime);
    } else {
      fetchSummary();
      fetchTablePlain();
    }
  }, [filterActive]);

  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleGroupClick = (desc) =>
    navigate(`/view-reports/${encodeURIComponent(desc)}`, {
      state: {
        from: fromDate,
        from_time: fromTime,
        to: toDate,
        to_time: toTime,
        filterActive,
      },
    });

  // ── Export PDF ────────────────────────────────────────────────────────────────
  const exportToPDF = () => {
    if (!rows.length) {
      alert("No data to export!");
      return;
    }
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.text("GPC Report", pw / 2, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(
      filterActive
        ? `Period: ${fromDate} ${fromTime} → ${toDate} ${toTime}`
        : "Period: Default",
      pw / 2,
      30,
      { align: "center" },
    );
    let y = 42;
    doc.setFontSize(13);
    doc.text("Summary", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Category", "Count"]],
      body: [
        ["New", baseSummary?.new ?? 0],
        ["Inbound", inboundTotal],
        ["Outbound", outboundTotal],
        ["Offers", baseSummary?.offer_count ?? 0],
        ["Deals", baseSummary?.deal_count ?? 0],
        ["Orders", baseSummary?.order_count ?? 0],
        ["Total Activity", totalActivity],
      ],
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [29, 78, 216] },
    });
    y = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(13);
    doc.text("Detailed Report", 14, y);
    y += 8;
    Object.entries(grouped).forEach(([desc, gRows]) => {
      const sub = gRows.reduce((s, r) => s + (parseInt(r.total) || 0), 0);
      doc.setFontSize(11);
      doc.text(`${desc} (Subtotal: ${sub})`, 14, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [["Action", "Total"]],
        body: gRows.map((r) => [r.action, r.total]),
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [51, 65, 85] },
        margin: { left: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });
    doc.setFontSize(13);
    doc.text(`Grand Total: ${grandTotal}`, 14, y + 8);
    doc.save(`GPC_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setOpenExport(false);
  };

  // ── Export Excel ──────────────────────────────────────────────────────────────
  const exportToExcel = async () => {
    if (!rows.length) {
      alert("No data to export!");
      return;
    }
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("GPC Report");
    ws.mergeCells("A1:B1");
    Object.assign(ws.getCell("A1"), {
      value: "GPC Report",
      font: { size: 16, bold: true },
      alignment: { horizontal: "center" },
    });
    ws.mergeCells("A2:B2");
    ws.getCell("A2").value = filterActive
      ? `Filter: ${fromDate} ${fromTime} → ${toDate} ${toTime}`
      : "Filter: Default";
    let ri = 4;
    ws.getCell(`A${ri}`).value = "Summary";
    ws.getCell(`A${ri}`).font = { bold: true };
    ri++;
    [
      ["New", baseSummary?.new ?? 0],
      ["Inbound", inboundTotal],
      ["Outbound", outboundTotal],
      ["Offers", baseSummary?.offer_count ?? 0],
      ["Deals", baseSummary?.deal_count ?? 0],
      ["Orders", baseSummary?.order_count ?? 0],
      ["Total Activity", totalActivity],
    ].forEach(([lbl, val]) => {
      ws.getCell(`A${ri}`).value = lbl;
      ws.getCell(`B${ri}`).value = val;
      ri++;
    });
    ri += 2;
    ws.getCell(`A${ri}`).value = "Detailed Report";
    ws.getCell(`A${ri}`).font = { bold: true };
    ri++;
    Object.entries(grouped).forEach(([desc, gRows]) => {
      const sub = gRows.reduce((s, r) => s + (parseInt(r.total) || 0), 0);
      ws.getCell(`A${ri}`).value = `${desc} (Subtotal: ${sub})`;
      ws.getCell(`A${ri}`).font = { bold: true };
      ri++;
      ws.getCell(`A${ri}`).value = "Action";
      ws.getCell(`B${ri}`).value = "Total";
      ws.getRow(ri).font = { bold: true };
      ri++;
      gRows.forEach((row) => {
        ws.getCell(`A${ri}`).value = row.action;
        ws.getCell(`B${ri}`).value = parseInt(row.total) || 0;
        ri++;
      });
      ri++;
    });
    ws.getCell(`A${ri}`).value = "Grand Total";
    ws.getCell(`B${ri}`).value = grandTotal;
    ws.getCell(`A${ri}`).font = { bold: true };
    ws.getCell(`B${ri}`).font = { bold: true };
    ws.columns.forEach((col) => {
      col.width = 28;
    });
    const buf = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `GPC_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    setOpenExport(false);
  };

  // ── Cards ─────────────────────────────────────────────────────────────────────
  const topCards = [
    { label: "New", value: baseSummary?.new ?? 0 },
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
      value: baseSummary?.offer_count ?? 0,
      onClick: () => navigate("/offers"),
    },
    {
      label: "Deals",
      value: baseSummary?.deal_count ?? 0,
      onClick: () => navigate("/deals"),
    },
    {
      label: "Orders",
      value: baseSummary?.order_count ?? 0,
      onClick: () => navigate("/orders"),
    },
  ];

  const bottomCards = [
    {
      label: "First Reply Sent",
      value:
        baseSummary?.data?.find((r) => r.action === "First-Reply-Sent")
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                GPC Report
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                Activity & performance overview
              </p>
            </div>
          </div>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setOpenExport((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-sm"
            >
              <Download size={15} />
              Export
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${openExport ? "rotate-180" : ""}`}
              />
            </button>
            {openExport && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 pb-1.5">
                  Choose Format
                </p>
                {[
                  {
                    label: "Export as PDF",
                    icon: FileText,
                    cls: "text-red-500",
                    bg: "bg-red-50",
                    fn: exportToPDF,
                  },
                  {
                    label: "Export as Excel",
                    icon: FileSpreadsheet,
                    cls: "text-green-600",
                    bg: "bg-green-50",
                    fn: exportToExcel,
                  },
                ].map(({ label, icon: Ic, cls, bg, fn }) => (
                  <button
                    key={label}
                    onClick={fn}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm font-semibold text-gray-700 transition-all"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Ic size={13} className={cls} />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="w-full mx-auto px-6 py-6 space-y-5">
        <DateRangeFilter
          fromDate={fromDate}
          fromTime={fromTime}
          toDate={toDate}
          toTime={toTime}
          setFromDate={setFromDate}
          setFromTime={setFromTime}
          setToDate={setToDate}
          setToTime={setToTime}
          filterActive={filterActive}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        <div>
          <p className="text-[10px] font-black text-gray-400 mb-3">Overview</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
            {topCards.map((c) => (
              <MetricCard key={c.label} {...c} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 ">
          {bottomCards.map((c) => (
            <MetricCard key={c.label} {...c} />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-gray-200" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Detailed Breakdown
          </p>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-[3px] border-blue-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-semibold">
              Loading report data…
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 flex flex-col items-center gap-2">
            <BarChart3 size={36} className="text-gray-200" />
            <p className="text-sm font-bold text-gray-400">
              No data available for this period
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(grouped).map(([description, groupRows]) => {
              const subtotal = groupRows.reduce(
                (s, r) => s + (parseInt(r.total) || 0),
                0,
              );
              const isOpen = openGroups[description];
              const color = GROUP_COLORS[description] ?? DEFAULT_COLOR;

              return (
                <div
                  key={description}
                  className="rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Colored gradient header */}
                  <div
                    className={`bg-gradient-to-r ${color.header} flex items-center justify-between px-5 py-3.5 cursor-pointer select-none`}
                    onClick={() => toggleGroup(description)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <span className="font-bold text-white text-sm tracking-wide">
                        {description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="bg-white/20 rounded-lg px-3 py-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          Subtotal
                        </span>
                        <span className="text-sm font-black text-white tabular-nums">
                          {subtotal}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        {isOpen ? (
                          <ChevronUp size={14} className="text-white" />
                        ) : (
                          <ChevronDown size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row list with colored accent */}
                  {isOpen && (
                    <div
                      className="bg-white border-x border-b border-gray-100 rounded-b-2xl overflow-hidden"
                      style={{ borderTop: `3px solid ${color.dot}` }}
                    >
                      {groupRows.map((row, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              color.light)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "")
                          }
                          onClick={() =>
                            navigate(
                              `/view-reports/${encodeURIComponent(row.action)}`,
                              {
                                state: {
                                  from: fromDate,
                                  from_time: fromTime,
                                  to: toDate,
                                  to_time: toTime,
                                  filterActive,
                                },
                              },
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color.dot }}
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              {row.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-black px-2.5 py-1 rounded-lg tabular-nums"
                              style={{
                                backgroundColor: color.badge,
                                color: color.text,
                              }}
                            >
                              {row.total}
                            </span>
                            <ChevronDown
                              size={11}
                              className="text-gray-300 -rotate-90"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide">
                  Grand Total
                </span>
              </div>
              <span className="text-2xl font-black tabular-nums">
                {grandTotal}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

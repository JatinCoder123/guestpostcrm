import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Loader2,
  MessageSquare,
  Activity,
  Layers,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { memo } from "react";
import { fetchGpc } from "../services/api.js";
import {
  setStagesLoading, setStagesData,
  setCategoriesLoading, setCategoriesData,
  toggleStage,
  setError, clearError, resetReport,
  selectStages, selectCategories, selectDetails,
  selectReportStats,
  selectStagesLoading, selectCatsLoading, selectDetsLoading,
  selectReportError,
} from "../store/Slices/reportSlice.js";
import { useNavigate } from "react-router-dom";
import { DateRangeFilter } from "./DateRangeFilter.jsx";
import { useCrmUsers } from "../queries/users.queries.js";
import CustomDropdown from "./ui/CustomDropdown.jsx";
// ─── Config ───────────────────────────────────────────────────────────────────

const PHASES = [
  {
    key: "filtration",
    label: "Filtration",
    sublabel: "Spam · Duplicates · Defaulters",
    icon: Filter,
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "conversation",
    label: "Conversations",
    sublabel: "Workflow · Stages · Outcomes",
    icon: MessageSquare,
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

const DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

const PAGE_SIZE = 20;
const DETAIL_PAGE_SIZE = 50;

const STAT_THEMES = [
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", label: "text-violet-500" },
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", label: "text-sky-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "text-amber-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", label: "text-rose-500" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", label: "text-teal-500" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", label: "text-orange-500" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const getDateRange = (preset) => {
  const now = new Date();
  if (preset === "yesterday") {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const s = fmtDate(y);
    return { from: s, from_time: "00:00:00", to: s, to_time: "23:59:59" };
  }
  const start = new Date(now);
  if (preset === "7days") start.setDate(now.getDate() - 7);
  if (preset === "30days") start.setDate(now.getDate() - 30);
  return { from: fmtDate(start), from_time: "00:00:00", to: fmtDate(now), to_time: "23:59:59" };
};

const getCount = (row) => Number(row?.total_count ?? row?.total ?? row?.count ?? 0);

const getStoredReportFilter = () => {
  try {
    return JSON.parse(localStorage.getItem("reportFilter") || "{}");
  } catch {
    return {};
  }
};

const getInitialDateFilter = () => {
  const storedFilter = getStoredReportFilter();
  const hasStoredRange = storedFilter.from || storedFilter.to;

  return {
    filterActive: Boolean(hasStoredRange),
    fromDate: storedFilter.from || "",
    fromTime: storedFilter.from_time || "00:00:00",
    toDate: storedFilter.to || "",
    toTime: storedFilter.to_time || "23:59:59",
  };
};

const getUserOptions = (users = []) => [
  { value: "", label: "All users" },
  ...users.map((user) => ({
    value: user.id,
    label: user.name,
  })),
];

// ─── Pagination ───────────────────────────────────────────────────────────────

const ReportPagination = memo(({ pageIndex, pageCount, onChange, compact = false }) => {
  const [gotoValue, setGotoValue] = useState("");
  if (!pageCount || pageCount <= 1) return null;

  const handlePrev = () => { if (pageIndex > 1) onChange(pageIndex - 1); };
  const handleNext = () => { if (pageIndex < pageCount) onChange(pageIndex + 1); };

  const pagesToShow = [];
  const start = Number(pageIndex);
  const end = Math.min(Number(pageIndex) + 2, pageCount);
  for (let i = start; i <= end; i++) pagesToShow.push(i);
  if (end < pageCount - 1) { pagesToShow.push("ellipsis"); pagesToShow.push(pageCount); }

  const handleGoto = (e) => {
    if (e.key === "Enter") {
      const p = Number(gotoValue);
      if (p >= 1 && p <= pageCount) { onChange(p); setGotoValue(""); }
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white/60">
        <span className="text-xs text-slate-400 font-medium tabular-nums">
          Page {pageIndex} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={pageIndex === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={13} />
          </button>
          {pagesToShow.map((p, idx) =>
            p === "ellipsis" ? (
              <span key={idx} className="w-7 text-center text-xs text-slate-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all
                  ${p === pageIndex
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={handleNext}
            disabled={pageIndex === pageCount}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={pageIndex === 1}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-all"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <div className="flex items-center gap-1">
          {pagesToShow.map((p, idx) =>
            p === "ellipsis" ? (
              <span key={idx} className="w-9 text-center text-sm text-slate-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                  ${p === pageIndex
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={pageIndex === pageCount}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-all"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Jump to</span>
        <input
          type="number"
          min="1"
          max={pageCount}
          value={gotoValue}
          onChange={(e) => setGotoValue(e.target.value)}
          onKeyDown={handleGoto}
          className="w-16 h-9 px-3 text-sm border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
          placeholder="—"
        />
      </div>
    </div>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="p-6 flex justify-between items-center animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-7 h-7 bg-slate-100 rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 w-28 bg-slate-100 rounded-lg" />
        <div className="h-3 w-16 bg-slate-100 rounded-lg" />
      </div>
    </div>
    <div className="h-7 w-24 bg-slate-100 rounded-xl" />
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <BarChart3 size={20} className="text-slate-400" />
    </div>
    <p className="font-semibold text-slate-700 text-sm">{title}</p>
    <p className="text-xs text-slate-400 mt-1.5 max-w-xs text-center leading-relaxed">{subtitle}</p>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ViewReports() {
  const dispatch = useDispatch();
  const { data: users } = useCrmUsers();
  const storedReportFilter = useMemo(() => getStoredReportFilter(), []);
  const [dateFilter, setDateFilter] =
    useState(() => getInitialDateFilter());
  const stages = useSelector(selectStages);
  const categories = useSelector(selectCategories);
  const details = useSelector(selectDetails);
  const stats = useSelector(selectReportStats);
  const stagesLoading = useSelector(selectStagesLoading);
  const catsLoading = useSelector(selectCatsLoading);
  const detsLoading = useSelector(selectDetsLoading);
  const error = useSelector(selectReportError);

  const [selectedUser, setSelectedUser] = useState(storedReportFilter.report_user_id || "");
  const [appliedFilters, setAppliedFilters] = useState({
    user: storedReportFilter.report_user_id || "",
    date: "today",
  });
  const [activeSection, setActiveSection] = useState(storedReportFilter.phase || "filtration");

  const phaseConfig = useMemo(
    () => PHASES.find((p) => p.key === activeSection) || PHASES[0],
    [activeSection],
  );

  const buildBody = useCallback(
    (overrides = {}) => ({
      phase: activeSection, stage: "", category: "",
      page: "", size: String(PAGE_SIZE),
      ...(appliedFilters.user ? { report_user_id: appliedFilters.user } : {}),
      ...(dateFilter.filterActive
        ? {
          from:
            dateFilter.fromDate,
          from_time:
            dateFilter.fromTime,

          to:
            dateFilter.toDate,
          to_time:
            dateFilter.toTime,
        }
        : getDateRange(
          appliedFilters.date
        )
      ),
      ...overrides,
    }),
    [activeSection, appliedFilters, dateFilter],
  );

  const callReport = useCallback(
    (overrides = {}) =>
      fetchGpc({ method: "POST", params: { type: "newReport" }, body: buildBody(overrides) }),
    [buildBody],
  );

  const loadStages = useCallback(async (page = 1) => {
    dispatch(setStagesLoading(true));
    dispatch(clearError());
    try {
      const data = await callReport({ page, size: String(PAGE_SIZE) });
      dispatch(setStagesData({
        records: data?.records || [], pagination: data?.pagination || {},
        stats: data?.stats || {}, total_records: data?.total_records ?? 0,
      }));
    } catch {
      dispatch(setError("Unable to fetch report stages."));
    } finally {
      dispatch(setStagesLoading(false));
    }
  }, [callReport, dispatch]);

  const loadCategories = useCallback(async (stageName, page = 1) => {
    if (categories.openStage === stageName && page === categories.pageIndex) {
      dispatch(toggleStage(stageName)); return;
    }
    dispatch(setCategoriesLoading(true));
    dispatch(clearError());
    try {
      const data = await callReport({ stage: stageName, category: "", page, size: String(PAGE_SIZE) });
      dispatch(setCategoriesData({
        stageName, records: data?.records || [],
        pagination: data?.pagination || {}, total_records: data?.total_records ?? 0,
      }));
    } catch {
      dispatch(setError("Unable to fetch categories."));
    } finally {
      dispatch(setCategoriesLoading(false));
    }
  }, [callReport, dispatch, categories.openStage, categories.pageIndex]);

  const loadDetails = (
    stage,
    category
  ) => {

    const range =
      dateFilter.filterActive
        ? {
          from:
            dateFilter.fromDate,
          from_time:
            dateFilter.fromTime,

          to:
            dateFilter.toDate,
          to_time:
            dateFilter.toTime,
        }
        : getDateRange(
          appliedFilters.date
        );

    const reportFilter = {
      phase:
        activeSection,

      stage,

      category,

      ...range,
    };

    if (appliedFilters.user) {
      reportFilter.report_user_id = appliedFilters.user;
    }

    localStorage.setItem(
      "reportFilter",
      JSON.stringify(
        reportFilter
      )
    );

    navigate(
      `/view-reports/${category}`,
      {
        state:
          reportFilter,
      }
    );
  };


  const navigate = useNavigate();



  useEffect(() => {
    dispatch(resetReport());
    loadStages(1);
  }, [activeSection, appliedFilters, dateFilter]); // eslint-disable-line

  const grandTotal = stages.rows.reduce((s, r) => s + getCount(r), 0);
  const statsEntries = Object.entries(stats);

  return (
    <div className="min-h-screen bg-[#f5f5f3] font-sans">

      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <Activity size={15} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-[15px]">Reports</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end mr-30">
            <DateRangeFilter
              fromDate={
                dateFilter.fromDate
              }
              fromTime={
                dateFilter.fromTime
              }
              toDate={
                dateFilter.toDate
              }
              toTime={
                dateFilter.toTime
              }
              filterActive={
                dateFilter.filterActive
              }
              onApply={({
                fromDate,
                fromTime,
                toDate,
                toTime,
              }) => {
                setDateFilter({
                  filterActive: true,

                  fromDate,
                  fromTime,

                  toDate,
                  toTime,
                });
              }}
              onReset={() => {
                setDateFilter({
                  filterActive: false,

                  fromDate: "",
                  fromTime:
                    "00:00:00",

                  toDate: "",
                  toTime:
                    "23:59:59",
                });
                setSelectedUser("");
                setAppliedFilters((prev) => ({ ...prev, user: "" }));
                localStorage.removeItem("reportFilter");
              }}
            />

            <CustomDropdown
              value={selectedUser}
              options={getUserOptions(users ?? [])}
              onChange={(user) => {
                setSelectedUser(user);
                setAppliedFilters((prev) => ({ ...prev, user }));
              }}
              placeholder="Select User"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">

        {/* ── Phase switcher ── */}
        <div className="grid grid-cols-2 gap-3">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const isActive = activeSection === phase.key;
            return (
              <button
                key={phase.key}
                onClick={() => { if (phase.key !== activeSection) setActiveSection(phase.key); }}
                className={`group text-left rounded-2xl p-5 border transition-all duration-200 ${isActive
                  ? "bg-white border-slate-200 shadow-sm ring-1 ring-slate-900/5"
                  : "bg-white/60 border-slate-200/60 hover:bg-white hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isActive ? "bg-slate-900" : "bg-slate-100 group-hover:bg-slate-200"
                      }`}>
                      <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{phase.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{phase.sublabel}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full transition-all ${isActive ? phase.dot : "bg-slate-200"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Stats strip ── */}
        {statsEntries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statsEntries.map(([key, value], i) => {
              const t = STAT_THEMES[i % STAT_THEMES.length];
              return (
                <div key={key} className={`${t.bg} border ${t.border} rounded-2xl p-4`}>
                  <span className={`text-2xl font-bold tracking-tight ${t.text}`}>{value}</span>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${t.label}`}>
                    {key.replace(/_/g, " ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-medium text-red-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Section header ── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight">
              {phaseConfig.label} breakdown
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {stages.totalRecords > 0
                ? `${stages.totalRecords.toLocaleString()} total records · ${stages.rows.length} stage${stages.rows.length !== 1 ? "s" : ""}`
                : "Records grouped by stage and category"
              }
            </p>
          </div>
          {!stagesLoading && stages.rows.length > 0 && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${phaseConfig.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${phaseConfig.dot}`} />
              {phaseConfig.label}
            </span>
          )}
        </div>

        {/* ── Main table card ── */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {stagesLoading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : stages.rows.length === 0 ? (
            <EmptyState
              title="No stages found"
              subtitle="Try adjusting the date range or user filter."
            />
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto] px-6 py-3 border-b border-slate-100 bg-slate-50/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stage</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Count</span>
              </div>

              <div className="divide-y divide-slate-100">
                {stages.rows.map((stageRow, idx) => {
                  const stageName = stageRow.stage;
                  const isStageOpen = categories.openStage === stageName;
                  const count = getCount(stageRow);

                  return (
                    <div key={stageName}>

                      {/* ── Stage row ── */}
                      <div
                        onClick={() => loadCategories(stageName, 1)}
                        className={`group flex items-center justify-between px-6 py-4 cursor-pointer select-none transition-colors ${isStageOpen ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm capitalize">{stageName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{phaseConfig.label} stage</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${phaseConfig.badge}`}>
                            {count.toLocaleString()}
                          </span>
                          <span className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${isStageOpen
                            ? "bg-slate-100 border-slate-200"
                            : "bg-white border-slate-200 group-hover:border-slate-300"
                            }`}>
                            {isStageOpen
                              ? <ChevronUp size={13} className="text-slate-500" />
                              : <ChevronDown size={13} className="text-slate-400" />
                            }
                          </span>
                        </div>
                      </div>

                      {/* ── Category accordion ── */}
                      {isStageOpen && (
                        <div className="bg-[#fafafa] border-t border-slate-100">
                          {catsLoading ? (
                            <div className="px-6 py-4 flex items-center gap-2 text-xs text-slate-400">
                              <Loader2 size={13} className="animate-spin" /> Loading categories…
                            </div>
                          ) : categories.rows.length === 0 ? (
                            <p className="px-6 py-4 text-xs text-slate-400">No categories found for this stage.</p>
                          ) : (
                            <>
                              {/* Category sub-header */}
                              <div className="grid grid-cols-[1fr_auto] px-6 py-2.5 border-b border-slate-100">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 pl-[calc(1rem+1px)]">Category</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Count</span>
                              </div>

                              {categories.rows.map((catRow) => {
                                const catName = catRow.category;
                                const isCatOpen = details.openCategory === catName;
                                const catCount = getCount(catRow);

                                return (
                                  <div key={catName} className="border-b border-slate-100 last:border-b-0">

                                    {/* ── Category row ── */}
                                    <div
                                      onClick={() => loadDetails(stageName, catName)}
                                      className={`flex items-center justify-between px-6 py-3.5 cursor-pointer select-none transition-colors ${isCatOpen ? "bg-white" : "hover:bg-white/70"
                                        }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${phaseConfig.dot} opacity-50`} />
                                        <span className="text-sm font-medium text-slate-700">{catName}</span>
                                      </div>
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                                          {catCount.toLocaleString()}
                                        </span>
                                        {isCatOpen
                                          ? <ChevronUp size={13} className="text-slate-400" />
                                          : <ChevronDown size={13} className="text-slate-300" />
                                        }
                                      </div>
                                    </div>

                                    {/* ── Detail table ── */}
                                    {isCatOpen && (
                                      <div className="bg-white border-t border-slate-100">
                                        {detsLoading ? (
                                          <div className="px-8 py-4 flex items-center gap-2 text-xs text-slate-400">
                                            <Loader2 size={13} className="animate-spin" /> Loading records…
                                          </div>
                                        ) : details.rows.length === 0 ? (
                                          <p className="px-8 py-4 text-xs text-slate-400">No records found.</p>
                                        ) : (
                                          <>
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-xs">
                                                <thead>
                                                  <tr className="border-b border-slate-100 bg-slate-50/60">
                                                    <th className="text-left px-6 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Sender</th>
                                                    <th className="text-left px-6 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                                                    <th className="text-left px-6 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                                                    <th className="text-left px-6 py-2.5 font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                  {details.rows.map((record, rIdx) => (
                                                    <tr key={record.id || record.message_id || rIdx} className="hover:bg-slate-50/60 transition-colors">
                                                      <td className="px-6 py-3 text-slate-700 font-medium">{record.sender_email || "—"}</td>
                                                      <td className="px-6 py-3">
                                                        {record.action
                                                          ? <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">{record.action}</span>
                                                          : <span className="text-slate-300">—</span>
                                                        }
                                                      </td>
                                                      <td className="px-6 py-3 text-slate-500 max-w-[220px] truncate">{record.description || "—"}</td>
                                                      <td className="px-6 py-3 text-slate-400 whitespace-nowrap font-mono">{record.date_entered || "—"}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                            <ReportPagination
                                              compact
                                              pageIndex={details.pageIndex}
                                              pageCount={details.pageCount}
                                              onChange={(p) => loadDetails(stageName, catName, p)}
                                            />
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Category-level pagination */}
                              <ReportPagination
                                compact
                                pageIndex={categories.pageIndex}
                                pageCount={categories.pageCount}
                                onChange={(p) => loadCategories(stageName, p)}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stage-level pagination */}
              <ReportPagination
                pageIndex={stages.pageIndex}
                pageCount={stages.pageCount}
                onChange={(p) => loadStages(p)}
              />
            </>
          )}
        </div>

        {/* ── Grand total ── */}
        {!stagesLoading && stages.rows.length > 0 && (
          <div className="rounded-2xl bg-slate-900 px-7 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Layers size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Grand Total</p>
                <p className="text-xs text-slate-400 mt-0.5">{phaseConfig.label} · all stages</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white tracking-tight tabular-nums leading-none">
                {grandTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {stages.rows.length} stage{stages.rows.length !== 1 ? "s" : ""}
                {stages.pageCount > 1 && ` · page ${stages.pageIndex}/${stages.pageCount}`}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

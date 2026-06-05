import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Filter,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../store/Slices/crmUser";
import { fetchGpc } from "../../services/api";

// ─── Phase config ─────────────────────────────────────────────────────────────

const PHASES = [
  {
    key: "filtration",
    label: "Filtration",
    icon: Filter,
    active: "bg-green-50 border-green-500 shadow-lg",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
    accent: "bg-green-500",
    total: "from-green-900 to-green-700",
    desc: "Spam, Defaulters, Stop Emails, Duplicates and more.",
  },
  {
    key: "conversation",
    label: "Conversations",
    icon: MessageSquare,
    active: "bg-blue-50 border-blue-500 shadow-lg",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    accent: "bg-blue-500",
    total: "from-slate-950 via-slate-900 to-blue-950",
    desc: "Track complete conversation workflow stages.",
  },
];

const DATE_OPTIONS = [
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days",     label: "Last 7 Days" },
  { value: "30days",    label: "Last 30 Days" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Returns { from, from_time, to, to_time } for a preset key.
 * Times include seconds to match what the Postman body sends.
 */
const getDateRange = (preset) => {
  const now = new Date();

  if (preset === "yesterday") {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const s = fmtDate(y);
    return { from: s, from_time: "00:00:00", to: s, to_time: "23:59:59" };
  }

  const start = new Date(now);
  if (preset === "7days")  start.setDate(now.getDate() - 7);
  if (preset === "30days") start.setDate(now.getDate() - 30);

  return {
    from:      fmtDate(start),
    from_time: "00:00:00",
    to:        fmtDate(now),
    to_time:   "23:59:59",
  };
};

const getCount = (row) =>
  Number(row?.total_count ?? row?.total ?? row?.count ?? 0);

const getUserLabel = (u) =>
  u?.name || u?.user_name || u?.username ||
  u?.first_name || u?.description || u?.email || u?.id || "Unnamed";

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyState = ({ title, subtitle }) => (
  <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
      <BarChart3 size={22} className="text-slate-400" />
    </div>
    <p className="font-semibold text-slate-700">{title}</p>
    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
  </div>
);

const InlineSpinner = ({ text }) => (
  <div className="px-6 py-5 flex items-center gap-2 text-sm font-medium text-slate-500">
    <Loader2 size={16} className="animate-spin" />
    {text}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReportTestPage() {
  const dispatch = useDispatch();
  const { users = [], loading: usersLoading } = useSelector(
    (state) => state.crmUser || {},
  );

  // ── Filter controls (uncommitted until Apply) ────────────────────────────────
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("today");

  // ── Committed filters — API fires only when these change ─────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    user: "",
    date: "today",
  });

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState("filtration");

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [stageRows,    setStageRows]    = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);
  const [detailRows,   setDetailRows]   = useState([]);

  // ── Open selections ───────────────────────────────────────────────────────────
  const [openStage,    setOpenStage]    = useState("");
  const [openCategory, setOpenCategory] = useState("");

  // ── Loading flags ─────────────────────────────────────────────────────────────
  const [stagesLoading,     setStagesLoading]     = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [detailsLoading,    setDetailsLoading]    = useState(false);

  const [error, setError] = useState("");
const [stats, setStats] = useState({});
  const phaseConfig = useMemo(
    () => PHASES.find((p) => p.key === activeSection) || PHASES[0],
    [activeSection],
  );

  // ── Build POST body ───────────────────────────────────────────────────────────
  //
  //  This is the JSON body that goes to:
  //    POST …/index.php?entryPoint=fetch_gpc&type=newReport
  //
  //  Matches exactly the Postman body:
  //  {
  //    "phase": "filtration",
  //    "stage": "",
  //    "report_user_id": "",
  //    "category": "",
  //    "page": "",
  //    "size": "",
  //    "from": "",
  //    "from_time": "",
  //    "to": "",
  //    "to_time": ""
  //  }
  //
  const buildBody = useCallback(
    (overrides = {}) => ({
      phase:          activeSection,
      stage:          "",
      category:       "",
      report_user_id: appliedFilters.user,
      page:           "",
      size:           "",
      ...getDateRange(appliedFilters.date),   // from / from_time / to / to_time
      ...overrides,                           // caller overrides stage / category / page / size
    }),
    [activeSection, appliedFilters],
  );

  // ── Single API wrapper ────────────────────────────────────────────────────────
  const callReport = useCallback(
    (bodyOverrides = {}) =>
      fetchGpc({
        method: "POST",
        params: { type: "newReport" },   // goes into URL query string
        body:   buildBody(bodyOverrides), // goes into request body as JSON
      }),
    [buildBody],
  );

  // ── Loaders ───────────────────────────────────────────────────────────────────

  const loadStages = useCallback(async () => {
    setStagesLoading(true);
    setError("");
    setStageRows([]);
    setCategoryRows([]);
    setDetailRows([]);
    setOpenStage("");
    setOpenCategory("");

    try {
      // Body: { phase, stage: "", category: "", report_user_id, from, … }
      const data = await callReport();
      setStats(data?.stats || {});
      setStageRows((data?.records || []).filter((r) => r?.stage));
    } catch (e) {
      console.error("[loadStages]", e);
      setError("Unable to fetch report stages.");
    } finally {
      setStagesLoading(false);
    }
  }, [callReport]);

  const loadCategories = useCallback(
    async (stageName) => {
      // Toggle closed
      if (openStage === stageName) {
        setOpenStage("");
        setCategoryRows([]);
        setDetailRows([]);
        setOpenCategory("");
        return;
      }

      setOpenStage(stageName);
      setOpenCategory("");
      setDetailRows([]);
      setCategoryRows([]);
      setCategoriesLoading(true);
      setError("");

      try {
        // Body: { phase, stage: stageName, category: "", … }
        const data = await callReport({ stage: stageName, category: "" });
        const records = data?.records || [];
        // Second-level response has `category` field on each row
        setCategoryRows(records.filter((r) => r?.category));
      } catch (e) {
        console.error("[loadCategories]", e);
        setError("Unable to fetch categories.");
      } finally {
        setCategoriesLoading(false);
      }
    },
    [callReport, openStage],
  );

  const loadDetails = useCallback(
    async (stageName, categoryName) => {
      // Toggle closed
      if (openCategory === categoryName) {
        setOpenCategory("");
        setDetailRows([]);
        return;
      }

      setOpenCategory(categoryName);
      setDetailRows([]);
      setDetailsLoading(true);
      setError("");

      try {
        // Body: { phase, stage, category, page: 1, size: 50, … }
        const data = await callReport({
          stage:    stageName,
          category: categoryName,
          page:     1,
          size:     50,
        });
        setDetailRows(data?.records || []);
      } catch (e) {
        console.error("[loadDetails]", e);
        setError("Unable to fetch records.");
      } finally {
        setDetailsLoading(false);
      }
    },
    [callReport, openCategory],
  );

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!users.length) dispatch(getAllUsers());
  }, [dispatch, users.length]);

  // Re-fetch stages when phase switches OR filters are applied
  useEffect(() => {
    loadStages();
  }, [activeSection, appliedFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleApply = () => {
    setAppliedFilters({ user: selectedUser, date: selectedDate });
  };

  const handlePhaseSwitch = (key) => {
    if (key === activeSection) return;
    setActiveSection(key);
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const grandTotal = stageRows.reduce((s, r) => s + getCount(r), 0);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header / filter bar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageSquare size={20} className="text-green-600" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-slate-800">Report Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* User selector */}
            <div className="relative">
              <Users size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="h-11 pl-10 pr-4 border border-slate-300 rounded-xl bg-white min-w-[180px]"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {getUserLabel(u)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date preset */}
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 pl-10 pr-4 border border-slate-300 rounded-xl bg-white min-w-[180px]"
              >
                {DATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleApply}
              disabled={stagesLoading || usersLoading}
              className="h-11 px-6 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl font-medium transition flex items-center gap-2"
            >
              {(stagesLoading || usersLoading) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Apply
            </button>
          </div>
        </div>

        {/* ── Phase selector cards ── */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const isActive = activeSection === phase.key;
            return (
              <div
                key={phase.key}
                onClick={() => handlePhaseSwitch(phase.key)}
                className={`cursor-pointer rounded-3xl p-8 transition-all border ${
                  isActive ? phase.active : "bg-white border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`w-14 h-14 rounded-2xl ${phase.iconBg} flex items-center justify-center mb-4`}>
                      <Icon size={24} className={phase.iconText} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{phase.label}</h2>
                    <p className="text-slate-500 mt-2">{phase.desc}</p>
                  </div>
                  <ChevronRight />
                </div>
              </div>
            );
          })}
        </div>

<div className="mt-10 bg-white rounded-3xl border border-slate-200 p-4">
  <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
    
</div>

  <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
    {Object.entries(stats).map(([key, value], index) => {
      const colors = [
        "border-amber-500",
        "border-emerald-500",
        "border-blue-500",
        "border-red-500",
        "border-purple-500",
        "border-pink-500",
        "border-cyan-500",
        "border-orange-500",
      ];

      return (
        <div
          key={key}
          className="flex flex-col items-center"
        >
          <div
            className={`w-20 h-20 rounded-full border-[10px] ${
              colors[index % colors.length]
            } flex items-center justify-center`}
          >
            <span className="text-2xl font-bold">
              {value}
            </span>
          </div>

          <p className="mt-3 text-sm font-medium text-slate-600 text-center">
            {key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
        </div>
      );
    })}
  </div>
  </div>


        {/* ── Breakdown ── */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {phaseConfig.label} Breakdown
              </h2>
              <p className="text-sm text-slate-500">
                Records grouped by stage and category
              </p>
            </div>
            {!stagesLoading && stageRows.length > 0 && (
              <div className="px-4 py-2 bg-white border rounded-xl text-xs font-semibold tracking-widest text-slate-500">
                {stageRows.length} Stage{stageRows.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {stagesLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-slate-400" />
              <p className="text-sm font-medium text-slate-500">Loading report stages…</p>
            </div>
          ) : stageRows.length === 0 ? (
            <EmptyState
              title="No stages found"
              subtitle="No data returned for the selected filters and phase."
            />
          ) : (
            <div className="space-y-4">

              {stageRows.map((stageRow) => {
                const stageName   = stageRow.stage;
                const isStageOpen = openStage === stageName;

                return (
                  <div
                    key={stageName}
                    className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${phaseConfig.accent}`} />

                    {/* Stage header */}
                    <div
                      onClick={() => loadCategories(stageName)}
                      className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 capitalize">
                          {stageName}
                        </h3>
                        <p className="text-sm text-slate-500">{phaseConfig.label} Stage</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 px-4 py-2 rounded-xl font-semibold text-slate-700">
                          TOTAL {getCount(stageRow)}
                        </div>
                        <button className="w-10 h-10 rounded-xl border bg-white flex items-center justify-center">
                          {isStageOpen
                            ? <ChevronUp size={18} />
                            : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Category list */}
                    {isStageOpen && (
                      <div className="border-t bg-slate-50/70">
                        {categoriesLoading ? (
                          <InlineSpinner text="Loading categories…" />
                        ) : categoryRows.length === 0 ? (
                          <div className="px-6 py-5 text-sm font-medium text-slate-500">
                            No categories found for this stage.
                          </div>
                        ) : (
                          categoryRows.map((catRow) => {
                            const catName   = catRow.category;
                            const isCatOpen = openCategory === catName;

                            return (
                              <div key={catName} className="border-b last:border-b-0">

                                {/* Category row */}
                                <div
                                  onClick={() => loadDetails(stageName, catName)}
                                  className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-white transition-colors"
                                >
                                  <span className="font-semibold text-slate-700">{catName}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">
                                      {getCount(catRow)}
                                    </span>
                                    {isCatOpen
                                      ? <ChevronUp size={16} className="text-slate-400" />
                                      : <ChevronDown size={16} className="text-slate-400" />}
                                  </div>
                                </div>

                                {/* Detail records table */}
                                {isCatOpen && (
                                  <div className="bg-white border-t">
                                    {detailsLoading ? (
                                      <InlineSpinner text="Loading records…" />
                                    ) : detailRows.length === 0 ? (
                                      <div className="px-8 py-4 text-sm font-medium text-slate-500">
                                        No records found for this category.
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                          <thead className="bg-slate-100 text-slate-500">
                                            <tr>
                                              <th className="text-left px-6 py-3 font-semibold">Sender</th>
                                              <th className="text-left px-6 py-3 font-semibold">Action</th>
                                              <th className="text-left px-6 py-3 font-semibold">Description</th>
                                              <th className="text-left px-6 py-3 font-semibold">Date</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {detailRows.map((record, idx) => (
                                              <tr
                                                key={record.id || record.message_id || idx}
                                                className="border-t hover:bg-slate-50"
                                              >
                                                <td className="px-6 py-3 text-slate-700">{record.sender_email || "—"}</td>
                                                <td className="px-6 py-3 text-slate-700">{record.action        || "—"}</td>
                                                <td className="px-6 py-3 text-slate-700">{record.description   || "—"}</td>
                                                <td className="px-6 py-3 text-slate-700 whitespace-nowrap">{record.date_entered || "—"}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Grand total banner */}
              <div className={`rounded-3xl overflow-hidden bg-gradient-to-r ${phaseConfig.total} shadow-xl`}>
                <div className="flex items-center justify-between p-8">
                  <div>
                    <p className="uppercase text-xs tracking-[3px] text-slate-300">
                      All {phaseConfig.label}
                    </p>
                    <h2 className="text-2xl font-bold text-white">Grand Total</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-white">{grandTotal}</div>
                    <p className="text-sm text-slate-300">
                      across {stageRows.length} stage{stageRows.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
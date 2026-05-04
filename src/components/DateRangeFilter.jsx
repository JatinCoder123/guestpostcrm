import { useEffect, useRef, useState } from "react";
import {
  PRESETS,
  resolvePreset,
  fmtDisplay,
  dtFromStrings,
  dtToStrings,
  fmtDtDisplay,
} from "../services/dateRangeUtils"
import { DateTimePicker } from "./DateTimePicker";
import { CalendarDays, ChevronDown, RefreshCcw } from "lucide-react";
export function DateRangeFilter({
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
              <RefreshCcw size={11} /> Reset
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
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all ${activePreset === p.id
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
                            className={`w-full border rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all ${openPicker === key
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
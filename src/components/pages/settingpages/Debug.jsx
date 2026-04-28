import React, { useEffect, useMemo, useState, useRef } from "react";
import { CREATE_DEAL_API_KEY } from "../../../store/constants.js";
import useModule from "../../../hooks/useModule.js";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import PromptViewer from "../../PromptViewer.jsx";
import PromptSectionsViewer from "../../PromptViewer.jsx";
import Header from "./Header.jsx";
import PromptExplorer from "./PromptExplorer.jsx";

const getToday = () => new Date().toISOString().split("T")[0];

const TABS = [
  { key: "error", label: "Error Logs", module: "outr_error_logs" },

  {
    key: "gpc",
    label: "GPC Request / Response",
    module: "outr_request_and_response",
  },

  {
    key: "api",
    label: "API Request / Response",
    module: "outr_request_and_response",
  },

  { key: "prompt", label: "Prompt Ledger", module: "outr_prompt_ledger" },

  { key: "logger", label: "Logger", module: "outr_global_logger" },

  // 👇 DUMMY / NOT WORKING YET
  {
    key: "prompt_testing",
    label: "Prompt Testing",
    module: "outr_prompt_testing",
    disabled: false,
  },

  {
    key: "process_audit",
    label: "Process Audit",
    module: "outr_el_process_audit",
    disabled: false,
  },

  {
    key: "ml",
    label: "Machine Learning",
    module: "outr_machine_learning",
    disabled: false,
  },
  {
    key: "self_test",
    label: "Self Test",
    module: "outr_self_test",
    disabled: false,
  },
  {
    key: "data_modelling",
    label: "Data Modelling",
    disabled: false,
  },
];

const IMPORTANT_COLUMNS = {
  error: ["date_entered", "file_path", "description"],
  api: ["date_entered", "request", "response"],
  gpc: ["date_entered", "request", "response"],
  prompt: ["date_entered", "response", "full_prompt"],
  logger: ["date_entered", "name", "description"],
  process_audit: [
    "date_entered",
    "from_email_c",
    "name",
    "message_id",
    "history_id",
  ],
};

const HIDDEN_FIELDS = [
  "id",
  "modified_user_id",
  "created_by",
  "deleted",
  "parent_type",
  "assigned_user_id",
  "date_modified",
  "static_prompt",
  "name",
  "date_entered",
  "prompt_id",
  "parent_id",
  "system_prompt",
  "user_prompt",
];

const TIME_FILTERS = [
  { label: "All", value: "all" },
  { label: "Last 1 Min", value: 1 },
  { label: "Last 5 Min", value: 5 },
  { label: "Last 10 Min", value: 10 },
];

const Debug = () => {
  const handleRowClick = (row) => {
    const messageId = row.message_id;
    const recordId = row.id;

    const url = `https://testcrm.guestpostcrm.com/index.php?entryPoint=handle_push_notification&message_id=${messageId}&test_now=${recordId}`;

    window.open(url, "_blank");

    setSelectedRecord(row);
  };
  const { state } = useLocation();
  const navigateTo = useNavigate();

  const getInitialTab = () => {
    if (!state?.prompt) return TABS[0];

    return TABS[3];
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [timeline, setTimeline] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [emailSearch, setEmailSearch] = useState("");
  const [exploreData, setExploreData] = useState(null);
  const getPromptStats = (text) => {
    if (!text) return { words: 0, lines: 0 };

    const cleaned = text.trim();

    const words = cleaned.split(/\s+/).filter(Boolean).length;
    const lines = cleaned.split(/\n/).length;

    return { words, lines };
  };

  const modalRef = useRef(null);

  const { crmEndpoint } = useSelector((state) => state.user);

  const { loading, data, error, refetch } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: activeTab.module },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: activeTab.label,
  });

  useEffect(() => {
    if (activeTab.key !== "prompt") return;
    if (state?.prompt) setSelectedRecord(state?.prompt);
  }, [loading, data, state?.promptId, activeTab]);

  useEffect(() => {
    refetch();
  }, [activeTab]);

  /* set timeline based on date */
  useEffect(() => {
    const today = getToday();

    if (selectedDate === today) {
      setTimeline(1);
    } else {
      setTimeline("all");
    }
  }, [selectedDate]);

  /* CLICK OUTSIDE MODAL */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (state?.prompt) navigateTo(-1);
        setSelectedRecord(null);
      }
    };

    if (selectedRecord) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRecord]);

  /* ESC CLOSE */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (state?.prompt) navigateTo(-1);
        setSelectedRecord(null);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const columns = useMemo(() => {
    return IMPORTANT_COLUMNS[activeTab.key] || [];
  }, [activeTab]);

  const truncate = (text, limit = 80) => {
    if (!text) return "-";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };
  const splitPrompt = (fullPrompt) => {
    if (!fullPrompt) return { system: "", user: "" };

    const separator =
      "----------------------------------------------------------------------";

    if (fullPrompt.includes(separator)) {
      const parts = fullPrompt
        .split(separator)
        .map((p) => p.trim())
        .filter(Boolean);

      const system = parts[0] || "";
      // All remaining sections joined back with separator
      const user = parts.slice(1).join(`\n\n${separator}\n\n`) || "";

      return { system, user };
    }

    return { system: fullPrompt.trim(), user: "" };
  };

  const isLargeField = (key) => {
    return ["request", "response", "full_prompt", "description"].includes(key);
  };

  /* FILTERING LOGIC */
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data?.filter((row) => {
      const email = (row.email || "").toLowerCase();

      /* EMAIL SEARCH */
      if (emailSearch && !email.includes(emailSearch.toLowerCase())) {
        return false;
      }

      if (!row.date_entered) return true;

      const parsed = row.date_entered.replace(" ", "T");
      const rowDate = new Date(parsed);

      if (isNaN(rowDate)) return true;

      const now = new Date();

      /* TIMELINE FILTER */
      if (timeline !== "all") {
        const diffMinutes = (now - rowDate) / 60000;
        if (diffMinutes > timeline) return false;
      }

      /* DATE FILTER */
      if (selectedDate) {
        const selected = new Date(selectedDate);

        if (
          rowDate.getFullYear() !== selected.getFullYear() ||
          rowDate.getMonth() !== selected.getMonth() ||
          rowDate.getDate() !== selected.getDate()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [data, timeline, selectedDate, emailSearch]);

  const parseAndDecode = (val) => {
    let parsed = val;

    // STEP 1: Parse JSON safely (even double encoded)
    try {
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
    } catch {}

    let content = parsed?.reply || parsed;

    if (typeof content !== "string") {
      content = JSON.stringify(content, null, 2);
    }

    // STEP 2: Remove all escape junk
    content = content
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\"/g, '"')
      .replace(/\\\//g, "/")
      .replace(/\\\\/g, "")
      .replace(/\s*\\\s*/g, ""); // removes \ \ garbage

    // STEP 3: REMOVE ALL BROKEN HTML TAGS
    content = content.replace(/<\/?[^>]+(>|$)/g, "");

    // STEP 4: Clean structure manually
    content = content
      .replace(/Hi\s+/i, "Hi ")
      .replace(/Please share:/i, "\n\nPlease share:\n")
      .replace(/Best regards,/i, "\n\nBest regards,\n")
      .replace(/Admin/i, "Admin\n")
      .replace(/OutrightCRM/i, "OutrightCRM");

    // STEP 5: Fix bullet points
    content = content
      .replace(/3–5 topic ideas/g, "\n• 3–5 topic ideas")
      .replace(/Your preferred target URL/g, "\n• Your preferred target URL")
      .replace(/Any key requirements/g, "\n• Any key requirements");

    return content.trim();
  };

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const formatJSON = (val) => {
    try {
      return typeof val === "string"
        ? JSON.stringify(JSON.parse(val), null, 2)
        : JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <>
      {" "}
      <Header text={"QA PlayGround"} />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex justify-center gap-6 flex-wrap">
          {/* Email Search */}
          {/* <div className="flex items-center gap-3 bg-gray-100 border rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-600">Email</span>

            <div className="relative">
              <input
                type="text"
                placeholder="Search email..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="bg-white border rounded-md px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-blue-500"
              />

              {emailSearch && (
                <button
                  onClick={() => setEmailSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
          </div> */}
          {/* Tabs (Replaced with Dropdown) */}
          <div className="flex items-center justify-between flex items-center gap-3 bg-blue-50 border border-2 border-blue-600 rounded-xl px-4 py-2 shadow-sm ">
            {/* ACTIVE TAB NAME */}
            {/* <div className="text-lg font-semibold text-blue-600">
              {activeTab.label}
            </div> */}

            {/* DROPDOWN */}
            <div>
              <select
                value={activeTab.key}
                onChange={(e) => {
                  const selected = TABS.find((t) => t.key === e.target.value);

                  if (!selected) return;

                  // 🔥 Navigation logic
                  if (selected.key === "prompt_testing") {
                    navigateTo("/settings/prompt-testing");
                    return;
                  }

                  if (selected.key === "ml") {
                    navigateTo("/settings/machine-learning");
                    return;
                  }

                  if (selected.key === "self_test") {
                    navigateTo("/settings/self-test");
                    return;
                  }
                  if (selected.key === "data_modelling") {
                    navigateTo("/settings/data-modelling");
                    return;
                  }

                  // बाकी tabs same rahenge
                  if (selected?.disabled) return;

                  setActiveTab(selected);
                }}
                className="border px-4 py-2 rounded-md text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {TABS.map((tab) => (
                  <option key={tab.key} value={tab.key} disabled={tab.disabled}>
                    {tab.label} {tab.disabled ? " (Coming Soon)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-3 bg-gray-100 border rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-600">Timeline</span>

            <select
              value={timeline}
              onChange={(e) => {
                const value =
                  e.target.value === "all" ? "all" : Number(e.target.value);
                setTimeline(value);
              }}
              className="bg-white border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {TIME_FILTERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 bg-gray-100 border rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-600">Date</span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

          {!loading && !error && filteredData.length > 0 && (
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
                {filteredData.map((row, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedRecord(row)}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className={`px-4 py-3 max-w-xs truncate ${
                          activeTab.key === "process_audit" &&
                          col === "message_id"
                            ? "cursor-pointer text-blue-600 hover:underline"
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            activeTab.key === "process_audit" &&
                            col === "message_id"
                          ) {
                            handleRowClick(row);
                          }
                        }}
                      >
                        {truncate(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && filteredData.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No records found.</div>
          )}
        </div>

        {/* Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              ref={modalRef}
              className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Record Details</h2>

                  {state?.prompt && (
                    <button
                      onClick={() => {
                        console.log("prompt id", state?.prompt.prompt_id);
                        navigateTo("/settings/machine-learning", {
                          state: {
                            promptId: state?.prompt.prompt_id,
                            promptStatus: state?.prompt.prompt_stage,
                          },
                        });
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (state?.prompt) navigateTo(-1);
                    setSelectedRecord(null);
                  }}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedRecord)
                  .filter(([key]) => {
                    // hide global fields
                    if (HIDDEN_FIELDS.includes(key)) return false;

                    // hide description ONLY in prompt tab
                    if (activeTab.key === "prompt" && key === "description")
                      return false;

                    return true;
                  })
                  .sort(([a], [b]) => {
                    if (a === "response") return -1;
                    if (b === "response") return 1;
                    if (a === "full_prompt") return 1;
                    if (b === "full_prompt") return -1;
                    return 0;
                  })
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

                        {key === "full_prompt" ? (
                          (() => {
                            const stats = getPromptStats(value);

                            return (
                              <div className="space-y-2">
                                {/* Stats */}
                                <div className="flex gap-4 text-xs text-gray-600 bg-gray-200 px-3 py-1 rounded-md w-fit">
                                  <span>Words: {stats.words}</span>
                                  <span>Lines: {stats.lines}</span>
                                </div>

                                {/* Viewer */}
                                {value?.includes(
                                  "----------------------------------------------------------------------",
                                ) ? (
                                  <PromptSectionsViewer
                                    prompt={value}
                                    onExplore={() => {
                                      const sys =
                                        selectedRecord?.system_prompt?.trim();
                                      const usr =
                                        selectedRecord?.user_prompt?.trim();
                                      if (sys || usr) {
                                        navigateTo(
                                          "/settings/prompt-explorer",
                                          {
                                            state: {
                                              system: sys || "",
                                              user: usr || "",
                                            },
                                          },
                                        );
                                      } else {
                                        // Both empty/null → split fullPrompt
                                        const { system, user } =
                                          splitPrompt(value);
                                        navigateTo(
                                          "/settings/prompt-explorer",
                                          { state: { system, user } },
                                        );
                                      }
                                    }}
                                  />
                                ) : (
                                  <PromptViewer
                                    prompt={value}
                                    onExplore={() => {
                                      const sys =
                                        selectedRecord?.system_prompt?.trim();
                                      const usr =
                                        selectedRecord?.user_prompt?.trim();
                                      if (sys || usr) {
                                        navigateTo(
                                          "/settings/prompt-explorer",
                                          {
                                            state: {
                                              system: sys || "",
                                              user: usr || "",
                                            },
                                          },
                                        );
                                      } else {
                                        // Both empty/null → split fullPrompt
                                        const { system, user } =
                                          splitPrompt(value);
                                        navigateTo(
                                          "/settings/prompt-explorer",
                                          { state: { system, user } },
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })()
                        ) : large ? (
                          key === "response" ? (
                            <div
                              className="w-full max-h-[400px] overflow-auto text-sm bg-black text-green-400 p-4 rounded"
                              dangerouslySetInnerHTML={{
                                __html: parseAndDecode(value),
                              }}
                            />
                          ) : (
                            <textarea
                              readOnly
                              value={formatJSON(value)}
                              className="w-full h-40 text-xs font-mono bg-black text-green-400 p-3 rounded"
                            />
                          )
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
      {/* Prompt Explorer Modal */}
      {exploreData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Prompt Explorer
              </h2>
              <button
                onClick={() => setExploreData(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <PromptExplorer
                initialSystem={exploreData.system}
                initialUser={exploreData.user}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Debug;

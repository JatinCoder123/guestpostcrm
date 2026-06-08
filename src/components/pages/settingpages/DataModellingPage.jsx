import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// All API calls use the real SugarCRM entrypoints:
//   Module list : GET  /index.php?entryPoint=get_module_list
//   Field list  : GET  /index.php?entryPoint=get_fields&module_name=<Module>
//   Actions     : POST /index.php?entryPoint=smart_gateway  (body = action payload)
// baseUrl is derived from the Redux crmEndpoint value.

// ─── TOKEN GENERATION ────────────────────────────────────────────────────────
// Mirrors the Postman pre-request script:
//   payload = { ts, source }  →  HMAC-SHA256 sign  →  base64("json||sig")
// Uses SubtleCrypto (built into every modern browser — no CryptoJS needed).
 
const TOKEN_SECRET = "MY_SUPER_SECRET_123";
 
async function generateToken() {
  const payload = {
    ts: Math.floor(Date.now() / 1000),
    source: "claude-mcp",
  };
  const json = JSON.stringify(payload);
 
  // Import the secret key for HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(TOKEN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
 
  // Sign
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(json)
  );
 
  // Convert ArrayBuffer → hex string (same as CryptoJS .toString(Hex))
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
 
  // base64(json + "||" + hexSig)
  return btoa(`${json}||${sigHex}`);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function syntaxHighlight(json) {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*([eE][+-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m)) return /:$/.test(m) ? `<span class="dm-jk">${m}</span>` : `<span class="dm-js">${m}</span>`;
        if (/true|false/.test(m)) return `<span class="dm-jb">${m}</span>`;
        if (/null/.test(m)) return `<span class="dm-jb">${m}</span>`;
        return `<span class="dm-jn">${m}</span>`;
      }
    );
}

function getPlaceholder(type, name) {
  if (name === "id") return "";
  switch (type) {
    case "bool": return false;
    case "int": case "decimal": case "float": case "currency": return 0;
    case "date": return "2025-01-01";
    case "datetime": return "2025-01-01 00:00:00";
    default: return "";
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@400;600;800&display=swap');

.dm-wrap {
  --dm-bg: #0a0e14;
  --dm-surface: #14191f;
  --dm-border: #1f2933;
  --dm-text: #e4e8ed;
  --dm-muted: #6b7784;
  --dm-accent: #3b82f6;
  --dm-accent2: #10b981;
  --dm-danger: #ef4444;
  --dm-success: #22c55e;
}

.dm-wrap *, .dm-wrap *::before, .dm-wrap *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}

.dm-app {
  display: grid;
  grid-template-areas: "topbar topbar" "sidebar main";
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr;
  height: 100vh;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
  background: var(--dm-bg);
  color: var(--dm-text);
  font-size: 13px;
  line-height: 1.6;
}

/* TOPBAR */
.dm-topbar {
  grid-area: topbar;
  background: var(--dm-surface);
  border-bottom: 1px solid var(--dm-border);
  display: flex; align-items: center;
  padding: 0 20px; gap: 16px;
}
.dm-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -0.5px; }
.dm-logo span { color: var(--dm-accent); }
.dm-topbar-url { flex: 1; font-size: 11px; color: var(--dm-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dm-badge { font-size: 10px; padding: 4px 8px; border: 1px solid var(--dm-accent); color: var(--dm-accent); border-radius: 4px; font-weight: 600; }
.dm-badge.green { border-color: var(--dm-accent2); color: var(--dm-accent2); }

/* SIDEBAR */
.dm-sidebar {
  grid-area: sidebar;
  background: var(--dm-surface);
  border-right: 1px solid var(--dm-border);
  padding: 20px 12px;
  overflow-y: auto;
}
.dm-section { font-size: 10px; text-transform: uppercase; color: var(--dm-muted); margin: 24px 0 8px 8px; letter-spacing: 0.5px; font-weight: 600; }
.dm-section:first-child { margin-top: 0; }

.dm-action-btn {
  width: 100%; background: transparent; border: 1px solid transparent; color: var(--dm-text);
  padding: 10px 12px; text-align: left; cursor: pointer; border-radius: 6px;
  font-family: inherit; font-size: 12px; display: flex; align-items: center; gap: 8px;
  transition: all 0.15s; margin-bottom: 4px;
}
.dm-action-btn svg { flex-shrink: 0; }
.dm-action-btn:hover { background: rgba(59,130,246,0.1); border-color: var(--dm-accent); }
.dm-action-btn.active { background: rgba(59,130,246,0.15); border-color: var(--dm-accent); color: var(--dm-accent); }

.dm-pill { margin-left: auto; font-size: 9px; padding: 2px 6px; border-radius: 3px; font-weight: 700; letter-spacing: 0.3px; }
.dm-pill-post { background: rgba(59,130,246,0.2); color: var(--dm-accent); }
.dm-pill-get  { background: rgba(16,185,129,0.2); color: var(--dm-accent2); }
.dm-pill-del  { background: rgba(239,68,68,0.2);  color: var(--dm-danger); }

/* MAIN */
.dm-main { grid-area: main; overflow-y: auto; padding: 24px; }
.dm-pane { max-width: 1100px; margin: 0 auto 24px; }

/* PANEL */
.dm-panel { background: var(--dm-surface); border: 1px solid var(--dm-border); border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
.dm-panel-head {
  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.05));
  border-bottom: 1px solid var(--dm-border);
  padding: 14px 20px; display: flex; align-items: center; gap: 12px;
}
.dm-panel-title { font-weight: 700; font-size: 14px; }
.dm-panel-desc  { color: var(--dm-muted); font-size: 11px; margin-left: auto; }
.dm-panel-body  { padding: 20px; }

/* FORM */
.dm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.dm-field { display: flex; flex-direction: column; gap: 6px; }
.dm-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; color: var(--dm-muted); }
.dm-req { color: var(--dm-danger); }

.dm-input, .dm-select, .dm-textarea {
  background: var(--dm-bg); border: 1px solid var(--dm-border); color: var(--dm-text);
  padding: 10px 12px; border-radius: 6px; font-family: inherit; font-size: 13px; transition: all 0.15s; width: 100%;
}
.dm-input:focus, .dm-select:focus, .dm-textarea:focus {
  outline: none; border-color: var(--dm-accent); box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.dm-select { cursor: pointer; }
.dm-textarea { resize: vertical; min-height: 80px; font-size: 12px; font-family: 'JetBrains Mono', monospace; line-height: 1.5; }
.dm-textarea.err { border-color: var(--dm-danger); }

/* DATE PILLS */
.dm-date-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.dm-date-pill {
  background: var(--dm-bg); border: 1px solid var(--dm-border); color: var(--dm-text);
  padding: 7px 13px; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 12px; transition: all 0.15s;
}
.dm-date-pill:hover { border-color: var(--dm-accent2); background: rgba(16,185,129,0.1); }
.dm-date-pill.active { background: var(--dm-accent2); color: #000; border-color: var(--dm-accent2); font-weight: 600; }
.dm-custom-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }

/* FIELD CHIPS */
.dm-fields-wrap { background: var(--dm-bg); border: 1px solid var(--dm-border); border-radius: 6px; padding: 12px; }
.dm-chip-search { width: 100%; background: var(--dm-surface); border: 1px solid var(--dm-border); color: var(--dm-text); padding: 8px 12px; border-radius: 6px; font-family: inherit; font-size: 12px; margin-bottom: 10px; }
.dm-chip-search:focus { outline: none; border-color: var(--dm-accent); }
.dm-chip-grid { display: flex; flex-wrap: wrap; gap: 6px; max-height: 200px; overflow-y: auto; }
.dm-chip {
  background: var(--dm-surface); border: 1px solid var(--dm-border); color: var(--dm-text);
  padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;
  display: flex; align-items: center; gap: 5px; transition: all 0.15s; font-family: inherit;
}
.dm-chip:hover { border-color: var(--dm-accent); background: rgba(59,130,246,0.1); }
.dm-chip.sel { background: var(--dm-accent); color: #000; border-color: var(--dm-accent); font-weight: 600; }
.dm-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dm-muted); flex-shrink: 0; }
.dm-chip.sel .dm-dot { background: #000; }
.dm-chip-type { font-size: 9px; opacity: 0.6; }

/* JSON ACTIONS */
.dm-json-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.dm-json-ok  { font-size: 11px; color: var(--dm-success); }
.dm-json-err { font-size: 11px; color: var(--dm-danger); }

/* BUTTONS */
.dm-btn {
  background: transparent; border: 1px solid var(--dm-border); color: var(--dm-muted);
  cursor: pointer; border-radius: 4px; font-family: inherit; font-size: 11px; padding: 4px 10px; transition: all 0.15s;
}
.dm-btn:hover { border-color: var(--dm-accent); color: var(--dm-accent); }

.dm-send {
  background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none;
  padding: 11px 26px; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 13px;
  font-weight: 600; letter-spacing: 0.3px; transition: all 0.15s;
  display: flex; align-items: center; gap: 8px;
}
.dm-send:hover { opacity: 0.9; transform: translateY(-1px); }
.dm-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.dm-send.danger { background: linear-gradient(135deg,#ef4444,#c0392b); }
.dm-send.green  { background: linear-gradient(135deg,#10b981,#20c997); }

/* RESPONSE PANEL */
.dm-resp-panel { background: var(--dm-surface); border: 1px solid var(--dm-border); border-radius: 8px; overflow: hidden; max-width: 1100px; margin: 0 auto; }
.dm-resp-head  { background: var(--dm-surface); border-bottom: 1px solid var(--dm-border); padding: 10px 18px; display: flex; align-items: center; gap: 10px; }
.dm-resp-status { font-size: 10px; padding: 3px 8px; border-radius: 3px; font-weight: 700; }
.dm-resp-idle    { background: rgba(107,119,132,0.2); color: var(--dm-muted); }
.dm-resp-ok      { background: rgba(34,197,94,0.2); color: var(--dm-success); }
.dm-resp-err     { background: rgba(239,68,68,0.2); color: var(--dm-danger); }
.dm-resp-time    { font-size: 11px; color: var(--dm-muted); }
.dm-resp-body {
  padding: 16px 20px; overflow: auto; max-height: 460px; min-height: 100px;
  background: #0f172a; color: #e2e8f0; font-size: 13px; line-height: 1.6;
  font-family: 'JetBrains Mono', monospace; white-space: pre-wrap; word-break: break-word;
}

/* JSON SYNTAX */
.dm-jk { color: #93c5fd; }
.dm-js { color: #86efac; }
.dm-jn { color: #fca5a5; }
.dm-jb { color: #f9a8d4; }

/* SCHEMA */
.dm-schema-tabs { display: flex; gap: 2px; background: var(--dm-bg); padding: 4px; border-radius: 6px; flex-wrap: wrap; }
.dm-schema-tab {
  background: transparent; border: none; color: var(--dm-muted); padding: 7px 14px; border-radius: 4px;
  cursor: pointer; font-family: inherit; font-size: 11px; font-weight: 600; transition: all 0.15s;
}
.dm-schema-tab:hover { color: var(--dm-text); background: var(--dm-surface); }
.dm-schema-tab.active { color: var(--dm-accent); background: var(--dm-surface); }
.dm-schema-body { padding: 20px; position: relative; }
.dm-schema-code {
  background: var(--dm-bg); border: 1px solid var(--dm-border); border-radius: 6px;
  padding: 16px; overflow-x: auto; font-size: 12px; line-height: 1.7; white-space: pre-wrap;
  font-family: 'JetBrains Mono', monospace;
}
.dm-copy-btn {
  position: absolute; top: 28px; right: 28px; background: var(--dm-accent); color: #fff; border: none;
  padding: 5px 11px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 10px; font-weight: 600;
}
.dm-copy-btn:hover { background: #2563eb; }

/* LOADING CHIP */
.dm-chip-loading { padding: 10px; color: var(--dm-muted); font-size: 12px; }

@keyframes dm-spin { to { transform: rotate(360deg); } }
.dm-spin { display: inline-block; animation: dm-spin 0.6s linear infinite; }
`;

// ─── SMALL REUSABLE UI ────────────────────────────────────────────────────────

const Pill = ({ type }) => {
  const cls = { POST: "dm-pill-post", GET: "dm-pill-get", DEL: "dm-pill-del" };
  return <span className={`dm-pill ${cls[type] || "dm-pill-post"}`}>{type}</span>;
};

const SpinIcon = () => (
  <svg className="dm-spin" width="13" height="13" viewBox="0 0 14 14">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" fill="none"
      strokeDasharray="20" strokeDashoffset="10" strokeLinecap="round" />
  </svg>
);

const SendBtn = ({ onClick, loading, variant = "" }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
    <button className={`dm-send ${variant}`} onClick={onClick} disabled={loading}>
      {loading ? <><SpinIcon /> Sending…</> : "▶ Send Request"}
    </button>
  </div>
);

// Module dropdown — modules is [{ key, label }]
const ModSel = ({ value, onChange, modules }) => (
  <select className="dm-select" value={value} onChange={e => onChange(e.target.value)}>
    <option value="">— select module —</option>
    {modules.map(m => (
      <option key={m.key} value={m.key}>{m.label} ({m.key})</option>
    ))}
  </select>
);

// Field chips with search + toggle
const FieldChips = ({ fields, selected, onToggle, loading }) => {
  const [filter, setFilter] = useState("");
  const visible = filter
    ? fields.filter(f =>
        f.name.toLowerCase().includes(filter.toLowerCase()) ||
        (f.label || "").toLowerCase().includes(filter.toLowerCase())
      )
    : fields;

  if (loading) return <div className="dm-chip-loading">Loading fields…</div>;
  if (!fields.length) return <div className="dm-chip-loading">No fields found.</div>;

  return (
    <div className="dm-fields-wrap">
      <input
        className="dm-chip-search"
        type="text"
        placeholder="Search fields…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <div className="dm-chip-grid">
        {visible.map(f => (
          <span
            key={f.name}
            className={`dm-chip${selected.includes(f.name) ? " sel" : ""}`}
            title={`${f.label || f.name} [${f.type}]`}
            onClick={() => onToggle(f.name, f.type)}
          >
            <span className="dm-dot" />
            {f.name}
            <span className="dm-chip-type">({f.type})</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// JSON textarea with format/clear/validation
const JsonBox = ({ value, onChange, rows = 6, placeholder = "{}" }) => {
  const [err, setErr] = useState("");
  const handle = e => {
    const v = e.target.value;
    try { JSON.parse(v); setErr(""); } catch (ex) { setErr(ex.message); }
    onChange(v);
  };
  const format = () => {
    try { onChange(JSON.stringify(JSON.parse(value), null, 2)); setErr(""); } catch {}
  };
  return (
    <div>
      <textarea
        className={`dm-textarea${err ? " err" : ""}`}
        rows={rows}
        value={value}
        onChange={handle}
        placeholder={placeholder}
        spellCheck={false}
      />
      <div className="dm-json-row">
        <button className="dm-btn" onClick={format}>Format</button>
        <button className="dm-btn" onClick={() => { onChange("{}"); setErr(""); }}>Clear</button>
        {err
          ? <span className="dm-json-err">✗ {err}</span>
          : <span className="dm-json-ok">✓ valid JSON</span>
        }
      </div>
    </div>
  );
};

// Date range pills
const DATE_RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this_week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "custom", label: "Custom…" },
  { key: "", label: "All Time" },
];

const DatePills = ({ value, onChange, customFrom, customTo, onFrom, onTo }) => (
  <div style={{ marginTop: 14 }}>
    <div className="dm-label" style={{ marginBottom: 8 }}>Date Range</div>
    <div className="dm-date-pills">
      {DATE_RANGES.map(r => (
        <button
          key={r.key === "" ? "all" : r.key}
          className={`dm-date-pill${value === r.key ? " active" : ""}`}
          onClick={() => onChange(r.key)}
        >
          {r.label}
        </button>
      ))}
    </div>
    {value === "custom" && (
      <div className="dm-custom-dates">
        <div className="dm-field">
          <label className="dm-label">From</label>
          <input type="date" className="dm-input" value={customFrom} onChange={e => onFrom(e.target.value)} />
        </div>
        <div className="dm-field">
          <label className="dm-label">To</label>
          <input type="date" className="dm-input" value={customTo} onChange={e => onTo(e.target.value)} />
        </div>
      </div>
    )}
  </div>
);

// ─── PANES ────────────────────────────────────────────────────────────────────

// Create
function PaneCreate({ modules, fieldCache, loadFields, onSend, loading }) {
  const [mod, setMod] = useState("");
  const [data, setData] = useState("{}");
  const [selected, setSelected] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const fields = mod ? fieldCache[mod] || [] : [];

  const handleMod = async m => {
    setMod(m);
    setSelected([]);
    setData("{}");
    if (m && !fieldCache[m]) {
      setFieldsLoading(true);
      await loadFields(m);
      setFieldsLoading(false);
    }
  };

  const toggleChip = (name, type) => {
    try {
      const obj = JSON.parse(data);
      if (selected.includes(name)) {
        delete obj[name];
        setSelected(prev => prev.filter(f => f !== name));
      } else {
        obj[name] = getPlaceholder(type, name);
        setSelected(prev => [...prev, name]);
      }
      setData(JSON.stringify(obj, null, 2));
    } catch {}
  };

  const send = () => {
    if (!mod) return alert("Please select a module");
    try {
      const parsed = JSON.parse(data);
      onSend({ action: "create", module: mod, data: parsed });
    } catch { alert("JSON in data is invalid"); }
  };

  return (
    <div className="dm-pane">
      <div className="dm-panel">
        <div className="dm-panel-head">
          <Pill type="POST" />
          <span className="dm-panel-title">Create Record</span>
          <span className="dm-panel-desc">Creates a new record in any module</span>
        </div>
        <div className="dm-panel-body">
          <div className="dm-grid">
            <div className="dm-field">
              <label className="dm-label">Module <span className="dm-req">*</span></label>
              <ModSel value={mod} onChange={handleMod} modules={modules} />
            </div>
          </div>

          {mod && (
            <div style={{ marginTop: 14 }}>
              <div className="dm-field">
                <label className="dm-label">Fields — click to add to JSON data</label>
                <FieldChips
                  fields={fields}
                  selected={selected}
                  onToggle={toggleChip}
                  loading={fieldsLoading}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">
                data <span className="dm-req">*</span>{" "}
                <span style={{ color: "var(--dm-muted)", fontSize: 10, textTransform: "none" }}>
                  — click fields above to populate
                </span>
              </label>
              <JsonBox value={data} onChange={setData} rows={8} />
            </div>
          </div>
        </div>
      </div>
      <SendBtn onClick={send} loading={loading} />
    </div>
  );
}

// Update
function PaneUpdate({ modules, fieldCache, loadFields, onSend, loading }) {
  const [mod, setMod] = useState("");
  const [id, setId] = useState("");
  const [data, setData] = useState("{}");
  const [selected, setSelected] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const fields = mod ? fieldCache[mod] || [] : [];

  const handleMod = async m => {
    setMod(m);
    setSelected([]);
    setData("{}");
    if (m && !fieldCache[m]) {
      setFieldsLoading(true);
      await loadFields(m);
      setFieldsLoading(false);
    }
  };

  const toggleChip = (name, type) => {
    try {
      const obj = JSON.parse(data);
      if (selected.includes(name)) {
        delete obj[name];
        setSelected(prev => prev.filter(f => f !== name));
      } else {
        obj[name] = getPlaceholder(type, name);
        setSelected(prev => [...prev, name]);
      }
      setData(JSON.stringify(obj, null, 2));
    } catch {}
  };

  const send = () => {
    if (!mod || !id.trim()) return alert("Module and Record ID are required");
    try {
      const parsed = JSON.parse(data);
      onSend({ action: "update", module: mod, id: id.trim(), data: parsed });
    } catch { alert("JSON in data is invalid"); }
  };

  return (
    <div className="dm-pane">
      <div className="dm-panel">
        <div className="dm-panel-head">
          <Pill type="POST" />
          <span className="dm-panel-title">Update Record</span>
          <span className="dm-panel-desc">Update fields on an existing record</span>
        </div>
        <div className="dm-panel-body">
          <div className="dm-grid">
            <div className="dm-field">
              <label className="dm-label">Module <span className="dm-req">*</span></label>
              <ModSel value={mod} onChange={handleMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Record ID <span className="dm-req">*</span></label>
              <input className="dm-input" type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={id} onChange={e => setId(e.target.value)} />
            </div>
          </div>

          {mod && (
            <div style={{ marginTop: 14 }}>
              <div className="dm-field">
                <label className="dm-label">Fields — click to add to data JSON</label>
                <FieldChips fields={fields} selected={selected} onToggle={toggleChip} loading={fieldsLoading} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">data <span className="dm-req">*</span></label>
              <JsonBox value={data} onChange={setData} rows={8} />
            </div>
          </div>
        </div>
      </div>
      <SendBtn onClick={send} loading={loading} />
    </div>
  );
}

// Delete
function PaneDelete({ modules, onSend, loading }) {
  const [mod, setMod] = useState("");
  const [id, setId] = useState("");

  const send = () => {
    if (!mod || !id.trim()) return alert("Module and Record ID are required");
    onSend({ action: "delete", module: mod, id: id.trim() });
  };

  return (
    <div className="dm-pane">
      <div className="dm-panel">
        <div className="dm-panel-head">
          <Pill type="DEL" />
          <span className="dm-panel-title">Delete Record</span>
          <span className="dm-panel-desc">Soft-delete (sets deleted=1)</span>
        </div>
        <div className="dm-panel-body">
          <div className="dm-grid">
            <div className="dm-field">
              <label className="dm-label">Module <span className="dm-req">*</span></label>
              <ModSel value={mod} onChange={setMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Record ID <span className="dm-req">*</span></label>
              <input className="dm-input" type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={id} onChange={e => setId(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <SendBtn onClick={send} loading={loading} variant="danger" />
    </div>
  );
}

// Fetch / Search
function PaneFetch({ modules, fieldCache, loadFields, onSend, loading }) {
  const [mod, setMod] = useState("");
  const [dateField, setDateField] = useState("date_entered");
  const [dateRange, setDateRange] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filters, setFilters] = useState("{}");
  const [search, setSearch] = useState("");
  const [searchFields, setSearchFields] = useState("");
  const [orderBy, setOrderBy] = useState("date_entered");
  const [orderDir, setOrderDir] = useState("DESC");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selected, setSelected] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const fields = mod ? fieldCache[mod] || [] : [];

  const handleMod = async m => {
    setMod(m);
    setSelected([]);
    if (m && !fieldCache[m]) {
      setFieldsLoading(true);
      await loadFields(m);
      setFieldsLoading(false);
    }
  };

  const toggleChip = (name) =>
    setSelected(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);

  const send = () => {
    if (!mod) return alert("Please select a module");
    const payload = { action: "fetch", module: mod };
    if (dateRange) {
      payload.date_range = dateRange;
      payload.date_field = dateField || "date_entered";
      if (dateRange === "custom") { payload.date_from = customFrom; payload.date_to = customTo; }
    }
    try { const f = JSON.parse(filters); if (Object.keys(f).length) payload.filters = f; } catch {}
    if (search.trim()) {
      payload.search = search.trim();
      if (searchFields.trim()) payload.search_fields = searchFields.split(",").map(s => s.trim());
    }
    if (selected.length) payload.fields = selected;
    payload.order_by = orderBy || "date_entered";
    payload.order_dir = orderDir;
    payload.page = parseInt(page) || 1;
    payload.per_page = parseInt(perPage) || 20;
    onSend(payload);
  };

  return (
    <div className="dm-pane">
      <div className="dm-panel">
        <div className="dm-panel-head">
          <Pill type="GET" />
          <span className="dm-panel-title">Fetch / Search Records</span>
          <span className="dm-panel-desc">Filter, paginate, date-range, free-text</span>
        </div>
        <div className="dm-panel-body">
          <div className="dm-grid">
            <div className="dm-field">
              <label className="dm-label">Module <span className="dm-req">*</span></label>
              <ModSel value={mod} onChange={handleMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Date Field</label>
              <input className="dm-input" value={dateField} onChange={e => setDateField(e.target.value)} placeholder="date_entered" />
            </div>
          </div>

          <DatePills value={dateRange} onChange={setDateRange}
            customFrom={customFrom} customTo={customTo} onFrom={setCustomFrom} onTo={setCustomTo} />

          {mod && (
            <div style={{ marginTop: 14 }}>
              <div className="dm-field">
                <label className="dm-label">
                  Return Fields{" "}
                  <span style={{ color: "var(--dm-muted)", fontSize: 10, textTransform: "none" }}>
                    — click to select (empty = all)
                  </span>
                </label>
                <FieldChips fields={fields} selected={selected} onToggle={toggleChip} loading={fieldsLoading} />
              </div>
            </div>
          )}

          <div className="dm-grid" style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">Free-text Search</label>
              <input className="dm-input" placeholder="search term…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Search Fields <span style={{ color: "var(--dm-muted)", fontSize: 10 }}>(comma-sep)</span></label>
              <input className="dm-input" placeholder="name,email1,description" value={searchFields} onChange={e => setSearchFields(e.target.value)} />
            </div>
          </div>

          <div className="dm-grid" style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">Filters <span style={{ color: "var(--dm-muted)", fontSize: 10 }}>field=value pairs</span></label>
              <JsonBox value={filters} onChange={setFilters} rows={3} placeholder='{"status":"New"}' />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="dm-field">
                <label className="dm-label">Order By</label>
                <input className="dm-input" value={orderBy} onChange={e => setOrderBy(e.target.value)} />
              </div>
              <div className="dm-field">
                <label className="dm-label">Order Dir</label>
                <select className="dm-select" value={orderDir} onChange={e => setOrderDir(e.target.value)}>
                  <option value="DESC">DESC</option>
                  <option value="ASC">ASC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="dm-grid" style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">Page</label>
              <input className="dm-input" type="number" min={1} value={page} onChange={e => setPage(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Per Page</label>
              <input className="dm-input" type="number" min={1} max={200} value={perPage} onChange={e => setPerPage(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <SendBtn onClick={send} loading={loading} variant="green" />
    </div>
  );
}

// Fetch Related
function PaneFetchRelated({ modules, fieldCache, loadFields, onSend, loading }) {
  const [mod, setMod] = useState("");
  const [id, setId] = useState("");
  const [relMod, setRelMod] = useState("");
  const [dateField, setDateField] = useState("date_entered");
  const [dateRange, setDateRange] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filters, setFilters] = useState("{}");
  const [search, setSearch] = useState("");
  const [searchFields, setSearchFields] = useState("");
  const [orderBy, setOrderBy] = useState("date_entered");
  const [orderDir, setOrderDir] = useState("DESC");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selected, setSelected] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const fields = relMod ? fieldCache[relMod] || [] : [];

  const handleRelMod = async m => {
    setRelMod(m);
    setSelected([]);
    if (m && !fieldCache[m]) {
      setFieldsLoading(true);
      await loadFields(m);
      setFieldsLoading(false);
    }
  };

  const toggleChip = (name) =>
    setSelected(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);

  const send = () => {
    if (!mod || !id.trim() || !relMod) return alert("Parent Module, Parent Record ID, and Related Module are required");
    const payload = { action: "fetch_related", module: mod, id: id.trim(), related_module: relMod };
    if (dateRange) {
      payload.date_range = dateRange;
      payload.date_field = dateField || "date_entered";
      if (dateRange === "custom") { payload.date_from = customFrom; payload.date_to = customTo; }
    }
    try { const f = JSON.parse(filters); if (Object.keys(f).length) payload.filters = f; } catch {}
    if (search.trim()) {
      payload.search = search.trim();
      if (searchFields.trim()) payload.search_fields = searchFields.split(",").map(s => s.trim());
    }
    if (selected.length) payload.fields = selected;
    payload.order_by = orderBy || "date_entered";
    payload.order_dir = orderDir;
    payload.page = parseInt(page) || 1;
    payload.per_page = parseInt(perPage) || 20;
    onSend(payload);
  };

  return (
    <div className="dm-pane">
      <div className="dm-panel">
        <div className="dm-panel-head">
          <Pill type="GET" />
          <span className="dm-panel-title">Fetch Related Records</span>
          <span className="dm-panel-desc">Get child/related records from a parent record</span>
        </div>
        <div className="dm-panel-body">
          <div className="dm-grid">
            <div className="dm-field">
              <label className="dm-label">Parent Module <span className="dm-req">*</span></label>
              <ModSel value={mod} onChange={setMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Parent Record ID <span className="dm-req">*</span></label>
              <input className="dm-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={id} onChange={e => setId(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Related Module <span className="dm-req">*</span></label>
              <ModSel value={relMod} onChange={handleRelMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Date Field</label>
              <input className="dm-input" value={dateField} onChange={e => setDateField(e.target.value)} />
            </div>
          </div>

          <DatePills value={dateRange} onChange={setDateRange}
            customFrom={customFrom} customTo={customTo} onFrom={setCustomFrom} onTo={setCustomTo} />

          {relMod && (
            <div style={{ marginTop: 14 }}>
              <div className="dm-field">
                <label className="dm-label">
                  Return Fields{" "}
                  <span style={{ color: "var(--dm-muted)", fontSize: 10, textTransform: "none" }}>
                    — click to select (empty = all)
                  </span>
                </label>
                <FieldChips fields={fields} selected={selected} onToggle={toggleChip} loading={fieldsLoading} />
              </div>
            </div>
          )}

          <div className="dm-grid" style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">Free-text Search</label>
              <input className="dm-input" placeholder="search term…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Search Fields <span style={{ color: "var(--dm-muted)", fontSize: 10 }}>(comma-sep)</span></label>
              <input className="dm-input" placeholder="name,email1" value={searchFields} onChange={e => setSearchFields(e.target.value)} />
            </div>
          </div>

          <div className="dm-grid" style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">Filters</label>
              <JsonBox value={filters} onChange={setFilters} rows={3} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="dm-field">
                <label className="dm-label">Order By</label>
                <input className="dm-input" value={orderBy} onChange={e => setOrderBy(e.target.value)} />
              </div>
              <div className="dm-field">
                <label className="dm-label">Order Dir</label>
                <select className="dm-select" value={orderDir} onChange={e => setOrderDir(e.target.value)}>
                  <option value="DESC">DESC</option>
                  <option value="ASC">ASC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="dm-grid" style={{ marginTop: 14 }}>
            <div className="dm-field">
              <label className="dm-label">Page</label>
              <input className="dm-input" type="number" min={1} value={page} onChange={e => setPage(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Per Page</label>
              <input className="dm-input" type="number" min={1} max={200} value={perPage} onChange={e => setPerPage(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <SendBtn onClick={send} loading={loading} variant="green" />
    </div>
  );
}

// Add / Remove Relationship
function PaneRelationship({ action, modules, onSend, loading }) {
  const [mod, setMod] = useState("");
  const [id, setId] = useState("");
  const [relMod, setRelMod] = useState("");
  const [relId, setRelId] = useState("");
  const [relName, setRelName] = useState("");

  const isRemove = action === "remove_relationship";

  const send = () => {
    if (!mod || !id.trim() || !relMod || !relId.trim())
      return alert("Module, Record ID, Related Module, and Related Record ID are required");
    const payload = { action, module: mod, id: id.trim(), related_module: relMod, related_id: relId.trim() };
    if (relName.trim()) payload.relationship_name = relName.trim();
    onSend(payload);
  };

  return (
    <div className="dm-pane">
      <div className="dm-panel">
        <div className="dm-panel-head">
          <Pill type={isRemove ? "DEL" : "POST"} />
          <span className="dm-panel-title">{isRemove ? "Remove Relationship" : "Add Relationship"}</span>
          <span className="dm-panel-desc">{isRemove ? "Unlink two records" : "Link two records via a named relationship"}</span>
        </div>
        <div className="dm-panel-body">
          <div className="dm-grid">
            <div className="dm-field">
              <label className="dm-label">Parent Module <span className="dm-req">*</span></label>
              <ModSel value={mod} onChange={setMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Parent Record ID <span className="dm-req">*</span></label>
              <input className="dm-input" placeholder="parent record UUID" value={id} onChange={e => setId(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Related Module <span className="dm-req">*</span></label>
              <ModSel value={relMod} onChange={setRelMod} modules={modules} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Related Record ID <span className="dm-req">*</span></label>
              <input className="dm-input" placeholder="related record UUID" value={relId} onChange={e => setRelId(e.target.value)} />
            </div>
            <div className="dm-field">
              <label className="dm-label">Relationship Name <span style={{ color: "var(--dm-muted)", fontSize: 10 }}>(optional)</span></label>
              <input className="dm-input" placeholder="accounts_contacts" value={relName} onChange={e => setRelName(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <SendBtn onClick={send} loading={loading} variant={isRemove ? "danger" : ""} />
    </div>
  );
}

// JSON Schema Reference
const SCHEMA_TABS = [
  { key: "create", label: "create" },
  { key: "update", label: "update" },
  { key: "delete", label: "delete" },
  { key: "fetch", label: "fetch" },
  { key: "fetch_related", label: "fetch_related" },
  { key: "add_rel", label: "add_relationship" },
  { key: "rem_rel", label: "remove_relationship" },
];

const SCHEMAS = {
  create: {
    req: `{\n  "action": "create",\n  "module": "Accounts",\n  "data": {\n    "name":         "Acme Corp",\n    "phone_office": "123-456-7890",\n    "website":      "https://acme.com"\n  }\n}`,
    res: `{\n  "success": true,\n  "action":  "create",\n  "module":  "Accounts",\n  "id":      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"\n}`,
  },
  update: {
    req: `{\n  "action": "update",\n  "module": "Accounts",\n  "id":     "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",\n  "data": {\n    "phone_office": "999-000-1111"\n  }\n}`,
    res: `{\n  "success": true,\n  "action":  "update",\n  "module":  "Accounts",\n  "id":      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"\n}`,
  },
  delete: {
    req: `{\n  "action": "delete",\n  "module": "Leads",\n  "id":     "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"\n}`,
    res: `{\n  "success": true,\n  "action":  "delete",\n  "module":  "Leads",\n  "id":      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"\n}`,
  },
  fetch: {
    req: `{\n  "action":       "fetch",\n  "module":       "Leads",\n  "date_range":   "today",\n  "date_field":   "date_entered",\n  "date_from":    "2025-01-01",\n  "date_to":      "2025-03-31",\n  "filters":      { "status": "New" },\n  "search":       "acme",\n  "search_fields":["first_name","last_name","email1"],\n  "fields":       ["first_name","last_name","status"],\n  "order_by":     "date_entered",\n  "order_dir":    "DESC",\n  "page":         1,\n  "per_page":     20\n}`,
    res: `{\n  "success":     true,\n  "action":      "fetch",\n  "module":      "Leads",\n  "total":       142,\n  "page":        1,\n  "per_page":    20,\n  "total_pages": 8,\n  "records": [\n    { "id": "...", "first_name": "John", "last_name": "Doe" }\n  ]\n}`,
  },
  fetch_related: {
    req: `{\n  "action":         "fetch_related",\n  "module":         "Accounts",\n  "id":             "acc-111",\n  "related_module": "Contacts",\n  "date_range":     "this_month",\n  "fields":         ["first_name","last_name","email1"],\n  "order_by":       "date_entered",\n  "order_dir":      "DESC",\n  "page":           1,\n  "per_page":       20\n}`,
    res: `{\n  "success":        true,\n  "action":         "fetch_related",\n  "related_module": "Contacts",\n  "total":          5,\n  "records":        [ ... ]\n}`,
  },
  add_rel: {
    req: `{\n  "action":            "add_relationship",\n  "module":            "Accounts",\n  "id":                "acc-uuid",\n  "related_module":    "Contacts",\n  "related_id":        "con-uuid",\n  "relationship_name": "accounts_contacts"\n}`,
    res: `{\n  "success":           true,\n  "action":            "add_relationship",\n  "module":            "Accounts",\n  "id":                "acc-uuid",\n  "related_module":    "Contacts",\n  "related_id":        "con-uuid"\n}`,
  },
  rem_rel: {
    req: `{\n  "action":            "remove_relationship",\n  "module":            "Accounts",\n  "id":                "acc-uuid",\n  "related_module":    "Contacts",\n  "related_id":        "con-uuid",\n  "relationship_name": "accounts_contacts"\n}`,
  },
};

function PaneSchema() {
  const [active, setActive] = useState("create");
  const s = SCHEMAS[active];
  return (
    <div className="dm-pane">
      <div className="dm-panel" style={{ background: "var(--dm-surface)" }}>
        <div className="dm-panel-head" style={{ padding: 0 }}>
          <div className="dm-schema-tabs" style={{ width: "100%" }}>
            {SCHEMA_TABS.map(t => (
              <button key={t.key} className={`dm-schema-tab${active === t.key ? " active" : ""}`}
                onClick={() => setActive(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="dm-schema-body">
          <div style={{ position: "relative" }}>
            <button className="dm-copy-btn"
              onClick={() => navigator.clipboard.writeText(s.req).catch(() => {})}>Copy</button>
            <pre className="dm-schema-code" dangerouslySetInnerHTML={{ __html: syntaxHighlight(s.req) }} />
          </div>
          {s.res && (
            <>
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--dm-muted)" }}>Response:</div>
              <pre className="dm-schema-code" style={{ marginTop: 6 }}
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(s.res) }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ITEMS ────────────────────────────────────────────────────────────

const SIDEBAR = [
  { section: "Actions" },
  { key: "create",            label: "Create Record",      pill: "POST", icon: "plus-circle" },
  { key: "update",            label: "Update Record",      pill: "POST", icon: "edit" },
  { key: "delete",            label: "Delete Record",      pill: "DEL",  icon: "trash" },
  { key: "fetch",             label: "Fetch / Search",     pill: "GET",  icon: "search" },
  { key: "fetch_related",     label: "Fetch Related",      pill: "GET",  icon: "layers" },
  { section: "Relationships" },
  { key: "add_relationship",  label: "Add Relationship",   pill: "POST", icon: "link" },
  { key: "remove_relationship", label: "Remove Relationship", pill: "DEL", icon: "unlink" },
  { section: "Reference" },
  { key: "schema",            label: "JSON Schemas",       pill: null,   icon: "file-text" },
];

const ICON_PATHS = {
  "plus-circle": <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  "edit": <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  "trash": <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></>,
  "search": <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  "layers": <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></>,
  "link": <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  "unlink": <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></>,
  "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
};
const Icon = ({ name }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    {ICON_PATHS[name]}
  </svg>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DataModellingPage() {
  const { crmEndpoint } = useSelector(s => s.user);

  const [active, setActive]       = useState("create");
  const [modules, setModules]     = useState([]);
  const [fieldCache, setFieldCache] = useState({});
  const [sending, setSending]     = useState(false);
  const [resp, setResp]           = useState({ html: "", status: "IDLE", ms: "" });

  // Derive base URL from crmEndpoint
  // crmEndpoint looks like: https://your-crm.com/index.php?token=xxx&...
  const baseUrl = crmEndpoint ? crmEndpoint.split("index.php")[0] : "";
  const apiUrl  = baseUrl ? `${baseUrl}index.php?entryPoint=smart_gateway` : "";

  // ── Load module list from real endpoint ───────────────────────────────────
  // GET https://your-crm.com/index.php?entryPoint=get_module_list
  // Returns: { "Accounts": "Accounts", "Leads": "Leads", ... }
  useEffect(() => {
    if (!baseUrl) return;
    const url = `${baseUrl}index.php?entryPoint=get_module_list`;
    fetch(url, { credentials: "same-origin" })
      .then(r => r.json())
      .then(data => {
        // data is an object like { "Accounts": "Accounts", "Leads": "Leads" }
        // We store as array of { key (module name), label }
        if (data && typeof data === "object") {
          const list = Object.entries(data).map(([key, label]) => ({ key, label }));
          setModules(list);
        }
      })
      .catch(console.error);
  }, [baseUrl]);

  // ── Load fields for a module from real endpoint ───────────────────────────
  // GET https://your-crm.com/index.php?entryPoint=get_fields&module_name=Accounts
  const loadFields = useCallback(async (moduleName) => {
    if (fieldCache[moduleName] !== undefined) return; // already cached
    // optimistically set empty so concurrent calls don't double-fetch
    setFieldCache(prev => ({ ...prev, [moduleName]: [] }));
    try {
      const url = `${baseUrl}index.php?entryPoint=get_fields&module_name=${encodeURIComponent(moduleName)}`;
      const r = await fetch(url, { credentials: "same-origin" });
      const data = await r.json();
      // Normalise whatever shape the endpoint returns into [{name, type, label}]
      let fields = [];
      if (Array.isArray(data)) {
        // already an array
        fields = data.map(f => ({
          name:  f.name  || f.field_name || String(f),
          type:  f.type  || "varchar",
          label: f.label || f.name || "",
        }));
      } else if (data && typeof data === "object") {
        // object keyed by field name: { "name": { type, label }, ... }
        fields = Object.entries(data).map(([name, meta]) => ({
          name,
          type:  (meta && meta.type)  || "varchar",
          label: (meta && meta.label) || name,
        }));
      }
      setFieldCache(prev => ({ ...prev, [moduleName]: fields }));
    } catch {
      setFieldCache(prev => ({ ...prev, [moduleName]: [] }));
    }
  }, [baseUrl, fieldCache]);

  // ── Send action (POST to smart_gateway) ───────────────────────────────────
  const handleSend = async (payload) => {
    setSending(true);
    setResp({ html: '<span style="color:var(--dm-muted)">Sending request…</span>', status: "...", ms: "" });
    const t0 = Date.now();

    try {
      const token = await generateToken();
      const res = await fetch(apiUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Token": token,
        },
        body: JSON.stringify(payload),
      });

      const ms = Date.now() - t0;
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { data = { success: false, error: "Invalid JSON response", raw: text }; }

      const ok = res.ok && data?.success !== false;
      setResp({
        html: syntaxHighlight(JSON.stringify(data, null, 3)),
        status: ok ? "SUCCESS" : "ERROR",
        ms: `${ms} ms`,
      });
    } catch (err) {
      const ms = Date.now() - t0;
      setResp({
        html: syntaxHighlight(JSON.stringify({ success: false, error: err.message }, null, 3)),
        status: "ERROR",
        ms: `${ms} ms`,
      });
    } finally {
      setSending(false);
    }
  };

  const copyResp = () => {
    const el = document.getElementById("dm-resp-body");
    if (el) navigator.clipboard.writeText(el.innerText).catch(() => {});
  };
  const clearResp = () => setResp({ html: '<span style="color:var(--dm-muted);font-style:italic">Cleared.</span>', status: "IDLE", ms: "" });

  const sharedProps = { modules, fieldCache, loadFields, onSend: handleSend, loading: sending };

  return (
    <div className="dm-wrap">
      <style>{CSS}</style>
      <div className="dm-app">

        {/* TOPBAR */}
        <header className="dm-topbar">
          <div className="dm-logo">ORC<span>Data</span> Modelling</div>
        </header>

        {/* SIDEBAR */}
        <nav className="dm-sidebar">
          {SIDEBAR.map((item, i) =>
            item.section
              ? <div key={i} className="dm-section">{item.section}</div>
              : (
                <button key={item.key}
                  className={`dm-action-btn${active === item.key ? " active" : ""}`}
                  onClick={() => setActive(item.key)}
                >
                  <Icon name={item.icon} />
                  {item.label}
                  {item.pill && (
                    <span className={`dm-pill dm-pill-${item.pill.toLowerCase()}`}>{item.pill}</span>
                  )}
                </button>
              )
          )}
        </nav>

        {/* MAIN */}
        <main className="dm-main">
          {active === "create"              && <PaneCreate          {...sharedProps} />}
          {active === "update"              && <PaneUpdate          {...sharedProps} />}
          {active === "delete"              && <PaneDelete          {...sharedProps} />}
          {active === "fetch"               && <PaneFetch           {...sharedProps} />}
          {active === "fetch_related"       && <PaneFetchRelated    {...sharedProps} />}
          {active === "add_relationship"    && <PaneRelationship    action="add_relationship"    {...sharedProps} />}
          {active === "remove_relationship" && <PaneRelationship    action="remove_relationship" {...sharedProps} />}
          {active === "schema"              && <PaneSchema />}

          {/* RESPONSE PANEL – always visible except schema */}
          {active !== "schema" && (
            <div className="dm-resp-panel">
              <div className="dm-resp-head">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Response</span>
                <span className={`dm-resp-status ${
                  resp.status === "SUCCESS" ? "dm-resp-ok" :
                  resp.status === "ERROR"   ? "dm-resp-err" : "dm-resp-idle"
                }`}>{resp.status}</span>
                {resp.ms && <span className="dm-resp-time">{resp.ms}</span>}
                <button className="dm-btn" style={{ marginLeft: "auto" }} onClick={copyResp}>Copy</button>
                <button className="dm-btn" onClick={clearResp}>Clear</button>
              </div>
              <pre
                id="dm-resp-body"
                className="dm-resp-body"
                dangerouslySetInnerHTML={{
                  __html: resp.html || '<span style="color:var(--dm-muted);font-style:italic">Waiting for request…</span>',
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  ExternalLink,
  Globe,
  Tag,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Activity,
  FileText,
  Link2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BadgeInfo,
  Layers3,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import EditWebSite from "./EditWebSite";
import { useSelector, useDispatch } from "react-redux";
import {
  createWebsite,
  deleteWebsite,
  getManageWeb,
  updateWebsite,
  webManagerAction,
} from "../../../store/Slices/webManager.js";
import { toast } from "react-toastify";

/* ─── helpers ───────────────────────────────────────────────── */
const getDomain = (raw) => {
  if (!raw) return "";
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const { hostname } = new URL(withProtocol);
    return hostname.replace(/^www\./i, "");
  } catch {
    return String(raw)
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0];
  }
};
const getFullUrl = (raw) =>
  !raw ? "" : /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
const getFavicon = (domain) =>
  domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`
    : "";
const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num)
    ? null
    : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v.trim());
const cleanValue = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};
const spamColor = (score) => {
  if (score === null)
    return { bg: "#f1f5f9", text: "#94a3b8", border: "#e2e8f0" };
  const n = Number(score);
  if (Number.isNaN(n))
    return { bg: "#f1f5f9", text: "#94a3b8", border: "#e2e8f0" };
  if (n <= 5) return { bg: "#ecfdf5", text: "#059669", border: "#6ee7b7" };
  if (n <= 30) return { bg: "#fffbeb", text: "#d97706", border: "#fcd34d" };
  return { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" };
};

/* ─── Stat pill ─────────────────────────────────────────────── */
const Pill = ({ label, value, accent = "#6366f1" }) => (
  <div
    style={{ borderColor: `${accent}25`, background: `${accent}08` }}
    className="rounded-xl border p-2.5 text-center"
  >
    <div
      className="text-[9px] uppercase tracking-widest font-bold mb-1"
      style={{ color: accent }}
    >
      {label}
    </div>
    <div className="text-base font-black text-gray-900 leading-none">
      {value ?? "—"}
    </div>
  </div>
);

/* ─── Row detail for the expanded drawer ───────────────────── */
const DrawerRow = ({ icon: Icon, label, value }) => {
  const cleaned = cleanValue(value);
  const linked = cleaned && isUrl(cleaned);
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Icon size={12} />
        {label}
      </div>
      {cleaned ? (
        linked ? (
          <a
            href={cleaned}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
          >
            Open <ExternalLink size={10} />
          </a>
        ) : (
          <span className="text-xs font-semibold text-gray-800 text-right max-w-[55%] break-all">
            {cleaned}
          </span>
        )
      ) : (
        <span className="text-xs text-gray-300">—</span>
      )}
    </div>
  );
};

/* ─── Main Card ─────────────────────────────────────────────── */
function WebCard({
  item,
  onEdit,
  onDelete,
  onRefresh,
  refreshingId,
  updating,
  deleting,
  deleteWebsiteId,
}) {
  const [expanded, setExpanded] = useState(false);

  const rawName = item.name || item.website || "";
  const domain = getDomain(rawName);
  const fullUrl = getFullUrl(rawName);
  const favicon = getFavicon(domain);

  const minRaw = item.minAmount ?? item.minimum_price;
  const maxRaw = item.maxAmount ?? item.amount;
  const minStr = formatMoney(minRaw);
  const maxStr = formatMoney(maxRaw);
  const minNum = Number(minRaw);
  const maxNum = Number(maxRaw);
  const hasRange =
    !Number.isNaN(minNum) &&
    !Number.isNaN(maxNum) &&
    maxNum > 0 &&
    maxNum >= minNum;
  const avg = hasRange ? (minNum + maxNum) / 2 : null;

  const da = cleanValue(item.da);
  const pa = cleanValue(item.pa);
  const drRaw = cleanValue(item.dr);
  const drIsLink = drRaw && isUrl(drRaw);
  const spam = cleanValue(item.spam_score);
  const traffic = cleanValue(item.traffic);
  const gpCount = cleanValue(item.gp_count);
  const liCount = cleanValue(item.li_count);
  const spamC = spamColor(spam);
  const isDeleted = item.deleted === "1";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 flex flex-col overflow-hidden transition-all duration-300 group"
    >
      {/* accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: isDeleted
            ? "linear-gradient(90deg,#f43f5e,#fb923c)"
            : "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)",
        }}
      />

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        {/* favicon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
          {favicon ? (
            <>
              <img
                src={favicon}
                alt=""
                className="w-6 h-6"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling &&
                    (e.currentTarget.nextSibling.style.display = "flex");
                }}
              />
              <Globe
                size={16}
                className="text-indigo-400"
                style={{ display: "none" }}
              />
            </>
          ) : (
            <Globe size={16} className="text-indigo-400" />
          )}
        </div>

        {/* title + url */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="text-sm font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors leading-tight"
              title={domain || rawName}
            >
              {domain || rawName || "Untitled"}
            </h2>
            {/* status badge */}
            <span
              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isDeleted
                  ? "bg-red-50 text-red-500 border-red-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}
            >
              {isDeleted ? "Deleted" : "Active"}
            </span>
          </div>

          {/* slug + spam inline */}
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              <Tag size={9} />
              {item.slug || "no-slug"}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                background: spamC.bg,
                color: spamC.text,
                borderColor: spamC.border,
              }}
            >
              <ShieldAlert size={9} />
              Spam {spam !== null ? `${spam}%` : "—"}
            </span>
            {fullUrl && (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <ExternalLink size={9} />
                Visit
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── DA / PA / DR ── */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-3">
        <Pill label="DA" value={da} accent="#6366f1" />
        <Pill label="PA" value={pa} accent="#8b5cf6" />
        <div
          style={{ borderColor: "#06b6d415", background: "#06b6d408" }}
          className="rounded-xl border p-2.5 text-center"
        >
          <div className="text-[9px] uppercase tracking-widest font-bold mb-1 text-cyan-500">
            DR
          </div>
          {drIsLink ? (
            <a
              href={drRaw}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-cyan-500 hover:underline flex items-center justify-center gap-1"
            >
              Check <ExternalLink size={9} />
            </a>
          ) : (
            <div className="text-base font-black text-gray-900 leading-none">
              {drRaw ?? "—"}
            </div>
          )}
        </div>
      </div>

      {/* ── Traffic / GP / LI ── */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-3">
        {[
          { icon: Activity, label: "Traffic", value: traffic },
          { icon: FileText, label: "GP", value: gpCount },
          { icon: Link2, label: "LI", value: liCount },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center"
          >
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-1">
              <Icon size={9} />
              {label}
            </div>
            <div className="text-sm font-black text-gray-800">
              {value ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {/* ── Price Range ── */}
      <div className="mx-4 mb-3 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-gray-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
            Price Range
          </span>
          {avg !== null && (
            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-0.5">
              <DollarSign size={9} />
              avg ${formatMoney(avg)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold uppercase tracking-wide">
              <TrendingDown size={9} /> Min
            </div>
            <div className="text-lg font-black text-gray-900">
              {minStr !== null ? `$${minStr}` : "—"}
            </div>
          </div>
          {/* divider bar */}
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden mx-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-cyan-400"
              style={{
                width: hasRange ? "100%" : minStr || maxStr ? "50%" : "0%",
              }}
            />
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[9px] text-indigo-600 font-bold uppercase tracking-wide">
              Max <TrendingUp size={9} />
            </div>
            <div className="text-lg font-black text-gray-900">
              {maxStr !== null ? `$${maxStr}` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Expandable Details ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mx-4 mb-3 flex items-center justify-between w-[calc(100%-2rem)] text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors py-1"
      >
        <span className="flex items-center gap-1.5 text-gray-900">
          <Sparkles size={11} />
          Additional Details
        </span>
        {expanded ? (
          <ChevronUp className="text-gray-900" size={13} />
        ) : (
          <ChevronDown className="text-gray-900" size={13} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <Motion.div
            key="drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden px-4 pb-2"
          >
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1">
              <DrawerRow
                icon={BadgeInfo}
                label="Category"
                value={item.category}
              />
              <DrawerRow icon={Layers3} label="Premium" value={item.premium} />
              <DrawerRow
                icon={Activity}
                label="Google Traffic"
                value={item.google_traffic}
              />
              <DrawerRow
                icon={Activity}
                label="Ahrefs Traffic"
                value={item.ahref_traffic}
              />
              <DrawerRow
                icon={Activity}
                label="Semrush Traffic"
                value={item.semrush_traffic}
              />
              <DrawerRow
                icon={DollarSign}
                label="Non-Brand Min"
                value={item.non_brand_minimum_amount}
              />
              <DrawerRow
                icon={DollarSign}
                label="Non-Brand Max"
                value={item.non_brand_maximum_amount}
              />
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Actions ── */}
      <div className="mt-auto px-4 py-3 border-t border-gray-50 bg-gray-50/60 flex items-center justify-end gap-2">
        {/* Refresh */}
        <button
          onClick={() => onRefresh(item)}
          disabled={
            refreshingId === item.id ||
            (updating && refreshingId !== item.id) ||
            deleting
          }
          title="Refresh"
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:scale-95 transition-all disabled:opacity-40"
        >
          <RefreshCw
            size={13}
            className={refreshingId === item.id ? "animate-spin" : ""}
          />
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(item)}
          disabled={updating || deleting}
          title="Edit"
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all disabled:opacity-40"
        >
          <Edit3 size={13} />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(item)}
          disabled={deleteWebsiteId === item.id || deleting}
          title="Delete"
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all disabled:opacity-40"
        >
          {deleteWebsiteId === item.id ? (
            <span className="text-[10px] font-bold text-red-400">...</span>
          ) : (
            <Trash2 size={13} />
          )}
        </button>
      </div>
    </Motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function WebsitesPage() {
  const [editItem, setEditItem] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);

  const {
    websites,
    loading,
    error,
    message,
    creating,
    updating,
    deleting,
    deleteWebsiteId,
  } = useSelector((state) => state.webManager);
  const dispatch = useDispatch();

  const handleCreate = (updatedItem) => dispatch(createWebsite(updatedItem));
  const handleUpdate = (updatedItem) => dispatch(updateWebsite(updatedItem));

  const handleDelete = (item) => {
    const websiteName = item.website_name || item.name || item.website;
    if (!window.confirm(`Are you sure you want to delete ${websiteName}?`))
      return;
    dispatch(deleteWebsite(item));
  };

  const handleRefresh = (item) => {
    if (refreshingId) return;
    setRefreshingId(item.id);
    dispatch(
      updateWebsite(item, {
        idOnly: true,
        successMessage: "Website refreshed successfully",
        failureMessage: "Website refresh failed",
      }),
    );
  };

  useEffect(() => {
    if (!updating && refreshingId) setRefreshingId(null);
  }, [updating, refreshingId]);
  useEffect(() => {
    dispatch(getManageWeb());
  }, [dispatch]);
  useEffect(() => {
    if (!message) return;
    toast.success(message);
    dispatch(webManagerAction.clearAllMessages());
  }, [dispatch, message]);
  useEffect(() => {
    if (!error) return;
    toast.error(error);
    dispatch(webManagerAction.clearAllErrors());
  }, [dispatch, error]);

  return (
    <div className="p-6 lg:p-8">
      <Header
        text="Website Manager"
        handleCreate={() => setEditItem({ type: "new" })}
      />

      {loading && <Loading text="Websites" />}

      {error && (
        <ErrorBox message={error} onRetry={() => dispatch(getManageWeb())} />
      )}

      {!loading && !error && websites.length === 0 && (
        <div className="mt-8 text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <Globe size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">No websites yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Add your first website to get started.
          </p>
        </div>
      )}

      {!loading && websites.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {websites.map((item, i) => (
            <Motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <WebCard
                item={item}
                onEdit={setEditItem}
                onDelete={handleDelete}
                onRefresh={handleRefresh}
                refreshingId={refreshingId}
                updating={updating}
                deleting={deleting}
                deleteWebsiteId={deleteWebsiteId}
              />
            </Motion.div>
          ))}
        </div>
      )}

      <EditWebSite
        item={editItem}
        onClose={() => setEditItem(null)}
        handleUpdate={handleUpdate}
        handleCreate={handleCreate}
        saving={creating || updating}
      />
    </div>
  );
}

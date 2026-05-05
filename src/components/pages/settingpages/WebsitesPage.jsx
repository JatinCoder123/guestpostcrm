import { motion as Motion } from "framer-motion";
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

// Pull a clean domain (e.g. "sugarai.com") out of a raw value that may be a
// URL or a plain name.
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

// Make sure we always have an absolute URL we can link to.
const getFullUrl = (raw) => {
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

// Google's free favicon service – no API key, works for any public domain.
const getFavicon = (domain) =>
  domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`
    : "";

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// True when a value looks like an http(s) URL (e.g. the `dr` field can come
// back as an Ahrefs checker link instead of a numeric DR score).
const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v.trim());

// Normalize "", null, undefined to null so we can show an em-dash placeholder.
const cleanValue = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

// Color tone for the spam-score chip — lower is better.
const spamTone = (score) => {
  if (score === null) return "bg-gray-100 text-gray-500 border-gray-200";
  const n = Number(score);
  if (Number.isNaN(n)) return "bg-gray-100 text-gray-500 border-gray-200";
  if (n <= 5) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (n <= 30) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
};

export default function WebsitesPage() {
  const [editItem, setEditItem] = useState(null);
  // Tracks which card is currently being refreshed so we can show a
  // per-card spinner (the global `updating` flag would disable every card).
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

  const handleCreate = (updatedItem) => {
    dispatch(createWebsite(updatedItem));
  };

  const handleUpdate = (updatedItem) => {
    dispatch(updateWebsite(updatedItem));
  };

  const handleDelete = (item) => {
    const websiteName = item.website_name || item.name || item.website;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${websiteName}?`,
    );

    if (!confirmDelete) return;
    dispatch(deleteWebsite(item));
  };

  // Refresh a single card by re-PUT-ing the existing record. The backend is
  // expected to re-scrape and return the latest DA/PA/DR/etc. on update.
  const handleRefresh = (item) => {
    if (refreshingId) return; // one at a time
    setRefreshingId(item.id);
    dispatch(
      updateWebsite(item, {
        idOnly: true,
        successMessage: "Website refreshed successfully",
        failureMessage: "Website refresh failed",
      }),
    );
  };

  // Clear the per-card refreshing flag once the global update finishes.
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
    <div className="p-8">
      {/* Header */}
      <Header
        text={"Website Manager"}
        handleCreate={() =>
          setEditItem(() => {
            return {
              type: "new",
            };
          })
        }
      />
      {/* Loading Skeleton */}
      {loading && <Loading text={"Websites"} />}

      {/* Error Component */}
      {error && (
        <ErrorBox message={error} onRetry={() => dispatch(getManageWeb())} />
      )}

      {/* Empty State */}
      {!loading && !error && websites.length === 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No Websites found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add new items from your backend or configuration panel.
          </p>
        </div>
      )}

      {/* Data Cards */}
      {!loading && websites.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((item) => {
            const rawName =
              item.website_name || item.name || item.website || "";
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

            // SEO + engagement metrics
            const da = cleanValue(item.da);
            const pa = cleanValue(item.pa);
            const drRaw = cleanValue(item.dr);
            const drIsLink = drRaw && isUrl(drRaw);
            const spam = cleanValue(item.spam_score);
            const traffic = cleanValue(item.traffic);
            const gpCount = cleanValue(item.gp_count);
            const liCount = cleanValue(item.li_count);

            return (
              <Motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl
                  border border-gray-200 hover:border-blue-300
                  flex flex-col overflow-hidden group transition-all"
              >
                {/* Decorative gradient strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                {/* Header: favicon + domain + visit link */}
                <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br
                      from-blue-50 to-indigo-50 border border-blue-100
                      flex items-center justify-center overflow-hidden"
                  >
                    {favicon ? (
                      <img
                        src={favicon}
                        alt=""
                        className="w-7 h-7"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling &&
                            (e.currentTarget.nextSibling.style.display =
                              "flex");
                        }}
                      />
                    ) : null}
                    <Globe
                      size={22}
                      className="text-blue-500"
                      style={{ display: favicon ? "none" : "flex" }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2
                      className="text-base font-semibold text-gray-900 truncate
                        group-hover:text-blue-600 transition"
                      title={domain || rawName}
                    >
                      {domain || rawName || "Untitled website"}
                    </h2>
                    {fullUrl && (
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs
                          text-gray-500 hover:text-blue-600 truncate max-w-full"
                        title={fullUrl}
                      >
                        <span className="truncate">{rawName}</span>
                        <ExternalLink size={12} className="flex-shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Slug pill + spam-score chip */}
                <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs
                      font-medium rounded-full bg-blue-50 text-blue-700
                      border border-blue-100"
                  >
                    <Tag size={12} />
                    {item.slug || "no-slug"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${spamTone(spam)}`}
                    title="Spam Score (lower is better)"
                  >
                    <ShieldAlert size={12} />
                    Spam {spam !== null ? `${spam}%` : "—"}
                  </span>
                </div>

                {/* SEO metrics: DA / PA / DR */}
                <div className="mx-5 mb-3 grid grid-cols-3 gap-2">
                  <div
                    className="rounded-lg border border-blue-100 bg-blue-50/60 p-2 text-center"
                    title="Domain Authority"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-600">
                      DA
                    </div>
                    <div className="text-base font-bold text-gray-900 leading-tight">
                      {da ?? "—"}
                    </div>
                  </div>
                  <div
                    className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 text-center"
                    title="Page Authority"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600">
                      PA
                    </div>
                    <div className="text-base font-bold text-gray-900 leading-tight">
                      {pa ?? "—"}
                    </div>
                  </div>
                  <div
                    className="rounded-lg border border-purple-100 bg-purple-50/60 p-2 text-center"
                    title="Domain Rating"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-purple-600">
                      DR
                    </div>
                    {drIsLink ? (
                      <a
                        href={drRaw}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-purple-700 hover:underline leading-tight"
                      >
                        Check
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <div className="text-base font-bold text-gray-900 leading-tight">
                        {drRaw ?? "—"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Engagement metrics: Traffic / Guest Posts / Links */}
                <div className="mx-5 mb-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                      <Activity size={11} />
                      Traffic
                    </div>
                    <div className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">
                      {traffic ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                      <FileText size={11} />
                      GP
                    </div>
                    <div className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">
                      {gpCount ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                      <Link2 size={11} />
                      LI
                    </div>
                    <div className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">
                      {liCount ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Price block */}
                <div className="mx-5 mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/60 border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                      Price Range
                    </span>
                    {avg !== null && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600">
                        <DollarSign size={11} />
                        avg ${formatMoney(avg)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <TrendingDown size={12} />
                        Min
                      </div>
                      <div className="text-lg font-bold text-gray-900 leading-tight">
                        {minStr !== null ? `$${minStr}` : "—"}
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-1 text-[11px] text-blue-700 font-medium">
                        Max
                        <TrendingUp size={12} />
                      </div>
                      <div className="text-lg font-bold text-gray-900 leading-tight">
                        {maxStr !== null ? `$${maxStr}` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Range bar */}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500"
                      style={{
                        width: hasRange
                          ? "100%"
                          : minStr || maxStr
                            ? "50%"
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* Actions footer */}
                <div className="mt-auto px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRefresh(item)}
                      disabled={
                        refreshingId === item.id ||
                        (updating && refreshingId !== item.id) ||
                        deleting
                      }
                      title="Refresh website data"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                        bg-white border border-gray-200 text-gray-700
                        rounded-lg shadow-sm hover:bg-emerald-50 hover:text-emerald-700
                        hover:border-emerald-200 active:scale-95
                        transition-all disabled:opacity-50"
                    >
                      <RefreshCw
                        size={14}
                        className={
                          refreshingId === item.id ? "animate-spin" : ""
                        }
                      />
                      {refreshingId === item.id ? "Refreshing" : "Refresh"}
                    </button>
                    <button
                      onClick={() => setEditItem(item)}
                      disabled={updating || deleting}
                      title="Edit website"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                        bg-white border border-gray-200 text-gray-700
                        rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-700
                        hover:border-blue-200 active:scale-95
                        transition-all disabled:opacity-50"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleteWebsiteId === item.id || deleting}
                      title="Delete website"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                        bg-white border border-gray-200 text-gray-700
                        rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700
                        hover:border-red-200 active:scale-95
                        transition-all disabled:opacity-50"
                    >
                      {deleteWebsiteId === item.id ? (
                        "..."
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
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

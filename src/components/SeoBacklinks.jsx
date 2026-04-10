import {
  Pencil,
  Trash,
  Check,
  LinkIcon,
  Dock,
  SparkleIcon,
} from "lucide-react";
import {
  FiLink,
  FiTag,
  FiLayers,
  FiAlertTriangle,
  FiGlobe,
  FiTrendingUp,
} from "react-icons/fi";
import UpdatePopup from "./UpdatePopup";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLink, orderAction, updateSeoLink } from "../store/Slices/orders";
import { LoadingChase } from "./Loading";
import { Fa500Px, FaAccusoft, FaAddressBook, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function ValidTick() {
  return (
    <span className="relative group ml-2 inline-flex items-center">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        Valid
      </span>
    </span>
  );
}

export default function SeoBacklinkList({ seo_backlink, orderId }) {
  const gpLinks = seo_backlink.filter((l) => l.type_c === "GP");
  const liLinks = seo_backlink.filter((l) => l.type_c === "LI");
  const { updateLinkLoading, deleting, updateLinkMessage } = useSelector(
    (state) => state.orders,
  );
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(null);
  const [linkId, setLinkId] = useState(null);
  const dispatch = useDispatch();

  const handleUpdate = (data) => {
    dispatch(updateSeoLink(orderId, { ...item, ...data }));
  };

  useEffect(() => {
    if (updateLinkMessage) {
      setOpen(false);
      dispatch(orderAction.clearAllMessages());
    }
  }, [updateLinkMessage]);

  const handleDelete = (linkId) => {
    dispatch(deleteLink(orderId, linkId));
  };

  // Group GP links by their doc URL
  const gpLinkGroups = gpLinks.reduce((acc, link) => {
    const key = link.gp_doc_url_c || "__no_doc__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {});

  // Group LI links by their target URL
  const liLinkGroups = liLinks.reduce((acc, link) => {
    const key = link.target_url_c || "__no_target__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(link);
    return acc;
  }, {});

  return (
    <>
      {open && (
        <UpdatePopup
          open={open}
          loading={updateLinkLoading}
          onClose={() => setOpen(false)}
          title="Update Backlink"
          fields={[
            {
              label: "Link Amount",
              name: "link_amount_c",
              type: "number",
              value: item.link_amount_c.split("$")[1],
            },
            {
              label: "Type",
              name: "type_c",
              type: "select",
              options: [
                { value: "GP", label: "Guest Post" },
                { value: "LI", label: "Link Insertion" },
              ],
              value: item.type_c || "",
            },
            {
              label: "Their Link",
              name: "backlink_url",
              type: "text",
              value: item.backlink_url,
            },
            {
              label: "Anchor Text",
              name: "anchor_text_c",
              type: "text",
              value: item.anchor_text_c || "",
            },
            item.type_c === "LI"
              ? {
                  label: "Our Link",
                  name: "target_url_c",
                  type: "text",
                  value: item.target_url_c || "",
                }
              : {
                  label: "Doc Link",
                  name: "gp_doc_url_c",
                  type: "text",
                  value: item.gp_doc_url_c || "",
                },
            {
              label: "Website",
              name: "name",
              type: "text",
              value: item.name || "",
            },
            {
              label: "Link Type",
              name: "link_type",
              type: "select",
              options: [
                { value: "dofollow", label: "DoFollow" },
                { value: "nofollow", label: "NoFollow" },
              ],
              value: item.link_type || "",
            },
          ]}
          onUpdate={handleUpdate}
        />
      )}

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 group relative">
          <div className="relative flex flex-col gap-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-3 border border-slate-200 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)]">
            {/* GP LINKS: one card per unique doc URL */}
            {Object.entries(gpLinkGroups).map(([docUrl, links], groupIndex) => (
              <div key={docUrl} className="relative mb-4">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full absolute top-0 left-0
        bg-gradient-to-r from-indigo-500 to-purple-600
        text-white text-xs font-bold shadow-md"
                >
                  #{groupIndex + 1}
                </span>
                <GPLinksTable
                  gpLinks={links}
                  groupIndex={groupIndex}
                  setItem={setItem}
                  setOpen={setOpen}
                  deleting={deleting}
                  setLinkId={setLinkId}
                  linkId={linkId}
                  handleDelete={handleDelete}
                />
              </div>
            ))}

            {/* LI LINKS: one card per unique target URL */}
            {Object.entries(liLinkGroups).map(
              ([targetUrl, links], groupIndex) => (
                <div key={targetUrl} className="relative mb-4">
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-full absolute top-0 left-0
        bg-gradient-to-r from-indigo-500 to-purple-600
        text-white text-xs font-bold shadow-md"
                  >
                    #{groupIndex + 1}
                  </span>
                  <LILinksTable
                    liLinks={links}
                    groupIndex={groupIndex}
                    setItem={setItem}
                    setOpen={setOpen}
                    deleting={deleting}
                    setLinkId={setLinkId}
                    linkId={linkId}
                    handleDelete={handleDelete}
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Shared table header & row used by both GP + LI
───────────────────────────────────────────── */
function LinkTableHeader() {
  return (
    <div className="grid grid-cols-9 text-sm font-semibold text-gray-700 px-4 py-3 bg-slate-50 border-t border-slate-200">
      <div>#</div>
      <div>Anchor Text</div>
      <div>Anchor Verdict</div>
      <div>Backlink URL</div>
      <div>Backlink Verdict</div>
      <div>Spam Score</div>
      <div>Amount &amp; Type</div>
      <div>Domain</div>
      <div>Action</div>
    </div>
  );
}

const getSpamLabel = (score) => {
  if (score < 10) return { label: "Low", color: "text-green-600" };
  if (score < 40) return { label: "Moderate", color: "text-yellow-600" };
  return { label: "High", color: "text-red-600" };
};

const formatLinkType = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function LinkTableRow({
  link,
  rowIndex,
  setItem,
  setOpen,
  setLinkId,
  linkId,
  deleting,
  handleDelete,
}) {
  const spam = getSpamLabel(link.spam_score_c);
  const navigateTo = useNavigate();
  return (
    <div
      className={`grid grid-cols-9 px-4 py-3 border-t border-slate-100 text-sm items-center ${link.link_type === "dofollow" ? "bg-green-100" : ""}`}
    >
      {/* Index */}
      <div>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-sm">
          {rowIndex + 1}
        </span>
      </div>

      {/* Anchor Text */}
      <div className="flex gap-1 items-center">
        <span className="truncate max-w-[130px] font-medium text-slate-800">
          {link.anchor_text_c || "-"}
        </span>
      </div>

      {/* Anchor Verdict */}
      <div className="flex items-center gap-2">
        {/* ✨ PROMPT (NO DEBUG REDIRECT NOW) */}
        {link.link_verdict_prompt_ledger && (
          <button
            onClick={() =>
              navigateTo("/settings/debugging", {
                state: { prompt: link.link_verdict_prompt_ledger[0] },
              })
            }
            className="text-yellow-600 hover:scale-110"
          >
            <SparkleIcon size={18} />
          </button>
        )}
        <ValidationBadge valid={link.is_anchor_text_valid} />
      </div>

      {/* Backlink URL */}
      <div>
        <a
          href={link.backlink_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition"
        >
          <span className="truncate max-w-[80px]">
            {link.backlink_url || "-"}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition">
            ↗
          </span>
        </a>
      </div>

      {/* Backlink Verdict */}
      <div className="flex items-center gap-2">
        {/* ✨ PROMPT (NO DEBUG REDIRECT NOW) */}
        {link.link_verdict_prompt_ledger && (
          <button
            onClick={() =>
              navigateTo("/settings/debugging", {
                state: { prompt: link.link_verdict_prompt_ledger[0] },
              })
            }
            className="text-yellow-600 hover:scale-110"
          >
            <SparkleIcon size={18} />
          </button>
        )}
        <ValidationBadge valid={link.is_link_valid} />
      </div>

      {/* Spam Score */}
      <div className={`font-medium ${spam.color}`}>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-bold text-slate-500">MOZ</span>
          <span className="text-yellow-400 text-xs">★</span>
          <span>{link.spam_score_c}%</span>
          {link.spam_score_c < 7 ? (
            <img
              width="22"
              height="22"
              src="https://img.icons8.com/3d-fluency/94/ok.png"
              alt="ok"
            />
          ) : (
            <img
              width="22"
              height="22"
              src="https://img.icons8.com/3d-fluency/94/cancel.png"
              alt="cross"
            />
          )}
        </div>
      </div>

      {/* Amount & Type */}
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-indigo-600">
          {link.link_amount_c}
        </span>
        <span
          className={`text-xs font-semibold ${link.link_type === "dofollow" ? "text-green-600" : "text-red-600"}`}
        >
          {formatLinkType(link.link_type)}
        </span>
      </div>

      <div className="flex flex-row gap-0.5 mr-12">
        {(() => {
          try {
            return new URL(link.backlink_url).hostname.replace(/^www\./, "");
          } catch {
            return link.backlink_url;
          }
        })()}
        {/* ✨ PROMPT (NO DEBUG REDIRECT NOW) */}
        {link.link_verdict_prompt_ledger && (
          <button
            onClick={() =>
              navigateTo("/settings/debugging", {
                state: { prompt: link.link_verdict_prompt_ledger[0] },
              })
            }
            className="text-yellow-600 hover:scale-110"
          >
            <SparkleIcon size={18} />
          </button>
        )}
        <span className="truncate max-w-[30px]">
          <ValidationBadge valid={link.is_domain_valid} />
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 ml-10">
        <button
          onClick={() => {
            setItem(link);
            setOpen(true);
          }}
          className="px-2 py-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => {
            setLinkId(link.id);
            handleDelete(link.id);
          }}
          disabled={deleting}
          className="px-2 py-1 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow"
        >
          {deleting && linkId === link.id ? (
            <LoadingChase size="16" color="white" />
          ) : (
            <Trash size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GPLinksTable
───────────────────────────────────────────── */
function GPLinksTable({
  gpLinks,
  groupIndex,
  setItem,
  setOpen,
  deleting,
  setLinkId,
  linkId,
  handleDelete,
}) {
  const rep = gpLinks[0];
  return (
    <div className="overflow-hidden mb-4 border-2 border-blue-300 rounded-xl">
      <DocumentAnalysisCard
        website={rep.name}
        docLink={rep.gp_doc_url_c}
        docNiche={rep.niche}
        ContentValid={rep.is_content_valid}
        DocName={rep.document_name}
        DomainValid={rep.is_domain_valid}
        linkCount={gpLinks.length}
        ContentVerdictPromptLedger={rep.guestpost_prompt_ledger[0]}
      />
      <LinkTableHeader />
      {gpLinks.map((gpLink, rowIndex) => (
        <LinkTableRow
          key={gpLink.id}
          link={gpLink}
          rowIndex={rowIndex}
          setItem={setItem}
          setOpen={setOpen}
          setLinkId={setLinkId}
          linkId={linkId}
          deleting={deleting}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LILinksTable  –  mirrors GPLinksTable structure
───────────────────────────────────────────── */
function LILinksTable({
  liLinks,
  groupIndex,
  setItem,
  setOpen,
  deleting,
  setLinkId,
  linkId,
  handleDelete,
}) {
  const rep = liLinks[0];
  return (
    <div className="overflow-hidden mb-4 border-2 border-emerald-300 rounded-xl">
      <LIAnalysisCard
        targetUrl={rep.target_url_c}
        website={rep.name}
        linkCount={liLinks.length}
      />
      <LinkTableHeader />
      {liLinks.map((liLink, rowIndex) => (
        <LinkTableRow
          key={liLink.id}
          link={liLink}
          rowIndex={rowIndex}
          setItem={setItem}
          setOpen={setOpen}
          setLinkId={setLinkId}
          linkId={linkId}
          deleting={deleting}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DocumentAnalysisCard  –  GP header (with link count)
───────────────────────────────────────────── */
function DocumentAnalysisCard({
  docLink,
  docNiche,
  website,
  ContentValid,
  DocName,
  DomainValid,
  linkCount,
  ContentVerdictPromptLedger,
}) {
  const navigateTo = useNavigate();
  return (
    <div className="overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-center gap-2 bg-blue-300 px-4 py-2">
        <div className="text-white text-md font-bold flex items-center gap-2">
          GuestPost Result for
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-md ml-2 text-black p-1 rounded-2xl hover:underline"
          >
            {website ?? "-"}
          </a>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 bg-white rounded-lg px-2 py-3 shadow grid grid-cols-5 gap-4">
          <div className="text-sm font-semibold text-gray-500">Doc Name</div>
          <div className="text-sm font-semibold text-gray-500">Niche</div>
          <div className="text-sm font-semibold text-gray-500">
            Content Verdict
          </div>
          <div className="text-sm font-semibold text-gray-500">AI Score</div>
          <div className="text-sm font-semibold text-gray-500">Link Count</div>

          <a
            href={docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg bg-indigo-50 px-1 py-1 text-sm hover:bg-indigo-100 transition w-full"
          >
            <span className="font-semibold text-indigo-700 truncate">
              {DocName || "Untitled Document"}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition text-indigo-500 ml-1">
              ↗
            </span>
          </a>

          <span className="text-md text-slate-500 truncate">
            {docNiche || "No Niche"}
          </span>

          <div className="flex items-center gap-2">
            {/* ✨ PROMPT (NO DEBUG REDIRECT NOW) */}
            {ContentVerdictPromptLedger && (
              <button
                onClick={() =>
                  navigateTo("/settings/debugging", {
                    state: { prompt: ContentVerdictPromptLedger },
                  })
                }
                className="text-yellow-600 hover:scale-110"
              >
                <SparkleIcon size={18} />
              </button>
            )}
            <ValidationBadge valid={ContentValid} />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            1%
          </div>

          <div className="flex items-center">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              {linkCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIAnalysisCard  –  LI header (mirrors GP card style)
───────────────────────────────────────────── */
function LIAnalysisCard({ targetUrl, website, linkCount }) {
  return (
    <div className="overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-center gap-2 bg-emerald-400 px-4 py-2">
        <div className="text-white text-md font-bold flex items-center gap-2">
          Link Insertion for
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-md ml-2 text-black p-1 rounded-2xl hover:underline"
          >
            {website ?? targetUrl ?? "-"}
          </a>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 bg-white rounded-lg px-2 py-3 shadow grid grid-cols-2 gap-4">
          <div className="text-sm font-semibold text-gray-500">Target URL</div>
          <div className="text-sm font-semibold text-gray-500">
            Monthly Traffic
          </div>

          {/* Target URL value */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg bg-emerald-50 px-1 py-1 text-sm hover:bg-emerald-100 transition w-full"
          >
            <span className="font-semibold text-emerald-700 truncate w-full">
              {targetUrl || "No Target URL"}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition text-emerald-500 ml-1">
              ↗
            </span>
          </a>

          {/* Traffic mini badges */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
              <FaGoogle size={10} /> 100
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold">
              <Fa500Px size={10} /> 100
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <FaAccusoft size={10} /> 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */
const getSpamStyle = (score) => {
  if (score < 10)
    return {
      label: "Low",
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-700",
      icon: "check",
    };
  return {
    label: "High",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-700",
    icon: "cross",
  };
};

export function TheirLink({ data }) {
  const spam = getSpamStyle(data.spam_score_c);
  return (
    <div className="relative p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition">
      <div className="flex items-center justify-center rounded-xl gap-3 bg-gradient-to-r from-blue-500 to-purple-500 p-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Their Link
        </h3>
      </div>
      <div className="flex items-start gap-0">
        <div className="flex-1 flex flex-col gap-1 pr-4">
          <div className="flex items-center gap-2">
            <FiTag className="text-slate-400" size={13} />
            <p className="text-xs text-slate-500">Anchor Text</p>
          </div>
          <p className="text-sm font-semibold text-slate-800 break-all flex items-center gap-1">
            {data.anchor_text_c || "-"}
          </p>
        </div>
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-2 pl-3 pr-8 py-1.5 rounded-full border-2 border-green-700 bg-green-100 text-green-700 text-sm font-medium">
            <SparkleIcon className="w-4 h-4 text-green-600" />
          </div>
          <div
            className={`absolute -right-1 flex items-center justify-center w-8 h-8 rounded-full shadow-md ${data.is_anchor_text_valid === "1" ? "bg-green-600" : "bg-red-600"}`}
          >
            {data.is_anchor_text_valid === "1" ? (
              <img
                width="65"
                height="65"
                src="https://img.icons8.com/3d-fluency/94/ok.png"
                alt="ok"
              />
            ) : (
              <img
                src="https://img.icons8.com/3d-fluency/94/cancel.png"
                alt="cross"
                width="65"
                height="65"
              />
            )}
          </div>
        </div>
      </div>
      <span className="block border-t border-gray-200"></span>
      <div className="flex items-center justify-between gap-0">
        <div className="flex flex-col gap-1 pl-4 items-end">
          <div className="flex items-center gap-2">
            <FiLayers className="text-indigo-500" size={14} />
            <p className="text-xs text-slate-500">Amount</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-base">
            {data.link_amount_c ?? "-"}
          </div>
        </div>
        <span className="self-stretch border-l border-gray-200 mx-2"></span>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50">
            <FiLink size={14} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Backlink URL</p>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={data.backlink_url}
                target="_blank"
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition"
              >
                <span className="truncate max-w-[220px] lg:max-w-[150px]">
                  {data.backlink_url}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-2 pl-2 pr-8 py-1.5 rounded-full border-2 border-green-700 bg-green-100 text-green-700 text-sm font-medium">
            <SparkleIcon className="w-4 h-4 text-green-600" />
          </div>
          <div className="absolute -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-green-600 shadow-md">
            <img
              width="65"
              height="65"
              src="https://img.icons8.com/3d-fluency/94/ok.png"
              alt="ok"
            />
          </div>
        </div>
      </div>
      <span className="block border-t border-gray-200"></span>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 flex items-center gap-4 pr-2 min-w-[220px]">
          <Meta icon={FiLink} label="Type" value={data.type_c} />
          <span className="self-stretch border-l border-gray-200 mx-2"></span>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-100">
              <FiTag size={14} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Link Type</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">
                {data.link_type}
              </p>
            </div>
          </div>
        </div>
        <span className="hidden sm:block self-stretch border-l border-gray-200 mx-4"></span>
        <div className="flex items-center">
          <div className="relative inline-flex justify-end max-w-[500px] lg:max-w-[100px]">
            <div
              className={`flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 pr-6 sm:pr-8 py-1 rounded-full border-2 ${spam.bg} ${spam.text} ${spam.border} text-xs sm:text-sm font-medium whitespace-nowrap`}
            >
              <FiAlertTriangle
                className={`w-3 h-3 sm:w-4 sm:h-4 ${spam.text}`}
              />
              <span>
                Spam {data.spam_score_c}% · {spam.label}
              </span>
              <span className="ml-1 flex items-center gap-1 font-bold text-blue-600">
                MOZ{" "}
                <span className="text-yellow-400 text-xs sm:text-sm">★</span>
              </span>
            </div>
            <div
              className={`absolute -right-1 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md ${spam.icon === "check" ? "bg-green-600" : "bg-red-600"}`}
            >
              {spam.icon === "check" ? (
                <img
                  className="w-5 h-5 sm:w-7 sm:h-7"
                  src="https://img.icons8.com/3d-fluency/94/ok.png"
                  alt="ok"
                />
              ) : (
                <img
                  className="w-5 h-5 sm:w-7 sm:h-7"
                  src="https://img.icons8.com/3d-fluency/94/cancel.png"
                  alt="cross"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OurLink({ data }) {
  return (
    <div className="relative p-5 rounded-xl bg-white shadow-sm space-y-5 hover:shadow-md transition">
      <div className="flex items-center justify-center rounded-xl gap-3 bg-gradient-to-r from-blue-500 to-purple-500 p-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Our Link
        </h3>
      </div>
      <div className="flex flex-wrap items-center justify-center">
        {data?.type_c === "LI" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <FiLink className="text-indigo-600" size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Target URL</p>
                <a
                  href={data?.target_url_c}
                  target="_blank"
                  className="group mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition"
                >
                  <span className="truncate max-w-[280px]">
                    {data?.target_url_c}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition">
                    ↗
                  </span>
                </a>
              </div>
            </div>
            <div className="flex">
              <div className="p-2 rounded-lg bg-indigo-50">
                <FiTrendingUp className="text-indigo-600" size={14} />
              </div>
              <p className="text-sm font-medium text-slate-600 ml-3">
                Monthly Traffic
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                icon={<FaGoogle size={16} />}
                label="Google"
                value={100}
                iconBg="bg-red-100"
                iconColor="text-red-600"
                cardBg="from-red-50 to-white"
              />
              <StatCard
                icon={<Fa500Px size={16} />}
                label="Ahrefs"
                value={100}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                cardBg="from-orange-50 to-white"
              />
              <StatCard
                icon={<FaAccusoft size={16} />}
                label="Semrush"
                value={100}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                cardBg="from-emerald-50 to-white"
              />
              <StatCard
                icon={<FaAddressBook size={16} />}
                label="All Links"
                value={100}
                iconBg="bg-violet-100"
                iconColor="text-violet-600"
                cardBg="from-violet-50 to-white"
              />
            </div>
          </div>
        )}
        {data?.type_c === "GP" && (
          <div className="w-full flex flex-col gap-0">
            <div className="flex items-start gap-0 py-3">
              <div className="flex-1 flex flex-col gap-1 pr-4">
                <div className="flex items-center gap-1">
                  <FiGlobe className="text-slate-400" size={13} />
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    Website
                  </p>
                </div>
                <p className="text-sm text-slate-700 font-medium break-all">
                  {data?.name || "-"}
                </p>
              </div>
              <span className="self-stretch border-l border-gray-200 mx-2"></span>
              <div className="flex-1 flex flex-col gap-1 pl-4">
                <div className="flex items-center gap-1">
                  <LinkIcon className="text-slate-400" size={13} />
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    Doc Link
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={data?.gp_doc_url_c}
                    target="_blank"
                    className="group inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition max-w-fit"
                  >
                    <span className="truncate max-w-[160px]">
                      {data?.gp_doc_url_c}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition">
                      ↗
                    </span>
                  </a>
                </div>
              </div>
              <div className="relative inline-flex items-center">
                <div className="flex items-center gap-2 pl-4 pr-10 py-1.5 rounded-full border-2 border-green-700 bg-green-100 text-green-700 text-sm font-semibold">
                  <SparkleIcon className="w-5 h-5 text-green-600" />
                </div>
                <div
                  className={`absolute -right-1 flex items-center justify-center w-10 h-10 rounded-full shadow-md ${data.is_link_valid === "1" ? "bg-green-600" : "bg-red-600"}`}
                >
                  {data.is_link_valid === "1" ? (
                    <img
                      width="94"
                      height="94"
                      src="https://img.icons8.com/3d-fluency/94/ok.png"
                      alt="ok"
                    />
                  ) : (
                    <img
                      src="https://img.icons8.com/3d-fluency/94/cancel.png"
                      alt="cross"
                      width="94"
                      height="94"
                    />
                  )}
                </div>
              </div>
            </div>
            <span className="block border-t border-gray-200"></span>
            <div className="flex items-start gap-0 py-3">
              <div className="flex-1 flex flex-col gap-1 pr-4">
                <div className="flex items-center gap-1">
                  <Dock className="text-slate-400" size={13} />
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                    Doc Niche
                  </p>
                </div>
                <p className="text-sm text-slate-700 font-medium break-all">
                  {data?.niche || "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value, valid }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="text-slate-400 mt-0.5" size={14} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-700 font-medium break-all">
          {value || "-"}
          {valid && <ValidTick />}
        </p>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, iconBg, iconColor, cardBg }) => (
  <div
    className={`flex items-center justify-between rounded-xl border border-slate-200 bg-gradient-to-br ${cardBg} px-4 py-3 hover:shadow-md hover:-translate-y-0.5 transition`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
    <span className="text-sm font-semibold text-slate-900">{value}</span>
  </div>
);

const ValidationBadge = ({ valid }) =>
  valid === "1" ? (
    <span className="flex items-center gap-1 text-green-600 font-medium">
      <img
        width="30"
        height="30"
        src="https://img.icons8.com/3d-fluency/94/ok.png"
        alt="ok"
      />
    </span>
  ) : (
    <span className="flex items-center gap-1 text-red-600 font-medium">
      <img
        className="w-5 h-5 sm:w-7 sm:h-7"
        src="https://img.icons8.com/3d-fluency/94/cancel.png"
        alt="cross"
      />
    </span>
  );

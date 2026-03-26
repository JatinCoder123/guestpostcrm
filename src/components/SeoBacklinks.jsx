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
function ValidTick() {
  return (
    <span className="relative group ml-2 inline-flex items-center">
      {/* Tick */}
      <span
        className="inline-flex items-center justify-center 
        w-5 h-5 rounded-full 
        bg-green-100 text-green-600"
      >
        <Check size={12} strokeWidth={3} />
      </span>

      {/* Tooltip */}
      <span
        className="absolute -top-7 left-1/2 -translate-x-1/2
        px-2 py-0.5 rounded-md
        bg-slate-900 text-white text-[10px]
        opacity-0 group-hover:opacity-100
        transition whitespace-nowrap"
      >
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
          <div className="relative flex flex-col gap-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-3  border border-slate-200 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)]">
            {gpLinks.length > 0 && (
              <div className="mb-6 flex flex-col gap-5">
                <DocumentAnalysisCard
                  docLink={gpLinks[0]?.gp_doc_url_c}
                  docNiche={gpLinks[0]?.niche}
                />
                <GPLinksTable
                  gpLinks={gpLinks}
                  setItem={setItem}
                  setOpen={setOpen}
                  deleting={deleting}
                  setLinkId={setLinkId}
                  linkId={linkId}
                />
              </div>
            )}
            {liLinks.map((item, index) => (
              <div
                key={item.id}
                className="relative flex flex-col p-1 gap-1 rounded-2xl border-b"
              >
                {/* Index Badge */}
                <div className="absolute top-2 -left-1 z-20">
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-full
        bg-gradient-to-r from-indigo-500 to-purple-600
        text-white text-xs font-bold shadow-md"
                  >
                    #{index + gpLinks.length + 1}
                  </span>
                </div>
                {/* Edit Button */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setItem(item);
                      setOpen(true);
                    }}
                    className="px-3 py-1 text-xs rounded-2xl 
      bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setLinkId(item.id);
                      handleDelete(item.id);
                    }}
                    disabled={deleting}
                    className="px-3 py-1 text-xs rounded-2xl 
      bg-red-600 text-white hover:bg-red-700 transition shadow"
                  >
                    {deleting && linkId === item.id ? (
                      <LoadingChase size="20" color="white" />
                    ) : (
                      <Trash size={16} />
                    )}
                  </button>
                </div>

                {/* Links Box */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-lg p-4">
                  <TheirLink data={item} />
                  <OurLink data={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
const getSpamStyle = (score) => {
  if (score < 10) {
    return {
      label: "Low",
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-700",
      icon: "check",
    };
  }

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
      {/* HEADER */}
      <div className="flex items-center justify-center rounded-xl gap-3 bg-gradient-to-r from-blue-500 to-purple-500 p-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Their Link
        </h3>
      </div>

      {/* ROW 1: Anchor Text | vertical line | Amount */}
      <div className="flex items-start gap-0">
        {/* LEFT: Anchor Text */}
        <div className="flex-1 flex flex-col gap-1 pr-4">
          <div className="flex items-center gap-2">
            <FiTag className="text-slate-400" size={13} />
            <p className="text-xs text-slate-500">Anchor Text</p>
          </div>
          <p className="text-sm font-semibold text-slate-800 break-all flex items-center gap-1">
            {data.anchor_text_c || "-"}
            {/* {data.is_anchor_text_valid && <ValidTick />} */}
          </p>
        </div>
        {/* RIGHT: Sparkle + Check pill (original) */}
        <div className="relative inline-flex items-center">
          <div
            className="
              flex items-center gap-2
              pl-3 pr-8 py-1.5
              rounded-full border-2
              border-green-700
              bg-green-100 text-green-700
              text-sm font-medium
            "
          >
            <SparkleIcon className="w-4 h-4 text-green-600" />
          </div>
          <div
            className={`
                absolute -right-1
                flex items-center justify-center
                w-8 h-8 rounded-full shadow-md
                ${data.is_anchor_text_valid === "1" ? "bg-green-600" : "bg-red-600"}
              `}
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

      {/* Horizontal Divider */}
      <span className="block border-t border-gray-200"></span>

      {/* ROW 2: Backlink URL | Sparkle+Check pill */}
      <div className="flex items-center justify-between gap-0">
        {/* RIGHT: Amount */}
        <div className="flex flex-col gap-1 pl-4 items-end">
          <div className="flex items-center gap-2">
            <FiLayers className="text-indigo-500" size={14} />
            <p className="text-xs text-slate-500">Amount</p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-base">
            {data.link_amount_c ?? "-"}
          </div>
        </div>
        {/* Vertical Divider */}
        <span className="self-stretch border-l border-gray-200 mx-2"></span>
        {/* LEFT: Backlink URL */}
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
                className="group inline-flex items-center gap-2
                  rounded-lg bg-indigo-50 px-3 py-1.5
                  text-sm font-medium text-indigo-600
                  hover:bg-indigo-100 transition"
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

        {/* RIGHT: Sparkle + Check pill (original) */}
        <div className="relative inline-flex items-center">
          <div
            className="
              flex items-center gap-2
              pl-2 pr-8 py-1.5
              rounded-full border-2
              border-green-700
              bg-green-100 text-green-700
              text-sm font-medium
            "
          >
            <SparkleIcon className="w-4 h-4 text-green-600" />
          </div>
          <div
            className="
              absolute -right-1
              flex items-center justify-center
              w-8 h-8 rounded-full
              bg-green-600 shadow-md
            "
          >
            <img
              width="65"
              height="65"
              src="https://img.icons8.com/3d-fluency/94/ok.png"
              alt="ok"
            />
          </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <span className="block border-t border-gray-200"></span>

      {/* ROW 3: Type | Link Type | vertical line | Spam Badge */}
      <div className="flex flex-wrap items-center gap-3">
        {/* LEFT: Type + Link Type */}
        <div className="flex-1 flex items-center gap-4 pr-2 min-w-[220px]">
          <Meta icon={FiLink} label="Type" value={data.type_c} />

          {/* Vertical Divider */}
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

        {/* Vertical Divider */}
        <span className="hidden sm:block self-stretch border-l border-gray-200 mx-4"></span>

        {/* RIGHT: Spam Badge */}
        <div className="flex items-center">
          <div className="relative inline-flex justify-end max-w-[500px] lg:max-w-[100px]">
            <div
              className={`
          flex items-center gap-1 sm:gap-2
          pl-1 sm:pl-2 pr-6 sm:pr-8 py-1
          rounded-full border-2
          ${spam.bg} ${spam.text} ${spam.border}
          text-xs sm:text-sm font-medium
          whitespace-nowrap
        `}
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
              className={`
          absolute -right-1
          flex items-center justify-center
          w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md
          ${spam.icon === "check" ? "bg-green-600" : "bg-red-600"}
        `}
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
  const spam = getSpamStyle(data?.spam_score_c);

  return (
    <div className="relative p-5 rounded-xl bg-white shadow-sm space-y-5 hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex items-center justify-center rounded-xl gap-3 bg-gradient-to-r from-blue-500 to-purple-500 p-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Our Link
        </h3>
      </div>

      {/* BACKLINK + SPAM */}
      <div className="flex flex-wrap items-center justify-center">
        {data?.type_c === "LI" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            {/* TARGET URL */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <FiLink className="text-indigo-600" size={14} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Target URL</p>

                <a
                  href={data?.target_url_c}
                  target="_blank"
                  className="group mt-2 inline-flex items-center gap-2
                    rounded-lg bg-indigo-50 px-3 py-1.5
                    text-sm font-medium text-indigo-600
                    hover:bg-indigo-100 transition"
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

            {/* STATS GRID */}
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
            {/* ROW 1: Website | Doc Link */}
            <div className="flex items-start gap-0 py-3">
              {/* LEFT: Website */}
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

              {/* Vertical Divider */}
              <span className="self-stretch border-l border-gray-200 mx-2"></span>

              {/* RIGHT: Doc Link */}
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
                    className="group inline-flex items-center gap-2
                      rounded-lg bg-indigo-50 px-3 py-1.5
                      text-sm font-medium text-indigo-600
                      hover:bg-indigo-100 transition max-w-fit"
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
              {/* RIGHT: Sparkle + Check pill (original) */}
              <div className="relative inline-flex items-center">
                <div
                  className="
              flex items-center gap-2
              pl-4 pr-10 py-1.5
              rounded-full border-2
              border-green-700
              bg-green-100 text-green-700
              text-sm font-semibold
            "
                >
                  <SparkleIcon className="w-5 h-5 text-green-600" />
                </div>
                <div
                  className={`
                absolute -right-1
                flex items-center justify-center
                w-10 h-10 rounded-full shadow-md
                ${data.is_link_valid === "1" ? "bg-green-600" : "bg-red-600"}
              `}
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

            {/* Horizontal Divider */}
            <span className="block border-t border-gray-200"></span>

            {/* ROW 2: Doc Niche */}
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
const StatCard = ({ icon, label, value, iconBg, iconColor, cardBg }) => {
  return (
    <div
      className={`flex items-center justify-between
      rounded-xl border border-slate-200
      bg-gradient-to-br ${cardBg}
      px-4 py-3
      hover:shadow-md hover:-translate-y-0.5
      transition`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
      </div>

      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
};
const getSpamLabel = (score) => {
  if (score < 10) return { label: "Low", color: "text-green-600" };
  if (score < 40) return { label: "Moderate", color: "text-yellow-600" };
  return { label: "High", color: "text-red-600" };
};

const ValidationBadge = ({ valid }) => {
  return valid === "1" ? (
    <span className="flex items-center gap-1 text-green-600 font-medium">
      <img
        width="30"
        height="30"
        src="https://img.icons8.com/3d-fluency/94/ok.png"
        alt="ok"
      />
      <span>Validated</span>
    </span>
  ) : (
    <span className="flex items-center gap-1 text-red-600 font-medium">
      <img
        className="w-5 h-5 sm:w-7 sm:h-7"
        src="https://img.icons8.com/3d-fluency/94/cancel.png"
        alt="cross"
      />
      <span>High Spam Risk</span>
    </span>
  );
};

function GPLinksTable({
  gpLinks,
  setItem,
  setOpen,
  deleting,
  setLinkId,
  linkId,
}) {
  return (
    <div className="overflow-hidden rounded-xl border-b border-gray-200 shadow-sm">
      {/* HEADER */}
      <div className="grid grid-cols-9  bg-blue-100 text-sm font-semibold text-gray-700 px-4 py-3">
        <div className="col-span-2">URL / Anchor Text</div>
        <div>Validation</div>
        <div>Spam Score</div>
        <div>Amount</div>
        <div>Type</div>
        <div>Link Type</div>
        <div>Website</div>
        <div className="ml-auto">Action</div>
      </div>

      {/* ROWS */}
      {gpLinks.map((item, index) => {
        const spam = getSpamLabel(item.spam_score_c);

        return (
          <div
            key={item.id}
            className="grid grid-cols-9 px-4 py-3 border-t text-sm items-center"
          >
            {/* URL + Anchor */}
            <div className="flex gap-2 items-center col-span-2">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full
        bg-gradient-to-r from-indigo-500 to-purple-600
        text-white text-xs font-bold shadow-md"
              >
                #{index + 1}
              </span>
              <a
                href={item.backlink_url}
                target="_blank"
                className="text-blue-600 hover:underline truncate max-w-[150px]"
              >
                {item.backlink_url}
              </a>
              <span className="text-xs text-gray-500 truncate">
                {item.anchor_text_c || "-"}
              </span>
            </div>

            {/* Validation */}
            <ValidationBadge valid={item.is_link_valid} />

            {/* Spam Score */}
            <div className={`font-medium ${spam.color}`}>
              {item.spam_score_c} ({spam.label})
            </div>

            {/* Amount */}
            <div className="font-semibold text-indigo-600">
              {item.link_amount_c}
            </div>
            <div className="font-semibold text-indigo-600">
              {item.type_c}
            </div>
            <div className={`font-semibold text-${item.link_type === "dofollow" ? "green" : "red"}-600`}>
              {item.link_type}
            </div>
            <div className={`font-semibold text-blue-500`}>
              {item.name}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setItem(item);
                  setOpen(true);
                }}
                className="px-3 py-1 text-xs rounded-2xl 
      bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => {
                  setLinkId(item.id);
                  handleDelete(item.id);
                }}
                disabled={deleting}
                className="px-3 py-1 text-xs rounded-2xl 
      bg-red-600 text-white hover:bg-red-700 transition shadow"
              >
                {deleting && linkId === item.id ? (
                  <LoadingChase size="20" color="white" />
                ) : (
                  <Trash size={16} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentAnalysisCard({ docLink, docName, docNiche }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-t-blue-200 rounded-xl shadow-md overflow-hidden">
      {/* HEADER */}
      <div className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold">
        Guest Post Order
      </div>

      {/* CONTENT */}
      <div className="flex items-center gap-4 p-4">
        {/* 🔹 LEFT: DOCUMENT PREVIEW (FAKE HTML PREVIEW) */}
        <div className="w-32 h-20 bg-white rounded-md shadow-inner border relative overflow-hidden">
          {/* fake lines */}
          <a
            href={docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-32 h-20 bg-white rounded-md shadow-inner border relative overflow-hidden hover:scale-105 transition"
          >
            <div className="p-2 space-y-1">
              <div className="h-2 bg-slate-300 rounded w-3/4"></div>
              <div className="h-2 bg-slate-200 rounded w-full"></div>
              <div className="h-2 bg-slate-200 rounded w-5/6"></div>
              <div className="h-2 bg-slate-300 rounded w-2/3"></div>
            </div>

            {/* blur overlay */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none" />
          </a>
          {/* blur overlay */}
        </div>

        {/* 🔹 RIGHT: RESULT */}
        <div className="flex-1 bg-white rounded-lg px-4 py-3 shadow flex items-center justify-between">
          <a
            href={docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2
    rounded-lg bg-indigo-50 px-3 py-2
    text-sm hover:bg-indigo-100 transition max-w-fit"
          >
            {/* DOC NAME */}
            <span className="font-semibold text-indigo-700 truncate max-w-[180px]">
              {docName || "Untitled Document"}
            </span>

            {/* NICHE */}


            {/* HOVER ICON */}
            <span className="opacity-0 group-hover:opacity-100 transition text-indigo-500 ml-1">
              ↗
            </span>
          </a>
          <span className="text-md text-slate-500 whitespace-nowrap">
            • {docNiche || "No Niche"}
          </span>
          <img
            width="30"
            height="30"
            src="https://img.icons8.com/3d-fluency/94/ok.png"
            alt="ok"
          />
        </div>
      </div>
    </div>
  );
}

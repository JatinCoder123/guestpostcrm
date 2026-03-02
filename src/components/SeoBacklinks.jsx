import { Pencil, Trash, Check, LinkIcon, Dock, SparkleIcon } from "lucide-react";
import {
  FiLink,
  FiTag,
  FiLayers,
  FiAlertTriangle,
  FiGlobe,
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
              label: "Their Link",
              name: "backlink_url",
              type: "text",
              value: item.backlink_url,
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
              options: [{ value: "dofollow", label: "DoFollow" }, { value: "nofollow", label: "NoFollow" }],
              value: item.link_type || "",
            },
          ]}
          onUpdate={handleUpdate}
        />
      )}
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 group relative">
          <div className="relative flex flex-col gap-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-3  border border-slate-200 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)]">
            {seo_backlink.map((item, index) => (
              <div
                key={item.id}
                className="relative flex flex-col p-1 gap-1 rounded-2xl border-b"
              >
                {/* Index Badge */}
                <div className="absolute top-2 -left-1 z-20">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full
        bg-gradient-to-r from-indigo-500 to-purple-600
        text-white text-xs font-bold shadow-md">
                    #{index + 1}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-lg p-4">
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
      <div className="flex  items-center justify-center rounded-xl gap-3 bg-gradient-to-r from-blue-500 to-purple-500 p-3">
        <h3 className="text-sm  font-bold text-white  uppercase tracking-widest">
          Their Link
        </h3>
      </div>

      {/* META GRID */}
      <div className="grid grid-cols-1  sm:grid-cols-3 gap-5">
        {/* Anchor */}
        <Meta
          icon={FiTag}
          label="Anchor Text"
          value={data.anchor_text_c}
          valid={data.is_anchor_text_valid}
        />

        {/* Amount (Highlighted) */}
        <div className="flex items-start gap-2">
          <FiLayers className="text-indigo-500 mt-0.5" size={15} />
          <div>
            <p className="text-xs text-slate-500">Amount</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-base">
              {data.link_amount_c ?? "-"}
            </div>
          </div>
        </div>

        {/* Type */}
        <Meta icon={FiLink} label="Type" value={data.type_c} />
      </div>

      <div className="rounded-2xl   bg-white space-y-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">

            <div className="mt-1 p-2 rounded-lg bg-indigo-50">
              <FiLink size={14} className="text-indigo-600" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">
                Backlink URL
              </p>

              <div className="flex items-center gap-2 mt-1">
                <a
                  href={data.backlink_url}
                  target="_blank"
                  className="group inline-flex items-center gap-2 
          rounded-lg bg-indigo-50 px-3 py-1.5
          text-sm font-medium text-indigo-600
          hover:bg-indigo-100 transition"
                >
                  <span className="truncate max-w-[220px]">
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

            {/* MAIN PILL */}
            <div
              className="
      flex items-center gap-2
      pl-4 pr-10 py-1.5
      rounded-full
      border-2
      border-green-700
      bg-green-100 text-green-700
      text-sm font-semibold
    "
            >
              <SparkleIcon className="w-5 h-5 text-green-600" />
            </div>

            {/* CHECK CIRCLE (OVERLAPPED) */}
            <div
              className="
                absolute -right-1
      flex items-center justify-center
      w-10 h-10
      rounded-full
      bg-green-600
      shadow-md
    "
            >
              <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/ok.png" alt="ok" />            </div>

          </div>

        </div>



        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* LINK TYPE */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <FiTag size={14} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Link Type
              </p>
              <p className="text-sm font-semibold text-slate-800 capitalize">
                {data.link_type}
              </p>
            </div>
          </div>
          {/* SPAM SCORE BADGE */}
          <div className="relative inline-flex items-center">
            {/* MAIN PILL */}
            <div
              className={`
      flex items-center gap-2
      pl-4 pr-14 py-1.5
      rounded-full
      border-2
      ${spam.bg}
      ${spam.text}
      ${spam.border}
      text-sm font-semibold
    `}
            >
              <FiAlertTriangle className={`w-4 h-4 ${spam.text}`} />

              <span>
                Spam {data.spam_score_c}% · {spam.label}
              </span>

              <span className="ml-2 flex items-center gap-1 font-bold text-blue-600">
                MOZ <span className="text-yellow-400">★</span>
              </span>
            </div>

            {/* ICON (CHECK OR CROSS) */}
            <div
              className={`
      absolute -right-1
      flex items-center justify-center
      w-10 h-10
      rounded-full
      shadow-md
      ${spam.icon === "check" ? "bg-green-600" : "bg-red-600"}
    `}
            >
              {spam.icon === "check" ? (
                <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/ok.png" alt="ok" />
              ) : (
                <img
                  src="https://img.icons8.com/3d-fluency/94/cancel.png"
                  alt="cross"
                  width="94" height="94"
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
    <div className="relative p-5  rounded-xl bg-white  shadow-sm space-y-5 hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex  items-center justify-center rounded-xl gap-3 bg-gradient-to-r from-blue-500 to-purple-500 p-3">
        <h3 className="text-sm  font-bold text-white  uppercase tracking-widest">
          Our Link
        </h3>
      </div>



      {/* BACKLINK + SPAM */}
      <div className="flex flex-wrap items-center justify-center  ">

        {data?.type_c === "LI" && (
          <div className="rounded-2xl  border border-slate-200 bg-white p-6 shadow-sm space-y-6">

            {/* TARGET URL */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <FiLink className="text-indigo-600" size={14} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">
                  Target URL
                </p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* GOOGLE */}
              <StatCard
                icon={<FaGoogle size={16} />}
                label="Google Traffic"
                value={100}
                iconBg="bg-red-100"
                iconColor="text-red-600"
                cardBg="from-red-50 to-white"
              />

              {/* AHREFS */}
              <StatCard
                icon={<Fa500Px size={16} />}
                label="Ahrefs Traffic"
                value={100}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                cardBg="from-orange-50 to-white"
              />

              {/* SEMRUSH */}
              <StatCard
                icon={<FaAccusoft size={16} />}
                label="Semrush Traffic"
                value={100}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                cardBg="from-emerald-50 to-white"
              />

              {/* EXISTING LINKS */}
              <StatCard
                icon={<FaAddressBook size={16} />}
                label="Existing Links"
                value={100}
                iconBg="bg-violet-100"
                iconColor="text-violet-600"
                cardBg="from-violet-50 to-white"
              />

            </div>
          </div>
        )}

        {data?.type_c === "GP" && <>
          <div className="flex justify-center flex-col gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <FiGlobe className="text-slate-400" size={14} />

              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Website
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-700 font-medium break-all">
                {data?.name || "-"}
              </p>
            </div>

          </div>
          <div className="flex justify-center flex-col gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <LinkIcon className="text-slate-400" size={14} />

              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Doc Link
              </h3>
            </div>

            <div className="flex items-center gap-2">

              <a
                href={data?.gp_doc_url_c}
                target="_blank"
                className="group inline-flex items-center gap-1 mt-0.5 px-2 py-1 rounded-md truncate
                text-sm font-medium text-blue-600 bg-blue-50
                hover:bg-blue-100 hover:underline transition"
              >
                {data?.gp_doc_url_c}
                <span className="opacity-0 group-hover:opacity-100 transition">↗</span>
              </a>
            </div>

          </div>
          <div className="flex justify-center flex-col gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <Dock className="text-slate-400" size={14} />

              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Doc Niche
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-700 font-medium break-all">
                {data?.niche || "-"}
              </p>
            </div>

          </div>
        </>}


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
        <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>
      </div>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
};
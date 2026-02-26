import { Pencil, Trash, Check } from "lucide-react";
import {
  FiLink,
  FiTag,
  FiLayers,
  FiAlertTriangle,
  FiHash,
  FiGlobe,
  FiGrid,
} from "react-icons/fi";
import UpdatePopup from "./UpdatePopup";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLink, orderAction, updateSeoLink } from "../store/Slices/orders";
import { LoadingChase } from "./Loading";

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

                  <div className="relative z-10 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                    {/* WEBSITE NAME */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      {/* Website */}
                      {item.type_c === "GP" && <div className="flex justify-center flex-col gap-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />

                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Website
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiGlobe className="text-slate-400" size={14} />
                          <p className="text-sm text-slate-700 font-medium break-all">
                            {item.name || "-"}
                          </p>
                        </div>

                      </div>}


                      {/* Doc / Our Link */}
                      <div className="flex items-center gap-2">
                        {item.type_c === "LI" ? (
                          <OurLink link={item.target_url_c} label="Our Link" />
                        ) : (
                          <OurLink link={item.gp_doc_url_c} label="Doc Link" />
                        )}

                        {item.is_content_valid === true && <ValidTick />}
                      </div>
                    </div>

                    {/* Doc Niche */}
                    {item.type_c === "LI" ? (
                      ""
                    ) : (
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Doc Niche
                      </h3>
                    )}

                    {/*Doc niche  */}
                    <div className="flex items-start gap-2">
                      {item.type_c === "LI" ? (
                        ""
                      ) : (
                        <FiGrid className="text-slate-400 mt-0.5" size={14} />
                      )}

                      <p className="text-sm text-slate-700 font-medium break-all">
                        {item.niche || ""}
                      </p>
                    </div>
                  </div>
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
  if (score <= 30)
    return {
      label: "Low",
      bg: "bg-green-100",
      text: "text-green-700",
      ring: "ring-green-400",
    };

  if (score <= 60)
    return {
      label: "Medium",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      ring: "ring-yellow-400",
    };

  return {
    label: "High",
    bg: "bg-red-100",
    text: "text-red-700",
    ring: "ring-red-400",
  };
};
export function TheirLink({ data }) {
  const spam = getSpamStyle(data.spam_score_c);

  return (
    <div className="relative p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Their Link
        </h3>
      </div>

      {/* META GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

      {/* BACKLINK + SPAM */}
      <div className="flex flex-wrap items-start justify-between gap-5 pt-3 ">
        {/* Backlink */}
        <div className="flex items-start gap-2 max-w-[75%]">
          <FiLink className="text-slate-400 mt-1" size={14} />
          <div>
            <p className="text-xs text-slate-500">Backlink URL</p>

            <a
              href={data.backlink_url}
              target="_blank"
              className="group inline-flex items-center gap-1 mt-0.5 px-2 py-1 rounded-md
                text-sm font-medium text-blue-600 bg-blue-50
                hover:bg-blue-100 hover:underline transition"
            >
              {data.backlink_url}
              <span className="opacity-0 group-hover:opacity-100 transition">↗</span>
            </a>

            {data.is_link_valid && <ValidTick />}
          </div>
        </div>

        {/* Spam Score */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ${spam.bg} ${spam.text} ${spam.ring}`}
        >
          <FiAlertTriangle size={14} />
          <span className="text-xs font-bold">
            Spam {data.spam_score_c}% · {spam.label}
          </span>
        </div>
      </div>

      {/* Link Type */}
      <Meta
        icon={FiTag}
        label="Link Type"
        value={data.link_type}
      />
    </div>
  );
}

export function OurLink({ link, label }) {
  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {label}
        </h3>
      </div>

      {/* LINK */}
      <a
        href={link}
        target="_blank"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
          bg-blue-50 text-blue-600 font-medium text-sm
          hover:bg-blue-100 hover:underline transition truncate w-[240px]"
      >
        <FiLink size={14} />
        {link || "-"}
        {link && <ValidTick />}
      </a>
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

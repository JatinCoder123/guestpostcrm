import { Link2 } from "lucide-react";
import {
    FiLink,
    FiTag,
    FiLayers,
    FiAlertTriangle,
} from "react-icons/fi";
export default function SeoBacklinkList({ seo_backlink }) {

    if (!seo_backlink.length) return null;

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3 group relative">
                <div className="relative flex flex-col gap-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-3 mt-7 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)]">
                    {seo_backlink.map((item, index) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-lg p-4"
                        >
                            <TheirLink data={item} />

                            <div className="flex items-center gap-4">
                                {/* Connector */}
                                <img width="30" height="30" src="https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/external-chain-automobile-kiranshastry-lineal-color-kiranshastry-1.png" alt="external-chain-automobile-kiranshastry-lineal-color-kiranshastry-1" />

                                {/* Our link */}
                                {item.type === "li" ? (
                                    <OurLink link={item.target_url} label="Our Link" />
                                ) : (
                                    <OurLink link={item.gp_doc_url} label="Doc Link" />
                                )}
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    );
}
export function TheirLink({ data }) {
    return (
        <div className="relative z-10 p-5 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">

            {/* HEADER */}
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Their Link
                </h3>
            </div>

            {/* META INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Anchor Text */}
                <div className="flex items-start gap-2">
                    <FiTag className="text-slate-400 mt-0.5" size={14} />
                    <div>
                        <p className="text-xs text-slate-500">Anchor Text</p>
                        <p className="text-sm text-slate-700 font-medium break-all">
                            {data.anchor_text || "-"}
                        </p>
                    </div>
                </div>

                {/* Link Amount */}
                <div className="flex items-start gap-2">
                    <FiLayers className="text-slate-400 mt-0.5" size={14} />
                    <div>
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm text-slate-700 font-medium">
                            {data.link_amount ?? "-"}
                        </p>
                    </div>
                </div>

                {/* Link Type */}
                <div className="flex items-start gap-2">
                    <FiLink className="text-slate-400 mt-0.5" size={14} />
                    <div>
                        <p className="text-xs text-slate-500">Type</p>
                        <p className="text-sm text-slate-700 font-medium">
                            {data.type || "-"}
                        </p>
                    </div>
                </div>

            </div>

            {/* BACKLINK + SPAM SCORE */}
            <div className="flex items-start justify-between gap-4 pt-3 border-t border-slate-100">

                {/* URL */}
                <div className="flex items-start gap-2">
                    <FiLink className="text-slate-400 mt-0.5" size={14} />
                    <div>
                        <p className="text-xs text-slate-500">Backlink URL</p>
                        <p className="text-sm text-blue-600 font-medium break-all hover:underline cursor-pointer">
                            {data.backlink_url}
                        </p>
                    </div>
                </div>

                {/* Spam Score */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <FiAlertTriangle className="text-yellow-600" size={14} />
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                        {data.spam_score}
                    </span>
                </div>

            </div>
        </div>
    );
}



export function OurLink({ link, label }) {
    return (
        <div className="relative z-10 p-5 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">

            {/* HEADER */}
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {label}
                </h3>
            </div>

            {/* LINK */}
            <div className="flex items-start gap-2">
                <FiLink className="text-slate-400 mt-0.5" size={14} />
                <div>
                    <p className="text-xs text-slate-500">URL</p>
                    <p className="text-sm text-blue-600 font-medium break-all hover:underline cursor-pointer">
                        {link || "-"}
                    </p>
                </div>
            </div>

        </div>
    );
}



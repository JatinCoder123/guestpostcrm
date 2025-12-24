import React from 'react'

export const OrderView = ({ data }) => {

    return (
        <div className="w-full relative mt-3">
            <div className="relative  rounded-3xl  p-10 border border-slate-700/50">
                <div className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                        <Field label="Date" value={data.date_entered_formatted} />
                        <Field label="Type" value={data.order_type} />
                        <Field label="Amount" value={`$${data.total_amount_c}`} />
                        <Field label="Status">
                            <div className="relative inline-flex">
                                <span className="relative inline-flex items-center gap-2 px-2 py-2 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 text-yellow-900 font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_8px_20px_rgba(234,179,8,0.4)] ">
                                    {data.order_status}
                                </span>
                            </div>
                        </Field>
                        <Field label="Invoice Link" value={data.invoice_link_c} link title="View Invoice" />
                        <Field label="Anchor Text" value={"Anchor Text"} />

                        <Field label="Document Link" value={data.doc_link_c} link title="View Document" />
                    </div>


                </div>
                <SeoBacklinkList seo_backlink={data.seo_backlinks} />
            </div>
        </div>
    );
}
function Field({ label, value, link, children, title }) {
    const content = children || value;

    return (
        <div className="group perspective-1000">
            <div className="relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* 3D Shadow layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transform translate-y-4 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-slate-900/10 rounded-2xl transform translate-y-2 translate-x-1"></div>

                {/* Main card with bevel effect */}
                <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500">
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Top edge highlight */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>

                    <div className="relative z-10">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            {label}
                        </div>
                        <div className="text-gray-800 font-semibold text-lg">
                            {link ? (
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 underline decoration-2 underline-offset-4 transition-all"
                                >
                                    {title} →
                                </a>
                            ) : (
                                content
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}



function DisplayList({ data = [], label, spamScores }) {
    const list = Array.isArray(data)
        ? data
        : typeof data === "string"
            ? data.split(",").map(item => item.trim()).filter(Boolean)
            : [];

    const spamScoreList = Array.isArray(spamScores)
        ? spamScores
        : typeof spamScores === "string"
            ? spamScores.split(",").map(item => item.trim()).filter(Boolean)
            : [];

    if (!list.length) return null;

    return (
        <div className="relative z-10 p-5 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <ul className="space-y-1.5">
                {list.map((item, idx) => (
                    <li key={idx} className="pl-6">
                        <div className="flex items-start justify-between gap-2">
                            {/* LINK TEXT */}
                            <span className="text-sm text-slate-700 font-medium whitespace-normal break-all">
                                {item}
                            </span>

                            {/* SPAM SCORE */}
                            {label === "Their Link" && spamScoreList[idx] && (
                                <span className="flex-shrink-0 px-3 py-1 rounded-lg bg-yellow-300 text-yellow-900 text-xs font-bold">
                                    {spamScoreList[idx]}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


/* ---------------- MAIN COMPONENT ---------------- */

export default function SeoBacklinkList({ seo_backlink }) {

    const normalizeData = (data = []) => {
        return data.map(item => {
            const backlinks = item.backlink_url
                ? item.backlink_url.split(",").map(v => v.trim()).filter(Boolean)
                : [];

            const spamScores = item.spam_score
                ? backlinks.map(() => item.spam_score)
                : [];

            return {
                id: item.id,
                backlink_url: item.backlink_url,
                spam_score: item.spam_score,
                target_url: item.target_url
            };
        });
    };

    const normalizedData = normalizeData(seo_backlink);

    if (!normalizedData.length) return null;

    return (
        <div className="flex flex-col gap-10">


            <div className="flex flex-col gap-3 group relative">
                <div className="relative transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                    <div className="relative flex flex-col gap-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-3 mt-7 border-2 border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)]">
                        <div className="flex items-center justify-around">
                            <div>
                                <div className="flex items-center  gap-2 px-5 pt-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        THEIR LINK
                                    </span>

                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        (Spam Score)
                                    </span>

                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 px-5 pt-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        OUR LINK
                                    </span>
                                </div>
                            </div>

                        </div>
                        {normalizedData.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-lg p-3 ">


                                {/* THEIR LINKS */}
                                <DisplayList
                                    data={item.backlink_url}
                                    spamScores={item.spam_score}
                                    label="Their Link"
                                    listIndex={index}
                                />
                                {/* OUR LINK */}
                                {item.target_url && (
                                    <div className="flex items-center gap-2">
                                        <img width="32" height="32" src="https://img.icons8.com/external-dreamstale-lineal-dreamstale/32/external-connection-networking-database-dreamstale-lineal-dreamstale-8.png" alt="external-connection-networking-database-dreamstale-lineal-dreamstale-8" />
                                        <DisplayList
                                            data={[item.target_url]}
                                            label="Our Link"
                                            listIndex={index}
                                        />
                                    </div>

                                )}
                            </div>
                        ))}
                    </div>
                </div>


            </div>

        </div>
    );
}

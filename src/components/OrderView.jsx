import SeoBacklinkList from './SeoBacklinks';
export const OrderView = ({ data }) => {

    return (
        <div className="w-full relative mt-3">
            <div className="relative  rounded-3xl  p-10 border border-slate-700/50">
                <div className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
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


                {/* Main card with bevel effect */}
                <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500">
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






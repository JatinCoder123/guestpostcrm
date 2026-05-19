import React, { useState } from "react";
import {
    MailCheck,
    Mail,
    Tag,
    Briefcase,
    ShoppingCart,
    BellOff,
    Calendar,
    ChevronDown,
    Globe,
    Eye,
    MessageSquare,
    FileText,
    SparkleIcon,
    Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";



const colorMap = {
    green: {
        light: "bg-green-50",
        border: "border-green-200",
        text: "text-green-600",
        badge: "bg-green-100 text-green-700",
    },
    violet: {
        light: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-600",
        badge: "bg-violet-100 text-violet-700",
    },
    orange: {
        light: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-700",
    },
    yellow: {
        light: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-600",
        badge: "bg-yellow-100 text-yellow-700",
    },
    cyan: {
        light: "bg-cyan-50",
        border: "border-cyan-200",
        text: "text-cyan-600",
        badge: "bg-cyan-100 text-cyan-700",
    },
};

const LadgerCard = ({ timelineData, handleMessageClick }) => {
    const [activeParent, setActiveParent] = useState(null);
    const [hoveredChild, setHoveredChild] = useState(null);
    const navigateTo = useNavigate()
    const [activeVisualization, setActiveVisualization] = useState(null);

    const toggleParent = (id) => {
        setActiveParent((prev) => (prev === id ? null : id));
    };

    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-6 relative">

            {timelineData.map((parent, index) => {

                const ParentIcon = MailCheck;
                const isOpen = activeParent === parent.id;
                const user = parent?.children?.length > 0 && parent?.children[0]?.user_details.length > 0 ? parent?.children[0]?.user_details[0].name : "GPC"

                return (
                    <div key={parent.id} className="flex gap-5  ">

                        {/* LEFT SIDE */}
                        <div className="relative flex flex-col items-center mt-4">

                            {/* ICON */}
                            <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-200 shadow-sm flex items-center justify-center z-20">
                                <ParentIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="border-l-2 border-dashed border-gray-300 flex-1  mt-1"></div>


                        </div>

                        {/* RIGHT */}
                        <div className="flex-1 relative">
                            <div className="absolute -left-[38px] top-[36px] w-10 h-1   bg-gradient-to-r from-blue-500 to-purple-600"></div>
                            {/* PARENT CARD */}
                            <div
                                onClick={() => toggleParent(parent.id)}
                                className="group bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >

                                <div className="flex justify-between items-start">

                                    <div>
                                        <h2 className="text-[18px] font-semibold text-gray-800">
                                            {parent.description}
                                        </h2>

                                        {/* MESSAGE ONLY ON HOVER */}
                                        {/* <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-500">
                                                <p className="text-sm text-gray-600 leading-7 mt-4 max-w-2xl">
                                                    {parent.message}
                                                </p>
                                            </div> */}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 truncate max-w-[100px]">
                                            {parent.date_entered}
                                        </p>

                                        <p className="text-sm text-gray-700 mt-1 truncate max-w-[100px]">
                                            <i> - by</i> {user}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CHILDREN */}
                            {isOpen && (
                                <div className="mt-5 ml-2 space-y-4 relative">

                                    {parent?.children?.map((child) => {

                                        const Icon = child.icon;
                                        const colors =
                                            colorMap['green'];

                                        const isHovered =
                                            hoveredChild === child.id;

                                        return (
                                            <div
                                                key={child.id}
                                                className="relative group"
                                                onMouseEnter={() => setHoveredChild(child.id)}
                                                onMouseLeave={() => setHoveredChild(null)}
                                            >
                                                {activeVisualization && (
                                                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                                                        <div className="bg-white w-[1200px] max-w-[1200px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
                                                            {/* Close */}
                                                            <button
                                                                onClick={() => setActiveVisualization(null)}
                                                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
                                                            >
                                                                ✕
                                                            </button>

                                                            {/* Title */}
                                                            <h2 className="text-2xl font-bold mb-6 text-center">
                                                                Process Visualization
                                                            </h2>

                                                            {/* Steps */}
                                                            <div className="flex flex-col gap-2">
                                                                {[...activeVisualization]
                                                                    ?.sort(
                                                                        (a, b) => Number(a.process_no) - Number(b.process_no),
                                                                    )
                                                                    .map((step, index) => {
                                                                        const colors = [
                                                                            { card: "bg-[#1a73c8]", num: "bg-[#155eaa]" },
                                                                            { card: "bg-[#e07020]", num: "bg-[#c25e10]" },
                                                                            { card: "bg-[#3a9e3a]", num: "bg-[#2e852e]" },
                                                                        ];
                                                                        const arrowColors = ["#e07020", "#3a9e3a", "#888888"];
                                                                        const color = colors[index % colors.length];

                                                                        return (
                                                                            <div key={step.id}>
                                                                                {/* Step Card */}
                                                                                <div
                                                                                    className={`flex items-stretch rounded-xl overflow-hidden ${color.card}`}
                                                                                >
                                                                                    {/* Number Circle */}
                                                                                    <div
                                                                                        className={`w-[72px] min-w-[72px] flex items-center justify-center ${color.num}`}
                                                                                    >
                                                                                        <span className="w-[50px] h-[50px] rounded-full border-2 border-white/60 flex items-center justify-center text-white text-2xl font-medium">
                                                                                            {step.process_no}
                                                                                        </span>
                                                                                    </div>

                                                                                    {/* Content */}
                                                                                    <div className="flex-1 px-5 py-3">
                                                                                        <p className="text-white text-xl font-medium mb-1">
                                                                                            <strong>{step?.name?.split(":")[0]}</strong>
                                                                                            {step?.name?.includes(":") && (
                                                                                                <span className="font-normal">
                                                                                                    {" "}
                                                                                                    :{" "}
                                                                                                    {step?.name
                                                                                                        .split(":")
                                                                                                        .slice(1)
                                                                                                        .join(":")
                                                                                                        .trim()}
                                                                                                </span>
                                                                                            )}
                                                                                        </p>
                                                                                        {(() => {
                                                                                            let text = "No description available";

                                                                                            try {
                                                                                                const desc = step.description;

                                                                                                if (!desc) {
                                                                                                    text = "No description available";
                                                                                                } else if (typeof desc === "string") {
                                                                                                    // string (old case)
                                                                                                    text = desc
                                                                                                        .replace(/<[^>]*>/g, "")
                                                                                                        .trim();
                                                                                                } else if (typeof desc === "object") {
                                                                                                    // array OR object → stringify safely
                                                                                                    text = JSON.stringify(desc, null, 2);
                                                                                                } else {
                                                                                                    // fallback (number, boolean, etc.)
                                                                                                    text = String(desc);
                                                                                                }
                                                                                            } catch (e) {
                                                                                                text = "Invalid description format";
                                                                                            }

                                                                                            return (
                                                                                                <pre
                                                                                                    title={text}
                                                                                                    className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[300px] overflow-auto"
                                                                                                >
                                                                                                    {text}
                                                                                                </pre>
                                                                                            );
                                                                                        })()}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Arrow between steps */}
                                                                                {index < activeVisualization.length - 1 && (
                                                                                    <div className="flex justify-center my-1">
                                                                                        <svg width="32" height="28" viewBox="0 0 32 28">
                                                                                            <polygon
                                                                                                points="4,0 28,0 16,28"
                                                                                                fill={
                                                                                                    arrowColors[index % arrowColors.length]
                                                                                                }
                                                                                                opacity="0.85"
                                                                                            />
                                                                                        </svg>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* CONNECTOR */}
                                                <div
                                                    className="absolute right-4 top-10 flex gap-3 bg-white border rounded-lg px-3 py-2 shadow-md
             opacity-0 translate-y-1 pointer-events-none
             group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
             transition-all duration-200 z-20"
                                                >
                                                    {/* 👁 VIEW
                                                        <button
                                                            onClick={() => onEyeClick(type, child)}
                                                            className="text-blue-600 hover:scale-110"
                                                        >
                                                            <Eye size={18} />
                                                        </button> */}

                                                    {/* 💬 MESSAGE */}
                                                    {child.message_id_c && (
                                                        <button
                                                            onClick={() =>
                                                                handleMessageClick(child.message_id_c)
                                                            }
                                                            className="text-purple-600 hover:scale-110"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    )}

                                                    {/* 📄 TEMPLATE */}
                                                    {child.template_id && (
                                                        <button
                                                            onClick={() =>
                                                                navigateTo("/settings/templates", {
                                                                    state: { templateId: child.template_id },
                                                                })
                                                            }
                                                            className="text-green-600 hover:scale-110"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                    )}

                                                    {/* ✨ PROMPT (NO DEBUG REDIRECT NOW) */}
                                                    {child?.prompt_details?.length > 0 && (
                                                        <button
                                                            onClick={() =>
                                                                navigateTo("settings/machine-learning", {
                                                                    state: { prompt: child.prompt_details[0] },
                                                                })
                                                            }
                                                            className="text-yellow-600 hover:scale-110"
                                                        >
                                                            <SparkleIcon size={18} />
                                                        </button>
                                                    )}
                                                    {/* Visualization */}
                                                    {child.visualization?.length > 0 && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveVisualization(child.visualization);
                                                            }}
                                                            className="text-blue-600 hover:scale-110"
                                                        >
                                                            <Workflow size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="absolute -left-[40px] top-6 w-8 border-t-2 border-dashed border-gray-300"></div>

                                                {/* DOT */}
                                                <div className={`absolute -left-[56px] top-[18px] w-3 h-3 rounded-full border-2 border-green-400 ${isHovered ? 'bg-green-300' : 'bg-white'} z-20`}></div>

                                                {/* CARD */}
                                                <div
                                                    className={`
                              bg-white border rounded-xl overflow-hidden
                              transition-all duration-300
                              ${isHovered
                                                            ? `${colors.border} shadow-lg scale-[1.01]`
                                                            : "border-gray-200 shadow-sm"}
                            `}
                                                >

                                                    {/* HEADER */}
                                                    <div className="px-5 py-4 flex items-center justify-between">

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.light}`}
                                                            >
                                                                <img src={Icon} />
                                                            </div>

                                                            <h3 className="font-medium text-gray-800">
                                                                {child?.type_c}
                                                            </h3>
                                                        </div>

                                                        {/* <div className="flex items-center gap-3">

                                                                <span
                                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${colors.badge}`}
                                                                >
                                                                    {3}
                                                                </span>

                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                            </div> */}
                                                    </div>

                                                    {/* EXPAND ON HOVER
                                                        <div
                                                            className={`
                              overflow-hidden transition-all duration-500
                              ${isHovered &&
                                                                    child.items.length > 0
                                                                    ? "max-h-[500px] opacity-100 border-t border-gray-100"
                                                                    : "max-h-0 opacity-0"}
                            `}
                                                        >

                                                            <div className="p-4 space-y-3">

                                                                {child.items.map(
                                                                    (item, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center"
                                                                        >

                                                                            <div className="flex items-center gap-3">

                                                                                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                                                                                    <Globe className="w-5 h-5 text-green-600" />
                                                                                </div>

                                                                                <div>
                                                                                    <h4 className="font-semibold text-gray-800">
                                                                                        {item.name}
                                                                                    </h4>

                                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                                        Offer Amount
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="text-right">

                                                                                <p className="text-xl font-bold text-green-600">
                                                                                    {item.amount}
                                                                                </p>

                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    {item.time}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div> */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LadgerCard;
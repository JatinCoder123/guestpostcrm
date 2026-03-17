import React from "react";
import {
    Mail,
    MailX,
    Tag,
    Handshake,
    ShoppingCart,
    Linkedin,
} from "lucide-react";
import Header from "./Header";

const actions = [
    {
        label: "Send Relevant Email",
        icon: <Mail size={20} />,
        color: "from-green-500 to-emerald-600",
    },
    {
        label: "Send Non Relevant Email",
        icon: <MailX size={20} />,
        color: "from-red-500 to-rose-600",
    },
    {
        label: "Send Offer",
        icon: <Tag size={20} />,
        color: "from-purple-500 to-indigo-600",
    },
    {
        label: "Send Deal",
        icon: <Handshake size={20} />,
        color: "from-blue-500 to-cyan-600",
    },
    {
        label: "Send GP Order",
        icon: <ShoppingCart size={20} />,
        color: "from-orange-500 to-amber-600",
    },
    {
        label: "Send LI Order",
        icon: <Linkedin size={20} />,
        color: "from-sky-500 to-blue-700",
    },
];

const SelfTest = () => {
    return (
        <div className="p-8">
            {/* Header */}
            <Header
                text={"Self Test"}
            />
            <div className="flex flex-col items-center justify-center mt-10">

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-10 tracking-wide">
                    🚀 Action Control Panel
                </h1>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() =>
                                alert(
                                    "🚧 Coming soon!\n\nThis will help in test the GPC by sending an email."
                                )
                            }
                            className={`group relative flex items-center gap-3 justify-center px-6 cursor-pointer py-5 rounded-2xl text-white font-semibold text-lg bg-gradient-to-r ${action.color} shadow-lg hover:scale-105 active:scale-95 transition-all duration-300`}
                        >
                            {/* Glow Effect */}
                            <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 blur-md transition" />

                            {/* Content */}
                            <span className="z-10 flex items-center gap-2">
                                {action.icon}
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer vibe */}
                <p className="text-gray-900 mt-10 text-sm">
                    Select an action to simulate workflow 🚀
                </p>
            </div>
        </div>
    );
};

export default SelfTest;
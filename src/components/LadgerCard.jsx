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
} from "lucide-react";

const workflowData = [
    {
        id: 1,
        title: "Reply Sent",
        icon: Mail,
        color: "indigo",
        time: "18 hours 53 mins ago",
        by: "GPC",
        message:
            "Hi John, Thank you for your response regarding the partnership proposal. We would like to schedule a quick meeting next week.",
        children: [
            {
                id: 11,
                title: "Offers Created",
                count: 2,
                icon: Tag,
                color: "green",
                items: [
                    {
                        name: "a.com",
                        amount: "$30",
                        time: "18 hours 40 mins ago",
                    },
                    {
                        name: "b.com",
                        amount: "$40",
                        time: "18 hours 35 mins ago",
                    },
                ],
            },
            {
                id: 12,
                title: "Deals Created",
                count: 3,
                icon: Briefcase,
                color: "violet",
                items: [],
            },
        ],
    },

    {
        id: 2,
        title: "Reply Received",
        icon: MailCheck,
        color: "blue",
        time: "16 hours 10 mins ago",
        by: "GPC",
        message:
            "Thanks for reaching out. I reviewed the details and everything looks good from our side. Let me know the next steps.",
        children: [
            {
                id: 21,
                title: "Orders Created",
                count: 2,
                icon: ShoppingCart,
                color: "orange",
                items: [
                    {
                        name: "amazon.com",
                        amount: "$120",
                        time: "16 hours ago",
                    },
                ],
            },
            {
                id: 22,
                title: "Cancelled Reminders",
                count: 1,
                icon: BellOff,
                color: "yellow",
                items: [],
            },
            {
                id: 23,
                title: "Created Reminders",
                count: 2,
                icon: Calendar,
                color: "cyan",
                items: [],
            },
        ],
    },
];

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

const LadgerCard = () => {
    const [activeParent, setActiveParent] = useState(null);
    const [hoveredChild, setHoveredChild] = useState(null);

    const toggleParent = (id) => {
        setActiveParent((prev) => (prev === id ? null : id));
    };

    return (
        <div className="min-h-screen  p-10">
            <div className="max-w-4xl mx-auto space-y-6 relative">

                {workflowData.map((parent, index) => {

                    const ParentIcon = parent.icon;
                    const isOpen = activeParent === parent.id;

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
                                                {parent.title}
                                            </h2>

                                            {/* MESSAGE ONLY ON HOVER */}
                                            <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-500">
                                                <p className="text-sm text-gray-600 leading-7 mt-4 max-w-2xl">
                                                    {parent.message}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 truncate max-w-[100px]">
                                                {parent.time}
                                            </p>

                                            <p className="text-sm text-gray-700 mt-1 truncate max-w-[100px]">
                                                <i> - by</i> {parent.by}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CHILDREN */}
                                {isOpen && (
                                    <div className="mt-5 ml-2 space-y-4 relative">

                                        {parent.children.map((child) => {

                                            const Icon = child.icon;
                                            const colors =
                                                colorMap[child.color];

                                            const isHovered =
                                                hoveredChild === child.id;

                                            return (
                                                <div
                                                    key={child.id}
                                                    className="relative"
                                                    onMouseEnter={() =>
                                                        setHoveredChild(child.id)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHoveredChild(null)
                                                    }
                                                >

                                                    {/* CONNECTOR */}
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
                                                                    <Icon
                                                                        className={`w-4 h-4 ${colors.text}`}
                                                                    />
                                                                </div>

                                                                <h3 className="font-medium text-gray-800">
                                                                    {child.title}
                                                                </h3>
                                                            </div>

                                                            <div className="flex items-center gap-3">

                                                                <span
                                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${colors.badge}`}
                                                                >
                                                                    {child.count}
                                                                </span>

                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        </div>

                                                        {/* EXPAND ON HOVER */}
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
                                                        </div>
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
        </div>
    );
};

export default LadgerCard;
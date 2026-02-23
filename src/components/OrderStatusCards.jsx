import {
    Package,
    CheckCircle,
    XCircle,
    PauseCircle,
    BadgeCheck,
} from "lucide-react";

const STATUS_CARDS = [
    {
        key: "new",
        label: "New",
        icon: Package,
        activeBg: "bg-blue-600 text-white",
        inactiveBg: "bg-blue-50 text-blue-700",
    },
    {
        key: "accepted",
        label: "Accepted",
        icon: CheckCircle,
        activeBg: "bg-green-600 text-white",
        inactiveBg: "bg-green-50 text-green-700",
    },
    {
        key: "wrong",
        label: "Rejected",
        icon: XCircle,
        activeBg: "bg-red-600 text-white",
        inactiveBg: "bg-red-50 text-red-700",
    },
    {
        key: "hold",
        label: "Hold",
        icon: PauseCircle,
        activeBg: "bg-yellow-600 text-white",
        inactiveBg: "bg-yellow-50 text-yellow-700",
    },
    {
        key: "completed",
        label: "Completed",
        icon: BadgeCheck,
        activeBg: "bg-purple-600 text-white",
        inactiveBg: "bg-purple-50 text-purple-700",
    },
];

export default function OrderStatusCards({ selectedStatus, onSelect }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {STATUS_CARDS.map(({ key, label, icon: Icon, activeBg, inactiveBg }) => {
                const isActive = selectedStatus === key;

                return (
                    <button
                        key={key}
                        onClick={() => onSelect(key)}
                        className={`
              flex items-center justify-between
              p-4 rounded-xl border
              transition-all duration-200
              hover:shadow-md hover:-translate-y-0.5
              ${isActive ? activeBg : inactiveBg}
            `}
                    >
                        <div className="text-left">
                            <p className={`text-sm ${isActive ? "opacity-90" : "opacity-70"}`}>
                                Orders
                            </p>
                            <p className="text-lg font-semibold">{label}</p>
                        </div>

                        <div
                            className={`w-11 h-11 flex items-center justify-center rounded-lg 
              ${isActive ? "bg-white/20" : "bg-white"}`}
                        >
                            <Icon className="w-6 h-6" />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
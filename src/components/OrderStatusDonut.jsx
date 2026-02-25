import StatusDonut from "./StatusDonut";
import {
    Package,
    CheckCircle,
    XCircle,
    PauseCircle,
    BadgeCheck,
} from "lucide-react";

export const STATUS_CARDS = [
    {
        key: "new",
        label: "New",
        icon: Package,
        color: "#2563eb", // blue
    },
    {
        key: "accepted",
        label: "Accepted",
        icon: CheckCircle,
        color: "#16a34a", // green
    },
    {
        key: "rejected",
        label: "Rejected",
        icon: XCircle,
        color: "#dc2626", // red
    },
    {
        key: "hold",
        label: "Hold",
        icon: PauseCircle,
        color: "#ca8a04", // yellow
    },
    {
        key: "completed",
        label: "Completed",
        icon: BadgeCheck,
        color: "#7c3aed", // purple
    },
];
export default function OrderStatusDonuts({
    selectedStatus,
    onSelect,
    counts = {},
}) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return (
        <div className="flex flex-wrap gap-6 items-center mb-6">
            {STATUS_CARDS.map(({ key, label, icon, color }) => (
                <StatusDonut
                    key={key}
                    label={label}
                    icon={icon}
                    value={counts[key] || 0}
                    total={total}
                    color={color}
                    active={selectedStatus === key}
                    onClick={() => onSelect(key)}
                />
            ))}
        </div>
    );
}
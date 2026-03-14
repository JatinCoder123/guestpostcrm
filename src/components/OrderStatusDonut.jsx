import StatusDonut from "./StatusDonut";
import {
    Package,
    CheckCircle,
    XCircle,
    PauseCircle,
    BadgeCheck,
    StoreIcon,
    ListFilter,
    X,
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
        key: "rejected_nontechnical",
        label: "Rejected",
        icon: XCircle,
        color: "#dc2626", // red
    },
    {
        key: "wrong",
        label: "Wrong",
        icon: X,
        color: "#662744ff", // red
    },
    {
        key: "pending",
        label: "Pending",
        icon: PauseCircle,
        color: "#ca8a04", // yellow
    },
    {
        key: "completed",
        label: "Completed",
        icon: BadgeCheck,
        color: "#7c3aed", // purple
    },
    {
        key: "marketplace",
        label: "Marketplace",
        icon: StoreIcon,
        color: "#ed3ab7", // purple
    },
    {
        key: "listacle",
        label: "Listacle",
        icon: ListFilter,
        color: "#56cd1f", // purple
    },
];
export default function OrderStatusDonuts({
    selectedStatus,
    onSelect,
    stats = [],
}) {
    const total = stats?.reduce(
        (sum, item) => sum + Number(item.status_count),
        0
    ) || 1;
    const totalAmount = stats?.reduce(
        (sum, item) => sum + Number(item.total_amount),
        0
    ) || 1;
    return (
        <div className="flex flex-wrap gap-6 items-center mb-6">
            {STATUS_CARDS.map(({ key, label, icon, color }) => (
                <StatusDonut
                    key={key}
                    label={label}
                    totalAmount={totalAmount}
                    icon={icon}
                    value={Number(stats.find(s => s.status == key)?.status_count) || 0}
                    amount={stats.find(s => s.status == key)?.total_amount || 0}
                    total={total}
                    color={color}
                    active={selectedStatus === key}
                    onClick={() => onSelect(key)}
                />
            ))}
        </div>
    );
}
import StatusDonut from "./StatusDonut";
import {
    Package,
    CheckCircle,
    XCircle,
    PauseCircle,
    BadgeCheck,
    StoreIcon,
    DollarSign,
    NotepadTextDashed,
    SendHorizonal,
} from "lucide-react";

export const STATUS_CARDS = [
    {
        key: "sent",
        label: "Sent",
        icon: SendHorizonal,
        color: "#2563eb", // blue
    },
    {
        key: "paid",
        label: "Paid",
        icon: DollarSign,
        color: "#16a34a", // green
    },
    {
        key: "draft",
        label: "Draft",
        icon: NotepadTextDashed,
        color: "#ca8a04", // yellow
    },
];
export default function InvoiceStatusDonuts({
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
                    icon={icon}
                    value={Number(stats.find(s => s.status.toLowerCase() == key)?.status_count) || 0}
                    amount={stats.find(s => s.status.toLowerCase() == key)?.total_amount || 0} total={total}
                    color={color}
                    active={selectedStatus === key}
                    onClick={() => onSelect(key)}
                />
            ))}
        </div>
    );
}
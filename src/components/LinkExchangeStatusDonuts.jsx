import StatusDonut from "./StatusDonut";
import {

    Unplug,
    Workflow,
    X,
} from "lucide-react";

export const STATUS_CARDS = [
    {
        key: "connected",
        label: "Connected",
        icon: Workflow,
        color: "#16a34a", // green
    },
    {
        key: "disconnected",
        label: "Disconnected",
        icon: X,
        color: "#ca8a04", // yellow
    },
];
export default function LinkExchangeStatusDonuts({
    selectedStatus,
    onSelect,
    stats = [],
}) {
    const total = stats?.reduce(
        (sum, item) => sum + Number(item.status_count),
        0
    ) || 1;
    ;

    return (
        <div className="flex flex-wrap gap-6 items-center justify-center mb-6">
            {STATUS_CARDS.map(({ key, label, icon, color }) => (
                <StatusDonut
                    key={key}
                    label={label}
                    icon={icon}
                    value={Number(stats.find(s => s.status.toLowerCase() == key)?.status_count) || 0}
                    amount={null} total={total}
                    color={color}
                    active={selectedStatus === key}
                    onClick={() => onSelect(key)}
                />
            ))}
        </div>
    );
}
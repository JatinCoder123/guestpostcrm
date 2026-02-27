import { VictoryPie } from "victory";

function StatusDonut({
    label,
    value,
    total,
    color,
    icon: Icon,
    active,
    amount,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            style={{
                backgroundColor: active ? `${color}15` : "transparent",
            }}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition
    ${active ? "shadow-md" : "hover:bg-gray-50"}`}
        >
            <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-gray-700">${amount}</p>
            </div>
            {/* Donut */}
            <div className="relative w-28 h-28">
                <VictoryPie
                    data={[
                        { x: "value", y: value },
                        { x: "rest", y: Math.max(total - value, 0) },
                    ]}
                    cornerRadius={10}
                    startAngle={-6}
                    innerRadius={100}
                    padAngle={2}
                    colorScale={[color, "#e5e7eb"]}
                    labels={() => null}
                    animate={{ duration: 700 }}
                />

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-md font-semibold text-gray-900">
                        {value}
                    </span>
                </div>
            </div>

            {/* Label */}
            <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">{label}</p>
            </div>
        </button>
    );
}

export default StatusDonut;
import { VictoryPie } from "victory";

function StatusDonut({
    label,
    value,
    total,
    color,
    icon: Icon,
    active,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition
        ${active ? "bg-gray-100 shadow-md" : "hover:bg-gray-50"}`}
        >
            {/* Donut */}
            <div className="relative w-24 h-24">
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
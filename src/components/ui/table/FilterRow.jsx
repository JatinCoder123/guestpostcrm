import { X } from "lucide-react";
import { useTableContext } from "./Table";

function FilterRow() {
    const { filters, setFilters } = useTableContext();

    const removeFilter = (key) => {
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const clearFilters = () => {
        setFilters({});
    };

    const formatValue = (value) => {
        if (value == null) return "";

        if (typeof value !== "object") {
            return value;
        }

        if (value.neq !== undefined) {
            return `≠ ${value.neq}`;
        }

        if (value.eq !== undefined) {
            return `= ${value.eq}`;
        }

        if (value.gt !== undefined) {
            return `> ${value.gt}`;
        }

        if (value.gte !== undefined) {
            return `≥ ${value.gte}`;
        }

        if (value.lt !== undefined) {
            return `< ${value.lt}`;
        }

        if (value.lte !== undefined) {
            return `≤ ${value.lte}`;
        }

        if (value.in !== undefined) {
            return `in (${Array.isArray(value.in) ? value.in.join(", ") : value.in})`;
        }

        return JSON.stringify(value);
    };

    const filterEntries = Object.entries(filters);

    if (!filterEntries.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50 px-3 py-2">
            <span className="text-sm font-medium text-gray-600">
                Active Filters:
            </span>

            {filterEntries.map(([key, value]) => (
                <div
                    key={key}
                    className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                    <span>
                        {key}: {formatValue(value)}
                    </span>

                    <button
                        onClick={() => removeFilter(key)}
                        className="hover:text-red-500"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}

            <button
                onClick={clearFilters}
                className="ml-2 text-sm text-red-500 hover:underline"
            >
                Clear All
            </button>
        </div>
    );
}

export default FilterRow;
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

    const filterEntries = Object.entries(filters);

    if (!filterEntries.length) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-b bg-gray-50">

            <span className="text-sm font-medium text-gray-600">
                Active Filters:
            </span>

            {filterEntries.map(([key, value]) => (
                <div
                    key={key}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                    <span>
                        {key}: {value}
                    </span>

                    <button onClick={() => removeFilter(key)}>
                        <X size={14} />
                    </button>
                </div>
            ))}

            <button
                onClick={clearFilters}
                className="text-sm text-red-500 ml-2"
            >
                Clear All
            </button>

        </div>
    );
}

export default FilterRow;
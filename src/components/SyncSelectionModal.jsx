import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import useIdle from "../hooks/useIdle.js"

const TYPE_LABELS = {
    deals: "Deals",
    offers: "Offers",
    orders: "Orders",
};

const SyncSelectionModal = ({
    onClose,
    data = [],
    type = "deals",
    onProceed,
}) => {
    const [selectedIds, setSelectedIds] = useState(new Set());
    useIdle({ idle: false })

    const allSelected = selectedIds.size === data?.length && data?.length > 0;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data.map((item) => item.id)));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const selectedItems = useMemo(
        () => data?.filter((item) => selectedIds.has(item.id)),
        [data, selectedIds]
    );

    const totalAmount = selectedItems.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const handleProceed = () => {
        onProceed({
            type,
            items: selectedItems,
            totalAmount,
        });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Sync {TYPE_LABELS[type]}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Select {TYPE_LABELS[type].toLowerCase()} to sync
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <X size={20} />
                    </button>
                </div>

                {/* Select All */}
                <div className="flex items-center justify-between px-6 py-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">Select All</span>
                    </label>

                    <span className="text-sm text-gray-500">
                        {selectedIds.size} selected
                    </span>
                </div>

                {/* List */}
                <div className="max-h-[320px] overflow-y-auto px-6">
                    {data.map((item, i) => {
                        const checked = selectedIds.has(item.id);

                        return (
                            <div
                                key={i}
                                onClick={() => toggleSelect(item.id)}
                                className={`flex items-center justify-between rounded-xl border p-4 mb-3 cursor-pointer transition
                  ${checked
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded border
                      ${checked
                                                ? "border-blue-500 bg-blue-500 text-white"
                                                : "border-gray-300"
                                            }`}
                                    >
                                        {checked && <Check size={14} />}
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">ID: {item.id}</p>
                                    </div>
                                </div>

                                <div className="text-sm font-semibold text-gray-900">
                                    ${item.amount}
                                </div>
                            </div>
                        );
                    })}

                    {data.length === 0 && (
                        <p className="py-10 text-center text-sm text-gray-500">
                            No {TYPE_LABELS[type].toLowerCase()} available
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t px-6 py-4">
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-lg font-semibold">${totalAmount}</p>
                    </div>

                    <button
                        onClick={handleProceed}
                        disabled={selectedIds.size === 0}
                        className="rounded-xl bg-blue-600 px-6 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                    >
                        Proceed & Sync
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyncSelectionModal;
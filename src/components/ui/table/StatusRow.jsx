import { AnimatePresence, motion } from "framer-motion";
import { useTableContext } from "./Table";
import Icon from "../Icon/Icon";

function StatusRow({ statusCount }) {
    const {
        statusList,
        statusKey,
        filters,
        setFilters,
        count: total,
        showStatus,
    } = useTableContext();

    const toggleStatus = (status) => {
        const key = status.filter || status.field || statusKey;

        const updated = { ...filters };

        statusList.forEach((s) => {
            delete updated[s.filter || s.field || statusKey];

            if (s.otherFilters) {
                Object.keys(s.otherFilters).forEach((k) => delete updated[k]);
            }

            if (s.neqFilter) {
                Object.keys(s.neqFilter).forEach((k) => delete updated[k]);
            }
        });

        const isAlreadyApplied = (() => {
            if (filters?.[key] !== status.value) return false;

            if (status.otherFilters) {
                for (const [k, v] of Object.entries(status.otherFilters)) {
                    if (filters?.[k] !== v) return false;
                }
            }

            if (status.neqFilter) {
                for (const [k, v] of Object.entries(status.neqFilter)) {
                    if (filters?.[k]?.neq !== v) return false;
                }
            }

            return true;
        })();

        if (isAlreadyApplied) {
            setFilters(updated);
            return;
        }

        updated[key] = status.value;

        if (status.otherFilters) {
            Object.assign(updated, status.otherFilters);
        }

        if (status.neqFilter) {
            Object.entries(status.neqFilter).forEach(([field, value]) => {
                updated[field] = { neq: value };
            });
        }

        setFilters(updated);
    };

    const isStatusActive = (status) => {
        const field = status.filter || status.field || statusKey;
        return filters?.[field] === status.value;
    };

    return (
        <AnimatePresence>
            {showStatus && (
                <motion.div
                    key="status-row"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.35 }}
                    className="
                        grid
                        grid-cols-2
                        sm:grid-cols-3
                        md:grid-cols-4
                        xl:grid-cols-6
                        2xl:grid-cols-8
                        gap-4
                        py-3
                    "
                >
                    {statusList.map((status) => {
                        const count = status.count ?? 0;
                        const grandTotal = statusCount ?? total ?? 1;

                        const percent = Math.round(
                            (count / Math.max(grandTotal, 1)) * 100
                        );

                        const active = status?.checkActive
                            ? status.checkActive()
                            : isStatusActive(status);

                        return (
                            <motion.button
                                whileHover={{
                                    y: -4,
                                    scale: 1.02,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                key={status.key || status.value}
                                onClick={() => {
                                    if (status.handleStatusClick) {
                                        status.handleStatusClick();
                                    } else {
                                        toggleStatus(status);
                                    }
                                }}
                                className={`
                                    relative
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    bg-white
                                    p-4
                                    text-left
                                    transition-all
                                    shadow-sm
                                    hover:shadow-lg

                                    ${active
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-blue-200"
                                    }
                                `}
                            >


                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                                        style={{
                                            background: `${status.color}15`,
                                            color: status.color,
                                        }}
                                    >
                                        {Icon({ ...status.icon })}
                                    </div>

                                    <span
                                        className="rounded-full px-2 py-1 text-xs font-semibold"
                                        style={{
                                            background: `${status.color}15`,
                                            color: status.color,
                                        }}
                                    >
                                        {status.label}                                    </span>
                                </div>

                                <div className="mt-5">
                                    {status.showAmount && (
                                        <div className="text-2xl font-bold">
                                            ${status.amount}
                                        </div>
                                    )}

                                    <div className="mt-1 text-xl font-semibold">
                                        {count}
                                    </div>

                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default StatusRow;
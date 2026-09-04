import { AnimatePresence, motion } from "framer-motion";
import { useTableContext } from "./Table";

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

        // Remove every filter added by any status
        statusList.forEach((s) => {
            // Remove main filter
            delete updated[s.filter || s.field || statusKey];

            // Remove other filters
            if (s.otherFilters) {
                Object.keys(s.otherFilters).forEach((k) => {
                    delete updated[k];
                });
            }

            // Remove neq filters
            if (s.neqFilter) {
                Object.keys(s.neqFilter).forEach((k) => {
                    delete updated[k];
                });
            }
        });

        // Check whether this exact status is already applied
        const isAlreadyApplied = (() => {
            if (filters?.[key] !== status.value) {
                return false;
            }

            if (status.otherFilters) {
                for (const [k, v] of Object.entries(status.otherFilters)) {
                    if (filters?.[k] !== v) {
                        return false;
                    }
                }
            }

            if (status.neqFilter) {
                for (const [k, v] of Object.entries(status.neqFilter)) {
                    if (filters?.[k]?.neq !== v) {
                        return false;
                    }
                }
            }

            return true;
        })();

        // Toggle OFF
        if (isAlreadyApplied) {
            setFilters(updated);
            return;
        }

        // Apply main filter
        updated[key] = status.value;

        // Apply normal extra filters
        if (status.otherFilters) {
            Object.assign(updated, status.otherFilters);
        }

        // Apply neq filters
        if (status.neqFilter) {
            Object.entries(status.neqFilter).forEach(([field, value]) => {
                updated[field] = {
                    neq: value,
                };
            });
        }

        setFilters(updated);
    };

    const isStatusActive = (status) => {
        const field =
            status.filter ||
            status.field ||
            statusKey;

        return filters?.[field] === status.value;
    };

    return (
        <div className="w-full">
            <AnimatePresence initial={false}>
                {showStatus && (
                    <motion.div
                        key="status-row"
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                        }}
                        className="
                            grid
                            grid-cols-2
                            sm:grid-cols-3
                            md:grid-cols-4
                            lg:grid-cols-5
                            xl:grid-cols-6
                            2xl:grid-cols-8
                            gap-2
                            overflow-hidden
                        "
                    >
                        {statusList.map((status, index) => {
                            const count = status.count ?? 0;
                            const amount = status.amount ?? 0;

                            const active = status?.checkActive
                                ? status.checkActive()
                                : isStatusActive(status);

                            const color = status.color || "#64748b";

                            const countLabel =
                                status.countLabel || "items";

                            const StatusIcon = status.icon;

                            return (
                                <motion.button
                                    key={
                                        status.key ||
                                        status.value ||
                                        index
                                    }
                                    type="button"
                                    onClick={() => {
                                        if (
                                            status?.handleStatusClick
                                        ) {
                                            status.handleStatusClick();
                                        } else {
                                            toggleStatus(status);
                                        }
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    transition={{
                                        duration: 0.12,
                                    }}
                                    className={`
                                        group
                                        relative
                                        flex
                                        min-w-0
                                        items-center
                                        gap-3
                                        rounded-xl
                                        border
                                        px-3
                                        py-2.5
                                        text-left
                                        transition-colors
                                        duration-150

                                        ${active
                                            ? "border-primary/40 bg-white"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {/* ICON */}
                                    <div
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                        "
                                        style={{
                                            backgroundColor: `${color}12`,
                                            color: color,
                                        }}
                                    >
                                        <span className="text-[16px]">
                                            {StatusIcon && < StatusIcon
                                                size={16}
                                            />}
                                        </span>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            {/* STATUS LABEL */}
                                            <span
                                                className={`
                                                    truncate
                                                    text-xs
                                                    font-medium
                                                    ${active
                                                        ? "text-gray-900"
                                                        : "text-gray-600"
                                                    }
                                                `}
                                            >
                                                {status.label}
                                            </span>

                                            {/* MAIN VALUE */}
                                            {status.showAmount ? (
                                                <span className="shrink-0 text-sm font-bold text-gray-900">
                                                    $
                                                    {Number(
                                                        amount
                                                    ).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="shrink-0 text-sm font-bold text-gray-900">
                                                    {count.toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        {/* SECONDARY VALUE */}
                                        <div className="mt-0.5 text-[13px] text-gray-500">
                                            {status.showAmount
                                                ? `${count.toLocaleString()} ${countLabel}`
                                                : ''}
                                        </div>
                                    </div>

                                    {/* ACTIVE INDICATOR */}
                                    {active && (
                                        <span
                                            className="
                                                absolute
                                                bottom-0
                                                left-3
                                                right-3
                                                h-0.5
                                                rounded-full
                                            "
                                            style={{
                                                backgroundColor:
                                                    color,
                                            }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StatusRow;
import { AnimatePresence, motion } from "framer-motion";
import StatusDonut from "./StatusDonut";
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

    const isStatusActive = (
        status
    ) => {
        const field =
            status.filter ||
            status.field ||
            statusKey;

        return (
            filters?.[field] ===
            status.value
        );
    };

    return (
        <div className="w-full">
            <AnimatePresence>
                {showStatus && (
                    <motion.div
                        key="status-row"
                        initial={{
                            y: -100,
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: 100,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                        }}
                        className="flex flex-wrap items-end justify-center gap-4 py-2"
                    >
                        {statusList.map(
                            (status) => {
                                const Icon =
                                    status.icon;

                                return (
                                    <StatusDonut
                                        key={
                                            status.key || status.value
                                        }
                                        label={
                                            status.label
                                        }
                                        value={
                                            status.count
                                        }
                                        total={
                                            statusCount ??
                                            total
                                        }
                                        color={
                                            status.color
                                        }
                                        icon={
                                            Icon
                                        }
                                        active={
                                            status?.checkActive
                                                ? status.checkActive()
                                                : isStatusActive(
                                                    status
                                                )
                                        }
                                        amount={
                                            status.showAmount
                                                ? status.amount
                                                : null
                                        }
                                        showAmount={status.showAmount}
                                        onClick={() => {
                                            if (
                                                status?.handleStatusClick
                                            ) {
                                                status.handleStatusClick();
                                            } else {
                                                toggleStatus(
                                                    status
                                                );
                                            }
                                        }}
                                    />
                                );
                            }
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StatusRow;
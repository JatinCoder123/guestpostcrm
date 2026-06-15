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

    const toggleStatus = (
        value,
        field
    ) => {
        const key =
            field || statusKey;

        const donutFields = [
            ...new Set(
                statusList.map(
                    (s) =>
                        s.filter ||
                        s.field ||
                        statusKey
                )
            ),
        ];

        const updated = {
            ...filters,
        };

        // Remove all donut-related filters
        donutFields.forEach((f) => {
            delete updated[f];
        });

        // If clicked donut already active,
        // just clear donut filters
        if (
            filters?.[key] === value
        ) {
            setFilters(updated);
            return;
        }

        // Apply selected donut filter
        updated[key] = value;

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
                                            status.value
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
                                        onClick={() => {
                                            if (
                                                status?.handleStatusClick
                                            ) {
                                                status.handleStatusClick();
                                            } else {
                                                toggleStatus(
                                                    status.value,
                                                    status.filter ||
                                                    status.field
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
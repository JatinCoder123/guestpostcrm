import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import StatusDonut from "./StatusDonut"
import { useTableContext } from "./Table"

function StatusRow({ statusCount }) {

    const { statusList, statusKey, filters, setFilters, count: total, showStatus, setShowStatus } = useTableContext()
    const activeStatus = filters[statusKey]


    const toggleStatus = (value) => {
        setFilters(prev => {
            if (prev[statusKey] === value) {
                const updated = { ...prev }
                delete updated[statusKey]
                return updated
            }
            return { ...prev, [statusKey]: value }
        })
    }

    return (
        <div className="w-full">

            {/* Toggle Button */}


            {/* Animated Donut Section */}
            <AnimatePresence>
                {showStatus && (
                    <motion.div
                        key="status-row"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="flex items-end justify-center gap-6 overflow-x-auto py-1"
                    >
                        {statusList.map(status => {
                            const Icon = status.icon

                            return (
                                <StatusDonut
                                    key={status.value}
                                    label={status.label}
                                    value={status.count}
                                    total={statusCount ?? total}
                                    color={status.color}
                                    icon={Icon}
                                    active={status?.checkActive ? status.checkActive() : activeStatus === status.value}
                                    amount={status.showAmount ? status.amount : null}
                                    onClick={() => {
                                        if (status?.handleStatusClick) {
                                            status.handleStatusClick();
                                        } else {
                                            toggleStatus(status.value);
                                        }
                                    }} />
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default StatusRow
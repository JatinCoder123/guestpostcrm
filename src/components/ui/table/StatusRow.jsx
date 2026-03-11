import StatusDonut from "./StatusDonut"
import { useTableContext } from "./Table"

function StatusRow() {

    const { statusList, filters, setFilters, count: total } = useTableContext()
    const activeStatus = filters.status

    const toggleStatus = (value) => {
        setFilters(prev => {
            if (prev.status === value) {
                const updated = { ...prev }
                delete updated.status
                return updated
            }
            return { ...prev, status: value }

        })

    }

    return (

        <div className="flex gap-6 overflow-x-auto py-3">

            {statusList.map(status => {

                const Icon = status.icon

                return (

                    <StatusDonut
                        key={status.value}
                        label={status.label}
                        value={status.count}
                        total={total}
                        color={status.color}
                        icon={Icon}
                        active={activeStatus === status.value}
                        amount={status.showAmount ? status.amount : null}
                        onClick={() => toggleStatus(status.value)}
                    />

                )

            })}

        </div>

    )

}

export default StatusRow
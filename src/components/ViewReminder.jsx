import Loading from "./Loading"

export const ViewReminder = ({ reminder, loading, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-3xl mx-4 rounded-xl shadow-xl
                            max-h-[90vh] overflow-y-auto animate-fadeIn">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-xl">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Reminder Details
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <Loading />
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-800">
                                        {reminder?.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Reminder Type: {reminder?.reminder_type_label}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${reminder?.status === 'Pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}
                                >
                                    {reminder?.status}
                                </span>
                            </div>

                            <div className="border-t my-5"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <Detail label="Recipient" value={reminder?.real_name} />
                                <Detail label="Recipient Email" value={reminder?.recipient} />
                                <Detail label="Sender" value={reminder?.sender} />
                                <Detail label="Scheduled Time" value={reminder?.scheduled_time} />
                                <Detail label="Created At" value={reminder?.date_entered_formatted} />
                                <Detail label="Last Modified" value={reminder?.date_modified_formatted} />
                                <Detail label="Thread ID" value={reminder?.thread_id} mono />
                                <Detail label="Template ID" value={reminder?.template_id} mono />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

/* Reusable detail row */
const Detail = ({ label, value, mono }) => (
    <div>
        <p className="text-gray-500 mb-1">{label}</p>
        <p
            className={`text-gray-800 font-medium break-all
            ${mono ? 'font-mono text-xs bg-gray-50 p-2 rounded' : ''}`}
        >
            {value || '—'}
        </p>
    </div>
)

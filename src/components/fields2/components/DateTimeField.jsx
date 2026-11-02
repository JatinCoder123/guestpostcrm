// fields/components/DateTimeField.jsx

const pad = (num) => String(num).padStart(2, "0");

const formatDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return `${date.getFullYear()}-${pad(
        date.getMonth() + 1
    )}-${pad(date.getDate())}T${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}`;
};

/**
 * Convert datetime-local value:
 *
 * 2026-09-17T07:16
 *
 * to:
 *
 * 09/17/2026 07:16
 */
const formatForApi = (value) => {
    if (!value) return "";

    const [datePart, timePart] = value.split("T");

    if (!datePart || !timePart) {
        return "";
    }

    const [year, month, day] = datePart.split("-");

    const [hours, minutes] = timePart.split(":");

    if (!year || !month || !day || !hours || !minutes) {
        return "";
    }

    return `${month}/${day}/${year} ${hours}:${minutes}`;
};

const DateTimeField = ({
    field,
    value,
    presentation,
    onChange,
    onCommit,
    onCancel,
    disabled,
    readOnly,
}) => {
    if (presentation === "display") {
        if (!value) {
            return <span>-</span>;
        }

        return (
            <span>
                {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                }).format(new Date(value))}
            </span>
        );
    }

    const inputValue = formatDateTimeLocal(value);

    return (
        <input
            type="datetime-local"
            value={inputValue}
            disabled={disabled}
            readOnly={readOnly}
            className="w-full rounded-md border px-3 py-2"
            onChange={(e) => {
                const formattedValue = formatForApi(
                    e.target.value
                );

                onChange?.(formattedValue);
            }}
            onBlur={() => onCommit?.()}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    onCancel?.();
                }
            }}
        />
    );
};

export default DateTimeField;
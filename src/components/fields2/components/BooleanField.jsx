// fields/components/BooleanField.jsx

const BooleanField = ({
    field,
    value,
    presentation,
    onChange,
    onCommit,
    disabled,
    readOnly,
}) => {
    if (presentation === "display") {
        return (
            <span>
                {Number(value) ? "Yes" : "No"}
            </span>
        );
    }

    return (
        <label className="inline-flex items-center gap-2">
            <input
                type="checkbox"
                checked={Boolean(Number(value))}
                disabled={disabled}
                readOnly={readOnly}
                onChange={(e) => {
                    onChange?.(
                        e.target.checked
                    );

                    onCommit?.();
                }}
            />

            <span>
                {field.label}
            </span>
        </label>
    );
};

export default BooleanField;
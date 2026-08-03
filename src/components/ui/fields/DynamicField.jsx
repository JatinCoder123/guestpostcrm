import { memo } from "react";
import FIELD_COMPONENTS from "./fieldRegistry";


function DynamicField({
    field,
    value,
    record,
    mode = "view",

    onChange,
    onSave,
    onCancel,

    disabled = false,

    ...rest
}) {

    const Component =
        FIELD_COMPONENTS[field.type] ??
        FIELD_COMPONENTS.text;

    return (
        <Component
            field={field}
            value={value}
            record={record}
            mode={mode}

            disabled={disabled}

            onChange={onChange}
            onSave={onSave}
            onCancel={onCancel}

            {...rest}
        />
    );
}

export default memo(DynamicField);
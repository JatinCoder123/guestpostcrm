import { memo } from "react";
import {
    DEFAULT_FIELD,
    FIELD_COMPONENTS,
} from "./fieldRegistry";

function FieldRenderer({
    row,
    column,
    value,
}) {
    const Component =
        FIELD_COMPONENTS[column.type] ??
        DEFAULT_FIELD;

    return (
        <Component
            row={row}
            value={value}
            column={column}
        />
    );
}

export default memo(FieldRenderer);
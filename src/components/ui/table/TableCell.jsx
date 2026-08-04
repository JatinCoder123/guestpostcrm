import { memo } from "react";
import DynamicField from "../fields/DynamicField";

function TableCell({
    row,
    column,
}) {
    const sticky = column.sticky;

    return (
        <div
            onClick={() => column.onClick?.(row)}
            className={`
                relative
                flex
                items-center
                 px-4
                 py-3
                overflow-hidden
                whitespace-nowrap
                hover:border
               hover:border-blue-300
                transition-colors
                ${column.classes ?? ""}
            `}
            style={{
                position: sticky ? "sticky" : "relative",

                left: sticky
                    ? column.left
                    : undefined,

                zIndex: sticky ? 20 : 1,

                background: sticky
                    ? "#fff"
                    : undefined,

                isolation: sticky
                    ? "isolate"
                    : undefined,
            }}
        >
            <DynamicField
                mode="table"
                field={column}
                value={row[column.accessor]}
                record={row}
            />
        </div>
    );
}

export default memo(TableCell);
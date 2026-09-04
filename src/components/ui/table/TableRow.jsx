import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTableContext } from "./Table";
import TableCell from "./TableCell";

export default function TableRow({
    row,
}) {
    const {
        stickyColumns,
        gridTemplate,
        layout,
    } = useTableContext();

    const navigate = useNavigate();

    const rowAction = layout?.rowAction;

    const handleRowAction = useCallback(
        (event) => {
            if (!rowAction) {
                return;
            }

            // Don't trigger row navigation when clicking
            // interactive elements inside a cell.
            const target = event.target;

            if (
                target.closest?.(
                    "button, a, input, textarea, select"
                )
            ) {
                return;
            }

            // Only handle navigation actions for now
            if (
                rowAction.type &&
                rowAction.type !== "navigate"
            ) {
                return;
            }

            const targetUrl =
                rowAction.target ||
                rowAction.navigateTo;

            if (!targetUrl) {
                return;
            }

            const url = targetUrl.replace(
                /\{([^}]+)\}/g,
                (_, key) => {
                    const value = row?.[key];

                    return value != null
                        ? encodeURIComponent(value)
                        : "";
                }
            );

            navigate(url);
        },
        [
            navigate,
            row,
            rowAction,
        ]
    );

    return (
        <div
            className={`
                grid
                border-b
                hover:bg-slate-50
                transition-colors
                ${rowAction ? "cursor-pointer" : ""}
            `}
            style={{
                gridTemplateColumns:
                    gridTemplate,
            }}
            onClick={
                rowAction
                    ? handleRowAction
                    : undefined
            }
        >
            {stickyColumns.map(
                (column) => (
                    <TableCell
                        key={
                            column.accessor
                        }
                        row={row}
                        column={column}
                    />
                )
            )}
        </div>
    );
}
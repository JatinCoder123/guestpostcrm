import { memo, useCallback } from "react";
import DynamicField from "../fields/DynamicField";
import { useTableContext } from "./Table";
import toast from "react-hot-toast";
import { useUpdateEntity } from "@/queries/entity.queries";

function TableCell({
    row,
    column,
}) {
    const sticky = column.sticky;

    const {
        actionContext,
        entity,
        layout,
    } = useTableContext();

    const updateMutation = useUpdateEntity();

    const handleSave = useCallback(
        async ({
            field,
            value,
            rowId,
            record,
        }) => {
            const toastId = toast.loading(
                "Saving changes..."
            );

            try {
                await updateMutation.mutateAsync({
                    entity: entity,
                    module: layout?.module,
                    id: rowId,
                    payload: {
                        [field.accessor]: value,
                    },
                });

                toast.success(
                    (t) => (
                        <div className="flex items-center gap-3">
                            <span>
                                Changes saved
                            </span>

                            <button
                                type="button"
                                onClick={() => {
                                    // Undo functionality will be added later
                                    toast.dismiss(t.id);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-700 underline"
                            >
                                Undo
                            </button>
                        </div>
                    ),
                    {
                        id: toastId,
                        duration: 5000,
                    }
                );
            } catch (error) {
                console.error(
                    "Update failed:",
                    error
                );

                toast.error(
                    "Failed to save changes",
                    {
                        id: toastId,
                    }
                );
            }
        },
        [
            entity,
            layout,
            updateMutation,
        ]
    );

    return (
        <div
            onClick={() =>
                column.onClick?.(row)
            }
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
                position: sticky
                    ? "sticky"
                    : "relative",

                left: sticky
                    ? column.left
                    : undefined,

                zIndex: sticky
                    ? 20
                    : 1,

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
                value={
                    row[column.accessor]
                }
                record={row}
                onSave={handleSave}
                actionContext={
                    actionContext
                }
                disabled={
                    updateMutation.isPending
                }
            />
        </div>
    );
}

export default memo(TableCell);
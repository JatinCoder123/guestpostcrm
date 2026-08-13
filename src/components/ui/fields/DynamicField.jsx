import { memo, useCallback } from "react";
import FIELD_COMPONENTS from "./fieldRegistry";
import { executeAction } from "../../fields/actions/ActionEngine";

function DynamicField({
    field,
    value,
    record,
    mode = "view",

    onChange,
    onSave,
    onCancel,

    disabled = false,

    actionContext,

    ...rest
}) {
    const Component =
        FIELD_COMPONENTS[field?.type] ??
        FIELD_COMPONENTS.text;

    /*
     * ---------------------------------------------------------
     * FIELD ACTION
     * ---------------------------------------------------------
     *
     * Example:
     *
     * actionable: true,
     *
     * action: {
     *     type: "navigate",
     *     target: "/contacts/{id}"
     * }
     *
     */

    const actionable =
        field?.actionable === true &&
        !!field?.action;

    const handleAction = useCallback(
        async (event) => {
            if (!actionable) {
                return;
            }

            /*
             * Prevent the action from bubbling to
             * TableRow / TableCell.
             */
            event?.stopPropagation();

            try {
                actionContext?.onActionStart?.({
                    action: field.action,
                    record,
                    field,
                });

                const result =
                    await executeAction({
                        action: field.action,
                        record,
                        context:
                            actionContext,
                    });

                actionContext?.onActionSuccess?.({
                    action: field.action,
                    record,
                    field,
                    result,
                });

                return result;
            } catch (error) {
                console.error(
                    "Field action failed:",
                    error
                );

                actionContext?.onActionError?.({
                    action: field.action,
                    record,
                    field,
                    error,
                });
            }
        },
        [
            actionable,
            field,
            record,
            actionContext,
        ]
    );

    /*
     * ---------------------------------------------------------
     * FIELD
     * ---------------------------------------------------------
     */

    const fieldElement = (
        <Component
            field={field}
            value={value}
            record={record}
            mode={mode}

            actionContext={actionContext}

            disabled={disabled}

            onChange={onChange}
            onSave={onSave}
            onCancel={onCancel}

            {...rest}
        />
    );

    /*
     * ---------------------------------------------------------
     * ACTIONABLE FIELD
     * ---------------------------------------------------------
     *
     * Only wrap the field when actionable.
     *
     * This prevents unnecessary wrapper divs for
     * normal fields.
     */

    if (!actionable) {
        return fieldElement;
    }

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={
                disabled
                    ? undefined
                    : handleAction
            }
            onKeyDown={(event) => {
                if (
                    disabled ||
                    !actionable
                ) {
                    return;
                }

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault();
                    handleAction(event);
                }
            }}
            className="
                w-full
                min-w-0
                cursor-pointer
                transition-colors
                hover:text-blue-600
            "
        >
            {fieldElement}
        </div>
    );
}

export default memo(DynamicField);
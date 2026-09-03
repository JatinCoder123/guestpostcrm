// detail/components/DetailField.jsx

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Check,
    X,
    Loader2,
} from "lucide-react";

import FieldRenderer from "@/components/fields2/FieldRenderer";
import { useDetailEdit } from "@/context/DetailEditContext";

const DetailField = ({
    field,
    value,
    record,
    updating = false,
    fieldKey,
    onSave,
}) => {
    const {
        isEditing,
        startEditing,
        stopEditing,
    } = useDetailEdit();

    const editing = isEditing(fieldKey);

    /*
     * ---------------------------------------------------------
     * LOCAL DISPLAY VALUE
     * ---------------------------------------------------------
     *
     * This is the value shown when the field is not editing.
     */
    const [displayValue, setDisplayValue] =
        useState(value);

    /*
     * ---------------------------------------------------------
     * DRAFT VALUE
     * ---------------------------------------------------------
     *
     * Temporary value while editing.
     */
    const [draftValue, setDraftValue] =
        useState(value);

    /*
     * ---------------------------------------------------------
     * SYNC WITH PARENT
     * ---------------------------------------------------------
     *
     * Only synchronize when we are NOT editing.
     *
     * IMPORTANT:
     * Don't reset displayValue immediately after our own
     * successful save. The parent/query can update later.
     */

    useEffect(() => {
        if (!editing && !updating) {
            setDisplayValue(value);
        }
    }, [value, editing, updating]);

    /*
     * ---------------------------------------------------------
     * START EDITING
     * ---------------------------------------------------------
     */

    const handleStartEditing = useCallback(
        (event) => {
            /*
             * Don't start editing if the click/double click
             * originated from an action button.
             */
            if (
                event?.target?.closest(
                    "[data-detail-field-action]"
                )
            ) {
                return;
            }

            if (
                field.readOnly ||
                field.editable === false ||
                updating
            ) {
                return;
            }

            setDraftValue(displayValue);

            startEditing(fieldKey);
        },
        [
            field.readOnly,
            field.editable,
            updating,
            displayValue,
            fieldKey,
            startEditing,
        ]
    );

    /*
     * ---------------------------------------------------------
     * SAVE
     * ---------------------------------------------------------
     */

    const handleSave = async (event) => {
        event?.preventDefault();
        event?.stopPropagation();

        if (updating) {
            return;
        }

        /*
         * Nothing changed.
         */
        if (
            Object.is(
                draftValue,
                displayValue
            )
        ) {
            stopEditing();
            return;
        }

        try {
            /*
             * Parent mutation must throw when it fails.
             */
            await onSave(
                draftValue,
                field
            );

            /*
             * -----------------------------------------------
             * SUCCESS
             * -----------------------------------------------
             *
             * Immediately show the new value.
             */
            setDisplayValue(draftValue);

            /*
             * Keep draft synchronized as well.
             */
            setDraftValue(draftValue);

            /*
             * Now leave edit mode.
             */
            stopEditing();
        } catch (error) {
            /*
             * -----------------------------------------------
             * FAILURE
             * -----------------------------------------------
             *
             * DO NOT change displayValue.
             *
             * Old value remains available.
             *
             * Keep editing open so user can retry/cancel.
             */
            console.error(
                "Field save failed:",
                error
            );
        }
    };

    /*
     * ---------------------------------------------------------
     * CANCEL
     * ---------------------------------------------------------
     */

    const handleCancel = (event) => {
        event?.preventDefault();
        event?.stopPropagation();

        if (updating) {
            return;
        }

        /*
         * Throw away draft.
         */
        setDraftValue(displayValue);

        /*
         * Leave edit mode.
         */
        stopEditing();
    };

    /*
     * ---------------------------------------------------------
     * BLUR
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We DO NOT save on blur.
     *
     * If focus moves outside the field, cancel the edit.
     *
     * If focus moves to Check/X, do nothing.
     */

    const handleBlur = (event) => {
        if (!editing || updating) {
            return;
        }

        const relatedTarget =
            event.relatedTarget;

        /*
         * Focus moved to something inside
         * this DetailField.
         *
         * Example:
         *
         * Input → Check
         * Input → Cancel
         */
        if (
            relatedTarget &&
            event.currentTarget.contains(
                relatedTarget
            )
        ) {
            return;
        }

        /*
         * Focus actually left the field.
         *
         * Cancel the draft.
         */
        handleCancel();
    };

    /*
     * ---------------------------------------------------------
     * KEYBOARD
     * ---------------------------------------------------------
     */

    const handleKeyDown = (event) => {
        if (!editing || updating) {
            return;
        }

        /*
         * Escape = cancel
         */
        if (event.key === "Escape") {
            event.preventDefault();

            handleCancel(event);

            return;
        }

        /*
         * Enter = save
         *
         * Don't do this for textarea-like fields.
         */
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            field.type !== "textarea" &&
            field.type !== "long_text"
        ) {
            event.preventDefault();

            handleSave(event);
        }
    };

    return (
        <div
            className="group min-w-0"
            onDoubleClick={
                handleStartEditing
            }
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            {/* =====================================================
                LABEL
            ===================================================== */}

            <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                    {field.label}
                </span>

                {!editing &&
                    field.editable !== false && (
                        <span
                            className="
                                text-xs
                                text-gray-400
                                opacity-0
                                transition
                                group-hover:opacity-100
                            "
                        >
                            Double click to edit
                        </span>
                    )}
            </div>

            {/* =====================================================
                VALUE
            ===================================================== */}

            <div
                className={`
                    flex
                    min-h-9
                    items-center
                    gap-2
                    rounded-md
                    px-2
                    py-1

                    ${!editing &&
                        field.editable !== false
                        ? "cursor-pointer transition hover:bg-gray-50"
                        : ""
                    }
                `}
            >
                {/* FIELD */}

                <div className="min-w-0 flex-1">
                    <FieldRenderer
                        field={field}
                        value={
                            editing
                                ? draftValue
                                : displayValue
                        }
                        record={record}
                        presentation={
                            editing
                                ? "edit"
                                : "display"
                        }
                        onChange={
                            setDraftValue
                        }
                        onCommit={
                            handleSave
                        }
                        onCancel={
                            handleCancel
                        }
                        disabled={updating}
                    />
                </div>

            </div>
        </div>
    );
};

export default DetailField;
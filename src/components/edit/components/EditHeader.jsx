import React from "react";



import useEntityEdit
    from "../context/useEntityEdit";
import { resolveFieldValue } from "../../fields/resolveFieldContext ";

const EditHeader = ({
    config,
    record,
}) => {
    const {
        isDirty,
        saving,
        resetAll,
    } = useEntityEdit();

    const title =
        resolveFieldValue({
            record,
            field: config.titleField,
        });

    const subtitle =
        resolveFieldValue({
            record,
            field: config.subtitleField,
        });

    const description =
        resolveFieldValue({
            record,
            field:
                config.descriptionField,
        });

    return (
        <div className="rounded-xl   p-6">
            <div className="flex items-start justify-between gap-6">

                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="min-w-0">

                    <h1 className="text-2xl font-semibold">
                        {title ?? "-"}
                    </h1>

                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}

                    {description && (
                        <p className="mt-1 text-sm text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                {/* =================================================
                    RIGHT
                ================================================= */}

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={resetAll}
                        disabled={
                            saving ||
                            !isDirty
                        }
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={
                            saving ||
                            !isDirty
                        }
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default EditHeader;
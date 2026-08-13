

import useEntityEdit
    from "../context/useEntityEdit";
import FieldRenderer from "../../fields/FieldRenderer";

const EditFieldRenderer = ({
    field,
    section,
}) => {
    const {
        record,
        getFieldValue,
        updateField,
        errors,
    } = useEntityEdit();

    const value =
        getFieldValue({
            section,
            field,
        });



    const module =
        section?.source?.module ??
        section?.module;

    const error =
        errors?.[module]?.[
        field.accessor
        ];

    return (
        <div className="min-w-0">

            <FieldRenderer
                field={field}

                value={value}
                record={record}

                mode="edit"

                disabled={
                    field.readonly === true ||
                    field.editable === false
                }

                onChange={(nextValue) =>
                    updateField({
                        section,
                        field,
                        value: nextValue,
                    })
                }
            />

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
};

export default EditFieldRenderer;
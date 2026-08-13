import React from "react";

import EditFieldRenderer
    from "./EditFieldRenderer";

const EditSection = ({
    config,
    record,
}) => {
    return (
        <div className="rounded-xl border bg-white p-6">

            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    {config.title}
                </h2>
            </div>

            <div
                className="grid gap-5"
                style={{
                    gridTemplateColumns:
                        `repeat(2, minmax(0, 1fr))`,
                }}
            >
                {config.fields
                    ?.filter(
                        (field) =>
                            field.visible !== false
                    )
                    .map(
                        (field) => (
                            <EditFieldRenderer
                                key={
                                    field.accessor
                                }
                                field={
                                    field
                                }
                                section={
                                    config
                                }
                                record={
                                    record
                                }
                            />
                        )
                    )}
            </div>
        </div>
    );
};

export default EditSection;
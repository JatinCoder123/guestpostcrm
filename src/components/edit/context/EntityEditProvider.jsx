import {
    useCallback,
    useMemo,
    useState,
} from "react";

import EntityEditContext
    from "./EntityEditContext";

import {
    buildEditState,
} from "../utils/buildEditState";

const EntityEditProvider = ({
    children,
    layout,
    record,
    entity,
    id,
}) => {
    const initialState = useMemo(
        () =>
            buildEditState({
                layout,
                record,
            }),
        [layout, record]
    );

    const [
        formState,
        setFormState,
    ] = useState(initialState);

    const [
        dirtyFields,
        setDirtyFields,
    ] = useState({});

    const [
        errors,
        setErrors,
    ] = useState({});

    const [
        saving,
        setSaving,
    ] = useState(false);

    // ============================================================
    // UPDATE FIELD
    // ============================================================

    const updateField = useCallback(
        ({
            section,
            field,
            value,
        }) => {
            const module =
                section?.source?.module ??
                section?.module;

            if (!module) {
                console.warn(
                    "No module found for section",
                    section
                );

                return;
            }

            setFormState(
                (previous) => ({
                    ...previous,

                    [module]: {
                        ...previous[module],

                        data: {
                            ...previous[module]
                                ?.data,

                            [field.accessor]:
                                value,
                        },
                    },
                })
            );

            setDirtyFields(
                (previous) => ({
                    ...previous,

                    [module]: {
                        ...previous[module],

                        [field.accessor]: true,
                    },
                })
            );

            // Clear field error
            setErrors(
                (previous) => {
                    if (
                        !previous[module]
                    ) {
                        return previous;
                    }

                    const moduleErrors = {
                        ...previous[
                        module
                        ],
                    };

                    delete moduleErrors[
                        field.accessor
                    ];

                    return {
                        ...previous,

                        [module]:
                            moduleErrors,
                    };
                }
            );
        },
        []
    );

    // ============================================================
    // GET FIELD VALUE
    // ============================================================

    const getFieldValue = useCallback(
        ({
            section,
            field,
        }) => {
            const module =
                section?.source?.module ??
                section?.module;

            return formState?.[
                module
            ]?.data?.[
                field.accessor
            ];
        },
        [formState]
    );

    // ============================================================
    // RESET FIELD
    // ============================================================

    const resetField = useCallback(
        ({
            section,
            field,
        }) => {
            const module =
                section?.source?.module ??
                section?.module;

            const originalValue =
                initialState?.[
                    module
                ]?.data?.[
                field.accessor
                ];

            updateField({
                section,
                field,
                value: originalValue,
            });

            setDirtyFields(
                (previous) => {
                    const moduleDirty = {
                        ...previous[module],
                    };

                    delete moduleDirty[
                        field.accessor
                    ];

                    return {
                        ...previous,

                        [module]:
                            moduleDirty,
                    };
                }
            );
        },
        [
            initialState,
            updateField,
        ]
    );

    // ============================================================
    // RESET ALL
    // ============================================================

    const resetAll = useCallback(() => {
        setFormState(
            initialState
        );

        setDirtyFields({});

        setErrors({});
    }, [initialState]);

    // ============================================================
    // DIRTY CHECK
    // ============================================================

    const isDirty =
        Object.values(
            dirtyFields
        ).some(
            (module) =>
                Object.keys(
                    module ?? {}
                ).length > 0
        );

    // ============================================================
    // CONTEXT
    // ============================================================

    const value = useMemo(
        () => ({
            layout,

            record,

            entity,

            id,

            formState,

            initialState,

            dirtyFields,

            errors,

            saving,

            isDirty,

            updateField,

            getFieldValue,

            resetField,

            resetAll,

            setSaving,

            setErrors,
        }),
        [
            layout,
            record,
            entity,
            id,
            formState,
            initialState,
            dirtyFields,
            errors,
            saving,
            isDirty,
            updateField,
            getFieldValue,
            resetField,
            resetAll,
        ]
    );

    return (
        <EntityEditContext.Provider
            value={value}
        >
            {children}
        </EntityEditContext.Provider>
    );
};

export default EntityEditProvider;
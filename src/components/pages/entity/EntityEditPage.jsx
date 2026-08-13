import React from "react";
import { useEntityRecord } from "../../../hooks/useEntity";
import { useDetailLayout } from "../../../queries/layouts.queries";

import EditRenderer from "../../edit/EditRenderer";
import EntityEditProvider from "../../edit/context/EntityEditProvider";

const EntityEditPage = ({
    entity,
    email,
}) => {
    const {
        data: layout,
        isLoading: layoutLoading,
        error: layoutError,
    } = useDetailLayout(entity);

    const {
        data: record,
        isLoading: recordLoading,
        error: recordError,
    } = useEntityRecord({
        request: layout?.request,
        entity,
        recordInfo: {
            email
        },
        enabled: !!layout,
    });

    if (layoutLoading || recordLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                Loading...
            </div>
        );
    }

    if (layoutError || recordError) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                Something went wrong.
            </div>
        );
    }

    if (!layout || !record) {
        return null;
    }

    return (
        <EntityEditProvider
            layout={layout}
            record={record}
            entity={entity}
            email={email}
        >
            <EditRenderer
                layout={layout}
                record={record}
                entity={entity}
            />
        </EntityEditProvider>
    );
};

export default EntityEditPage;
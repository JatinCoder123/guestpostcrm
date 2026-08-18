import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import DetailRenderer from "../../detail/DetailRenderer";
import { useEntityRecord } from "../../../hooks/useEntity";
import { useDetailLayout } from "../../../queries/layouts.queries";
import { LoadingProgress } from "@/components/Loading";

const EntityViewPage = ({ entity, email }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedId = searchParams.get("id");

    const {
        data: layout,
        isLoading: layoutLoading,
        error: layoutError,
    } = useDetailLayout(entity, "detail");

    const {
        data: record,
        isLoading: recordLoading,
        error: recordError,
    } = useEntityRecord({
        request: layout?.request,
        entity,
        recordInfo: {
            email,
        },
    });

    /*
     * Normalize API response.
     *
     * API can return:
     * - single object
     * - array of objects
     */
    const records = useMemo(() => {
        if (!record) return [];

        return Array.isArray(record) ? record : [record];
    }, [record]);

    /*
     * If multiple records are returned and there is no
     * id in URL, select the first record.
     */
    useEffect(() => {
        if (records.length > 1 && !selectedId) {
            const firstRecord = records[0];

            if (firstRecord?.id) {
                const params = new URLSearchParams(searchParams);
                params.set("id", firstRecord.id);

                setSearchParams(params, { replace: true });
            }
        }
    }, [
        records,
        selectedId,
        searchParams,
        setSearchParams,
    ]);

    /*
     * Select the record using URL id.
     *
     * If there is no id yet, use the first record.
     */
    const selectedRecord = useMemo(() => {
        if (!records.length) {
            return null;
        }

        if (selectedId) {
            return (
                records.find(
                    (item) => String(item.id) === String(selectedId)
                ) || records[0]
            );
        }

        return records[0];
    }, [records, selectedId]);

    if (layoutLoading || recordLoading) {
        return (
            <div className="flex h-full min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center">
                    <LoadingProgress
                        color="blue"
                        size="100"
                        stroke="5"
                    />
                </div>
            </div>
        );
    }

    if (layoutError || recordError) {
        return <div>Something went wrong.</div>;
    }

    if (!selectedRecord) {
        return <div>No record found.</div>;
    }

    return (
        <DetailRenderer
            layout={layout}
            record={selectedRecord}
            entity={entity}
        />
    );
};

export default EntityViewPage;
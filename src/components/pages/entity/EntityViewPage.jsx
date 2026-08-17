import DetailRenderer from "../../detail/DetailRenderer";
import { useEntityRecord } from "../../../hooks/useEntity";
import { useLayout } from "../../../queries/layouts.queries";
import { LoadingProgress } from "@/components/Loading";

const EntityViewPage = ({ entity, email }) => {
    const {
        data: layout,
        isLoading: layoutLoading,
        error: layoutError,
    } = useLayout(entity, 'detail');
    console.log("layout", layout)
    const {
        data: record,
        isLoading: recordLoading,
        error: recordError,
    } = useEntityRecord({ request: layout?.request, entity, recordInfo: { email } });
    console.log("RECORD", record)
    if (layoutLoading || recordLoading) {
        return (
            <div className="flex h-full min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center">
                    <LoadingProgress color="blue" size="100" stroke="5" />
                </div>
            </div>
        );

    }

    if (layoutError || recordError) {
        return <div>Something went wrong.</div>;
    }

    return (
        <DetailRenderer
            layout={layout}
            record={record}
            entity={entity}
        />
    );
};

export default EntityViewPage;
import DetailRenderer from "../../detail/DetailRenderer";
import { useEntityRecord } from "../../../hooks/useEntity";
import { useDetailLayout } from "../../../queries/layouts.queries";

const EntityViewPage = ({ entity, id }) => {
    const {
        data: layout,
        isLoading: layoutLoading,
        error: layoutError,
    } = useDetailLayout(entity);

    const {
        data: record,
        isLoading: recordLoading,
        error: recordError,
    } = useEntityRecord(entity, id);

    if (layoutLoading || recordLoading) {
        return <div>Loading...</div>;
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
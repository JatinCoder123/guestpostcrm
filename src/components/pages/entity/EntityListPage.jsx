import { useContext } from "react";
import { useTablePreference } from "@/hooks/useTablePreference.js";
import { useLayout } from "@/queries/layouts.queries.js";
import { LoadingProgress } from "@/components/Loading";
import { PageContext } from "@/context/pageContext";
import TableView from "@/components/ui/table/Table";
import { useEntityStats, useInfiniteEntity } from "@/hooks/useEntity";

export default function EntityListPage({ entity }) {
    const preferences = useTablePreference(entity);
    const { enteredEmail: email } = useContext(PageContext)
    const { data: layout, isPending: layoutPending } = useLayout('orders', "table")
    console.log("LAYOUT", layout)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
    } = useInfiniteEntity({ preferences, email, entity });
    const loading = isPending || isFetchingNextPage;

    if (layoutPending) {
        return (
            <div className="flex h-full min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center">
                    <LoadingProgress color="blue" size="100" stroke="5" />
                </div>
            </div>
        );
    }

    return (
        <TableView
            data={data}
            layout={layout}
            entity={entity}
            loading={loading}
            preferences={preferences}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
        />

    );
}

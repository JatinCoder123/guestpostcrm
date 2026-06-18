import {
    useInfiniteQuery,
} from "@tanstack/react-query";

import {
    getLedger,
    getChildLedger,
} from "../api/ledger.api";
export const ledgerKeys = {
    all: ["ledger"],

    lists: (
        email,
        brandTimeline
    ) => [
            "ledger",
            "list",
            email,
            brandTimeline
        ],
    childLists: (
        parentId,
    ) => [
            "ledger",
            "list",
            "child",
            parentId,
        ],

    brandLists: (
        email,
    ) => [
            "ledger",
            "brand",
            email,
        ],
};
export const useInfiniteLedger = (email, brandTimeline) => {
    return useInfiniteQuery({
        queryKey:
            ledgerKeys.lists(email, brandTimeline),

        queryFn: ({
            pageParam = 1,
        }) =>
            getLedger({
                email,
                page: pageParam,
                brandTimeline
            }),

        enabled: !!email,

        initialPageParam: 1,

        getNextPageParam: (
            lastPage
        ) => {
            if (
                lastPage.current_page <
                lastPage.total_pages
            ) {
                return (
                    lastPage.current_page +
                    1
                );
            }

            return undefined;
        },
    });
};
export const useInfiniteChildLedger = (parentId) => useInfiniteQuery({
    queryKey: ledgerKeys.childLists(parentId),
    queryFn: ({ pageParam = 1 }) => getChildLedger({ parentId, page: pageParam }),
    enabled: !!parentId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
        if (lastPage.current_page < lastPage.total_pages) { return (lastPage.current_page + 1) }
        return undefined;
    },
});

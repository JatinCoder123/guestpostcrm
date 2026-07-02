import { useInfiniteQuery } from "@tanstack/react-query";
import { getBillingHistory } from "../api/billings.api";

export const billingKeys = {
    all: ["billing"],

    lists: (
        filters = {},
    ) => [
            "billing",
            "list",
            filters,
        ],



};


export const useBillingHistory = (
    { preferences = {} }
) =>
    useInfiniteQuery({
        queryKey:
            billingKeys.lists(
                preferences,
            ),

        queryFn: ({
            pageParam = 1,
        }) =>
            getBillingHistory({
                preferences,
                page: pageParam,
            }),

        initialPageParam: 1,

        getNextPageParam: (
            lastPage
        ) =>
            lastPage.page <
                lastPage.total_pages
                ? lastPage.page +
                1
                : undefined,

        staleTime:
            5 * 60 * 1000,
    });


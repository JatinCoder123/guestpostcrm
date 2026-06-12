import {useInfiniteQuery} from "@tanstack/react-query";
import {getReports} from "../api/report.api";
export const reportKeys = {
    all: ["reports"],

    lists: (
        filters = {}
    ) => [
        "reports",
        "list",
        filters,
    ],
};
export const useInfiniteReports =
    (filters = {}) =>
        useInfiniteQuery({
            queryKey:
                reportKeys.lists(
                    filters
                ),

            queryFn: ({
                pageParam = 1,
            }) =>
                getReports({
                    filters,
                    page: pageParam,
                }),

            initialPageParam: 1,

            getNextPageParam: (
                lastPage
            ) => {
                if (
                    lastPage.page <
                    lastPage.totalPages
                ) {
                    return (
                        lastPage.page +
                        1
                    );
                }

                return undefined;
            },

            staleTime:
                5 * 60 * 1000,
        });
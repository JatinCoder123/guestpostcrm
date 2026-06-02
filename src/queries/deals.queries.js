import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getAllDeals,
    getDealStats,
    deleteDeal,
    getDealById,
} from "../api/deals.api";

import toast from "react-hot-toast";

export const dealKeys = {
    all: ["deals"],

    lists: (
        filters = {}, email = ""
    ) => [
            "deals",
            "list",
            email,
            filters,
        ],

    stats: () => [
        "deals",
        "stats",
    ],

    byId: (id) => [
        "deals",
        "id",
        id,
    ],
};

export const useDealStats =
    () =>
        useQuery({
            queryKey:
                dealKeys.stats(),

            queryFn: (filters = {}) =>
                getDealStats(filters),

            staleTime:
                5 * 60 * 1000,
        });

export const useInfiniteDeals =
    (
        preferences = {}
    ) =>
        useInfiniteQuery({
            queryKey:
                dealKeys.lists(
                    preferences
                ),

            queryFn: ({
                pageParam = 1,
            }) =>
                getAllDeals({
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

export const useDeleteDeal =
    () => {
        const queryClient =
            useQueryClient();

        return useMutation({
            mutationFn:
                deleteDeal,

            onSuccess: () => {
                queryClient.invalidateQueries(
                    {
                        queryKey:
                            dealKeys.all,
                    }
                );

                toast.success(
                    "Deal Deleted Successfully"
                );
            },

            onError: () => {
                toast.error(
                    "Failed To Delete Deal"
                );
            },
        });
    };
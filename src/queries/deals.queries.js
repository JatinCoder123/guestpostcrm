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
    getDealsByEmail,
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

    stats: (email = '') => [
        "deals",
        "stats",
        email
    ],

    byId: (id) => [
        "deals",
        "id",
        id,
    ],
    byEmail: (email) => [
        "deals",
        "email",
        email,
    ],
};

export const useDealStats =
    (email) => useQuery({
        queryKey: dealKeys.stats(email),

        queryFn: ({ filters = {}, email }) => getDealStats(filters, email),

        staleTime:
            5 * 60 * 1000,
    });

export const useInfiniteDeals =
    (
        { preferences = {},
            email = "" }
    ) =>
        useInfiniteQuery({
            queryKey:
                dealKeys.lists(
                    preferences,
                    email
                ),

            queryFn: ({
                pageParam = 1,
            }) =>
                getAllDeals({
                    preferences,
                    page: pageParam,
                    email,
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
export const useDealsByEmail = (email = "") =>
    useQuery({
        queryKey: dealKeys.byEmail(email),
        queryFn: () => getDealsByEmail(email),
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
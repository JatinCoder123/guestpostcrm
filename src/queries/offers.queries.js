import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getAllOffers,
    getOfferStats,
    deleteOffer,
    getOfferById,
} from "../api/offers.api";

import toast from "react-hot-toast";

export const offerKeys = {
    all: ["offers"],

    lists: (
        filters = {},
        email = ""
    ) => [
            "offers",
            "list",
            email,
            filters,
        ],

    stats: (filters = {}) => [
        "offers",
        "stats",
        filters,
    ],

    byId: (id) => [
        "offers",
        "id",
        id,
    ],
};

/**
 * Offer Stats
 */
export const useOfferStats = (
    filters = {}
) =>
    useQuery({
        queryKey:
            offerKeys.stats(
                filters
            ),

        queryFn: () =>
            getOfferStats(
                filters
            ),

        staleTime:
            5 * 60 * 1000,
    });

/**
 * Infinite Offers
 */
export const useInfiniteOffers = (
    preferences = {},
    email = ""
) =>
    useInfiniteQuery({
        queryKey:
            offerKeys.lists(
                preferences,
                email
            ),

        queryFn: ({
            pageParam = 1,
        }) =>
            getAllOffers({
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

/**
 * Single Offer
 */
export const useOffer = (
    id
) =>
    useQuery({
        queryKey:
            offerKeys.byId(id),

        queryFn: () =>
            getOfferById(id),

        enabled:
            Boolean(id),

        staleTime:
            5 * 60 * 1000,
    });

/**
 * Delete Offer
 */
export const useDeleteOffer =
    () => {
        const queryClient =
            useQueryClient();

        return useMutation({
            mutationFn:
                deleteOffer,

            onSuccess: () => {
                queryClient.invalidateQueries(
                    {
                        queryKey:
                            offerKeys.all,
                    }
                );

                toast.success(
                    "Offer Deleted Successfully"
                );
            },

            onError: () => {
                toast.error(
                    "Failed To Delete Offer"
                );
            },
        });
    };
// contact.query.js

import {
    useInfiniteQuery,
    useQuery,
} from "@tanstack/react-query";

import {
    getAllContacts,
    getContactStats,
} from "../api/contact.api";

/**
 * Query Keys
 */
export const favoriteKeys = {
    all: ["favorite"],

    lists: (filters = {}) => [
        "favorite",
        "list",
        filters,
    ],

    stats: (filters = {}) => [
        "favorite",
        "stats",
        filters,
    ],
};


export const useFavoriteStats = (
    filters = {}
) => {
    return useQuery({
        queryKey:
            favoriteKeys.stats(
                filters
            ),

        queryFn: () =>
            getContactStats(
                filters
            ),

        staleTime:
            5 * 60 * 1000,
    });
};

export const useInfiniteFavorite = (
    preferences = {}
) => {
    return useInfiniteQuery({
        queryKey:
            favoriteKeys.lists(preferences),

        queryFn: ({ pageParam = 1 }) =>
            getAllContacts({
                preferences,
                page: pageParam,
                defaults: { favorite: "1" }
            }),

        initialPageParam: 1,

        getNextPageParam: (
            lastPage
        ) => {
            if (
                lastPage.page <
                lastPage.total_pages
            ) {
                return (
                    lastPage.page + 1
                );
            }

            return undefined;
        },

        staleTime: 5 * 60 * 1000,
    });
};
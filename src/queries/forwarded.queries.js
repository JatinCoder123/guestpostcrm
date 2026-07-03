// contact.query.js

import {
    useInfiniteQuery,
    useQuery,
} from "@tanstack/react-query";

import {
    getAllContacts,
    getContactStats,
} from "../api/contact.api";
import { getForwardStats } from "../api/forward.api";

/**
 * Query Keys
 */
export const forwardedKeys = {
    all: ["forwarded"],

    lists: (filters = {}) => [
        "forwarded",
        "list",
        filters,
    ],

    stats: (filters = {}, userId) => [
        "forwarded",
        "stats",
        filters,
        userId
    ],
};


export const useForwardedStats = (
    filters = {}, userId
) => {
    return useQuery({
        queryKey:
            forwardedKeys.stats(
                filters, userId
            ),

        queryFn: () =>
            getForwardStats(
                filters, userId
            ),

        staleTime:
            5 * 60 * 1000,
    });
};

export const useInfiniteForwarded = (
    preferences = {}
) => {
    return useInfiniteQuery({
        queryKey:
            forwardedKeys.lists(preferences),

        queryFn: ({ pageParam = 1 }) =>
            getAllContacts({
                preferences,
                page: pageParam,
                defaults: { forwarded: "1" }
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
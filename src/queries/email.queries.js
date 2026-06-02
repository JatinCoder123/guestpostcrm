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
export const emailKeys = {
    all: ["emails"],

    lists: (filters = {}) => [
        "emails",
        "list",
        filters,
    ],

    stats: () => [
        "emails",
        "stats",
    ],
};


export const useEmailStats = (
) => {
    return useQuery({
        queryKey:
            emailKeys.stats(),

        queryFn: () =>
            getContactStats(),

        staleTime:
            5 * 60 * 1000,
    });
};
export const useInfiniteEmails = (
    preferences = {}
) => {
    return useInfiniteQuery({
        queryKey:
            emailKeys.lists(preferences),

        queryFn: ({ pageParam = 1 }) =>
            getAllContacts({
                preferences,
                page: pageParam,
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


// contact.query.js

import {
    useInfiniteQuery,
    useQuery,
} from "@tanstack/react-query";

import {
    getAllContacts,
    getAllUnreadEmails,
    getContactStats,
    getUnreadCount,
} from "../api/contact.api";


/**
 * Query Keys
 */
export const emailKeys = {
    all: ["emails"],

    lists: (filters = {}, unread = false) => [
        "emails",
        "list",
        filters,
        unread
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
export const useUnreadCount = (
) => {
    return useQuery({
        queryKey: ["emails", "unread", "count"],
        queryFn: () => getUnreadCount(),
    });
};
export const useInfiniteEmails = (
    preferences = {}
) => {
    const unread = preferences?.filters.status == 'unread';
    const effectivePreferences = unread ? {} : preferences;
    return useInfiniteQuery({
        queryKey:
            emailKeys.lists(effectivePreferences, unread),

        queryFn: ({ pageParam = 1 }) =>
            unread ? getAllUnreadEmails({
                page: pageParam,
            }) : getAllContacts({
                preferences: effectivePreferences,
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


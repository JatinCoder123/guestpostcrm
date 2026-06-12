import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { getAllReminders, getReminderStats } from "../api/reminders.api";



export const reminderKeys = {
    all: ["reminders"],

    lists: (
        filters = {},
        email = ""
    ) => [
            "reminders",
            "list",
            email,
            filters,
        ],

    stats: (filters = {}) => [
        "reminders",
        "stats",
        filters,
    ],


};

/**
 * Offer Stats
 */
export const useReminderStats = (
    filters = {}
) =>
    useQuery({
        queryKey: reminderKeys.stats(filters),

        queryFn: () => getReminderStats(filters),


    });

/**
 * Infinite Offers
 */
export const useInfiniteReminders = (
    preferences = {},
    email = ""
) =>
    useInfiniteQuery({
        queryKey:
            reminderKeys.lists(
                preferences,
                email
            ),

        queryFn: ({
            pageParam = 1,
        }) =>
            getAllReminders({
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


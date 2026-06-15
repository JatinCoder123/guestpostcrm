import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";



import toast from "react-hot-toast";
import { getAllMovedEmails, getMovedEmailStats, restoreMovedEmail } from "../api/movedEmails.api";

export const movedEmailsKeys = {
    all: ["moved-emails"],

    lists: (
        filters = {},
    ) => [
            "moved-emails",
            "list",
            filters,
        ],

    stats: (filters = {}) => [
        "moved-emails",
        "stats",
        filters,
    ],
};

export const useMovedEmailStats = (filters = {}) =>
    useQuery({
        queryKey: movedEmailsKeys.stats(filters),
        queryFn: () => getMovedEmailStats(filters),
    });


export const useInfiniteMovedEmails = (preferences = {}) =>
    useInfiniteQuery({
        queryKey: movedEmailsKeys.lists(preferences),
        queryFn: ({ pageParam = 1 }) => getAllMovedEmails({ preferences, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (
            lastPage
        ) =>
            lastPage.page <
                lastPage.total_pages
                ? lastPage.page +
                1
                : undefined,
    });

export const useRestoreEmail =
    () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: restoreMovedEmail,

            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: movedEmailsKeys.all, });
                toast.success("Email Restored Successfully!")
            },

            onError: () => { toast.error("Failed To Restore Email") },
        });
    };

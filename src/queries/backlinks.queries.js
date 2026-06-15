import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getAllBacklinks,
    getBacklinkStats,
    updateBacklink,
    getBacklinkById,
} from "../api/backlinks.api";

import toast from "react-hot-toast";

export const backlinkKeys = {
    all: ["backlinks"],

    lists: (
        filters = {}
    ) => [
            "backlinks",
            "list",
            filters,
        ],

    stats: (
        filters = {}
    ) => [
            "backlinks",
            "stats",
            filters,
        ],

    byId: (id) => [
        "backlinks",
        "id",
        id,
    ],
};

export const useBacklinkStats =
    (
        filters = {}
    ) =>
        useQuery({
            queryKey:
                backlinkKeys.stats(
                    filters
                ),

            queryFn: () =>
                getBacklinkStats(
                    filters
                ),

            staleTime:
                5 *
                60 *
                1000,
        });

export const useInfiniteBacklinks =
    (
        preferences = {}
    ) =>
        useInfiniteQuery({
            queryKey:
                backlinkKeys.lists(
                    preferences
                ),

            queryFn: ({
                pageParam = 1,
            }) =>
                getAllBacklinks({
                    preferences,
                    page: pageParam,
                }),

            initialPageParam: 1,

            getNextPageParam:
                (
                    lastPage
                ) =>
                    lastPage.page <
                        lastPage.total_pages
                        ? lastPage.page +
                        1
                        : undefined,

            staleTime:
                5 *
                60 *
                1000,
        });

export const useUpdateBacklink =
    () => {
        const queryClient =
            useQueryClient();

        return useMutation({
            mutationFn: updateBacklink,

            onSuccess: (
                response,
                variables
            ) => {


                queryClient.invalidateQueries({
                    queryKey:
                        backlinkKeys.all,
                });

            },
        });
    };

export const useBacklink =
    (id) =>
        useQuery({
            queryKey:
                backlinkKeys.byId(
                    id
                ),

            queryFn: () =>
                getBacklinkById(
                    id
                ),

            enabled:
                Boolean(id),
        });
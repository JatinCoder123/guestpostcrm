import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    getOrderStats,
} from "../api/orders.api";

import toast from "react-hot-toast";

/**
 * Query Keys
 */
export const orderKeys = {
    all: ["orders"],

    lists: (filters = {}, email = '') => [
        "orders",
        "list",
        email,
        filters,
    ],

    stats: (filters = {}) => [
        "orders",
        "stats",
        filters,
    ],

    byId: (id) => [
        "orders",
        "id",
        id,
    ],
};

/**
 * Get Single Order
 */
export const useOrder = (id) => {
    return useQuery({
        queryKey: orderKeys.byId(id),

        queryFn: () =>
            getOrderById(id),

        enabled: Boolean(id),

        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Order Stats
 */
export const useOrderStats = (
    filters = {}
) => {
    return useQuery({
        queryKey:
            orderKeys.stats(filters),

        queryFn: () =>
            getOrderStats(filters),

        staleTime:
            5 * 60 * 1000,
    });
};

/**
 * Infinite Orders List
 */
export const useInfiniteOrders = (
    preferences = {}
) => {
    return useInfiniteQuery({
        queryKey:
            orderKeys.lists(
                preferences
            ),

        queryFn: ({
            pageParam = 1,
        }) =>
            getAllOrders({
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

        staleTime:
            5 * 60 * 1000,
    });
};

/**
 * Create Order
 */
export const useCreateOrder = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            createOrder,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:
                    orderKeys.all,
            });

            toast.success(
                "Order Created Successfully!"
            );
        },

        onError: () => {
            toast.error(
                "Failed To Create Order!"
            );
        },
    });
};

/**
 * Update Order
 */
export const useUpdateOrder = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            updateOrder,

        onSuccess: (
            _,
            variables
        ) => {
            queryClient.invalidateQueries({
                queryKey:
                    orderKeys.all,
            });

            if (
                variables?.id
            ) {
                queryClient.invalidateQueries({
                    queryKey:
                        orderKeys.byId(
                            variables.id
                        ),
                });
            }

            toast.success(
                "Order Updated Successfully!"
            );
        },

        onError: () => {
            toast.error(
                "Failed To Update Order!"
            );
        },
    });
};
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { getAllInvoice, getInvoiceStats, updateInvoice } from "../api/invoice.api";

export const invoiceKeys = {
    all: ["invoices"],

    lists: (
        filters = {}, email = ""
    ) => [
            "invoices",
            "list",
            email,
            filters,
        ],

    stats: () => [
        "invoices",
        "stats",
    ],

    byId: (id) => [
        "invoices",
        "id",
        id,
    ],

    byEmail: (email) => [
        "invoices",
        "email",
        email,
    ],
};

export const useInvoiceStats =
    () =>
        useQuery({
            queryKey:
                invoiceKeys.stats(),

            queryFn: (filters = {}) =>
                getInvoiceStats(filters),

            staleTime:
                5 * 60 * 1000,
        });

export const useInfiniteInvoices =
    (
        preferences = {},
        email = ''
    ) =>
        useInfiniteQuery({
            queryKey: invoiceKeys.lists(preferences, email),

            queryFn: ({
                pageParam = 1,
            }) =>
                getAllInvoice({
                    preferences,
                    page: pageParam,
                    email
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
export const useEmailInvoices =
    (
        email = ''
    ) =>
        useInfiniteQuery({
            queryKey: invoiceKeys.byEmail(email),

            queryFn: ({
                pageParam = 1,
            }) =>
                getAllInvoice({
                    preferences: {},
                    page: pageParam,
                    email
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
export const useUpdateInvoice = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: updateInvoice,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey:
                    invoiceKeys.all,
            });
        },
    });
};
// contact.query.js

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getAllContacts,
    getContactByEmail,
    createContact,
    updateContact,
    getContactStats,
} from "../api/contact.api";
import toast from "react-hot-toast";
import { useContext } from "react";
import { PageContext } from "../context/pageContext";

/**
 * Query Keys
 */
export const contactKeys = {
    all: ["contacts"],

    lists: (filters = {}) => [
        "contacts",
        "list",
        filters,
    ],

    stats: (filters = {}) => [
        "contacts",
        "stats",
        filters,
    ],

    byEmail: (email) => [
        "contacts",
        "email",
        email,
    ],
};

/**
 * Get Single Contact
 */
export const useContact = (email) => {
    return useQuery({
        queryKey: contactKeys.byEmail(email),

        queryFn: () =>
            getContactByEmail(email),

        enabled: Boolean(email),
        // 5 min
    });
};
/**
 * Contact Stats
 */
export const useContactStats = (
    filters = {}
) => {
    return useQuery({
        queryKey:
            contactKeys.stats(
                filters
            ),

        queryFn: () =>
            getContactStats(
                filters
            ),

    });
};
/**
 * Infinite Contact List
 */
export const useInfiniteContacts = (
    preferences = {}
) => {
    return useInfiniteQuery({
        queryKey:
            contactKeys.lists(preferences),

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

    });
};

/**
 * Create Contact
 */
export const useCreateContact = () => {
    const queryClient =
        useQueryClient();

    const { handleDateClick } =
        useContext(PageContext);

    return useMutation({
        mutationFn: createContact,

        onSuccess: (
            response,
            contact
        ) => {
            queryClient.invalidateQueries({
                queryKey:
                    contactKeys.all,
            });

            toast.success(
                "New Contact Created!"
            );

            handleDateClick({
                email: contact.email1, navigate: '/'
            });
        },

        onError: () => {
            toast.error(
                "Failed To Create New Contact!"
            );
        },
    });
};
/**
 * Update Contact
 */
export const useUpdateContact = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: updateContact,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey:
                    contactKeys.all,
            });

            if (variables?.email) {
                queryClient.invalidateQueries({
                    queryKey:
                        contactKeys.byEmail(
                            variables.email
                        ),
                });
            }
        },
    });
};
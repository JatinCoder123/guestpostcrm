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
    updateAccount,
    searchContacts,
} from "../api/contact.api";
import toast from "react-hot-toast";
import { useContext } from "react";
import { PageContext } from "../context/pageContext";
import { useTablePreference } from "../hooks/useTablePreference";
import { emailKeys } from "./email.queries";
import { buildLedgerItem, createLedgerEntry, getCurrentUser } from "../services/utils";

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

    search: (term) => [
        "contacts",
        "search",
        term,
    ],
};

/**
 * Search Contacts (global search suggestions)
 */
export const useContactSearch = (term) => {
    return useQuery({
        queryKey: contactKeys.search(term),
        queryFn: () => searchContacts(term),
        enabled: term.length >= 2,
        staleTime: 60 * 1000,
    });
};

/**
 * Get Single Contact
 */
export const useContact = (email) => {
    return useQuery({
        queryKey: contactKeys.byEmail(email),

        queryFn: async () => {
            return getContactByEmail(email);
        },

        enabled: Boolean(email),

        staleTime: 5 * 60 * 1000
    });
};
/**
 * Contact Stats
 */
export const useContactStats = () => {
    const preferences = useTablePreference("contacts");

    return useQuery({
        queryKey:
            contactKeys.stats(
                preferences
            ),

        queryFn: () =>
            getContactStats(
                preferences
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

            // The contact exists even if this fails, so don't block on it
            createLedgerEntry({
                email: contact.email1,
                group: "New",
                items: [
                    buildLedgerItem({
                        status: "Contact-Created",
                        detail: `email: {${contact.email1}}`,
                        user: getCurrentUser(),
                    }),
                ],
            }).catch(() => {
                toast.error(
                    "Contact created, but the ledger entry could not be added."
                );
            });

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
            queryClient.invalidateQueries({ queryKey: emailKeys.all })

            toast.success("Contact updated");
        },
    });
};
export const useUpdateAccount = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: updateAccount,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey:
                    contactKeys.all,
            });

            toast.success("Account updated");
        },
    });
};
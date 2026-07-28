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
} from "../api/contact.api";
import toast from "react-hot-toast";
import { useContext } from "react";
import { PageContext } from "../context/pageContext";
import { useTablePreference } from "../hooks/useTablePreference";
import { emailKeys } from "./email.queries";
import { getSidebarStats } from "../api/sidebar.api";

/**
 * Query Keys
 */
export const sidebarKeys = {
    all: ["sidebar"],

    lists: (filters = {}) => [
        "sidebar",
        "list",
        filters,
    ],

    stats: (filters = {}, email) => [
        "sidebar",
        "stats",
        filters,
        email
    ],
};


export const useSidebarStats = ({ email, queries }) => {
    queries && console.log("QUER", queries)
    return useQuery({
        queryKey: sidebarKeys.stats({ email, queries }),
        queryFn: () => getSidebarStats({ email, queries }),
        enabled: !!queries

    });
};

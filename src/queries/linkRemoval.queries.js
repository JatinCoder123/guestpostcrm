// contact.query.js

import { useQuery } from "@tanstack/react-query";
import { getLinkRemovalById } from "../api/linkRemoval.api";

export const linkRemovalKeys = {
    all: ["linkRemoval"],

    lists: (filters = {}) => [
        "linkRemoval",
        "list",
        filters,
    ],

    byId: (id) => [
        "linkRemoval",
        "id",
        id,
    ],

};


/**
 * Link Exchange Stats
 */
export const useLinkRemoval = (id) => {
    return useQuery({
        queryKey: linkRemovalKeys.byId(id),

        queryFn: () => getLinkRemovalById(id),

        staleTime: 5 * 60 * 1000,
    });
};


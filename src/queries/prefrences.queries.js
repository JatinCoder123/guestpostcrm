import { useQuery } from "@tanstack/react-query";
import { fetchLayout } from "../api/prefrences.api";


export const preferenceKeys = {
    all: ["preferences"],

    layout: () => [
        "preferences",
        "layout"
    ],

};


export const useLayoutPreferences = () =>
    useQuery({
        queryKey: preferenceKeys.layout(),
        queryFn: fetchLayout,
        staleTime:
            5 * 60 * 1000,
    });
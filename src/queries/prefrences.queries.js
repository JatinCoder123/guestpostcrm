import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLayout, updateLayout } from "../api/prefrences.api";


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
export function useUpdateLayout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            module,
            id,
            payload,
        }) => {
            return updateLayout(
                {
                    module,
                    id,
                    payload
                }
            );
        },

        onSuccess: (
            data,
            variables
        ) => {
            const { } = variables;

            // Refresh entity queries
            queryClient.invalidateQueries({
                queryKey: preferenceKeys.all,
            });
        },
    });
}
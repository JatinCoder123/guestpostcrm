import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getWebsites } from "../api/web.api";
import { webKeys } from "../queries/web.queries";

export const useAppInitialization =
    () => {

        const queryClient =
            useQueryClient();

        useEffect(() => {

            Promise.all([
                queryClient.prefetchQuery({
                    queryKey: webKeys.lists,
                    queryFn: getWebsites,
                }),
            ]);

        }, []);
    };
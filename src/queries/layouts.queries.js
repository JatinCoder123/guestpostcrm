import { useQuery } from "@tanstack/react-query";
import { getDetailLayout } from "../api/layouts.api";

export function useDetailLayout(entity) {
    return useQuery({
        queryKey: ["entity", entity, "detail"],
        queryFn: () => getDetailLayout(entity),
        enabled: !!entity,
    });
}
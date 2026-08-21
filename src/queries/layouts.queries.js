import { useQuery } from "@tanstack/react-query";
import { getDetailLayout, getLayout } from "../api/layouts.api";

export function useDetailLayout(entity) {
    return useQuery({
        queryKey: ["entity", entity, "detail"],
        queryFn: () => getDetailLayout(entity),
        enabled: !!entity,
    });
}
export function useLayout(module, view_key) {
    return useQuery({
        queryKey: ["entity", module, view_key],
        queryFn: () => getLayout(module, view_key),
        enabled: !!module && !!view_key,
    });
}
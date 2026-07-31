import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/entity.api";

// LIST
export function useEntityList(entity, params) {
    return useQuery({
        queryKey: ["entity", entity, "list", params],
        queryFn: () => api.fetchList(entity, params),
    });
}

// SINGLE RECORD
export function useEntityRecord(entity, id) {
    return useQuery({
        queryKey: ["entity", entity, "detail", id],
        queryFn: () => api.fetchOne(entity, id),
        enabled: !!id,
    });
}

// CREATE
export function useCreateEntity(entity) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => api.createOne(entity, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["entity", entity, "list"] }),
    });
}

// UPDATE
export function useUpdateEntity(entity) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            api.updateOne(entity, id, payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["entity", entity, "list"] });
            qc.invalidateQueries({ queryKey: ["entity", entity, "detail", vars.id] });
        },
    });
}

// DELETE
export function useDeleteEntity(entity) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.deleteOne(entity, id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["entity", entity, "list"] }),
    });
}